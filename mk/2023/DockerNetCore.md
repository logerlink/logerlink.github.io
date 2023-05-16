[TOC]

#### 说明

.netcore 程序涉及mysql、redis。后续还需要通过nginx反向代理与域名绑定在一起，所以我们需要先部署mysql、redis、nginx，再进行.netcore程序部署

我们先走一遍docker流程，后续再用docker-compose将这些服务"一网打尽"

环境：linux（centOS），未安装docker的可以参考[Install Docker Engine on CentOS | Docker Documentation](https://docs.docker.com/engine/install/centos/)

本文需要有一定docker基础，如镜像、容器的操作等等

#### docker 安装 mysql

##### 拉取镜像

[docker hub mysql 镜像 Tags | Docker Hub](https://hub.docker.com/_/mysql/tags)

```shell
docker pull mysql:8.0-debian
```

##### 创建本地挂载文件

```shell
mkdir -p /home/docker/share/mysql-server/log/
mkdir -p /home/docker/share/mysql-server/data/
mkdir -p /home/docker/share/mysql-server/conf
```

##### 创建并启动容器

```shell
docker run -itd --name mysql-server -p 3316:3306 \
-v /home/docker/share/mysql-server/log/:/var/log:rw \
-v /home/docker/share/mysql-server/data/:/var/lib/mysql:rw \
-v /home/docker/share/mysql-server/conf:/etc/mysql:rw 
-v /etc/localtime:/etc/localtime:ro \
--restart=always -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0-debian
```

- -itd：指定后台交互运行
- --name：指定容器名称
- -p：端口映射，前者机器端口，后者容器端口，mysql默认3306
- -v：挂载文件，主要是将容器存储的文件或读取的配置映射到本地，容器挂了或删除了，数据不受影响（重新启动新容器再次挂在即可）
- --restart：容器退出时应用的重启策略（默认否），--restart=always 容器退出时会重启容器
- -e：设置环境变量，-e MYSQL_ROOT_PASSWORD=123456 设置mysql root用户的初始密码

##### 查看容器是否启动成功

```shell
# 查看docker当前所有(-a)容器的运行情况
docker ps -a
# 查看某容器的运行日志，若容器启动失败则可以通过该命令查看日志查找错误信息
docker logs 容器ID
```

![image-20230512145556683](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512145556683.png)

##### 查看mysql是否可用

```shell
# 进入某容器内部终端
docker exec -it 容器ID bash

# 登录mysql，-u 指定用户名，-p 指定密码
mysql -u root -p
# 输入密码

# 退出mysql、容器都可以用exit命令
exit
```

![image-20230512150040977](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512150040977.png)

#### docker 安装 redis

##### 拉取镜像

[docker hub redis 镜像 Tags | Docker Hub](https://hub.docker.com/_/redis/tags)

```shell
docker pull redis:latest
```

##### 创建本地挂载文件

```shell
mkdir /home/docker/share/redis-server/data
```

##### 创建并启动容器

```shell
docker run -d --name redis-server -p 6479:6379 \
-v /home/docker/share/redis-server/data:/data \
redis --appendonly yes
```

- -d：指定后台运行
- --name：指定容器名称
- -p：端口映射，前者机器端口，后者容器端口，mysql默认6379
- -v：挂载文件，主要是将容器存储的文件或读取的配置映射到本地，容器挂了或删除了，数据不受影响（重新启动新容器再次挂在即可）
- --appendonly yes  开启redis持久化

##### 查看容器是否启动成功

```shell
# 查看docker当前所有(-a)容器的运行情况
docker ps -a
# 查看某容器的运行日志，若容器启动失败则可以通过该命令查看日志查找错误信息
docker logs 容器ID
```

![image-20230512151929155](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512151929155.png)

##### 查看redis是否可用

```shell
# 进入某容器内部终端
docker exec -it 容器ID bash

# 进入redis
redis-cli
# redis-cli -h host -p port -a password

# 退出程序、容器都可以用exit命令
exit
```

![image-20230512152316011](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512152316011.png)

#### docker 安装 nginx

##### 拉取镜像

[docker hub nginx 镜像 Tags | Docker Hub](https://hub.docker.com/_/nginx/tags)

```shell
docker pull nginx:latest
```

##### 创建本地挂载文件

```shell
mkdir -p /usr/local/docker/nginx/conf
mkdir -p /usr/local/docker/nginx/log
mkdir -p /usr/local/docker/nginx/html
```

##### 默认启动nginx

启动后获取容器内部默认配置文件到宿主机

```shell
# 生成容器
docker run --name nginx -p 80:80 -d nginx:latest
#查看容器ID
docker ps

# 将容器nginx.conf文件复制到宿主机
docker cp 容器ID:/etc/nginx/nginx.conf /usr/local/docker/nginx/conf/nginx.conf
# 将容器conf.d文件夹下内容复制到宿主机
docker cp 容器ID:/etc/nginx/conf.d /usr/local/docker/nginx/conf/conf.d
# 将容器中的html文件夹复制到宿主机
docker cp 容器ID:/usr/share/nginx/html /usr/local/docker/nginx/
```

##### 停止容器并将其删除

```shell
docker stop 容器ID
docker rm 容器ID
```

##### 创建并启动容器

```shell
docker run \
-p 80:80 \
--name nginx \
--restart=always \
-v /usr/local/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf \
-v /usr/local/docker/nginx/conf/conf.d:/etc/nginx/conf.d \
-v /usr/local/docker/nginx/log:/var/log/nginx \
-v /usr/local/docker/nginx/html:/usr/share/nginx/html \
-d nginx:latest
```

- -d：指定后台运行
- --name：指定容器名称
- -p：端口映射，前者机器端口，后者容器端口，nginx默认80
- -v：挂载文件，主要是将容器存储的文件或读取的配置映射到本地，容器挂了或删除了，数据不受影响（重新启动新容器再次挂在即可）
- --restart：容器退出时应用的重启策略（默认否），--restart=always 容器退出时会重启容器

##### 查看容器是否启动成功

```shell
# 查看docker当前所有(-a)容器的运行情况
docker ps -a
# 查看某容器的运行日志，若容器启动失败则可以通过该命令查看日志查找错误信息
docker logs 容器ID
```

![image-20230512153343272](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512153343272.png)

##### 查看nginx是否可用

```shell
curl 127.0.0.1
```

![image-20230512153843014](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230512153843014.png)

#### docker 部署 .net core程序

##### 项目生成Dockerfile

主项目右键—>添加—>docker支持 —>选择平台（linux），然后就会在该项目下生成Dockerfile文件。Dockerfile里面的内容我们先不用管，直接将该文件移动到**解决方案目录**即可，这样做可以避免Dockerfile构建的时候找不到项目依赖的问题。

![image-20230515104611132](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515104611132.png)

##### Dockerfile说明

正常来说，VS自动生成的Dockerfile不需要做太大变动，我们只需要关注暴露端口和工作目录即可

更多解释可以参考[[Docker\] .NET Core 的 Dockerfile 指令詳解 | K. C. - 點部落 (dotblogs.com.tw)](https://dotblogs.com.tw/fire/2022/10/27/225738)

![image-20230515110010102](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515110010102.png)

##### docker打包发布程序(手动)

**切换到解决方案目录**（含有Dockerfile的目录），打开终端，执行build命令

```shell
# -t 指定镜像名称，标签
docker build -t aspnetapp:2.2 .
docker images
```

![image-20230515110940310](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515110940310.png)

保存镜像到本地

```shell
docker save aspnetapp:2.2 > english_backend2.2.tar
```

![image-20230515113036870](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515113036870.png)

将文件上传至服务器，加载镜像

```shell
# 切换文件目录
cd /usr/core/
# 加载镜像
docker load < english_backend2.2.tar
docker images

# 如果仓库名和Tag为空，可以使用tag命令进行打tag
# docker tag 镜像ID aspnetapp:2.2
```

![image-20230515113639447](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515113639447.png)

##### docker打包发布程序说明

打包发布有多种，大家可以自行搜索，整体步骤大差不差，怎么方便怎么来

1. 本地构建（build）—>打包镜像（save）—>上传镜像到服务器—>读取镜像（load）
2. 本地构建（build）—>推送镜像仓库（push）—>服务器从镜像仓库拉取镜像（pull）——**常用**
3. 本地代码上传代码到git远程仓库（git push）—>服务器从git远程仓库拉取代码（git pull）—>服务器构建（build）——**慎用**

##### 创建并启动容器

```shell
docker run -d --restart=always -p 5000:80 --name english_backend_server aspnetapp:2.2
```

- -d：指定后台运行
- --name：指定容器名称
- -p：端口映射，前者机器端口，后者容器端口，nginx默认80
- -v：挂载文件，主要是将容器存储的文件或读取的配置映射到本地，容器挂了或删除了，数据不受影响（重新启动新容器再次挂在即可）
- --restart：容器退出时应用的重启策略（默认否），--restart=always 容器退出时会重启容器

如果需要将资源文件或配置文件放到宿主机上，我们可以使用-v挂载磁盘，操作如下：

```shell
# 默认启动程序，找到容器ID
docker run -d --restart=always -p 5000:80 --name english_backend_server aspnetapp:2.2

# 创建宿主机资源目录
mkdir /usr/core/appdata
# 拷贝容器的资源文件和配置文件到宿主机
docker cp 容器ID:/app/Files/SentencePhoto /usr/core/appdata/SentencePhoto
docker cp 容器ID:/app/Files/audio /usr/core/appdata/audio
docker cp 容器ID:/app/appsettings.json /usr/core/appdata/appsettings.json

# 停止删除容器
docker stop 容器ID
docker rm 容器ID

#启动程序，挂载配置文件和资源文件
docker run -d --restart=always -p 5000:80 --name english_backend_server \
-v /usr/core/appdata/Files/SentencePhoto:/app/Files/SentencePhoto \
-v /usr/core/appdata/Files/audio:/app/Files/audio \
-v /usr/core/appdata/appsettings.json:/app/appsettings.json \
-v /etc/localtime:/etc/localtime \
aspnetapp:2.2
```

值得一提，拷贝容器的资源文件和配置文件到宿主机**仅需要执行一次**，不需要每次发布都执行一次，以免覆盖掉文件。后续发布更新时我们只需要执行带-v的docker run 命令即可

还要注意的是，如果你的程序依赖别的程序，而别的程序又没启动或者配置，那么你的程序就会报错，程序报错容器就会停止运行，此时可以使用logs命令查看日志，以寻求解决方法。

到这里我们.net core 程序、mysql服务、redis服务、nginx都已经装好了

![image-20230515115755506](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515115755506.png)

##### 时区问题

大陆玩家要注意了，如果你的宿主机时区是`Asia/Shanghai` ,那就要将.net core程序的容器时区和宿主机的时区保持一致。容器内部默认是utc时区，也就是说容器内部的时间和宿主机的时间（东八区）差了8小时。**容器获取时间的相关程序都会有差错**，所以我们需要将.net core程序的容器时区和宿主机的时区保持一致。

注意了，`-v /etc/localtime:/etc/localtime` 是可以将容器时区和宿主机保持一致，但是程序获取的时间还是utc时间。

![image-20230515120719380](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515120719380.png)

我们应该如此：

```shell
# 将宿主机时区复制到容器中
docker cp /usr/share/zoneinfo/Asia/Shanghai 容器id:/etc/localtime
重启容器
docker restart  容器id
# 进入容器
docker exec -it  容器id bash

ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
```

效果如图，宿主机时间、容器时间、程序获取时间基本保持一致

![image-20230515121257621](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515121257621.png)

当然，时区问题也可以直接Dockerfile文件的final阶段执行以下命令，这样就不需要每次发布都手动同步时区了

```shell
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
```

##### nginx反向代理

通过上面的一通操作，我们已经成功启动.net core程序，并且分配端口为5000。我们需要访问`http://127.0.0.1:5000`才能正常访问，那怎样做将端口去掉（将端口设为80，访问时端口80可忽略）也能正常访问.net core程序呢？nginx就派上用场了

因为我们上面已经将nginx配置文件挂载到宿主机磁盘，我们直接改宿主机的nginx配置文件即可

```shell
# 修改挂载在本地nginx配置文件的内容
vim /usr/local/docker/nginx/conf/nginx.conf

# 添加配置
 server {
    listen 80;
    server_name 119.45.xx.xx; # 可以改成域名
    location / {
      proxy_pass http://119.45.xx.xx:5000;
    }
  }

docker ps
docker restart 容器ID

# 重启nginx容器后配置生效
```

![image-20230516115119951](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230516115119951.png)

nginx配置文件修改内容

![image-20230516114923894](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230516114923894.png)

#### docker-compose 一键操作管理服务

涉及到多个服务操作，如果每次都需要单独执行docker run来启动，那就太麻烦了。我们可以使用docker-compose来管理我们的服务

##### docker-compose安装卸载

安装

```shell
# 下载docker-compose
curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

chmod +x /usr/bin/docker-compose

# 命令补全
curl -L https://raw.githubusercontent.com/docker/compose/1.24.0/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose
# 查看版本
docker-compose --version
```

卸载

```shell
# 卸载docker-compose
rm /usr/local/bin/docker-compose
```

##### 编写docker-compose.yaml

根据上面的docker run 命令，我们可以很快编写docker-compose文件，起始docker-compose就是根据docker命令编写的，做的都是同一件事

```yaml
version: '3'   # 版本，默认1
services:      # 服务列表
        mysql: # 服务名称
                container_name: mysql-server    # 容器名称
                image: mysql:8.0-debian         # 指定镜像
                volumes: # 挂载磁盘（不存在时，自动创建，建议自行手动创建），也可以挂载卷标（在与services同级的volumes定义）
                      - /home/docker/share/mysql-server/log/:/var/log:rw
                      - /home/docker/share/mysql-server/data/:/var/lib/mysql:rw
                      - /home/docker/share/mysql-server/conf:/etc/mysql:rw
                      - /etc/localtime:/etc/localtime:ro
                restart: always  # 是否重启
                ports:           # 暴露端口，映射端口
                         - '3316:3306'
                environment:     # 环境变量
                         MYSQL_ROOT_PASSWORD: 123456
        redis:
                container_name: redis-server
                image: redis:latest
                volumes:
                    - /home/docker/share/redis-server/data:/data
                restart: always
                ports:
                    - '6479:6379'
                command: ["redis-server", "--appendonly", "yes"]   # 执行指定命令
        webapp:
                container_name: english_backend_server
                image: aspnetapp:2.2
                volumes: 
                    - /usr/core/appdata/Files/SentencePhoto:/app/Files/SentencePhoto
                    - /usr/core/appdata/Files/audio:/app/Files/audio
                    - /usr/core/appdata/appsettings.json:/app/appsettings.json
                    - /etc/localtime:/etc/localtime
                ports: 
                    - '5000:80'
                restart: always
                depends_on:  # 依赖服务，先启动依赖服务在启动本服务
                    - mysql
                    - redis
        nginx:
              container_name: nginx-server
              image: nginx:latest
              volumes:
                - /usr/local/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf
                - /usr/local/docker/nginx/conf/conf.d:/etc/nginx/conf.d
                - /usr/local/docker/nginx/log:/var/log/nginx
                - /usr/local/docker/nginx/html:/usr/share/nginx/html
              ports:
                - '80:80'
              restart: always
              depends_on:
                    - webapp

```

注意做注释或者编写时的时候**不要用Tab键**，可能会出现错误

##### docker-compose 常用说明

- version——版本，默认1
- services——服务集合
  - container_name——string，容器名称
  - labels——string，设置服务标签，metadata
  - image——string，指定需要拉取或使用的镜像，若没有build，则以该镜像运行容器。可以是镜像ID或者是镜像:tag
  - build——string/object，构建目录（含Dockerfile的目录）当前目录则用.表示即可。当build和image字段都存在时，使用image指定的镜像名和tag作为build后镜像的name和tag
    - context:——string，指定上下文所在的目录，当前目录则用.表示即可。可以是git仓库的url也可以是绝对/相对路径
    - dockerfile:——string，指定Dockerfile文件名称
    - args——object，执行build参数
  - volumes——array，挂载磁盘（不存在时，自动创建，建议自行手动创建），也可以挂载卷标（在与services同级的volumes定义）
  - ports——array，暴露端口，映射端口。"宿主机端口:容器端口"
  - environment：object，指定环境变量
  - command：array， 执行指定命令
  - restart——string，默认no。always—失败后总是重启，on-failure—错误码为 on-failure 时才重启，unless-stopped—手动停止后不重启，no—失败不重启
  - depends_on——array，依赖服务，先启动依赖服务在启动本服务。这里写的是服务名称，不是容器名称
  - network——array，为容器指定网络。默认default
  - shm_size——number/string，'2gb'或者10000000（字节）。设置容器内`/dev/shm`目录的大小，/dev/shm目录非常重要，此目录并不在硬盘上，而是在内存中，默认大小为内存的一半大小,存入其中的文件不会被清空，容器内划分此目录可以一定程度上指定容器的性能
- volumes——卷标，供services内的服务使用，更多请参考：[docker-compose-volumes的说明 - 简书 (jianshu.com)](https://www.jianshu.com/p/0beda3ece539)
- networks——网络配置，供services内的服务使用。不填时，默认services内的所有服务使用同一个网络，即可以在服务1中访问服务2的端口，更多请参考：[docker-compose的网络networks的使用技巧 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/382779160)

##### docker-compose 常用命令

###### 启动所有服务

docker-compose.yaml文件编写完后，我们可以使用**up指令启动**docker-compose.yaml里面列出的所有服务

```shell
# 若当前目录下存在docker-compose.yaml，可以直接使用该命令。-d 即后台运行
docker-compose up -d

# 指定docker-compose.yaml运行
docker-compose -f /xx/docker-compose.yaml up -d
```

###### 停止所有服务

**down指令将停止运行的容器**，并且会删除已停止的容器以及已创建的所有网络。添加`-v`标记删除所有卷

```shell
docker-compose down
```

###### 查看镜像

列出 Compose 文件中包含的镜像。

```shell
docker-compose images
```

![image-20230515174550956](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515174550956.png)

###### 列出项目中所有容器

```shell
docker-compose ps -v
```

######  暂停服务

unpause可以解除暂停

```shell
docker-compose pause redis-server
```

![image-20230515174820928](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515174820928.png)

###### 不暂停服务

```
docker-compose unpause redis-server
```

![image-20230515175033321](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515175033321.png)

###### 停止服务

注意stop指令只能指定服务名称，不知道为什么。停止的服务可以用start指令启动

```shell
docker-compose stop redis
```

![image-20230515175735112](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515175735112.png)

###### 启动服务（单个）

```shell
docker-compose start redis-server
```

![image-20230515175950350](https://cdn.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20230515175950350.png)

######  重启服务（单个）

```shell
docker-compose restart [options] [SERVICE...]
```

`t, --timeout TIMEOUT` 指定重启前停止容器的超时（默认为 10 秒）

######  验证compose文件正确性

```shell
docker-compose config

# 指定文件
docker-compose -f docker-compose.yaml config
```

