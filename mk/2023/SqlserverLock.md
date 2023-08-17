[TOC]

闲来无聊，撸撸Sql Server锁

### sp_lock 查看锁

我们可以使用`sp_lock`语句查看Sql Server当前存在哪些锁。

![image-20230726155330008](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230726155330008.png)

参考：[SQLSERVER各种锁——实例_sqlserver sp_lock_飞行的数据的博客-CSDN博客](https://blog.csdn.net/hahawujin/article/details/80109105)

- **spid**：进程id。可以使用kill spid来杀死进程释放锁。
- **dbid**：数据库id
- Objid：数据库内对象id
- Indid：持有锁的索引标识号。
- **type**：锁的资源类型。
  - **RID**：行锁——表中单个行的锁，由行标识符 (RID) 标识。
  - **KEY**：索引内保护可串行事务中一系列键的锁。
  - **PAG**：数据页或索引页的锁。
  - **TAB**：表锁——TAB = 整个表（包括所有数据和索引）的锁。
  - **DB**：数据库的锁
  - EXT：对某区的锁
  - FIL：数据库文件的锁
  - APP：执行的应用程序资源的锁
  - MD：元数据或目录信息的锁。
  - HBT：堆或 B 树索引的锁。在 SQL Server 中此信息不完整。
  - AU：分配单元的锁。在 SQL Server 中此信息不完整。
- **mode**：请求锁的类型
  - Sch-S：架构稳定性。确保在任何会话持有对架构元素（例如表或索引）的架构稳定性锁时，不删除该架构元素
  - Sch-M：架构修改。必须由要更改指定资源架构的任何会话持有。确保没有其他会话正在引用所指示的对象。
  - **S**：共享。授予持有锁的会话对资源的共享访问权限。
  - **U**： 更新。指示对最终可能更新的资源获取的更新锁。用于防止一种常见的死锁，这种死锁在多个会话锁定资源以便稍后对资源进行更新时发生。
  - **X**：排他。授予持有锁的会话对资源的独占访问权限。
  - **IS**：意向共享。指示有意将 S 锁放置在锁层次结构中的某个从属资源上。
  - **IU**：意向更新。指示有意将 U 锁放置在锁层次结构中的某个从属资源上。
  - **IX**：意向排他。指示有意将 X 锁放置在锁层次结构中的某个从属资源上。
  - SIU：共享意向更新。指示对有意在锁层次结构中的从属资源上获取更新锁的资源进行共享访问。
  - SIX：共享意向排他。指示对有意在锁层次结构中的从属资源上获取排他锁的资源进行共享访问。
  - UIX：更新意向排他。指示对有意在锁层次结构中的从属资源上获取排他锁的资源持有的更新锁。
  - BU：大容量更新。用于大容量操作。
  - ...
- status：锁的状态
  - CNVRT：锁正在从另一种模式进行转换，但是转换被另一个持有锁（模式相冲突）的进程阻塞。
  - **GRANT**：已获取锁。
  - **WAIT**：等待获取锁。锁可能被另一个持有锁（模式相冲突）的进程阻塞。

### Sql Server加锁语句

Sql Server加锁语句，尽量使用**WITH(锁)**形式，直接写锁有时不管用

```sql
select * from [User] with(UPDLOCK) where ...
select * from [User] with(ROWLOCK,UPDLOCK) where ...

update [User] with(UPDLOCK) set Name = 'Tom' where ...
```

### Sql Server常见锁

- ROWLOCK：行锁。
- TABLOCK：表锁。
- UPDLOCK：更新锁。
- XLOCK：排它锁。
- TABLOCKX：表的排他锁。
- NOLOCK：没有锁。
- HOLDLOCK：共享锁。 
- PAGLOCK：在通常使用单个表锁的地方采用页锁。

接下来我们来演示添加锁之后，对表内数据进行增删改查，看看有什么影响。

数据库隔离级别：READ COMMITTED（默认）

#### ROWLOCK——行锁——READ COMMITTED

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
-- 事务1
Begin Transaction selectData
	select * from [User] WITH(ROWLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Mike','5555555555',18);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];

-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Mike','5555555555',18);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：ROWLOCK——行锁，隔离级别为`READ COMMITTED`，与索引无关，当前事务执行中，其他事务或语句可立即查看、插入（新数据、注意唯一限定）、修改删除数据，相当于ROWLOCK单独使用，并没有起到 锁定数据的效果。在select语句中，不使用组合时，RowLock是没有意义的，一般会与`UPDLOCK`组合使用

#### ROWLOCK——行锁2——REPEATABLE READ

目前我们数据库的隔离级别是默认的——`READ COMMITTED`，此时我们改为更高级的隔离级别即`REPEATABLE READ`再重复上面的操作

```sql
-- 查看数据库隔离级别
-- DBCC Useroptions
-- 修改当前数据库的隔离级别
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
```

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
-- 事务1
Begin Transaction selectData
	select * from [User] WITH(ROWLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801183704106](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801183704106.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Mike','5555555555',18);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];

-- 查看同一条数据，除了ROWLOCK、TABLOCK、UPDLOCK、NOLOCK、HOLDLOCK立即执行，XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、UPDLOCK、NOLOCK、HOLDLOCK立即执行，XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801183833647](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801183833647.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Mike','5555555555',18);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];

-- 查看同一条数据，除了ROWLOCK、TABLOCK、UPDLOCK、NOLOCK、HOLDLOCK立即执行，XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、UPDLOCK、NOLOCK、HOLDLOCK立即执行，XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：ROWLOCK——行锁，隔离级别为`REPEATABLE READ`，当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）、插入（新数据、注意唯一限定）数据，其他事务或语句对**锁定行**执行修改、删除操作需要等待当前事务提交（锁释放）后才会执行，对未锁定的数据可立即更新、删除。

本节演示完后，将数据库的隔离级别恢复至默认隔离级别——`READ COMMITTED`

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED
```

#### TABLOCK——表锁——READ COMMITTED

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
-- 事务1
Begin Transaction selectData
	select * from [User] with(TABLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁,查看数据	立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：TABLOCK——表锁，隔离级别为`READ COMMITTED`，与索引无关，当前事务执行中，其他事务或语句可立即查看、插入（新数据、注意唯一限定）、更新、删除数据，相当于TABLOCK单独使用，并没有起到 锁定数据的效果。

#### TABLOCK——表锁2——REPEATABLE READ

目前我们数据库的隔离级别是默认的——`READ COMMITTED`，此时我们改为更高级的隔离级别即`REPEATABLE READ`重复上面的操作

```sql
-- 查看数据库隔离级别
-- DBCC Useroptions
-- 修改当前数据库的隔离级别
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
```

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] with(TABLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230803163158354](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230803163158354.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230803164132563](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230803164132563.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：TABLOCK——表锁，隔离级别为`REPEATABLE READ`，与索引无关，当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）数据，其他事务或语句对**表内数据**执行插入（新数据、注意唯一限定）、更新、删除需要等待当前事务提交（锁释放）后才会执行。

本节演示完后，将数据库的隔离级别恢复至默认隔离级别——`READ COMMITTED`

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED
```

#### UPDLOCK——更新锁

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] with(UPDLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230727113258872](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230727113258872.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230727113759504](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230727113759504.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：UPDLOCK——更新锁。

无索引的情况下，事务1查询会全表扫描（Table scan）导致扫描过的行都会被锁定，造成"锁表"现象。

无索引的情况下，当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）、插入数据（新数据、注意唯一限定），其他事务或语句对**表内数据**进行更新、删除操作需要等待当前事务提交（锁释放）后才会执行.

有索引的情况下，事务1查询不会进行全表扫描（Table scan）——不过我测试的时候还是走了全表扫描（Table scan），不知道是不是数据不够的原因。当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）、插入数据（新数据、注意唯一限定），其他事务或语句对**锁定的数据**进行更新、删除操作需要等待当前事务提交（锁释放）后才会执行，对未锁定的数据可立即更新、删除。

#### XLOCK——排它锁

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] with(XLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801163725601](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801163725601.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	等待事务1完成后才执行，有时会立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801164523713](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801164523713.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	等待事务1完成后才执行，有时会立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、NOLOCK立即执行，TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：XLOCK——排它锁

与索引无关，当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）、插入数据（新数据、注意唯一限定），其他事务或语句对**表内数据**进行更新、删除操作需要等待当前事务提交（锁释放）后才会执行.

#### TABLOCKX——表的排他锁

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] with(TABLOCKX) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801173801576](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801173801576.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	等待事务1完成后才执行
select * from [User];
-- 查看同一条数据，除了NOLOCK立即执行，ROWLOCK、TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了NOLOCK立即执行，ROWLOCK、TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801175039905](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801175039905.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	等待事务1完成后才执行
select * from [User];
-- 查看同一条数据，除了NOLOCK立即执行，ROWLOCK、TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了NOLOCK立即执行，ROWLOCK、TABLOCK、UPDLOCK、XLOCK、TABLOCKX、HOLDLOCK都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：TABLOCKX——表的排他锁

与索引无关，当前事务执行中，其他事务或语句对**表内数据**进行查询（带锁查询要分情况）、插入（新数据、注意唯一限定）、更新、删除操作需要等待当前事务提交（锁释放）后才会执行.

#### NOLOCK——没有锁

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] with(NOLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:20'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况，发现与事务执行之前没有差异，说明NoLOCK不会对任何数据（行表库）加锁。

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 带任意锁查看同一条数据，立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁查看不同数据，立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况，发现与事务执行之前没有差异，说明NOLOCK不会对任何数据（行表库）加锁。

```sql
-- 修改同一条数据	立即执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	立即执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	立即执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	立即执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 带任意锁查看同一条数据，立即执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 带任意锁查看不同数据，立即执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：NOLOCK——没有锁

与索引无关，当前事务执行中，其他事务或语句对**表内数据**进行查询、插入（新数据、注意唯一限定）、更新、删除操作立即执行.

#### HOLDLOCK——共享锁

新建一个查询窗口执行`事务1`，`waitfor delay`用于延长事务结束时间，在该事务结束之前我们还需要去执行一些语句。

```sql
Begin Transaction selectData
	select * from [User] WITH(HOLDLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
Commit Transaction selectData
```

再新建一个查询窗口，执行`事务1`的同时，执行`语句1`。`事务1、语句1`执行完了之后，再次执行`事务1`，然后执行`语句2`，依次执行完所有语句，并观察执行效果。

**没有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801180543155](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801180543155.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

新增id非唯一非聚集索引

```sql
create index idx_id
on [User](id)
```

**有索引**的情况下，各语句的执行效果：

在事务执行中时，我们可以先通过`sp_lock`查看当前锁的情况

![image-20230801181112470](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230801181112470.png)

```sql
-- 修改同一条数据	等待事务1完成后才执行
update [User] set Name = 'Tom81' where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 修改其他数据	等待事务1完成后才执行
update [User] set Name = 'Tom18' where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
-- 插入新数据	等待事务1完成后才执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','Tom','5555555555',3);
-- 删除其他数据	等待事务1完成后才执行
delete from [dbo].[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C';
-- 删除同一条数据	等待事务1完成后才执行
BEGIN TRANSACTION deleteuser
delete from [dbo].[User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03';
ROLLBACK
-- 查看数据	立即执行
select * from [User];
-- 查看同一条数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 查看不同数据，除了ROWLOCK、TABLOCK、NOLOCK、HOLDLOCK立即执行，UPDLOCK、XLOCK、TABLOCKX都需要等待事务1完成后才执行
select * from [User] WITH(任意锁) where id <> '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

小结：HOLDLOCK——共享锁

与索引无关，当前事务执行中，其他事务或语句可立即查询（带锁查询要分情况）数据，其他事务或语句对**表内数据**执行插入（新数据、注意唯一限定）、更新、删除操作需要等待当前事务提交（锁释放）后才会执行.

### 悲观锁和乐观锁 

悲观锁和乐观锁并不是指的"某种锁"，我更愿意理解为对待并发的"处理态度"。

一种执悲观的态度，认为并发是**经常**发生的。所以我要对数据加锁，在处理数据的这段时间，不允许别人修改该数据，从而保证每一个线程都能达到目的。由于需要**加锁等待**，**并发的效率不高**，适合**并发不高**的场景下使用，**悲观锁一定会成功**。

一种执乐观的态度，认为并发是**极少**发生的。所以我不需要对数据加锁，我只需要确定**在我读取该数据到我修改该数据的这段时间内**该数据有没有被修改过就行了。若未被修改，则修改该数据，若被修改了，则不修改该数据并告诉用户（重试）。乐观处理，无需加锁，**并发的效率较高**，适合**高并发**的场景下使用，**乐观锁不一定成功**(修改)。

参考：[数据库对并发的处理-乐观锁与悲观锁 - 努力--坚持 - 博客园 (cnblogs.com)](https://www.cnblogs.com/kongsq/p/5841397.html)

#### 场景及问题

假如我们有一个事务用于查询并修改某条数据A，但是该事务可能要执行（等待）一段时间，在这段时间里，另一个事务或语句可能也要修改这条数据A（制造并发场景）。

我们有如下sql语句用于查询Age值，并更新Age值为 @age+1。正常情况下，若Age初始值为4，执行完该事务，Age值则变为5。

```sql
Begin Transaction updateAge
	-- 查询Age值并赋值@age
	declare @age int
	select @age = Age from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
	-- 更新Age值为 @age+1
	update [User] set Age = @age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction updateAge
```

此时我们再准备一条sql语句，在执行事务updateAge的同时，执行update语句。正常情况下，若Age初始值为4，执行完该语句，Age值则变为5。

```sql
update [User] set Age = Age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

事务updateAge执行结果：

![image-20230816161344130](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816161344130.png)

update语句执行结果：

![image-20230816161443142](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816161443142.png)

我们观察一下事务updateAge执行情况：在执行事务updateAge的同时，执行update语句，update语句立即执行，Age值变为5。事务updateAge执行完后查询，Age的值也是5。那就有问题了是不是，因为我们执行了update语句和事务updateAge，都会去更改Age值，按理来说此时的Age的值应该是6（4+1+1），而不是5。相当于我们执行了两次更新操作，其中有一次更新是无效的，但是并没有提示用户。在我们看来两次更新操作都成功了，但是Age的值没有达到我们期望的值。

接下来我们分别演示一下使用悲观锁和乐观锁如何处理这个问题

#### 悲观锁

修改Age为初始值4

```sql
update [User] set Age = 4 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

我们有如下sql语句用于查询Age值（加了**更新锁**），并更新Age值为 @age+1。正常情况下，若Age初始值为4，执行完该事务，Age值则变为5。

```sql
-- 悲观锁
Begin Transaction updateAge
	-- 查询Age值并赋值@age
	declare @age int
	select @age = Age from [User] WITH(UPDLOCK) where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
	-- 更新Age值为 @age+1
	update [User] set Age = @age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction updateAge
```

此时我们再准备一条sql语句，在执行事务updateAge的同时，执行update语句。正常情况下，若Age初始值为4，执行完该语句，Age值则变为5。

```sql
update [User] set Age = Age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

事务updateAge执行结果：

![image-20230816162429664](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816162429664.png)

update语句执行结果：

![image-20230816162507438](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816162507438.png)

我们观察一下事务updateAge执行情况：由于事务updateAge加了`UPDLOCK`锁，在执行事务updateAge的同时，执行update语句，update语句需要等待事务updateAge提交**执行完毕（锁释放）后才会执行**。事务updateAge执行完后查询，Age的值是5，update语句执行完后查询，Age的值是6（4+1+1），符合情况。

**悲观锁一定会成功**，我们可以发现事务updateAge和update语句都依次成功执行了。

#### 乐观锁

修改Age为初始值4

```sql
update [User] set Age = 4 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

由于乐观锁需要一个**版本或时间戳字段**的支持才能完成，我们需要先加一下这个字段。**推荐使用时间戳字段**，因为时间戳字段**无法也无需**手动更新，每次成功更新数据时间戳字段都会自动更新，版本字段需要每次更新数据的同时手动更新版本字段，比较麻烦。

```sql
ALTER TABLE [User] ADD TimesFlag TIMESTAMP NOT null
```

我们有如下sql语句用于查询Age值，并更新Age值为 @age+1，更新的时候加上时间戳判断条件。这还没完，事务的最后我们还需要获取当前事务被修改行数`@@ROWCOUNT`，**若修改行数大于0，则表示修改成功，否则修改失败，提示用户**(重试)。

正常情况下，若事务updateAge执行的这段时间内没有更新该数据，Age初始值为4，执行完该事务，Age值则变为5。

若事务updateAge执行的这段时间内有其他语句或者事务更新了该数据，那么该数据的时间戳就会发生改变，导致事务updateAge执行更新操作**找不到数据**（时间戳对不上），最终更新数据失败。

```sql
-- 乐观锁
Begin Transaction updateAge
	-- 查询Age值并赋值@age、查询TimesFlag并赋值@flag
	declare @age int
	declare @flag TIMESTAMP
	select @age = Age,@flag = TimesFlag from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
	waitfor delay '00:00:10'
	-- 更新Age值为 @age+1
	update [User] set Age = @age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03' and TimesFlag = @flag	-- 这里加了TimesFlag判断条件
	-- 获取被修改的行数，判断是否修改成功
	if @@ROWCOUNT <= 0
		print '修改失败'
	else
		print '修改成功'
	select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction updateAge
```

此时我们再准备一条sql语句，在执行事务updateAge的同时，执行update语句。正常情况下，若Age初始值为4，执行完该语句，Age值则变为5。

```sql
update [User] set Age = Age + 1 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

事务updateAge执行结果：

![image-20230816173038341](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816173038341.png)

update语句执行结果：

![image-20230816172438737](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230816172438737.png)

我们观察一下事务updateAge执行情况：在执行事务updateAge的同时，执行update语句，update语句立即执行，Age值变为5。事务updateAge执行完后查询，Age的值也是5。

唉，怎么Age的值都是5，那不是跟原来一样的问题吗？

不不不，我们可以看一下事务updateAge执行结果图，里面是不是有一个`修改失败`的提示，在实际开发中我们可以把被修改行数`@@ROWCOUNT`作为事务是否成功执行的另一条件，若修改行数大于0，则表示修改成功，否则修改失败，提示用户(重试)。

乐观锁认为并发是极少发生的，**乐观锁不一定成功**(修改)，在此场景下，update语句执行成功了，但是事务updateAge并没有执行"成功"(修改)

### .Net Core代码使用锁

以悲观锁和乐观锁的场景，看看.Net Core如何使用锁。EF使用锁比较麻烦，需要借助`ExecuteSqlRaw`、`FromSqlRaw`方法来执行原生Sql语句来实现锁。

Nuget包版本

![image-20230817120217918](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230817120217918.png)

#### 准备数据

准备三个接口：ChangeAgeByPCC（悲观锁）、ChangeAgeByOCC（乐观锁）、ChangeAgeNoLock（直接修改）

分别执行ChangeAgeByPCC、ChangeAgeByOCC接口，触发执行后接着执行ChangeAgeNoLock接口，观察各个接口执行的情况。

User实体类：

```csharp
    /// <summary>
    /// 用户信息
    /// </summary>
    public class User : BaseModel
    {
        /// <summary>
        /// 用户名称
        /// </summary>
        [MaxLength(100)]
        [Required]
        public string Name { get; private set; }
        /// <summary>
        /// 用户性别
        /// </summary>
        [Required]
        public int Age { get; private set; }
        /// <summary>
        /// 用户头像
        /// </summary>
        public string Avatar { get; private set; }
        /// <summary>
        /// 时间戳
        /// </summary>
        public byte[] TimesFlag { get; set; }

        public void SetAvatar(string avatar)
        {
            Avatar = avatar;
        }

        public void SetAge(int age)
        {
            Age = age;
        }

        public override string ToString()
        {
            return $"ID：{this.Id}，Avater：{this.Avatar}，Name：{this.Name}，Age：{this.Age}";
        }
    }
```

ChangeAgeNoLock接口实现逻辑：

```csharp
        /// <summary>
        /// 直接修改Age数据后查询
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string ChangeAgeNoLock(Guid userId)
        {
            // 不要先查出来再修改，可能会造成死锁
            // http://localhost:5125/api/SqlTest/ChangeAgeNoLock?userId=08db1fba-affb-49bd-88ca-6a91fe1e1a03
            _db.Database.ExecuteSqlRaw("update [User] set Age = Age + 1 where id ={0}", userId);
            var user = _db.User.FirstOrDefault(x => x.Id == userId);
            if (user == null) return "空数据";
            return $"修改成功，Age：{user.Age}，{DateTime.Now}";
        }
```

#### 悲观锁

修改Age为初始值4

```sql
update [User] set Age = 4 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

ChangeAgeByPCC接口实现逻辑：

```csharp
        /// <summary>
        /// 悲观锁
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="delay"></param>
        /// <returns></returns>
        public string ChangeAgeByPCC(Guid userId, int delay)
        {
            var sb = new StringBuilder();
            using (var tran = _db.Database.BeginTransaction())
            {
                // http://localhost:5125/api/SqlTest/ChangeAgeByPCC?userId=08db1fba-affb-49bd-88ca-6a91fe1e1a03
                string sql = "select * from [User] WITH(UPDLOCK) where id = @id";
                var param = new SqlParameter("@id", userId.ToString());
                var users = _db.Set<User>().FromSqlRaw(sql, param);
                var user = users.FirstOrDefault();
                if (user == null) return "空数据";
                sb.Append($"初始值为：{user.Age},{DateTime.Now}\n");
                Task.Delay(delay * 1000).Wait();
                user.SetAge(user.Age + 1);
                sb.Append($"修改值为：{user.Age},{DateTime.Now}\n");
                sb.Append($"等待：{delay}s\n");
                _db.SaveChanges();
                tran.Commit();
            }
            return sb.ToString();
        }
```

在执行ChangeAgeByPCC的同时执行ChangeAgeNoLock，我们看一下效果：

![image-20230817113158850](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230817113158850.png)

我们可以看出，ChangeAgeNoLock会等待ChangeAgeByPCC执行完毕后再执行，两个接口都**执行成功**。执行完后，Age的值由4变为6(4+1+1)。

#### 乐观锁

修改Age为初始值4

```sql
update [User] set Age = 4 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

ChangeAgeByOCC接口实现逻辑：

```csharp
        /// <summary>
        /// 乐观锁
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="delay"></param>
        /// <returns></returns>
        public string ChangeAgeByOCC(Guid userId, int delay)
        {
            var sb = new StringBuilder();
            using (var tran = _db.Database.BeginTransaction())
            {
                // http://localhost:5125/api/SqlTest/ChangeAgeByOCC?userId=08db1fba-affb-49bd-88ca-6a91fe1e1a03
                var user = _db.User.FirstOrDefault(x=>x.Id == userId);
                if (user == null) return "空数据";
                sb.Append($"初始值为：{user.Age},{DateTime.Now}\n");
                Task.Delay(delay * 1000).Wait();
                user.SetAge(user.Age + 1);
                sb.Append($"修改值为：{user.Age},{DateTime.Now}\n");
                sb.Append($"等待：{delay}s\n");

                var rowCount = _db.Database.ExecuteSqlRaw("update [User] set Age = {0} where id ={1} and TimesFlag = {2}", user.Age + 1, user.Id, user.TimesFlag);
                _db.SaveChanges();
                tran.Commit();
                sb.Append("修改" + (rowCount <= 0 ? "失败" : "成功"));
            }
            return sb.ToString();
        }
```

在执行ChangeAgeByOCC的同时执行ChangeAgeNoLock，我们看一下效果：

![image-20230817112256665](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230817112256665.png)

我们可以看出，在ChangeAgeByOCC执行的过程中执行ChangeAgeNoLock，ChangeAgeNoLock成功修改Age值，但是ChangeAgeByOCC修改Age的值却**提示失败**，说明此次修改不起作用。

我们再单独执行ChangeAgeByOCC接口，看一下效果：

![image-20230817112648640](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230817112648640.png)

我们可以看出，因为在ChangeAgeByOCC执行的过程中没有修改该数据，执行成功。



花了半个多月，终于撸完了，希望有帮助，去搬砖了。