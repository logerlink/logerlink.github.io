[TOC]

### 关于事务

#### 含义

事务：将一系列操作看成一个整体执行，这些操作要么全部执行成功，要么全部失败

#### 特性（ACID）

**原子性**：Atomicity，原子性是指事务是一个不可分割的工作单位，同一个事务中的操作要么全部执行成功，要么全部失败。

**一致性**：Consistency，事务前后的数据完整性必须保持一致。

**隔离**性：Isolation，隔离性是指多个用户并发访问数据库（同一张表）时，数据库开启的事务不能被其他事务所做的操作干扰，多个并发事务之间应当相互隔离。

如两个事务操作同一张表，事务1要么在事务2提交前执行，要么在事务2提交后执行。通常一个事务要等另一个事务提交后才会执行（提交），不会出现两个事务同时执行的情况。

**持久性**：Durability，持久性是指一个事务提交后，事务一系列操作对数据库的（数据）改变是永久性的，即使数据库发生故障也不影响（数据）的改变。

原子性、一致性、持久性可以归纳为可靠性。保证数据一致改变与不丢失。

隔离性，为了在并发场景下，"正确"读取数据。多事务并发执行时，可能会出现**脏读**、**不可重复读**、**幻读**问题，对于这些问题数据库也提供了不同的隔离级别应对——读未提交、读提交（默认）、可重复读、串行化。

#### 事务操作

```sql
-- 启用并提交事务
Begin Transaction Name
...
Rollback Transaction

-- 启用并回滚事务
Begin Transaction Name
...
Commit Transaction
```

#### 事务可靠演示

事务一旦开启，就一定要Commit（提交）或者Rollback（回滚）。提交操作会将事务的一系列更改真正更新到数据库中，回滚操作不会对数据库进行任何操作

```sql
Begin Transaction SetAge
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','明细的22','5555555555',18)
update [User] set Age = 1000
delete from [User]
Rollback Transaction
```

Rollback将事务回滚，不会对数据库进行任何操作，执行前后数据库没有发生任何改变。

![image-20230822181109514](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822181109514.png)

```sql
Begin Transaction SetAge
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','明细的22','5555555555',18)
update [User] set Age = 1000
delete from [User]
Commit Transaction
```

提交会依次执行事务的一系列操作

![image-20230822181321809](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822181321809.png)

#### 事务隔离演示

准备事务SetAge，并在事务中等待10s

```sql
Begin Transaction SetAge
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
waitfor delay '00:00:10'
Commit Transaction
```

我们可以用`sp_lock`命令，查看事务SetAge执行前后数据库锁的情况

![image-20230822175200340](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822175200340.png)

准备事务ReadAge，在事务SetAge执行期间，启用另一个窗口执行事务ReadAge

```sql
Begin Transaction ReaAge
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction
```

多测试几次，我们可以发现事务ReadAge总是在事务SetAge提交后才完成查询操作

准备下列语句，在事务SetAge执行期间，分别执行下列语句并观察执行情况

```sql
-- 等待事务ReadAge提交后执行
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 等待事务ReadAge提交后执行
update [User] set Age = 1000
-- 立即执行
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES ('57D50625-7559-42B9-933B-6684F8924A6C','明细的22','5555555555',18)
-- 等待事务ReadAge提交后执行
delete from .[User] where Id = '57D50625-7559-42B9-933B-6684F8924A6C'
```

当我们在开启事务时，默认为当前表加上意向排他锁（IX锁：[简单记录Sql Server常见锁类型 (logerlink.github.io)](https://logerlink.github.io/page/2023/SqlserverLock.html#xlock------排它锁)）。当前事务执行中，其他事务或语句可立即查看（带锁查询要分情况）、插入数据（新数据、注意唯一限定），其他事务或语句对**表内数据**进行更新、删除操作需要等待当前事务提交（锁释放）后才会执行。

### 数据库隔离级别

#### 读未提交

READ UNCOMMITTED。最低级别的隔离级别，所有事务都可以读取其他未提交事务的执行结果。该隔离级别性能最高，但很少用于实际应用

#### 读提交

READ COMMITTED。大多数数据库系统的**默认**隔离级别。设置该隔离级别，可处理**脏读**问题

#### 可重复读

REPEATABLE READ。保证同一个事务多次读取的数据是一样，但是不保证读取的数据行数是一样的。设置该隔离级别可处理**脏读**、**不可重复读**问题


#### 串行化

SERIALIZABLE。最高级别的隔离级别。强制事务排序，事务之间不可能相互冲突，从而解决幻读问题。设置该隔离级别可处理**脏读**、**不可重复读**、**幻读**问题。

由于串行化，是在每个读的数据上加锁，其他事务需要等待锁释放，可能会导致其他事务等待超时。串行化保证了事务的串行执行，数据稳定，但是对于并发事务的处理效率是非常低，实际应用中很少使用。

下列表格统计事务并发时不同隔离级别可能会出现的问题，"是"代表在该隔离级别下可能会出现的问题，"否"则相反

| 隔离级别                  | 脏读 | 不可重复读 | 幻读 | 加锁读 |
| ------------------------- | ---- | ---------- | ---- | ------ |
| 读未提交—READ UNCOMMITTED | 是   | 是         | 是   | 否     |
| 读提交—READ COMMITTED     | 否   | 是         | 是   | 否     |
| 可重复读—REPEATABLE READ  | 否   | 否         | 是   | 否     |
| 串行化—SERIALIZABLE       | 否   | 否         | 否   | 是     |

### 查看修改隔离级别

查看当前数据库的隔离级别

```sql
-- 查看数据库隔离级别，查看【isolation level】配置即可
DBCC Useroptions
```

![image-20230822170119342](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822170119342.png)

修改数据库隔离级别

```sql
-- 修改数据库隔离级别为REPEATABLE READ
-- READ UNCOMMITTED(读未提交)、READ COMMITTED(读提交)、REPEATABLE READ(可重复读)、SERIALIZABLE(串行化)
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
```

### 事务并发问题

多事务并发执行时，可能会出现脏读、不可重复读、幻读问题，我们先简单介绍这几个问题的场景再通过修改隔离级别一一解决问题。

#### 脏读

一个事务读取到了另一个事务未提交的数据。

设置数据库隔离级别为 `READ UNCOMMITTED(读未提交)`

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
```

![image-20230822170712948](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822170712948.png)

修改并查看初始数据

```sql
update [User] set Age = 5 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

![image-20230823101006637](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823101006637.png)

准备事务SetAge，将Age值改为100

```sql
Begin Transaction SetAge
-- 修改Age为100
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
-- 等待10s
waitfor delay '00:00:10'
Commit Transaction
```

准备事务ReadAge，在事务SetAge执行过程中，启用另一个窗口执行事务ReadAge，并查看执行情况

```sql
Begin Transaction ReaAge
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction
```

![image-20230822181947957](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230822181947957.png)

我们可以发现，事务ReadAge总是在事务SetAge提交后执行，事务ReadAge总是能拿到事务SetAge未提交的值——100。我们称这种现象为脏读，解决这个问题我们只要将数据库的隔离级别设为READ COMMITTED(读提交)、REPEATABLE READ(可重复读)、SERIALIZABLE(串行化)其中的一个即可

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED
```

设置后再次执行上述操作，查看执行情况，我们可以发现事务ReadAge拿到的Age值还是初始值——5

![image-20230823100411296](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823100411296.png)

#### 不可重复读

一个事务开始读取到了某个值，过段时间，再次读取该值，发现与之前读取的值不一致，可能是这段时间内别的事务将该值修改了。

设置数据库隔离级别为 `READ UNCOMMITTED(读未提交)`、`READ COMMITTED(读提交)`任意一个

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED
```

修改并查看初始数据

```sql
update [User] set Age = 5 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
select * from [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

![image-20230823101006637](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823101006637.png)

准备事务ReadAge，多次读取Age值

```sql
Begin Transaction ReadAge
declare @age int
select @age = Age From [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
print '第一次查询Age：'+ CONVERT(nvarchar , @age)
waitfor delay '00:00:10'
select @age = Age From [User] where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
print '第二次查询Age：'+ CONVERT(nvarchar , @age)
Rollback Transaction
```

准备事务SetAge，将Age值改为100。在事务ReadAge执行过程中，启用另一个窗口执行事务SetAge，并查看执行情况

```sql
Begin Transaction SetAge
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
Commit Transaction
```

![image-20230823102509152](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823102509152.png)

我们可以发现，由于事务ReadAge没有操作数据库，事务SetAge立即执行。事务ReadAge前后两次读取Age值不一致，这就是不可重复读。

有个**特别现象**：如果事务ReadAge在第二次读取Age前有修改Age（修改为1000）操作，事务SetAge会等待事务ReadAge提交或回滚后才提交。此时事务ReadAge第二次读取的值则是当前事务修改后的Age值（1000），此时查询数据库发现数据库的值是事务SetAge修改的值（100）

![image-20230823104215444](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823104215444.png)

如何处理不可重复读问题？我们可以将数据库的隔离级别设置为REPEATABLE READ(可重复读)、SERIALIZABLE(串行化)其中的一个即可

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
```

设置后再次执行上述操作，查看执行情况，我们可以发现事务SetAge需要等待事务ReadAge提交后，才开始执行。事务ReadAge前后两次读取Age值一致

#### 幻读

事务A将表内某批数据修改，在事务A提交前事务B往该表插入或删除一条数据，事务A再次查询数据会发现多或少一条数据，而这条数据就是事务B刚刚提交的数据。

幻读和不可重复读都是事务前后读取的数据不一致，但是幻读更侧重于插入、删除的数据（行数的变化）。

设置数据库隔离级别为 READ UNCOMMITTED(读未提交)、READ COMMITTED(读提交)、REPEATABLE READ(可重复读)任意一个

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
```

查看初始数据

```sql
select * from [User]
```

![image-20230823105524114](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823105524114.png)

准备事务SetAge，将Age值都改为100

```sql
Begin Transaction SetAge
update [User] set Age = 100
waitfor delay '00:00:10'
select * from [User]
Commit Transaction
```

准备事务AddUser，插入一条Age为18的新数据。在事务SetAge执行过程中，启用另一个窗口执行事务AddUser，并查看执行情况

```sql
Begin Transaction AddUser
INSERT INTO [dbo].[User] ([Id],[Name],[Avatar],[Age])
     VALUES (NEWID(),'大明','369369',18)
Commit Transaction
```

![image-20230823110349353](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823110349353.png)

我们可以发现，在事务SetAge执行过程中，执行事务AddUser，事务AddUser立即执行（IX锁插入无需等待）。事务SetAge将所有Age值改为100，执行后再次查询，发现有一条数据（事务AddUser新增的）的Age值没有变为100。可是明明已经全部修改，怎么还有一些数据没有改过来，这就是幻读。我们可以将数据库的隔离级别设置为SERIALIZABLE(串行化)解决幻读问题。

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
```

设置后再次执行上述操作，查看执行情况，我们可以发现事务AddUser需要等待事务SetAge提交后，才开始执行。事务SetAge在更改后正常读取数据——行数没有发生改变，值都改为了100.

![image-20230823111258751](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823111258751.png)

在执行事务SetAge的时候，我们使用`sp_lock`查看数据库锁发现，数据库隔离级别为SERIALIZABLE时，事务执行更新操作时，会给数据表加上排他锁（X）导致其他事务或语句对该表进行插入、删除、更新操作时需要等待当前事务提交（锁释放）后才会执行。其他隔离级别只会加上意向排他锁（IX），对该表进行插入操作立即执行，导致出现幻读。

![image-20230823112620707](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823112620707.png)

### 代码应用

环境：.Net6.0

![image-20230831110952189](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230831110952189.png)

#### EF使用事务

ef常见的三种事务使用方式——SaveChanges、DBContextTransaction、TransactionScope

参考：[EF的三种事务的应用场景和各自注意的问题(SaveChanges、DBContextTransaction、TransactionScope)_ef事务_虫儿Sound的博客-CSDN博客](https://blog.csdn.net/weixin_45756851/article/details/126466392)

##### SaveChanges

SaveChanges平时用的最多，仅针对一个数据库，不能控制多个数据库。如我们对数据库不同数据或表进行增删改操作后，调用SaveChanges，统一提交。

SaveChange 成功演示

```csharp
        /// <summary>
        /// SaveChange 成功演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string SaveChangeTest(Guid userId)
        {
            try
            {
                var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                if (delUser == null) return "空数据";
                // 删除数据
                _db.User.Remove(delUser);
                var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                if (user == null) throw new Exception("没数据");
                // 修改Age数据
                user.SetAge(new Random().Next(1000));
                // 新增数据
                _db.User.Add(new User(Guid.NewGuid(), "张三", 55, "test123"));
                var count = _db.SaveChanges();
                return "执行成功，影响行数：" + count;
            }
            catch (Exception ex)
            {
                return "执行失败：" + ex.Message;
            }
        }
```

SaveChangeTest接口执行后，没有异常，数据库操作全部成功。

![image-20230823164021877](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823164021877.png)

SaveChange失败演示：

```csharp
        /// <summary>
        /// SaveChangeTestError SaveChange失败演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string SaveChangeTestError(Guid userId)
        {
            try
            {
                var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                if (delUser == null) return "空数据";
                // 删除数据
                _db.User.Remove(delUser);
                var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                if (user == null) throw new Exception("没数据");
                var age = new Random().Next(1000);
                // 修改Age数据
                user.SetAge(age);
                // 新增数据
                _db.User.Add(new User(user.Id, "张三" + age, 55, "test123"));     // create unique clustered index idx_id on[User](id);  操作前为id创建唯一聚集索引，插入相同ID会报错
                var count = _db.SaveChanges();
                return "执行成功，影响行数：" + count;
            }
            catch (Exception ex)
            {
                return "执行失败：" + ex.Message;
            }
        }
```

SaveChangeTestError 接口执行后，程序出现异常，没有成功调用SaveChanges，所有的操作都无效，接口执行前后数据库数据不受影响。

![image-20230823164458252](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823164458252.png)

##### DBContextTransaction

仅针对一个数据库，不能控制多个数据库。依靠SaveChanges对数据库进行操作，支持多个SaveChanges提交或回滚，如一个事务存在三个SaveChanges，前两个SaveChanges执行成功，最后一个SaveChanges执行失败，此时主动调用`Rollback`方法则可以将该事务内部的一系列操作（包括已经成功的SaveChanges的操作）全部回滚。默认事务隔离级别为`READ COMMITTED`

DBContextTransaction常见格式

```csharp
			// 开启事务
            using (var tran = _db.Database.BeginTransaction())
            {
                try
                {
                    // ...
                    var count = _db.SaveChanges();		// 保存对数据库的操作
                    tran.Commit();						// 提交事务
                    return "执行成功，影响行数：" + count;
                }
                catch (Exception ex)
                {
                    tran.Rollback();					// 回滚事务
                    return "执行失败：" + ex.Message;
                }
            }
```

DBContextTransaction 成功演示

```csharp
        /// <summary>
        /// DBContextTransaction 成功演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string DBContextTransactionTest(Guid userId)
        {
            using (var tran = _db.Database.BeginTransaction())
            {
                try
                {
                    var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                    if (delUser == null) return "空数据";
                    // 删除数据
                    _db.User.Remove(delUser);
                    var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                    if (user == null) throw new Exception("没数据");
                    var age = new Random().Next(1000);
                    // 修改Age数据
                    user.SetAge(age);
                    // 新增数据
                    _db.User.Add(new User(new Guid(), "张三" + age, 55, "test123"));
                    var count = _db.SaveChanges();
                    tran.Commit();
                    return "执行成功，影响行数：" + count;
                }
                catch (Exception ex)
                {
                    tran.Rollback();
                    return "执行失败：" + ex.Message;
                }
            }
        }
```

DBContextTransactionTest 接口执行后，没有异常，数据库操作全部成功。

![image-20230823170158404](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823170158404.png)

DBContextTransaction 失败演示

```csharp
        /// <summary>
        /// DBContextTransaction 失败演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string DBContextTransactionTestError(Guid userId)
        {
            using (var tran = _db.Database.BeginTransaction())
            {
                try
                {
                    var count = 0;
                    var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                    if (delUser == null) return "空数据";
                    // 删除数据
                    _db.User.Remove(delUser);
                    var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                    if (user == null) throw new Exception("没数据");
                    var age = new Random().Next(1000);
                    // 修改Age数据
                    user.SetAge(age);
                    count += _db.SaveChanges();
                    // 新增数据
                    _db.User.Add(new User(user.Id, "张三" + age, 55, "test123"));		// create unique clustered index idx_id on[User](id);  操作前为id创建唯一聚集索引，插入相同ID会报错
                    count += _db.SaveChanges();
                    tran.Commit();
                    return "执行成功，影响行数：" + count;
                }
                catch (Exception ex)
                {
                    tran.Rollback();
                    return "执行失败：" + ex.Message;
                }
            }
        }
```

DBContextTransactionTestError 接口执行后，程序出现异常，事务执行回滚操作，所有的操作都无效，包括已经SaveChanges的操作，接口执行前后数据库数据不受影响。

![image-20230823172245484](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230823172245484.png)

##### TransactionScope

可针对不同的数据库，可以控制**多个数据库**。依靠SaveChanges对数据库进行操作，支持多个SaveChanges提交或回滚。如一个事务存在三个SaveChanges，前两个SaveChanges执行成功，最后一个SaveChanges执行失败或异常，导致没有执行`Complete`方法，此时事务会将该事务内部的一系列操作（包括已经成功的SaveChanges的操作）全部回滚，当然也可以使用Try...Catch捕获异常后手动回滚（Transaction.Current.Rollback）。TransactionScope事务正常结束最后一定要调用`Complete`方法。默认事务隔离级别为Serializable（串行化）

特别注意：如果使用该事务来处理多个数据库(多个DBContext)时,必须手动**开启msdtc服务**,这样才可以将多个DB的SaveChange给放到一个事务中，如果失败， 则多个数据库的数据统一回滚。开启msdtc服务的步骤： cmd命令→net start msdtc

TransactionScope常见格式

```csharp
//Complete提交、若出现异常则自动回滚
            using (var ts = new TransactionScope())
            {
                var db1 = ...;
                var db2 = ...;
                db1.SaveChanges();
                db2.SaveChanges();
                ts.Complete();
            }
// 或者可以手动回滚
            using (var ts = new TransactionScope())
            {
                try
                {
                    var db1 = ...;
                    var db2 = ...;
                    db1.SaveChanges();
                    db2.SaveChanges();
                    ts.Complete();
                }
                catch (Exception ex)
                {
                    if(Transaction.Current != null) Transaction.Current.Rollback();
                    return "执行失败";
                }
            }
```

TransactionScope 成功演示

```csharp
        /// <summary>
        /// TransactionScope 成功演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string TransactionScopeTest(Guid userId)
        {
            using (var ts = new TransactionScope())
            {
                var count = 0;
                var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                if (delUser == null) return "空数据";
                // 删除数据
                _db.User.Remove(delUser);
                var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                if (user == null) throw new Exception("没数据");
                var age = new Random().Next(1000);
                // 修改Age数据
                user.SetAge(age);
                count += _db.SaveChanges();
                // 新增数据
                _db.User.Add(new User(Guid.NewGuid(), "张三" + age, 55, "test123"));
                count += _db.SaveChanges();
                ts.Complete();
                return "执行成功，影响行数：" + count;
            }
        }
```

TransactionScopeTest 接口执行后，没有异常，数据库操作全部成功。

![image-20230824152801143](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230824152801143.png)

TransactionScope 失败演示

```csharp
        /// <summary>
        /// TransactionScope 失败演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string TransactionScopeTestError(Guid userId)
        {
            #region 失败自动回滚
            try
            {
                using (var ts = new TransactionScope())
                {
                    var count = 0;
                    var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
                    if (delUser == null) return "空数据";
                    // 删除数据
                    _db.User.Remove(delUser);
                    var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
                    if (user == null) throw new Exception("没数据");
                    var age = new Random().Next(1000);
                    // 修改Age数据
                    user.SetAge(age);
                    count += _db.SaveChanges();
                    // 新增数据
                    _db.User.Add(new User(user.Id, "张三" + age, 55, "test123"));       // create unique clustered index idx_id on[User](id);  操作前为id创建唯一聚集索引，插入相同ID会报错
                    count += _db.SaveChanges();
                    ts.Complete();
                    return "执行成功，影响行数：" + count;
                }
            }
            catch (Exception ex)
            {
                // 事务失败、自动回滚
                return "执行失败：" + ex.Message;
            }
            #endregion

            #region 失败手动回滚
            //using (var ts = new TransactionScope())
            //{
            //    try
            //    {
            //        var count = 0;
            //        var delUser = _db.User.FirstOrDefault(x => x.Id == userId);
            //        if (delUser == null) return "空数据";
            //        // 删除数据
            //        _db.User.Remove(delUser);
            //        var user = _db.User.FirstOrDefault(x => x.Id == Guid.Parse("08DB1FBA-AFFB-49BD-88CA-6A91FE1E1A03"));
            //        if (user == null) throw new Exception("没数据");
            //        var age = new Random().Next(1000);
            //        // 修改Age数据
            //        user.SetAge(age);
            //        count += _db.SaveChanges();
            //        // 新增数据
            //        _db.User.Add(new User(user.Id, "张三" + age, 55, "test123"));     // create unique clustered index idx_id on[User](id);  操作前为id创建唯一聚集索引，插入相同ID会报错
            //        count += _db.SaveChanges();
            //        ts.Complete();
            //        return "执行成功，影响行数：" + count;
            //    }
            //    catch (Exception ex)
            //    {
            //        // 事务失败、手动回滚，try...catch要放在using的范围内
            //        if (Transaction.Current != null) Transaction.Current.Rollback();
            //        return "执行失败：" + ex.Message;
            //    }
            //}
            #endregion
        }
```

TransactionScopeTestError 接口执行后，程序出现异常，事务执行回滚操作，所有的操作都无效，包括已经SaveChanges的操作，接口执行前后数据库数据不受影响。

![image-20230824153032056](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230824153032056.png)

#### EF使用事务及隔离级别

一般情况下，SaveChanges会默认使用当前数据库的隔离级别。DBContextTransaction默认的隔离级别为`READ COMMITTED`，可以通过System.Data.IsolationLevel指定不同的隔离级别。TransactionScope默认的隔离级别为`SERIALIZABLE`，可以通过System.Transactions.IsolationLevel指定不同的隔离级别。如何指定不同的隔离级别，如下示例

```csharp
// DBContextTransaction设置隔离级别
using (var tran = _db.Database.BeginTransaction(System.Data.IsolationLevel.RepeatableRead))
	...
    
// TransactionScope 设置隔离级别
using (var ts = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions() { IsolationLevel = System.Transactions.IsolationLevel.RepeatableRead }))
    ...
```

##### 准备工作

User类：

```csharp
    /// <summary>
    /// 用户信息
    /// </summary>
    public class User : BaseModel
    {
        public User()
        {

        }
        public User(Guid id,string name,int age,string avatar)
        {
            this.Id = id;
            this.Name = name;
            this.Age = age;
            this.Avatar = avatar;
        }
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

DMSession类：

```csharp
    /// <summary>
    /// 查看当前的数据库隔离级别
    /// </summary>
    public class DMSession
    {
        [Key]
        public int session_id { get; set; }
        public int transaction_isolation_level { get; set; }
    }
```

GetLevelName方法：

```csharp
        /// <summary>
        /// 获取事务隔离级别名称
        /// </summary>
        /// <param name="level"></param>
        /// <returns></returns>
        string GetLevelName(int level) => level switch
        {
            0 => "Unspecified",
            1 => "ReadUncommitted",
            2 => "ReadCommitted",
            3 => "Repeatable",
            4 => "Serializable",
            5 => "Snapshot",
        };
```

##### SaveChanges

SaveChanges会默认使用当前数据库的隔离级别。

设置数据库隔离级别为默认值`READ COMMITTED`

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED
```

设置初始数据

```sql
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

准备接口ReadAgeByChange，分两次读取数据

```csharp
        /// <summary>
        /// 查看值，SaveChanges演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string ReadAgeByChange(Guid userId)
        {
            var sb = new StringBuilder();

            var sql = "SELECT CONVERT(int,session_id) session_id,CONVERT(int,transaction_isolation_level) transaction_isolation_level FROM sys.dm_exec_sessions WHERE session_id = @@SPID";
            var session = _db.Set<DMSession>().FromSqlRaw(sql).FirstOrDefault();
            if (session == null) return "空数据";
            sb.AppendLine("当前事务隔离级别：" + GetLevelName(session.transaction_isolation_level));
            sb.AppendLine("当前事务超时时间：" + TransactionManager.DefaultTimeout);

            var user = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId); // 要加上AsNoTracking，不然不管什么隔离级别两次查询都是一样的
            if (user == null) return "空数据";
            sb.AppendLine($"第一次查询，Age：{user.Age}，{DateTime.Now}");

            Task.Delay(10 * 1000).Wait();

            var gg = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId);
            if (gg == null) return "空数据";
            sb.AppendLine($"第二次查询，Age：{gg.Age}，{DateTime.Now}");

            sb.AppendLine("执行成功");
            return sb.ToString();
        }
```

准备接口SetAge，执行ReadAgeByChange后，执行SetAge接口，观察接口执行情况

```csharp
        /// <summary>
        /// 修改值
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string SetAge(Guid userId)
        {
            _db.Database.ExecuteSqlRaw("update [User] set Age = 999 where id ={0}", userId);
            _db.SaveChanges();
            return $"修改成功{DateTime.Now}";
        }
```

![image-20230830172914006](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230830172914006.png)

我们可以发现，执行接口ReadAgeByChange后，执行SetAge接口。SetAge接口立即执行，接口ReadAgeByChange两次查询的值不一致，成功复现不可重复读问题

##### DBContextTransaction

DBContextTransaction默认的隔离级别为`READ COMMITTED`，可以通过System.Data.IsolationLevel指定不同的隔离级别。

~~（翻阅之前的文档，文档提到DBContextTransaction默认的隔离级别`REPEATABLE READ(可重复读)`，但我经过测试发现DBContextTransaction默认的隔离级别为`READ COMMITTED`。可能是版本问题或者参考的文档有误，所以该文章以测试为准）~~

设置数据库隔离级别`READ UNCOMMITTED(读未提交)`

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
```

设置初始数据

```sql
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

准备接口ReadAgeByTransaction，分两次读取数据

```csharp
        /// <summary>
        /// 多次查看值，BeginTransaction 演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string ReadAgeByTransaction(Guid userId)
        {
            using (var tran = _db.Database.BeginTransaction())
            {
                var sb = new StringBuilder();

                var sql = "SELECT CONVERT(int,session_id) session_id,CONVERT(int,transaction_isolation_level) transaction_isolation_level FROM sys.dm_exec_sessions WHERE session_id = @@SPID";
                var session = _db.Set<DMSession>().FromSqlRaw(sql).FirstOrDefault();
                if (session == null) return "空数据";
                sb.AppendLine("当前事务隔离级别：" + GetLevelName(session.transaction_isolation_level));
                sb.AppendLine("当前事务超时时间：" + TransactionManager.DefaultTimeout);

                var user = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId); // 要加上AsNoTracking，不然不管什么隔离级别两次查询都是一样的
                if (user == null) return "空数据";
                sb.AppendLine($"第一次查询，Age：{user.Age}，{DateTime.Now}");

                Task.Delay(10 * 1000).Wait();

                var gg = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId);
                if (gg == null) return "空数据";
                sb.AppendLine($"第二次查询，Age：{gg.Age}，{DateTime.Now}");

                sb.AppendLine("执行成功");
                tran.Commit();
                return sb.ToString();
            }
        }
```

准备接口SetAge，执行ReadAgeByChange后，执行SetAge接口，观察接口执行情况

```csharp
        /// <summary>
        /// 修改值
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string SetAge(Guid userId)
        {
            _db.Database.ExecuteSqlRaw("update [User] set Age = 999 where id ={0}", userId);
            _db.SaveChanges();
            return $"修改成功{DateTime.Now}";
        }
```

![image-20230830180229735](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230830180229735.png)

我们可以发现，执行接口ReadAgeByTransaction后，执行SetAge接口。SetAge接口立即执行，接口ReadAgeByTransaction两次查询的值不一致，成功复现不可重复读问题，而且我们前面已经设置数据库隔离级别为`READ UNCOMMITTED(读未提交)`，执行时获取当前事务隔离级别却是`READ COMMITTED`。

接下来我们在c#代码中修改事务的隔离级别为`REPEATABLE READ(可重复读)`，再次执行接口ReadAgeByTransaction、SetAge，观察接口执行情况

```csharp
using (var tran = _db.Database.BeginTransaction(System.Data.IsolationLevel.RepeatableRead))
    ...
```

![image-20230830174134587](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230830174134587.png)

修改事务的隔离级别后，执行接口ReadAgeByTransaction、SetAge。接口SetAge会等待接口ReadAgeByTransaction执行完后才执行，接口ReadAgeByTransaction中两次读取的值都是一样的，避免了不可重复读问题

##### TransactionScope

设置数据库隔离级别`READ UNCOMMITTED(读未提交)`

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
```

设置初始数据

```sql
update [User] set Age = 100 where id = '08db1fba-affb-49bd-88ca-6a91fe1e1a03'
```

准备接口ReadAgeByTransactionScope，分两次读取数据

```csharp
        /// <summary>
        /// 多次查看值，TransactionScope 演示
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string ReadAgeByTransactionScope(Guid userId)
        {
            //using (var ts = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions() { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted }))
            using (var ts = new TransactionScope())
            {
                var sb = new StringBuilder();

                var sql = "SELECT CONVERT(int,session_id) session_id,CONVERT(int,transaction_isolation_level) transaction_isolation_level FROM sys.dm_exec_sessions WHERE session_id = @@SPID";
                var session = _db.Set<DMSession>().FromSqlRaw(sql).FirstOrDefault();
                if (session == null) return "空数据";
                sb.AppendLine("当前事务隔离级别：" + GetLevelName(session.transaction_isolation_level));
                sb.AppendLine("当前事务超时时间：" + TransactionManager.DefaultTimeout);

                var user = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId); // 要加上AsNoTracking，不然不管什么隔离级别两次查询都是一样的
                if (user == null) return "空数据";
                sb.AppendLine($"第一次查询，Age：{user.Age}，{DateTime.Now}");

                Task.Delay(10 * 1000).Wait();

                var gg = _db.User.AsNoTracking().FirstOrDefault(x => x.Id == userId);
                if (gg == null) return "空数据";
                sb.AppendLine($"第二次查询，Age：{gg.Age}，{DateTime.Now}");

                sb.AppendLine("执行成功");
                ts.Complete();
                return sb.ToString();
            }
        }
```

准备接口SetAge，执行ReadAgeByTransactionScope后，执行SetAge接口，观察接口执行情况

```csharp
        /// <summary>
        /// 修改值
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string SetAge(Guid userId)
        {
            _db.Database.ExecuteSqlRaw("update [User] set Age = 999 where id ={0}", userId);
            _db.SaveChanges();
            return $"修改成功{DateTime.Now}";
        }
```

![image-20230830181136808](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230830181136808.png)

我们可以发现，执行接口ReadAgeByTransactionScope后，执行SetAge接口。接口SetAge会等待接口ReadAgeByTransaction执行完后才执行，接口ReadAgeByTransactionScope中两次读取的值都是一样的，避免了不可重复读问题，而且我们前面已经设置数据库隔离级别为`READ UNCOMMITTED(读未提交)`，执行时获取当前事务隔离级别却是`SERIALIZABLE`。

接下来我们在c#代码中修改事务的隔离级别为`READ COMMITTED(读已提交)`，再次执行接口ReadAgeByTransaction、SetAge，观察接口执行情况

```csharp
using (var ts = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions() { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted }))
    ...
```

![image-20230830182128240](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230830182128240.png)

修改事务的隔离级别后，执行接口ReadAgeByTransactionScope、SetAge。接口SetAge立即执行，SetAge接口立即执行，接口ReadAgeByTransaction两次查询的值不一致，成功复现不可重复读问题。

##### EF查看事务隔离级别

EF查看当前的事务隔离级别和事务超时时间（默认1分钟），TransactionScope可以直接使用`Transaction.Current?.IsolationLevel`获取当前事务的隔离级别，其他不行

```csharp
       /// <summary>
       /// 获取当前的事务隔离级别
       /// </summary>
       /// <returns></returns>
        public string GetTran()
        {
            var sb = new StringBuilder();
            using (var tran = _db.Database.BeginTransaction())  // System.Data.IsolationLevel.Serializable
            {
                var sql = "SELECT CONVERT(int,session_id) session_id,CONVERT(int,transaction_isolation_level) transaction_isolation_level FROM sys.dm_exec_sessions WHERE session_id = @@SPID";
                var session = _db.Set<DMSession>().FromSqlRaw(sql).FirstOrDefault();
                if (session == null) return "空数据";
                sb.AppendLine("当前事务隔离级别：" + GetLevelName(session.transaction_isolation_level));
                sb.AppendLine("当前事务超时时间：" + TransactionManager.DefaultTimeout);
                
                tran.Commit();
            }

            sb.AppendLine("----------TransactionScope----------");

            using (var ts = new TransactionScope())
            {
                sb.AppendLine("当前事务隔离级别：" + Transaction.Current?.IsolationLevel.ToString());
                sb.AppendLine("当前事务超时时间：" + TransactionManager.DefaultTimeout);

                sb.AppendLine("执行成功");
                ts.Complete();
            }
            sb.AppendLine("执行成功");

            return sb.ToString();
        }
```

![image-20230831110612086](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230831110612086.png)
