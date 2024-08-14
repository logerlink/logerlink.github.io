[TOC]

#####  说明

window系统、Docker Desktop、redis 7.0、mysql 8.0、redis-stack 7.4.0

新电脑，演示并记录docker使用mysql、redis、布隆过滤器

##### 下载Hyper-V

此步**非必选**，不下载Hyper-V的话，安装Docker Desktop时要勾选"使用WSL 2替代Hyper-v"选项

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

![image-20240805163330866](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240805163330866.png)

##### 下载Docker Desktop

国内不可访问：[Docker Desktop: The #1 Containerization Tool for Developers | Docker](https://www.docker.com/products/docker-desktop/)

##### 重启计算机

##### 配置仓库镜像

```json
"registry-mirrors": [
        "https://docker.m.daocloud.io",
        "https://huecker.io",
        "https://dockerhub.timeweb.cloud",
        "https://noohub.ru"
    ]
```

##### 拉取redis和mysql镜像

```shell
docker pull redis:7.0
docker pull mysql:8.0
```

##### 启动redis和mysql容器

```shell
# 启动mysql非挂载，如果本机有my.cnf，请忽略这一步
docker run -itd -p 3326:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0
#将/etc/my.cnf的配置复制到本机，完了把容器ID删除即可，如果本机有my.cnf，请忽略这一步。
docker cp b18d6eb8c0ff:/etc/my.cnf F:\dockerHome\mysql\conf\my.cnf


# 启动mysql 挂载磁盘
docker run -itd --name mysql-server -p 3316:3306 -v /f/dockerHome/mysql/log/:/var/log:rw -v f/dockerHome/mysql/data/:/var/lib/mysql:rw -v /f/dockerHome/mysql/conf/my.cnf:/etc/my.cnf:rw --restart=always -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0

# -v /f/dockerHome/mysql/conf:/etc/mysql:rw 注意这个映射在mysql8.0可能会有问题（找不到配置文件） 换成 /f/dockerHome/mysql/conf/my.cnf:/etc/my.cnf:rw 即可。

# 启动redis 挂载磁盘
docker run -d --restart=always --name redis-server -p 6379:6379 -v /f/dockerHome/redis/data:/data redis:7.0 --appendonly yes
```

![image-20240805181137468](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240805181137468.png)

mysql8.0 my.cnf 默认内容

```shell
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/8.0/en/server-configuration-defaults.html

[mysqld]
#
# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M
#
# Remove leading # to turn on a very important data integrity option: logging
# changes to the binary log between backups.
# log_bin
#
# Remove leading # to set options mainly useful for reporting servers.
# The server defaults are faster for transactions and fast SELECTs.
# Adjust sizes as needed, experiment to find the optimal values.
# join_buffer_size = 128M
# sort_buffer_size = 2M
# read_rnd_buffer_size = 2M

# Remove leading # to revert to previous value for default_authentication_plugin,
# this will increase compatibility with older clients. For background, see:
# https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_default_authentication_plugin
# default-authentication-plugin=mysql_native_password
skip-host-cache
skip-name-resolve
datadir=/var/lib/mysql
socket=/var/run/mysqld/mysqld.sock
secure-file-priv=/var/lib/mysql-files
user=mysql

pid-file=/var/run/mysqld/mysqld.pid
[client]
socket=/var/run/mysqld/mysqld.sock

!includedir /etc/mysql/conf.d/

```

##### mysql简单使用

```sql
 # 查看全部数据库
 show databases;
 # 创建数据库-test
 create database test;
 # 选择数据库-test
 use test;
 # 查看test数据库所有表
 show tables;
 # 创建表-User，含有两列——Id、Name
 create table User (Id int,Name varchar(50));
 # 向 User 表插入数据
 insert User (Id,Name) values (1,Tom),(2,Jerry);
 # 查询User表数据
 select * from User;
```

##### 远程链接

```shell
# 链接mysql -P 3306 大写P
mysql -h 127.0.0.1 -P 3306 -u root -p
# 链接redis
redis-cli -h 127.0.0.1 -p 6379
auth [username] pwd
# 链接mongodb
mongo --host localhost --port 27017 -u mongoUser -p mongoPassword
```

```json
.net core字符串链接
  "ConnectionStrings": {
    "MySql": "server=127.0.0.1;port=3316;user=root;pwd=123456;database=testdb",
    "Redis": "127.0.0.1:6379,password=123456",
    "MongoDB": "mongodb://username:password@host:port/databaseName"
  }
```

##### docker常用命令

docker-compose参考：[Linux-Docker部署.netCore程序 (logerlink.github.io)](https://logerlink.github.io/page/2023/DockerNetCore.html#docker-compose-一键操作管理服务)

```shell
########## 镜像操作 ##########
# 查看配置信息，最常用的就是查看镜像仓库
docker info
# 查看版本 --help 查看帮助
docker --version
# 查看本地镜像
docker images
# 搜索远程仓库中的镜像 可惜没有显示tag内容
docker search redis
# 拉取镜像
docker pull redis:latest
# 复制并重命名镜像，镜像名称要全小写
docker tag redis:latest redis:8.8.8

# 构建dockerfile文件为docker镜像
docker build path
# 导出镜像
docker save image:2.2 > image2.2.tar
# 导入镜像
docker load < image2.2.tar
# 查看镜像历史
docker history image:2.2
# 删除镜像
docker rmi image:2.2

########## 容器操作 ##########
# 启动容器，-d后台运行，-p 端口映射，--name 取名字
docker run -d --restart=always --name redis-server -p 6379:6379 redis:latest --appendonly yes
# 查看容器运行情况，-a 查看全部
docker ps -a
# 进入容器内部，exit退出容器内部
docker exec -it <container-id> /bin/bash
# 查看容器日志，通常是失败后运行该命令查看。-f 实时监控
docker logs <container-id>
# 停止容器运行，stop/start/restart 停止/开始/重启  kill/pause/unpause/port 杀死/暂停/不暂停/查看端口映射
docker stop <container-id>
# 删除容器 运行中无法删除 remove也是删除，-f 强制删除
docker rm containerId
# 更新容器
docker update --restart=always redis-server
# 重命名容器
docker rename <container-id>  redisServer
# 查看容器内的进程，stats：实时查看进程
docker top <container-id>
# 容器复制文件
docker cp <container-id>:filePath filePath
docker cp filePath <container-id>:filePath
# 查看容器信息
docker inspect <container-id>
# 查看容器ip地址，供容器间互相调用
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" containerId

########## 系统、网络管理、存储卷##########
# 查看镜像、容器、网络、卷预览
docker system df
# 删除未使用的镜像、容器、网络，不会删除卷
docker system prune
# 容器网络管理——列出网络
docker network ls
# 容器网络管理——创建自定义网络，rm：删除网络，prune：删除未使用的网络
docker network create <network-name>
# 容器网络管理——链接网络，disconnect：断开链接
docker network connect <network-name> <container-id>
# 容器网络管理——查看网络信息
docker network inspect <container-id>
# 存储卷管理——列出卷
docker volume ls
# 存储卷管理——创建卷，rm：删除卷，prune：删除未使用的卷
docker volume create name
# 存储卷管理——查看卷信息
docker volume inspect name
```

##### 带有布隆过滤器的redis

###### 安装布隆过滤器

[22. Redis---布隆过滤器 - v_jjling - 博客园 (cnblogs.com)](https://www.cnblogs.com/jiajunling/p/16608128.html)

我看好多都是使用redislabs/rebloom，不过redislabs/rebloom 已不维护，推荐使用redis-stack，自带RedisInsight可视化页面——http://localhost:8001/redis-stack/browser。生产环境可以使用redis-stack-server，不包含RedisInsight，所以不需要指定8001端口

```csharp
# 使用带有布隆过滤器的redis  https://hub.docker.com/r/redis/redis-stack
docker pull redis/redis-stack:7.4.0-v0

docker run -d --restart=always --name redis-stack -p 6379:6379 -p 8001:8001 -v /f/dockerHome/redis/data:/data -e REDIS_ARGS="--requirepass 123456" redis/redis-stack:7.4.0-v0
```

![image-20240811152614971](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240811152614971.png)

###### 命令提示

方便是方便，不过有点可惜的是redis-stack的redis命令没有提示，我们可以使用redis链接redis-stack，这样就有命令提示了

```shell
# 运行redis容器用于链接redis-stack
docker run -d --restart=always --name redis-server -p 6380:6379 redis:7.0 --appendonly yes
# 查看容器IP
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" containerId

# redis远程链接
redis-cli -h host -p 6379
# 密码验证 auth username pwd
auth 123456
```

![image-20240811162423861](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240811162423861.png)

###### 布隆过滤器

**使用场景**：高并查询时，有效避免缓存穿透，缓解数据库压力

**含义**：布隆过滤器是一种redis的数据结构，由一个bit位数组组成，内部存储二进制内容，占据空间小且数据检索快

**特点**：**空间效率**和**查询时间**的高效性，而且redis比sql数据库能抗下更高的并发量

**缺点**：无法删除元素，小几率出现误判（误判率可设置，误判率越小，存储时使用空间越大，hash运算可能也会更多）

**如何使用？**

存储时，将数据进行多次hash运算取模得到多个下标（如进行五次运算分别得到五个下标2,6,15,88,125），将这些坐标都改成1

查询时，将数据进行多次hash运算取模得到多个下标（如进行五次运算分别得到五个下标2,6,15,88,125），并判断这些下标对应的值是否是1。如果有一个值一个是0，则表示不存在该数据，若这些下标的值全部是1，则表示存在该该数据

**为什么出现误判率？**

如有一个值 value=99999 进行多次hash运算取模得到多个下标——1,10,12,18,100,255,999,10000 并存储此时仅有99999一个元素。此时查询 value=123 ，对value=123 进行多次hash运算取模得到多个下标——10,18,255，布隆过滤器就会判断这三个下标对应的值是否为1 => 结果刚好为1，出现hash碰撞，但实际并不存在的123这个元素，这样，便出现了误判率

**可以修改误判率吗？**

可以，通过`BF.RESERVE bloom:key 0.001 1000` 可以创建并指定误判率和容量为0.001 1000。默认：0.01 100

**如果自己实现应该如何降低误判率？**

可以从这两方面入手：

- 增加hash运算取模，用更多的下标表示一个数据——升级CPU应对
- 增加bit位数长度，让下标更分散，减少hash碰撞——增加内存应对

**误判率是不是越小越好？**

并不是，误判率越低，误判率越小，存储时占用的内存空间会越大。存储和查询时的hash运算次数可能也会变得更多，影响效率

###### 基本命令演示

```shell
# 创建一个布隆过滤器。设置误判率和容量。若已存在会报错——(error) ERR item exists
BF.RESERVE key 0.001 1000
# 添加一个元素到布隆过滤器
BF.ADD key value
# 添加多个元素到布隆过滤器
BF.MADD key value value2 value3
# 将多个元素添加到过滤器
BF.INSERT key ITEMS "value1" value2
# 判断元素是否在布隆过滤器
BF.EXISTS key value
# 判断元素是否在布隆过滤器
BF.MEXISTS key value values
# 返回有关布隆过滤器的信息。若不存在会报错——(error) ERR not found
BF.INFO key
```

![image-20240813184031618](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240813184031618.png)

`BF.SCANDUMP key cursor`，扫描数据，返回cursor和数据，cursor返回0表示扫描结束。记得把cursor和数据保存，用于LOADCHUNK。SCANDUMP执行多少次，LOADCHUNK就要执行多少次，不然恢复数据失败。`BF.LOADCHUNK key cursor "data"`

参考：[BF.SCANDUMP | Docs (redis.io)](https://redis.io/docs/latest/commands/bf.scandump/)

```shell
# 扫描 Bloom 过滤器
BF.SCANDUMP bf 0
# 恢复之前使用BF.SCANDUMP保存的布隆过滤器
BF.LOADCHUNK bf 1
```

![image-20240813182901764](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240813182901764.png)

```shell
# 将多个元素添加到过滤器，指定容量、误判率
BF.INSERT key CAPACITY 10 ERROR 0.01 ITEMS "value1" value2
# 将多个元素添加到过滤器，NOCREATE，key不存在则不插入
BF.INSERT key CAPACITY 10 ERROR 0.01 NOCREATE ITEMS "value1" "value2" value3
# 将多个元素添加到过滤器，NONSCALING，超出容量不自动创建子过滤器
BF.INSERT key NOCREATE NONSCALING ITEMS "value1" value2
```

###### 值得注意

- 可以使用`del key`删除布隆过滤器，但是不支持移除成员 
- `BF.ADD、BF.MADD、BF.INSERT` (不指定NOCREATE参数)执行时，不存在key时自动创建布隆过滤器key，默认值：Capacity: 100; error_rate：0.01。也可以主动执行 `BF.RESERVE` 创建key，自定义初始容量和误判率 
- `BF.RESERVE` error_rate越低，需要的空间越大。当过滤器内存在的数量超过指定 Capacity，会创建子过滤器误判率会增加。所以一开始要准备好 Capacity
-  `BF.INSERT` 若指定NOCREATE参数，不存在key时则不创建key并报错——(error) ERR not found。若指定NONSCALING参数，当过滤器达到最大容量时，不创建子过滤器，并报错——ERR non scaling filter is full

###### 代码使用-c#

使用参考：[RedisTest/RedisTest.Share/RedisClient.cs at main · logerlink/RedisTest (github.com)](https://github.com/logerlink/RedisTest/blob/main/RedisTest.Share/RedisClient.cs) 

[c#使用布隆过滤器](https://logerlink.github.io/page/2024/redisUseDocs.html#使用布隆过滤器)

```csharp
    /// <summary>
    /// 布隆过滤器扩展
    /// </summary>
    public static class RedisBloomExtensions
    {
        /// <summary>
        /// 创建一个布隆过滤器
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="errorRate">误判率</param>
        /// <param name="initialCapacity">容量</param>
        /// <returns></returns>
        public static async Task BloomReserveAsync(this IDatabaseAsync db, RedisKey key, double errorRate, int initialCapacity)
        {
            // BF.RESERVE key 0.01 100
            await db.ExecuteAsync("BF.RESERVE", key, errorRate, initialCapacity);
        }

        /// <summary>
        /// 添加一个元素
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="value">元素</param>
        /// <returns>新增插入返回1，覆盖插入返回0</returns>
        public static async Task<bool> BloomAddAsync(this IDatabaseAsync db, RedisKey key, RedisValue value)
        {
            // BF.ADD key value
            return (bool)await db.ExecuteAsync("BF.ADD", key, value);
        }
        /// <summary>
        /// 添加多个元素
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="values">多个元素</param>
        /// <returns>数组：新增插入返回1，覆盖插入返回0</returns>
        public static async Task<bool[]?> BloomMAddAsync(this IDatabaseAsync db, RedisKey key, IEnumerable<RedisValue> values)
        {
            // bf.madd key value value2 value3
            return (bool[]?)await db.ExecuteAsync("BF.MADD", values.Cast<object>().Prepend(key).ToArray());
        }

        /// <summary>
        /// 将多个元素插入到布隆过滤器
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="errorRate">误判率</param>
        /// <param name="initialCapacity">容量</param>
        /// <param name="notCreateIfExit">NOCREATE：如果布隆过滤器key不存在，则不进行插入，并报错</param>
        /// <param name="isNscal">当过滤器达到最大容量时，不创建子过滤器，并报错</param>
        /// <param name="values">值</param>
        /// <returns>数组：新增插入返回1，覆盖插入返回0</returns>
        public static async Task<bool[]?> BloomInsertAsync(this IDatabaseAsync db, RedisKey key, IEnumerable<RedisValue> values, double errorRate, int initialCapacity, bool notCreateIfExit, bool isNscal)
        {
            // BF.INSERT key CAPACITY 10 ERROR 0.01 ITEMS "value1" value2
            // BF.INSERT key CAPACITY 10 ERROR 0.01 NOCREATE ITEMS "value1" "value2" value3

            var paramValues = new List<RedisValue>() { "CAPACITY", initialCapacity, "ERROR", errorRate};
            return await BloomInsertAsync(db, key, values, notCreateIfExit, isNscal, paramValues);
        }
        /// <summary>
        /// 将多个元素插入到布隆过滤器
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="notCreateIfExit">NOCREATE：如果布隆过滤器key不存在，则不进行插入，并报错</param>
        /// <param name="isNscal">当过滤器达到最大容量时，不创建子过滤器，并报错</param>
        /// <param name="values">值</param>
        /// <returns>数组：新增插入返回1，覆盖插入返回0</returns>
        internal static async Task<bool[]?> BloomInsertAsync(IDatabaseAsync db, RedisKey key, IEnumerable<RedisValue> values, bool notCreateIfExit, bool isNscal)
        {
            // BF.INSERT key ITEMS "value1" value2
            // BF.INSERT key NOCREATE NONSCALING ITEMS "value1" value2

            return await BloomInsertAsync(db, key, values, notCreateIfExit, isNscal, null);
        }
        /// <summary>
        /// 将多个元素插入到布隆过滤器
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="notCreateIfExit">NOCREATE：如果布隆过滤器key不存在，则不进行插入，并报错</param>
        /// <param name="isNscal">当过滤器达到最大容量时，不创建子过滤器，并报错</param>
        /// <param name="values">值</param>
        /// <param name="paramValues">初始化值</param>
        /// <returns>数组：新增插入返回1，覆盖插入返回0</returns>
        private static async Task<bool[]?> BloomInsertAsync(IDatabaseAsync db, RedisKey key, IEnumerable<RedisValue> values, bool notCreateIfExit, bool isNscal, List<RedisValue>? paramValues = null)
        {
            try
            {
                paramValues ??= new List<RedisValue>();
                if (isNscal) paramValues.Add("NONSCALING");       // 超过容量不创建子过滤器
                if (notCreateIfExit) paramValues.Add("NOCREATE");
                paramValues.Add("ITEMS");   // 也可以使用ITEM
                paramValues.AddRange(values);

                return (bool[]?)await db.ExecuteAsync("BF.INSERT", paramValues.Cast<object>().Prepend(key).ToArray());
            }
            catch (Exception ex)
            {
                if (notCreateIfExit && ex.Message.Contains("ERR not found")) throw new Exception("指定 NOCREATE 参数，布隆过滤器key不存在，无法插入。" + ex.Message, ex);
                if (isNscal && ex.Message.Contains("ERR non scaling filter is full")) throw new Exception("指定 NONSCALING 参数，当前容量超出指定容量，无法插入。" + ex.Message, ex);
                throw;
            }
        }

        /// <summary>
        /// 判断元素是否存在
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="value">元素</param>
        /// <returns>存在返回1，不存在返回0</returns>
        public static async Task<bool> BloomExistsAsync(this IDatabaseAsync db, RedisKey key, RedisValue value)
        {
            // bf.exists key value
            return (bool)await db.ExecuteAsync("BF.EXISTS", key, value);
        }

        /// <summary>
        /// 判断多个元素是否存在
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="values">多个元素</param>
        /// <returns>存在返回1，不存在返回0</returns>
        public static async Task<bool[]?> BloomMExistsAsync(this IDatabaseAsync db, RedisKey key, IEnumerable<RedisValue> values)
        {
            // bf.mexists key value values
            return (bool[]?)await db.ExecuteAsync("BF.MEXISTS", values.Cast<object>().Prepend(key).ToArray());
        }

        /// <summary>
        /// 查看key
        /// </summary>
        /// <param name="db">数据库</param>
        /// <param name="key">键</param>
        /// <param name="values">多个元素</param>
        /// <returns></returns>
        public static async Task<object> BloomInfoAsync(this IDatabaseAsync db, RedisKey key)
        {
            // bf.info key
            return await db.ExecuteAsync("BF.INFO", key);
        }

        
    }
```