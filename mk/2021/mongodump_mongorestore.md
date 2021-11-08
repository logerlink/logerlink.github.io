[TOC]

#### 全量备份、差异备份、增量备份

![u=3157406177,12331095&fm=253&app=138&f=JPEG](https://i.loli.net/2021/11/03/DgjEA1mMVnc974i.jpg)

看图写字：

##### 资源占比

如周日做了一个备份共 10G ，往后每天产生 1G 数据。在大数据的角度来看的话增量备份优势还是很大的。而且从时间上来看备份 1G 数据明显要比备份十几G数据所花费的时间要少。

备份占用空间：全量备份 > 差异备份 > 增量备份

备份花费时间：全量备份 > 差异备份 > 增量备份

|          | 一   | 二   | 三   | 四   | 五   | 六   | 总   |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 全量备份 | 10+1 | 11+1 | 12+1 | 13+1 | 14+1 | 15+1 | 81   |
| 差异备份 | 1    | 1+1  | 2+1  | 3+1  | 4+1  | 5+1  | 21   |
| 增量备份 | 1    | 1    | 1    | 1    | 1    | 1    | 6    |

##### 还原复杂度

为何要备份数据？备份就是为还原做准备的，那我们再看看这三种模式还原又有什么表现呢？

如周四数据出现问题，我们要将整个数据回退到周三前的数据。

备份还原复杂度：增量备份 > 差异备份 > 全量备份

|          | 备份还原操作                                                 |
| -------- | ------------------------------------------------------------ |
| 全量备份 | 直接找到周三的（全量）备份，还原即可                         |
| 差异备份 | 先找最近一次（周日）的全量备份A，再找周三的（差异）备份B。<br />先还原全量备份A，再还原差异备份B |
| 增量备份 | 先找最近一次（周日）的全量备份A，再找周一到周三的增量备份（B、C、D）<br />先还原全量备份A，再还原差异备份B、C、D。顺序不能乱，也不要缺失任何一份增量备份数据 |

##### 备份数据缺失

如周四数据出现问题，我们要将整个数据回退到周三前的数据，可周二的备份数据被删除了，或者周二备份失败了。这时候又会发生什么呢？

对于全量、差异备份，缺少周二的数据并没有太大影响，整体数据基本不会缺失；而对于增量备份，周二的数据无法恢复，整体数据会缺失周二的数据。

备份还原安全性：全量备份 > 差异备份 > 增量备份

掐头去尾取中间，大家都推荐用差异备份，如sql server默认的方式就是差异备份。而 mongodb 副本集有 oplog 的加持，做备份的时候大多都是增量备份，这也是我们今天要讲的内容。

##### 其他

**mongodb 单机无法做增量备份，只能做全量备份**


关于这三者的区别与介绍可参考：[全量备份/增量备份/差异备份说明 - 散尽浮华 - 博客园 (cnblogs.com)](https://www.cnblogs.com/kevingrace/p/6098963.html)

#### 工具准备

OS：window

mongodb v5.0.3  下载地址：[MongoDB Community Download | MongoDB](https://www.mongodb.com/try/download/community)

mongodump、mongorestore 下载地址：[Download MongoDB Command Line Database Tools | MongoDB](https://www.mongodb.com/try/download/database-tools)

#### mongodump

备份所有库

```js
mongodump -h 链接地址:端口 --oplog -o 输出文件夹路径
```

**--oplog**	备份过程如果有插入数据，会将这些操作一起记到 oplog 文件，后续使用mongorestore 还原时指定 --oplogReplay 可以将全部数据还原，就不会出现漏数据的问题了。单机mongodb不能指定 --oplog 参数

**-o**	输出文件夹路径

**基本语法**

```js
mongodump -h 链接地址:端口 -u 用户名 -p 密码 -d 数据库名称 -c 集合名称 -q 搜索条件 --oplog -o 备份输出文件夹路径
```

**-u** 用户名  **-p** 密码		没有账号密码可不填

**-d** 数据库名称  **-c** 集合名称	可不填，不填时默认备份全库全表

**-q** 搜索条件	可不填，要填的话一定要指定**-d -c** 的参数，这个搜索条件就是 **-c** 指定表的搜索条件。这里要写成 json 字符串，一定要写双引号，双引号的内部双引号或特殊符号要记得转义，如：

```js
-q "{\"name\":\"xiaoming\"}"
```

**-q** 要符合 mongo 的 json ，[specifications/extended-json.rst at master · mongodb/specifications (github.com)](https://github.com/mongodb/specifications/blob/master/source/extended-json.rst)  如：

```js
use local
//举例：搜索local库oplog.rs集合中 ts小于1635929573 且 ns以test开头的记录
//mongodb 正常的搜索
db.oplog.rs.find({ts:{$gt:Timestamp(1635929573,1)},ns:/^test/})
```

![image-20211106151311918](https://i.loli.net/2021/11/06/IcqxlnvWh9sutkm.png)

```js
//mongodump 的查询要写成
-q "{\"ts\":{\"$gt\":{\"$timestamp\":{\"t\":1635929573,\"i\":1}}},\"ns\":{\"$regex\":\"^test\"}}"
// 非转义  {"ts":{"$gt":{"$timestamp":{"t":1635929573,"i":1}}},"ns":{"$regex":"^test"}}
// ***特别注意的是：这个-q的查询，用mongodb正常查询是查不出来记录的 如下：
// db.oplog.rs.find({"ts":{"$lt":{"$timestamp":{"t":1635929573,"i":1}}},"ns":{"$regex":"^test"}})
// ***这样是查不出来记录的
```

![image-20211106151523389](https://i.loli.net/2021/11/06/8iM2LG4BuNgpWsr.png)

#### mongorestore

**基本语法**

```js
mongorestore -h 链接地址:端口 -u 用户名 -p 密码 -d 数据库名称 -c 集合名称 --drop --oplogReplay  指定还原的文件夹路径
```

**-u** 用户名  **-p** 密码		没有账号密码可不填

**-d** 数据库名称  **-c** 集合名称	指定还原某个库、某个表，可不填，不填默认还原全库全表

**--drop** 还原过程中出现冲突时，先删除冲突数据，再进行还原。有时候还原过程中出现主键冲突时可以加上这个参数处理

**--oplogReplay** 配合 mongodump 的  **--oplog**  参数使用，如果你的备份没有使用 **--oplog** ，那么还原的时候就不要指定  **--oplogReplay **参数

#### window 搭建mongodb 副本集

创建三个文件夹 rs1、rs2、rs3 ，分别代表三个 mongodb 服务

rs1 文件夹示例， rs2、rs3 基本都一样

![image-20211105144526790](https://i.loli.net/2021/11/05/Vy2oUxhFSuN57KA.png)

##### rs1

1. 创建 db 文件夹，一定要创建
2. 创建 mongodb.conf 文件，内容为

```shell
dbpath=D:\Install\mongos\rs1\db
logpath=D:\Install\mongos\rs1\mongodb.log
logappend=true
journal=true
quiet=true
port=27007
replSet = testrs
```

3. 创建 mongodb.log 文件，内容留空，一定要创建
4. 创建 start.bat 文件，启动程序，双击即可开启 mongodb 服务，内容为

```shell
cd D:\Install\mongodb5\bin
mongod --config D:\Install\mongos\rs1\mongodb.conf
```

##### rs2

1. 创建 db 文件夹，一定要创建
2. 创建 mongodb.conf 文件，内容为

```shell
dbpath=D:\Install\mongos\rs2\db
logpath=D:\Install\mongos\rs2\mongodb.log
logappend=true
journal=true
quiet=true
port=27008
replSet = testrs
```
3. 创建 mongodb.log 文件，内容留空，一定要创建
4. 创建 start.bat 文件，启动程序，双击即可开启 mongodb 服务，内容为

```shell
cd D:\Install\mongodb5\bin
mongod --config D:\Install\mongos\rs2\mongodb.conf
```

##### rs3

1. 创建 db 文件夹，一定要创建
2. 创建 mongodb.conf 文件，内容为

```shell
dbpath=D:\Install\mongos\rs3\db
logpath=D:\Install\mongos\rs3\mongodb.log
logappend=true
journal=true
quiet=true
port=27009
replSet = testrs
```
3. 创建 mongodb.log 文件，内容留空，一定要创建
4. 创建 start.bat 文件，启动程序，双击即可开启 mongodb 服务，内容为

```shell
cd D:\Install\mongodb5\bin
mongod --config D:\Install\mongos\rs3\mongodb.conf
```

##### 启动rs1、rs2、rs3

分别双击 rs1、rs2、rs3 文件夹下的 start.bat 即可启动

##### 配置添加节点

打开 cmd 窗口，按顺序执行以下命令

```shell
#进入到 mongodb环境
mongo localhost:27007
# 切到admin库
use admin
# 定义变量
# priority 优先级 同等条件下优先级越高  越容易被选举为主节点
# arbiterOnly 该节点为仲裁节点，仅用于内部选举，无法读写数据
cfg={ _id:"testrs", members:[ {_id:0,host:'localhost:27007',priority:2}, {_id:1,host:'localhost:27008',priority:1}, {_id:2,host:'localhost:27009',arbiterOnly:true}] };
# 初始化节点配置
rs.initiate(cfg)
# 查看节点配置
rs.status()
```

![image-20211105144922792](https://i.loli.net/2021/11/05/G6Sh2QyfVZUCFXg.png)

#### （题外）将mongodb加入window服务，开机自启动

上面的 start.bat 启动的时候会留一个 cmd 窗口，一旦关闭这个窗口 mongodb 服务就无法访问了，对此我们可以将 mongodb 加到 window 服务，这样就比较方便了，以 rs1 为例，右键以管理员身份运行 startService.bat 即可。

![image-20211108175325749](https://i.loli.net/2021/11/08/PWLDUqNBzyVGedh.png)

```shell
D:\Install\mongodb5\bin\mongod.exe --config "D:\Install\mongos\rs1\mongodb.conf" --install --serviceName "mongoDBr1" --serviceDisplayName "mongoDBr1" --serviceDescription "mongoDBr1"
net start mongoDBr1
```

**--config**	指定配置文件

**--install**	安装为 window 服务

**--serviceName**	指定服务名  net start mongoDBr1 就是这个服务名

**--serviceDisplayName**	指定服务显示名   在服务列表显示的名称

**--serviceDescription**	指定服务描述   在服务列表显示的服务描述

![image-20211108180531686](https://i.loli.net/2021/11/08/gezQ9vuqOBDKSsR.png)

#### window mongodb 测试全量备份、增量备份与还原

再开一个 cmd 窗口，执行备份与还原操作（一定要开 cmd 窗口，不要开 powershell ，powerShell 执行 mongodump 和 mongorestore  命令会出现错误）。这个窗口不需要进入到 mongodb 环境

##### 数据准备1

```shell
# 切换到test 库
use test
# for循环 写入1001条数据
for(var i=0;i<=1000;i++){db.user.insert({name:'num'+i})}
```

![image-20211105145331314](https://i.loli.net/2021/11/05/pkHCjysV91QZRBb.png)

##### 全量备份

先执行一次全量备份

```shell
mongodump -h localhost:27007 --oplog -o D:\Install\mongos\backup\backup_20211105\full
```

![image-20211105145948133](https://i.loli.net/2021/11/05/TdJkPjGLaF1Hs5i.png)

##### 数据准备2

```shell
# for循环 再写入1001条数据
for(var i=0;i<=1000;i++){db.user.insert({name:'number'+i})}
```

![image-20211105150221714](https://i.loli.net/2021/11/05/4L6abiC5IQkdw2E.png)

##### 增量备份

首先增量备份有两个很重要的时间点：上次备份时间，当前时间。

如定时每天零点执行增量备份，我们上一次备份时间为：2021-08-08 00:00:00 ，那么我们

这次备份的时间段应该是 2021-08-08 00:00:00 至 2021-08-09 00:00:00，

下一次备份时间点是 2021-08-09 00:00:00 至  2021-08-10 00:00:00。

如果我们不记得上一次备份时间，我们可以通过bsondump来解析oplog.bson文件，取得上次备份（全量备份）的时间戳为：1636095484，当前时间戳为：1636099300

```shell
#  在执行mongodump 时指定 --oplog才会生成 oplog.bson 文件
bsondump D:\Install\mongos\backup\backup_20211105\full\oplog.bson
```

![image-20211105175737841](https://i.loli.net/2021/11/05/sCAeiSHDMLkVTfy.png)

执行增量备份，不要用 powerShell 执行，用 cmd、用 cmd、用 cmd

```shell
mongodump -h localhost:27007 -d local -c oplog.rs --query "{\"ts\":{\"$lt\":{\"$timestamp\":{\"t\":1636099300,\"i\":1}},\"$gte\":{\"$timestamp\":{\"t\":1636095484,\"i\":1}}},\"ns\":{\"$regex\":\"^test\"}}" -o D:\Install\mongos\backup\backup_oplog_202111051601
```

**-d local -c oplog.rs**	备份 local 库 oplog.rs 表下的记录

**ts**	仅备份 ts 大于等于 1636095484 小于 1636099300 

**ns**   仅备份 test 开头

![image-20211105181541888](https://i.loli.net/2021/11/05/AoJagKmyRL7X6nB.png)

##### 删除测试记录，不要在生产环境测试！！！

```shell
# 删除user 表
db.user.drop()
```

![image-20211105182144279](https://i.loli.net/2021/11/05/iKRb1yMO23Fkvcd.png)

##### 还原全量备份

```shell
# 还原路径 全量备份指定的是什么路径  这里就填什么路径
mongorestore -h localhost:27007 --drop --oplogReplay D:\Install\mongos\backup\backup_20211105\full
```

![image-20211105182726727](https://i.loli.net/2021/11/05/CKaWryJDRpwPTSL.png)

上图已还原 1001 条文档，我们来验证一下，还原成功

![image-20211105182925847](https://i.loli.net/2021/11/05/rQ7Be5FVh63Gml4.png)

##### 还原增量备份

```shell
# 还原路径 增量备份指定的是什么路径  这里就填什么路径
mongorestore -h localhost:27007 --oplogReplay D:\Install\mongos\backup\backup_oplog_202111051601
```

![image-20211105183148875](https://i.loli.net/2021/11/05/sznlvVOuhyD2wTP.png)

上图已回放 1001 条  oplog 记录，我们再来验证一下，还原成功

![image-20211105183410972](https://i.loli.net/2021/11/05/To4ur5RtvbmpVnk.png)

还原增量备份的时候要注意，一定要按照时间先后顺序还原，而且增量备份不可缺失，否则会造成数据缺失或者还原失败。

#### 参考资料

mongodb的备份与还原，以及下面的这两个 bat 执行文件都是参考这个博客：[ windows下mongodb增量备份方案_芊芊寻的博客-CSDN博客](https://blog.csdn.net/yumikobu/article/details/83623992)

可能是我 mongodb 版本（v5.0.3）太高的原因，我按照这些博客进行测试时，不是很顺利，所以重新梳理了一番。

更多 mongodump 和 mongorestore 命令可参考：

[mongodump/mongorestore命令详解 - 柴米油盐酱醋 - 博客园 (cnblogs.com)](https://www.cnblogs.com/nanxiang/p/15269540.html)

[MongoDB 逻辑备份工具mongodump--转发 - 北方客888 - 博客园 (cnblogs.com)](https://www.cnblogs.com/xiaoyaojinzhazhadehangcheng/articles/15098062.html)

也可以查阅官方文档：

[mongodump — MongoDB Database Tools](https://docs.mongodb.com/database-tools/mongodump/)

[mongorestore — MongoDB Database Tools](https://docs.mongodb.com/database-tools/mongorestore/)

[bsondump — MongoDB Database Tools](https://docs.mongodb.com/database-tools/bsondump/)

#### window mongodb自动备份

全量备份：一月一次，每月一号凌晨两点

增量备份：一天一次，每天零点

##### 全量备份 backupAll.bat

替换里面的相关路径和端口即可，执行一次会将本次执行的时间戳记录到 timestamp.txt ，供全量备份后的第一次增量备份使用。（可能有 bug ，如果 mongodump 执行很久，这个时间戳会提前，不知道 oplog 回放会不会受影响，上次测试单机 mongodb 备份 1T 的数据需要36个小时左右...）

```shell
rem ******Mongodb full backup start******
@echo off

set "Ymd=%date:~0,4%%date:~5,2%%date:~8,2%0%time:~0,2%%time:~3,2%%time:~6,2%"

set backupFile=D:\Install\mongos\backup\backup_%Ymd%\full\

md %backupFile%

echo 【全量备份】备份文件夹：%backupFile% >>D:\Install\mongos\log.txt
echo 【全量备份】命令： "D:\Install\mongodb5\bin\mongodump.exe" --host=localhost --port=27007 --oplog -o D:\Install\mongos\backup\backup_%Ymd%\full\ >>D:\Install\mongos\log.txt

"D:\Install\mongodb5\bin\mongodump.exe" --host=localhost --port=27007 --oplog -o D:\Install\mongos\backup\backup_%Ymd%\full\

set "TimeNow=%date:~0,4%-%date:~5,2%-%date:~8,2% %time:~0,2%:%time:~3,2%:%time:~6,2%"
echo 【全量备份】成功。时间为：%TimeNow% >>D:\Install\mongos\log.txt

:: 记录当前全备份的时间戳
echo wscript.echo DateDiff("s", "01/01/1970 00:00:00", Now())>D:\Install\mongos\sjc.vbs
for /f %%i in ('cscript sjc.vbs /nologo') do set endDate=%%i
rem 减掉8小时时差
set /a "endDate=%endDate%-28800"

echo %endDate% >D:\Install\mongos\timestamp.txt

@echo on
rem ******Mongodb full backup end******
```

##### 增量备份 backupOplog.bat

如果存在 D:\Install\mongos\timestamp.txt 则 "上一次时间A" 取 timestamp.txt 内记录的时间戳，若不存在则 将当前时间减去 24 小时，得到"上一次时间A"（1天一次增量备份）

```shell
rem ******MongoDB backup start********
@echo off&setlocal enabledelayedexpansion

echo wscript.echo DateDiff("s", "01/01/1970 00:00:00", Date())>D:\Install\mongos\sjc.vbs
for /f %%i in ('cscript sjc.vbs /nologo') do set endDate=%%i
:: 减8小时  
set /a "endDate=%endDate%-28800"
:: 86400 减一天	3600 减一个小时	300 减5分钟
set /a "startDate=%endDate%-86400"

set timeFile=D:\Install\mongos\timestamp.txt
if exist %timeFile% (

	rem 读取文件第一列
	for /f %%a in (%timeFile%) do set startDate=%%a
	
	:: 删除txt
	del %timeFile%
)


set "Ymd=%date:~0,4%%date:~5,2%%date:~8,2%%time:~0,2%%time:~3,2%%time:~6,2%"

set backupFile=D:\Install\mongos\backup\backup_oplog_%Ymd%\
md %backupFile%

echo %startDate%

echo 【增量备份】时间为：%startDate% 至 %endDate%，备份文件夹：%backupFile% >>D:\Install\mongos\log.txt
echo 【增量备份】命令："D:\Install\mongodb5\bin\mongodump.exe" --host=localhost --port=27007 -d local -c oplog.rs --query "{\"ts\":{\"$lt\":{\"$timestamp\":{\"t\":%endDate%,\"i\":1}},\"$gt\":{\"$timestamp\":{\"t\":%startDate%,\"i\":1}}},\"ns\":{\"$regex\":\"^test\"}}" -o %backupFile% >>D:\Install\mongos\log.txt

"D:\Install\mongodb5\bin\mongodump.exe" --host=localhost --port=27007 -d local -c oplog.rs --query "{\"ts\":{\"$lt\":{\"$timestamp\":{\"t\":%endDate%,\"i\":1}},\"$gte\":{\"$timestamp\":{\"t\":%startDate%,\"i\":1}}},\"ns\":{\"$regex\":\"^test\"}}" -o %backupFile%

set "TimeNow=%date:~0,4%-%date:~5,2%-%date:~8,2% %time:~0,2%:%time:~3,2%:%time:~6,2%"
echo 【增量备份】成功。时间为：%TimeNow% >>D:\Install\mongos\log.txt
@echo on
rem ******MongoDB backup end********
```

打开任务计划程序，建立任务让 window 自动执行这两个 bat 执行文件就好了。

##### window任务计划定时执行全量备份

![image-20211106100940794](https://i.loli.net/2021/11/06/XbZOr9lM8gxUECP.png)

![image-20211106101050576](https://i.loli.net/2021/11/06/rMinHZOjdhgoy97.png)

这里开始时间选择凌晨2点，月份选择全部月份，天选择1，即每月一号凌晨两点执行一次全量备份

![image-20211106140053797](https://i.loli.net/2021/11/06/PyQUw34BlJWbRsC.png)

选择 bat 执行文件

![image-20211106115205247](https://i.loli.net/2021/11/06/KdokDtQjiRZV6AM.png)

![image-20211106115114059](https://i.loli.net/2021/11/06/M41tLsFkVlxOUfh.png)

![image-20211106120235571](https://i.loli.net/2021/11/06/tL1wsHUa4fYNgZD.png)

这个列表需要关注两列，一列是下次运行时间栏，还有就是状态栏。为了测试我们可以直接选中任务，右键执行一次看看是否成功。

![image-20211106120712830](https://i.loli.net/2021/11/06/UN5pBZ6eIOgXmsl.png)

##### window任务计划定时执行增量备份

和上面的步骤没多大区别，主要是时间选择那里调整一下就可以了。

如下图参数，每天零点执行一次增量备份

![image-20211106135940906](https://i.loli.net/2021/11/06/WZtuBL2em9GPi7x.png)

#### mongodb副本集如何添加、删除新节点呢？

如增加 rs4 ，测试后再将其删除。默认只有主节点可以添加、删除新节点

##### rs4

1. 创建 db 文件夹，一定要创建
2. 创建 mongodb.conf 文件，内容为

```shell
dbpath=D:\Install\mongos\rs4\db
logpath=D:\Install\mongos\rs4\mongodb.log
logappend=true
journal=true
quiet=true
port=27010
replSet = testrs
```

3. 创建 mongodb.log 文件，内容留空，一定要创建
4. 创建 start.bat 文件，启动程序，双击即可开启 mongodb 服务，内容为

```shell
cd D:\Install\mongodb5\bin
mongod --config D:\Install\mongos\rs4\mongodb.conf
```

双击 start.bat 启动 s4 mongodb 服务

##### 添加新节点

打开 cmd 依次执行以下命令

```shell
# 连接到主节点
mongo localhost:27007

use admin

# 27010为rs4的端口
rs.add("localhost:27010")

# 查看副本集状态和成员信息
rs.status()
```

![image-20211106142855866](https://i.loli.net/2021/11/06/aDuL2TFVkOfhYIr.png)

##### 验证添加新节点是否成功

依次执行以下命令

```shell
mongo localhost:27010

# 接受成为副本节点
rs.secondaryOk()

# 切换到test 库
use test

# 查询 有数据则成功
db.user.find().count()
```

![image-20211106143330468](https://i.loli.net/2021/11/06/2UYvmRw6MQKdlJi.png)

##### 删除副本节点

依次执行以下命令

```shell
# 连接到主节点
mongo localhost:27007

use admin

# 27010为rs4的端口
rs.remove("localhost:27010")

# 查看副本集状态和成员信息
rs.status()
```

![image-20211106143546575](https://i.loli.net/2021/11/06/xqDuf1EbVvdG8wi.png)

##### 删除副本节点 注意事项

如果我们的副本节点一共只有三个节点（一主一副一仲裁），那么我们删除节点时**不能直接删除**

如当我们副本集只有三个节点，我们要删除 27008 副本节点，如何实现？

```shell
# 添加 27010 节点
rs.add("localhost: 27010")
# 查看当前副本集节点个数 4
rs.conf().members.length
# 删除 27008 节点
rs.remove("localhost:27008")
# 查看副本集状态
rs.status()
```

![image-20211108121439321](https://i.loli.net/2021/11/08/X5xnKyTi64AUEzO.png)

##### 删除节点错误示范***

那如果直接删除27008节点会怎么样呢？

```shell
# 查看当前副本集节点个数   
rs.conf().members.length
# 删除 27008 节点
rs.remove("localhost:27008")
# 查看副本集状态
rs.status()
```

![image-20211108122007657](https://i.loli.net/2021/11/08/qK2lcaeRsxjbF93.png)

上述代码执行成功后确实已经将 27008 节点成功删除，但是我们再去添加新节点或者删除 27009 节点时都是失败的。但是仍然可以操作数据库，这种可以修改当前的写关注。下面有

rs.add("")	添加节点无反应是直接删除 27008 节点造成的。

![image-20211108122822166](https://i.loli.net/2021/11/08/ErpfqtFZvnBDHP1.png)

#### 单机 mongodb 如何变成副本集呢？

如 rs1 原本为单机 mongodb ，我们要怎样在 rs1 的数据基础上搭建集群呢？

其实很简单的，我们只需要在 rs1 的 mongodb.conf  文件加一项配置：replSet = testrs，然后再将 rs2、rs3 一起加进来即可

#### mongodb如何做差异备份呢？

虽然没有人这样做，但是如果非要这样做的话，我想应该也是很简单的。

我们只需要记住全量备份的时间戳A，后续的备份都用这个时间戳A来判断，一直到下一次全量备份如下：

第一次差异备份的时间段：时间戳A 至 第一次备份的当前时间

第二次差异备份的时间段：时间戳A 至 第二次备份的当前时间

第三次差异备份的时间段：时间戳A 至 第三次备份的当前时间

...



#### 其他问题

##### This node was not started with the replSet option

这个节点没有设置 replSet ，通常是你本地运行了一个端口为 27017 的单机 mongodb 程序，然后你的集群里面又有 27017 节点，所以要么改 27017 节点的端口，要么杀死 27017 的程序

##### Failed: bad option: --oplog mode only supported on full dumps

--oplog  仅支持全库备份

[mongodb - mongodump with replica set with oplog throws error: "oplog mode is only supported on full dumps" - Stack Overflow](https://stackoverflow.com/questions/23682867/mongodump-with-replica-set-with-oplog-throws-error-oplog-mode-is-only-supporte)

![image-20211030171446560](https://i.loli.net/2021/10/30/erFKjac613mdPiG.png)

##### Failed: no oplog file to replay; make sure you run mongodump with --oplog

没有 oplog 可以回放，所以这个 mongorestore  命令不要指定  --oplogReplay 参数。

--oplog 和 --oplogReplay 是一起出现的，当然了，增量备份不允许指定 --oplog 参数，但在全量备份指定 --oplog 参数情况下，还原增量备份却可以指定 --oplogReplay 参数

```shell
mongodump --oplog .....		#生成 oplog 文件

mongorestore --oplogReplay ....		#回放 oplog
```

![image-20211030171429805](https://i.loli.net/2021/10/30/U3qGkS4FbAnPcpK.png)

##### mongorestore 恢复失败。插入主键冲突

mongorestore 指定 --drop 参数。当还原发生冲突，先删除冲突项再进行还原

![image-20211030172336449](https://i.loli.net/2021/10/30/JPvXKNAw2ZYs7qI.png)

##### not master and slaveOk=false

刚搭建好的副本集，副本节点要先执行 rs.secondaryOk()  命令才可以读取数据。

![image-20211030173858416](https://i.loli.net/2021/10/30/notumfLlSk1C87I.png)

##### not master  NotWritablePrimary

副本节点无法写入

##### New config is rejected :: caused by :: replSetReconfig should only be run on a writable PRIMARY. Current state SECONDARY;

副本节点无法添加、删除节点

![image-20211106142807403](https://i.loli.net/2021/11/06/unhwzGvNl5MIi4a.png)

##### Reconfig attempted to install a config that would change the implicit default write concern. Use the setDefaultRWConcern command to set a cluster-wide write concern and try the reconfig again	删除仲裁（副）节点报错

删除仲裁（副）节点报错，默认情况一主一副一仲裁下无法直接删除仲裁（副）节点

```shell
# 先修改写关注
db.adminCommand({
  "setDefaultRWConcern" : 1,
  "defaultWriteConcern" : {
    "w" : 2
  }
})
# 移除仲裁节点 27009
rs.remove("localhost:27009")
```

![image-20211108144519663](https://i.loli.net/2021/11/08/tSAU81JxDjwRYpX.png)

##### 如何将副节点转成仲裁节点，仲裁节点转成副节点，

**不能直接改配置文件**，要先将该副节点移除，然后再以仲裁节点的身份加回来，这里仅演示 **副节点转成仲裁节点** 这两个都是一样的逻辑

New and old configurations differ in the setting of the arbiterOnly field for member localhost:27008; to make this change, remove then re-add the member

![image-20211108145212638](https://i.loli.net/2021/11/08/PqG6xmQ1f7BoSkU.png)

如三个节点（一主两副）将一个副节点 27008 转成仲裁节点。

1. 先加一个副本节点 27010
2. 再移除副节点 27008（为什么不直接移除请看下面一个问题）
3. 再将27008添加为仲裁节点（添加前应先把db文件夹删除了，可以减少磁盘空间）
4. 最后删除新增的副本节点27010。

```shell
# 查看当前节点数 3
rs.conf().members.length
# 添加一个新副本节点 27010    一定要是副本节点
rs.add("localhost:27010")
# 查看当前节点数 4
rs.conf().members.length
# 移除副本节点 27008
rs.remove("localhost:27008")
# 添加仲裁节点 27008
rs.addArb("localhost:27008")
# 移除新增的副本节点 27010
rs.remove("localhost:27010")
```

![image-20211108155148239](https://i.loli.net/2021/11/08/ETKnDC69AW8JSBL.png)

##### Quorum check failed because not enough voting nodes responded; required 2 but only the following 1 voting nodes responded: localhost:27007; the following nodes did not respond affirmatively: localhost:27009 failed with Error connecting to localhost:27009 (127.0.0.1:27009)

三个节点（一主两副）移除副节点失败。移除了一个那么剩下两个节点，会出现平票的现象（1：1）。这时我们不要去改配置文件里面的投票数，应该再加一个节点（最好是添加副节点，其实大家都不建议用仲裁节点的），然后再将目标节点移除

```shell
# 查看当前节点数 3
rs.conf().members.length
# 添加一个新节点 27010
rs.addArb("localhost:27010")
# 查看当前节点数 4
rs.conf().members.length
# 移除仲裁节点 27008
rs.remove("localhost:27008")
```

![image-20211108151143087](https://i.loli.net/2021/11/08/ulPr29NJQv6VnyW.png)

#####  修改配置文件（投票数）报错：caused by :: BSON field 'votes' value must be <= 1, actual value '2'

节点的投票数不能大于1

#####  修改配置文件（投票数）报错：caused by :: priority must be 0 when non-voting (votes:0)

节点的投票数如果为0，那么他的优先级也要设为0

##### 删除仲裁节点报错：Rejecting reconfig where the new config has a PSA topology and the secondary is electable, but the old config contains only one writable node

如在四个节点（一主一副两仲裁）副本集中删除 27008 仲裁节点（变成一主一副一仲裁） 。

![image-20211108152856863](https://i.loli.net/2021/11/08/osrRqdKbMvyH2ih.png)

只要加一个新的副本节点就可以解决了。

1. 先加一个副本节点27011
2. 再删目标仲裁节点27008
3. 再删除新加的副本节点27011。

其实好多问题都是出现在偶数节点的情况，这也是大家**不建议用偶数节点**的原因。

```shell
# 原节点数 4
rs.conf().members.length
# 添加副本节点 
rs.add("localhost:27011")
# 删除目标仲裁节点 27008
rs.remove("localhost:27008")
# 删除新加的副本节点
rs.remove("localhost:27011")
# 当前节点数 3 一主一副一仲裁
rs.conf().members.length
```

![image-20211108153217007](https://i.loli.net/2021/11/08/VeTr98O3GwKgco5.png)

##### mongodb备份的磁盘占用，备份时间（局域网）。

<img src="https://i.loli.net/2021/11/08/TUNBWeLEAj1F6cs.png" alt="image-20211108160706321" style="zoom:50%;" />

| 总文件大小：750G             | 时间     | 备份文件大小 |
| ---------------------------- | -------- | ------------ |
| 单机 mongodump               | 36小时   | 800G         |
| 副本集 mongodump --oplog xxx | 45个小时 | 1.2T         |

<img src="https://i.loli.net/2021/11/08/djJhQZeXD6UtpIw.png" alt="image-20211108161433801" style="zoom:50%;" />







总数据大小：750G，在这个数据的基础上搭建副本集，一主一副一仲裁。

| 总文件大小：750G | 主节点服务器 | 副节点服务器 | 仲裁节点服务器 |
| ---------------- | ------------ | ------------ | -------------- |
| 全量备份前       | 750G         | 300M         | 300M           |
| 全量备份后       | 750G         | 400G         | 310M           |

不知道后面主节点和副节点服务器占用磁盘看见会不会基本持平，仲裁节点不需要耗费太大资源，所以预算少的话，一主一副一仲裁还是挺不错的方案。

##### 其他

文件夹结构与相关命令 [logerlink/mongoRepDemo (github.com)](https://github.com/logerlink/mongoRepDemo)

mongorestore 没测，本来只想整理备份与还原的内容，谁知越操作问题越多，最后都整的一锅粥了。

edg冠军了。















