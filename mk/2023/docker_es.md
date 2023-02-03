[TOC]

#### 说明

环境：Win10、docker-Ubuntu

ElasticSearch：8.4.1

Kibana：8.4.1

IK：8.4.1

ElasticSearch、Kibana、IK这三个版本尽量保持一致，可能会出现版本对不上的错误，导致无法启动ES数据库。目前ElasticSearch、Kibana的最新版本为8.4.3，但是IK的最新版本是8.4.1，所以我们统一版本都选择8.4.1

![image-20221012102702884](https://s2.loli.net/2022/10/13/Z9FOAJacktGdlVn.png)

参考：[使用docker部署elasticsearch+kibana-chenm1xuexi的博客-CSDN博客](https://blog.csdn.net/qq_38796327/article/details/90480314)

[docker部署elasticsearch容器安装ik分词器 - 开顺 - 博客园 (cnblogs.com)](https://www.cnblogs.com/shujiying/p/14264460.html)

#### 安装部署ElasticSearch

##### 拉取镜像

![image-20221012104416765](https://s2.loli.net/2022/10/13/3VTjpLuWcNEOMrS.png)
```shell
docker pull elasticsearch:8.4.1
```

##### 启动ES

```shell
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.4.1
```

![image-20221012104934138](https://s2.loli.net/2022/10/13/dGD5a2yW4VIeOEr.png)

##### 挂载数据卷

###### 准备本机路径

d盘下的esdata文件夹：/d/esdata，并创建data、logs文件夹

###### 查看es配置信息

```shell
docker exec -it es bash
cd config
pwd
```

![image-20221009180907672](https://s2.loli.net/2022/10/13/3UlCGiRXeqZJm1E.png)

###### 将容器内部配置文件拷贝到本地

```shell
# 查看docker进程信息 -f 筛选
docker ps -f name=es
# docker cp 容器ID:容器路径 本机路径
docker cp 5803d10fa9ae:/usr/share/elasticsearch/config/ D:\\esdata\\config
```

![image-20221010094716998](https://s2.loli.net/2022/10/13/pJts4agl1yV9RXN.png)

###### 关闭并移除ES

```shell
docker stop es
docker rm es
```

![image-20221010094955320](https://s2.loli.net/2022/10/13/gcvefMFCOGlWa7Q.png)

###### 挂载数据卷

挂载的意思是将容器运行所需要配置文件、文件存储空间都放在本机。这样做即使容器被销毁，容器的配置文件和数据都还在本地存储，**不会受影响**，挂载后修改其中一端的数据，另一端数据也会**随之更改**

![image-20221012111655518](https://s2.loli.net/2022/10/13/BPbKaQ6StTYpoqM.png)

挂载的格式： -v 本机路径:容器内路径

值得注意：window下命令行没有换行、挂载整个config文件夹、使用绝对路径

参考：[Docker for Windows 安装 ElasticSearch 和 ik 分词器 挂载磁盘 | 言曌博客 (liuyanzhao.com)](https://liuyanzhao.com/1526827459826290689.html)

```shell
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms512m -Xmx512m" -v /d/esdata/config:/usr/share/elasticsearch/config -v /d/esdata/data:/usr/share/elasticsearch/data  -v /d/esdata/logs:/usr/share/elasticsearch/logs -v /d/esdata/plugins:/usr/share/elasticsearch/plugins elasticsearch:8.4.1
```

![image-20221010160202969](https://s2.loli.net/2022/10/13/9Lwxg2e8izmMQdb.png)

##### 访问ES

[https://127.0.0.1:9200](https://127.0.0.1:9200/)

![image-20221010161711864](https://s2.loli.net/2022/10/13/LbGh1a7ytf45DKF.png)

我们可以使用账号密码登录也可以直接跳过

###### 账号密码登录

进入容器内部借助 `elasticsearch-reset-password`工具重置密码

```shell
docker exec -it es bash
bin/elasticsearch-reset-password -username elastic -i
# 为账号elastic指定密码
```

![image-20221010162131658](https://s2.loli.net/2022/10/13/MVOJpcYbqQk7xl9.png)

成功后直接使用【elastic、密码】登录即可

![image-20221010162234117](https://s2.loli.net/2022/10/13/WhT4UALrfan6i7H.png)

###### 忽略验证直接登录

将ES配置文件【elasticsearch.yml】中的配置【xpack.security.enabled】改成 false，意思是不需要账号密码不需要使用https协议，更多配置如下

```yaml
xpack.security.enabled: false #安全验证配置总开关，也可以根据需要单独配置下面的各项
xpack.security.enrollment.enabled: true #是否需要用户名密码
xpack.security.http.ssl:  #客户端访问是否使用https协议
xpack.security.transport.ssl: #集群节点间交换是否使用https协议
```

注意如果你已经挂载到本地，则直接在本地修改，若未挂载到本地则需要进入容器内部修改配置文件

![image-20221010162859891](https://s2.loli.net/2022/10/13/WFcmQVLiDPGxlzg.png)

重启ES服务

```shell
docker restart es
```

直接访问 [127.0.0.1:9200](http://127.0.0.1:9200/)

![image-20221010163331103](https://s2.loli.net/2022/10/13/KDdkEuwT6soC89h.png)

#### 安装部署Kibana

##### 拉取镜像

![image-20221012105449925](https://s2.loli.net/2022/10/13/WoZITFYQpLfBh5U.png)

```shell
docker pull kibana:8.4.1
```

##### 启动Kibana

```shell
docker run --name kibana -d -p 5601:5601 --link es -e "ELASTICSEARCH_URL=https://127.0.0.1:9200" kibana:8.4.1
```

--link es：链接ES数据库，格式：--link [ES的容器名称]

-e：指定ES的链接路径，要注意一下你的ES数据库使用http还是https

查看kibana日志，等待日志出链接，再访问链接（0.0.0.0改成127.0.0.1或你的ip即可）

```shell
docker logs kibana
```

![image-20221010180625970](https://s2.loli.net/2022/10/13/VBEOJ8ac3tglN5T.png)

##### 配置kibana链接ES

###### 访问链接：http://127.0.0.1:5601/

![image-20221011174225383](https://s2.loli.net/2022/10/13/mnzbFwcqARCey4V.png)

###### 进入ES容器生成token

注意ES8版本后，启动ES不会自动生成token，需要手动去生成，若手动生成token失败，说明你的ES并没有启动成功，可以检查一下配置文件和启动命令

```shell
docker exec -it es bash
./bin/elasticsearch-create-enrollment-token --scope kibana
```

![image-20221011174413820](https://s2.loli.net/2022/10/13/FegY2cQarusy3m8.png)

成功生成token后，将其填入网页输入框，并点击验证按钮

![image-20221012110212448](https://s2.loli.net/2022/10/13/hugAeSpMCbyjEGo.png)

###### 进入kibana容器生成token

成功生成验证码后，输入并验证

```shell
docker exec -it kibana bash
./bin/kibana-verification-code
```

![image-20221011174636744](https://s2.loli.net/2022/10/13/gL2NUxf8MD4EaOS.png)

###### 使用ES的账号密码登录

![image-20221012112304803](https://s2.loli.net/2022/10/13/aOPhIp7CeQUwTZn.png)

待验证完成后使用**ES的账号密码**登录

![image-20221011174804462](https://s2.loli.net/2022/10/13/ipD8qLdXhnyW42b.png)

首页侧边菜单栏选择【Dev Tools】

![image-20221011174935494](https://s2.loli.net/2022/10/13/ME37dlVeLFUiJI6.png)

在这里我们可以使用kibana命令更好的操作ES数据库，ES没有kibana也是可以正常使用的

![image-20221012100841173](https://s2.loli.net/2022/10/13/LHSWzF76X5xsQgG.png)

##### 安装部署IK分词器

下载指定版本IK[Releases · medcl/elasticsearch-analysis-ik (github.com)](https://github.com/medcl/elasticsearch-analysis-ik/releases)

![image-20221012101512642](https://s2.loli.net/2022/10/13/nkqYMPj4bvKgtuC.png)

###### 挂载数据卷

挂载数据卷启动的话，我们直接将压缩包解压到我们本机的plugins文件夹下然后重启ES数据库即可

![image-20221012102029746](https://s2.loli.net/2022/10/13/JkIznf8c7ZaxOhT.png)

```shell
docker restart es
```

###### 未挂载数据卷

未挂载数据卷启动，我们需要将ik压缩包拷贝到容器内部的plugins文件夹下，再进行解压，将压缩包删除然后重启ES数据库即可

```shell
# docker cp 本机路径 容器ID:容器路径
docker cp d:\\esdata\\download\\elasticsearch-analysis-ik-8.4.1.zip b3be26f86c9d:/usr/share/elasticsearch/plugins
```

![image-20221012113942698](https://s2.loli.net/2022/10/13/VLmAb6Bv92kMISr.png)

```shell
cd plugins/
unzip elasticsearch-analysis-ik-8.4.1.zip -d elasticsearch-analysis-ik-8.4
.1
rm -rf elasticsearch-analysis-ik-8.4.1.zip
# 如果压缩包放在plugins文件夹下，记得将其删除，不然es会将该压缩包识别为一个插件（实际并不是），导致es启动失败
```

###### 测试分词器

```she
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "梦想家"
}
```

安装ik分词器插件前

![image-20221012113728559](https://s2.loli.net/2022/10/13/e5nMcmpbBfhgFzt.png)

安装ik分词器插件后，表名分词器插件安装成功

![image-20221012112638461](https://s2.loli.net/2022/10/13/XesU5Tk2Qh4xt73.png)
