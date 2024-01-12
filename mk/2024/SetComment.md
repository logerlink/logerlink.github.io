[TOC]

#### 说明

SQL Server数据库，如何快速更新数据库表和字段的注释信息？我们先看一下常规操作

题外话，MySql可以通过ALTER 语句更新注释，也可以在创建表或新增字段时直接在语句后面指定注释信息

```sql
-- 更新表注释
ALTER TABLE test_db COMMENT '表注释';
-- 更新表注释
ALTER TABLE test_db MODIFY COLUMN column1 INT COMMENT '字段注释';

-- 创建表时指定表注释
CREATE TABLE test_db (
    column1 INT,
    column2 VARCHAR(50)
) COMMENT = '表注释';
-- 新增字段时指定字段注释
ALTER TABLE test_db ADD COLUMN column3 INT COMMENT '字段注释';
```

#### 手动更新注释

对注释进行**增删改查**都可以在此页面进行

数据库表【右键】选择设计

![image-20240111163511806](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111163511806.png)

选择列，修改【说明】属性，然后保存即可

![image-20240111163646378](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111163646378.png)

#### 使用SQL语句更新注释

我们可以借助以下存储过程来对注释进行增删改查 。

注意，以下存储过程中的表名、字段名不能用[]包起来、不区分大小写

##### 查看注释信息

[extended_properties](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/extended-properties-catalog-views-sys-extended-properties?view=sql-server-ver16) 查看注释信息

```sql
(
-- 查看字段注释
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    ep.value AS Comment
FROM sys.tables t
INNER JOIN sys.columns c ON c.object_id = t.object_id
LEFT JOIN sys.extended_properties ep ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
WHERE ep.class = 1 -- 表或视图的扩展属性
    AND ep.name = 'MS_Description' -- 注释的名称
    AND OBJECT_NAME(ep.major_id) = 'User_TradeInfo' -- 替换为你的表名
	)
	union	-- 使用union合成一张表
(
-- 查看表注释
SELECT 
    t.name AS TableName,
	null as ColumnName,
    ep.value AS TableComment
FROM sys.tables t
LEFT JOIN sys.extended_properties ep ON ep.major_id = t.object_id AND ep.minor_id = 0
WHERE ep.class = 1 -- 表或视图的扩展属性
    AND ep.name = 'MS_Description' -- 注释的名称
    AND OBJECT_NAME(ep.major_id) = 'User_TradeInfo' -- 替换为你的表名
	)
```

![image-20240112095444223](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240112095444223.png)

##### 增加注释信息

[sp_addextendedproperty](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-addextendedproperty-transact-sql?view=sql-server-ver16) 增加注释信息

```sql
use test;

-- 给表【User_TradeInfo】的字段【Frzamt】增加注释信息
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
@value = N'字段的注释信息',	
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo', 	-- 表名
@level2type = N'COLUMN',
@level2name = N'Frzamt';	-- 字段名

-- 给表【User_TradeInfo】增加注释信息,不指定字段
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
@value = N'表的注释信息',	
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo'; 	-- 表名
```

若该字段或表存在注释信息时，执行 sp_addextendedproperty 会报错：<span style="color:red;">无法添加属性。'dbo.User_TradeInfo.Frzamt' 已存在属性 'MS_Description'。</span>

如果我们要修改注释信息，则应该使用 sp_updateextendedproperty 修改注释信息，或者先删除，再增加注释信息

![image-20240111172449599](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111172449599.png)

##### 修改注释信息

[sp_updateextendedproperty](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-updateextendedproperty-transact-sql?view=sql-server-ver16) 修改注释信息

```sql
use test;

-- 给表【User_TradeInfo】的字段【Frzamt】修改注释信息
EXEC sys.sp_updateextendedproperty  @name = N'MS_Description',
@value = N'字段的注释信息11111',	
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo', 	-- 表名
@level2type = N'COLUMN',
@level2name = N'Frzamt';	-- 字段名

-- 给表【User_TradeInfo】修改注释信息,不指定字段
EXEC sys.sp_updateextendedproperty  @name = N'MS_Description',
@value = N'表的注释信息22222',	
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo'; 	-- 表名
```

![image-20240112095555114](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240112095555114.png)

若该字段或表不存在注释信息时，执行 sp_updateextendedproperty 会报错：<span style="color:red;">无法更新或删除属性。'dbo.User_TradeInfo.CreateStaffId' 不存在属性 'MS_Description'。</span>

![image-20240111173118877](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111173118877.png)

如果我们要增加注释信息，则应该使用 sp_addextendedproperty 修改注释信息

##### 删除注释信息

[sp_dropextendedproperty](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-dropextendedproperty-transact-sql?view=sql-server-ver16) 删除注释信息，注意没有@value参数

```sql
use test;

-- 给表【User_TradeInfo】的字段【Frzamt】删除注释信息
EXEC sys.sp_dropextendedproperty  @name = N'MS_Description',
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo', 	-- 表名
@level2type = N'COLUMN',
@level2name = N'Frzamt';	-- 字段名

-- 给表【User_TradeInfo】删除注释信息,不指定字段
EXEC sys.sp_dropextendedproperty  @name = N'MS_Description',
@level0type = N'SCHEMA',
@level0name = N'dbo',
@level1type = N'TABLE', 
@level1name = N'User_TradeInfo'; 	-- 表名
```

![image-20240112095645188](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240112095645188.png)

若该字段或表不存在注释信息时，执行 sp_addextendedproperty 会报错：<span style="color:red;">无法更新或删除属性。'dbo.User_TradeInfo.Frzamt' 不存在属性 'MS_Description'。</span>

![image-20240111173713043](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111173713043.png)

##### 快速更新数据库表和字段的注释信息

借助循环生成语句，快速更新数据库表和字段的注释信息

```sql
DECLARE @TableName NVARCHAR(128) = 'User_TradeInfo'; -- 替换为你的表名
DECLARE @ColumnName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);
DECLARE @SQLAction NVARCHAR(MAX);

DECLARE ColumnCursor CURSOR FOR
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = @TableName;

OPEN ColumnCursor;
FETCH NEXT FROM ColumnCursor INTO @ColumnName;

-- 增加表注释（未判断是否存在，自行看一下是否存在，存在的话add改成update即可）
PRINT N'EXEC  sys.sp_addextendedproperty @name = N''MS_Description'',@value = N''表注释'',@level0type = N''SCHEMA'',@level0name = N''dbo'',@level1type = N''TABLE'',@level1name = N''' + @TableName + N''';';

WHILE @@FETCH_STATUS = 0
BEGIN
	
	IF EXISTS (
		SELECT 1
		FROM sys.extended_properties ep
		INNER JOIN sys.columns c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
		WHERE ep.class = 1 -- 表或视图的扩展属性
			AND ep.name = 'MS_Description' -- 注释的名称
			AND OBJECT_NAME(ep.major_id) = @TableName
			AND c.name = @ColumnName
	)
	BEGIN
		SET @SQLAction = 'sys.sp_updateextendedproperty';	-- 若存在注释则改为修改注释
	END
	ELSE
	BEGIN
		SET @SQLAction = 'sys.sp_addextendedproperty';	-- 若不存在注释则改为增加注释
	END
	
    SET @SQL = N'EXEC  ' + @SQLAction + ' @name = N''MS_Description'',@value = N''' + @ColumnName + N'注释'',@level0type = N''SCHEMA'',@level0name = N''dbo'',@level1type = N''TABLE'',@level1name = N''' + @TableName + N''',@level2type = N''COLUMN'',@level2name = N''' + @ColumnName + N''';';

    PRINT @SQL; -- 打印存储过程调用语句

    FETCH NEXT FROM ColumnCursor INTO @ColumnName;
END;

CLOSE ColumnCursor;
DEALLOCATE ColumnCursor;
```

![image-20240111191709441](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111191709441.png)

执行以上SQL语句，一键生成后，我们只要修改字段相应的注释信息，接着执行这些语句，就可以快速更新字段和表的注释信息了

![image-20240112100546709](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240112100546709.png)

同理我还可以快速删除表和字段的注释信息

```sql
DECLARE @TableName NVARCHAR(128) = 'User_TradeInfo'; -- 替换为你的表名
DECLARE @ColumnName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);
DECLARE @SQLAction NVARCHAR(MAX);

DECLARE ColumnCursor CURSOR FOR
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = @TableName;

OPEN ColumnCursor;
FETCH NEXT FROM ColumnCursor INTO @ColumnName;

-- 删除表注释（未判断是否存在注释，自行看一下是否存在，不存在的话把这条命令注释掉不执行即可）
PRINT N'EXEC sys.sp_dropextendedproperty @name = N''MS_Description'',@level0type = N''SCHEMA'',@level0name = N''dbo'',@level1type = N''TABLE'',@level1name = N''' + @TableName + N''';';

WHILE @@FETCH_STATUS = 0
BEGIN
	
	IF EXISTS (
		SELECT 1
		FROM sys.extended_properties ep
		INNER JOIN sys.columns c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
		WHERE ep.class = 1 -- 表或视图的扩展属性
			AND ep.name = 'MS_Description' -- 注释的名称
			AND OBJECT_NAME(ep.major_id) = @TableName
			AND c.name = @ColumnName
	)
	BEGIN
		-- 若存在注释则删除注释，不存在则不处理
		SET @SQL = N'EXEC sys.sp_dropextendedproperty @name = N''MS_Description'',@level0type = N''SCHEMA'',@level0name = N''dbo'',@level1type = N''TABLE'',@level1name = N''' + @TableName + N''',@level2type = N''COLUMN'',@level2name = N''' + @ColumnName + N''';';
		PRINT @SQL; -- 打印存储过程调用语句
	END

    FETCH NEXT FROM ColumnCursor INTO @ColumnName;
END;

CLOSE ColumnCursor;
DEALLOCATE ColumnCursor;
```

执行以上SQL语句，一键生成后，执行这些语句，就可以快速删除字段和表的注释信息了

![image-20240111195647309](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111195647309.png)

虽然还是需要我们一个一个复制注释信息，但是这样复制会比较快，尤其适用于迁移（已存在的注释的话，可以右键数据库表生成create DDL语句，也可以拿到这些注释命令）

![image-20240111200530251](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240111200530251.png)

#### EF迁移数据库时设置注释

我们还可以修改 ` Add-Migration ...` 生成后的代码，帮助我们设置注释

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<bool>(
        name: "IsAllow",
        table: "User_TradeInfo",
        nullable: true,
        comment: "是否允许");	-- 设置注释，生成的代码默认没有comment参数

    migrationBuilder.AddColumn<bool>(
        name: "IsPub",
        table: "User_TradeInfo",
        nullable: false,
        defaultValue: false,
        comment: "是否发布");	-- 设置注释，生成的代码默认没有comment参数
    ...
}
```

更新数据库后，当我们使用 `Script-Migration ...` 生成迁移脚本时，也会自动帮我们把注释信息加上

![image-20240112105933745](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240112105933745.png)