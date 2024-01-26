[TOC]

#### 问题

![image-20240126161843021](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126161843021.png)

EF迁移，执行`update-database`时报错：<span style="color:red">Microsoft.Data.SqlClient.SqlException (0x80131904): Column names in each table must be unique. Column name 'Address' in table 'xxx_xxx_StaffInfo' is specified more than once.</span>

提示很明显不能添加相同的列（表），一般有两种可能

1. 手动再数据库表新增了一列，然后又使用EF迁移新增一列
2. EF已经迁移过了，但是在迁移表中不存该记录，导致重复迁移

#### 如何解决

针对第一种情况很少见，若真的出现这种情况，我们要先观察是否已经存在数据，不存在则直接删除。存在的话可能要做个备份再删除，等待迁移后再恢复数据即可

第二种情况往往比较常见，一般是我们更换数据库连接或者误删除迁移表的迁移记录而导致的问题。下面给大家演示如何处理，核心：往迁移表添加迁移记录

##### 问题定位

查看历史Migration，看看错误提示的字段（**Address**）在哪个Migration中，也可以根据控制台错误提示快速定位是哪个Migration出的问题

![image-20240126161843021](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126161843021.png)

![image-20240126150741422](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126150741422.png)

##### 验证

找到指定Migration，在迁移表中查找该Migration的文件名，发现未找到该记录，那便是这个问题了

```sql
SELECT MigrationId, ProductVersion
FROM TestDb.dbo.[__EFMigrationsHistory]
where MigrationId = '20210622082655_07xxxxxxxxxxfoAddField'
```

![image-20240126150941645](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126150941645.png)

##### 处理

接下来我们往迁移表手动添加一条迁移记录，保证MigrationId要正确即可

```sql
INSERT INTO TestDb.dbo.[__EFMigrationsHistory]
(MigrationId,ProductVersion)
VALUES 
('20210622082655_07xxxxxxxxxxfoAddField','3.1.2')
```

![image-20240126151346210](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126151346210.png)

##### 验证解决

再次执行迁移，成功

```shell
update-database
```

![image-20240126151502979](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126151502979.png)