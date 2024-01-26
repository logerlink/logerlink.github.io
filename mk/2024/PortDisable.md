[TOC]

#### 问题

启动.net core程序报错：<span style="color:red">System .Net .Sockets .SocketException 10013 以一种访问权限不允许的方式做了一个访问套接字的尝试</span>

![image-20240126165131306](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126165131306.png)

一般是端口被占用或者指定端口在排除范围之内，对症下药，我们需要**换个端口**、**处理端口占用**问题或者**把端口从排除范围中删除**即可

一招制敌：重启计算机（不太建议），因为重启计算机后，端口排除排除范围会初始化，端口也可能没有被占用

#### 如何解决

##### 处理端口占用

首先我们在cmd输入以下命令，查看端口(54000)是否被占用

```shell
netstat -ano | findstr 54000
```

![image-20240125152919365](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240125152919365.png)

如果端口被占用，则可以在**任务管理器**中的**详细信息**根据PID查到对应的程序，右键将其**结束任务**即可

![image-20240126165845224](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126165845224.png)

##### 检查端口排除范围

如果端口没有被占用，接下来我们要查看指定端口是否在端口排除范围之内（端口是否被排除），如下图我们发现端口54000被排除了

```shell
netsh interface ipv4 show excludedportrange protocol=tcp
```

![image-20240126170225798](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126170225798.png)

接下来我们只需要**重启winnat**，再查询端口是否被排除即可（是的，这里只需要重启winnat即可，不用手动删除排除范围也不用重启计算机）

如果端口还在排除范围的话就多重启winnat几次，或者手动删除排除范围即可

```shell
# 重启winnat
net stop winnat
net start winnat
netsh interface ipv4 show excludedportrange protocol=tcp
```

![image-20240125154257191](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240125154257191.png)

接着重新启动项目，成功运行

![image-20240126171220225](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240126171220225.png)

##### 添加/删除端口排除范围

至于手动添加/删除端口排除范围，可以参照以下写法。不过我没有测试成功，先记个**Todo**吧

```shell
net stop winnat
# 添加端口排除范围，从5600开始往后10个端口
netsh int ip add excludedportrange protocol=tcp  numberofports=10 startport=5600
net start winnat
netsh interface ipv4 show excludedportrange protocol=tcp
netsh int ip reset
# 重启计算机
```

![image-20240125155325373](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240125155325373.png)

如下图，我重启计算机后，端口5600确实在排除范围内，但是**没有生效**，仍然可以使用端口5600

![image-20240125162045361](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240125162045361.png)

```shell
# 移除排除范围
netsh int ip delete excludedportrange protocol=tcp  numberofports=10 startport=56092
# 重启计算机
```
