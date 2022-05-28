[TOC]

### 表格预览

|  修改项/版本   | CentOS 6.x                                             | CentOS 7.x                                                   |
| :------------: | :----------------------------------------------------- | :----------------------------------------------------------- |
|    桌面系统    | gnome<br />#echo $DESKTOP_SESSION  （ssh服务无法使用） | gnome-classic<br />#echo $DESKTOP_SESSION  （ssh服务无法使用） |
|    文件系统    | ext4<br />#df -T                                       | xfs<br />#df -T                                              |
|    内核版本    | 2.6.x-x<br />#uname -a                                 | 3.10.x-x<br />#uname -a                                      |
|   启动加载器   | GRUB Legacy(+efibootmgr)                               | GRUB2                                                        |
|     防火墙     | iptables                                               | firewalld                                                    |
|   默认数据库   | MySql                                                  | MariaDB                                                      |
|    文件结构    | /bin，/sbin，/lib，lib64在根目录（/）下                | /bin，/sbin，/lib，lib64在/usr目录下，在根目录下以软连接的形式 |
|     主机名     | 在/etc/sysconfig//network配置                          | 在/etc/hostname配置                                          |
|    时间同步    | #ntp<br />#ntp -p                                      | #chrony<br />#chrony source                                  |
|    修改时间    |                                                        |                                                              |
|    修改时区    |                                                        | #timedatectl                                                 |
|    服务管理    | #service 服务名 start/stop/restart                     | #systemctl start/stop/reload 服务名                          |
| 自启动服务管理 | #chkconfig                                             | #systemctl enable 服务名                                     |
|    强制停止    | #kill -9 pid                                           | 仍旧可用<br />#systemctl kill -singal=9 进程名               |
|    网络信息    | #netstat -ln                                           | 仍旧可用<br />#ip n<br />#ip -s l<br />#ss                   |
|   ip地址/Mac   | #ifconfig -a                                           | 仍旧可用<br />#ip address show<br />#ip addr                 |
|      路由      | #route -n<br />#route -A inet6 -n                      | 仍旧可用<br />#ip route [show]<br />#ip -6 route [show]      |
|      重启      | #reboot<br />#shutdown -r now                          | 可用<br />#systemctl reboot                                  |
|   单用户模式   | #init 1 临时                                           |                                                              |
|    启动模式    | #vim /etc/inittab                                      | #systemctl get-default                                       |

### 桌面系统

**CentOS 6**

![image-20210220140644972](https://i.loli.net/2021/02/20/9ahfs6ow5iKpRLC.png)

**CentOS 7**

![image-20210220140555062](https://i.loli.net/2021/02/20/RjfaDPSx1WA2F38.png)

### 文件系统

**CentOS 6**

```shell
df -T	#ext4
```

![image-20210220141152034](https://i.loli.net/2021/02/20/ytXzKrwZpaYJGQP.png)



**CentOS 7**

```shell
df -T	#xfs
```

![image-20210220140918739](https://i.loli.net/2021/02/20/lJv5YjZcqGXdAy2.png)

### 内核版本

**CentOS 6**

```shell
uname -a	#2.6.x.x
```



![image-20210220141401074](https://i.loli.net/2021/02/20/LBWxg5rsfHQljoC.png)

**CentOS 7**

```shell
uname -a	#3.10.x
```



![image-20210220141449922](https://i.loli.net/2021/02/20/mGL436njefcdo9z.png)

### 启动加载器

参考：[grub2与grub区别_技术联盟-CSDN博客](https://blog.csdn.net/mao0514/article/details/51397193)

**CentOS 6**

GRUB

**CentOS 7**

GRUB2

### 防火墙

**CentOS 6**

iptables

检查防火墙服务

```shell
service iptables status
```

查看防火墙配置情况

```shell
iptables -L -n
```

通过指令添加配置规则

```shell
#允许对外请求的返回包
iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
#允许icmp包通过
iptables -A INPUT -p icmp --icmp-type any -j ACCEPT
#允许来自于lo接口的数据包，如果没有此规则，将不能通过127.0.0.1访问本地服务
iptables -A INPUT -i lo -j ACCEPT
#开放22端口
iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT   
#过滤所有非以上规则的请求
iptables -P INPUT DROP
```

保存配置规则

```shell
/etc/init.d/iptables save #通过指令添加防火墙配置需要保存配置规则并重启防火墙
```

重启防火墙

```shell
service iptables restart #通过指令添加防火墙配置需要保存配置规则并重启防火墙
#service iptables start/stop/restart
```

通过更改配置文件配置规则

```shell
#打开配置文件
vim /etc/sysconfig/iptables
#加入规则  #开放88端口
-A INPUT -p tcp -m state --state NEW -m tcp --dport 88 -j ACCEPT
#保存并退出
#重启防火墙
service iptables restart
```

通过指令删除配置规则

```shell		
#查看当前端口所在行数
iptables -L -n --line-number	#--line-number显示行号
#删除某行（第六行）的配置规则
iptables -D INPUT 6
#再次查看当前配置（已经删除）
iptables -L -n --line-number
```

![image-20210220144634676](https://i.loli.net/2021/02/20/1qzFKbhWiwCPIfM.png)

通过配置文件删除配置规则

```shell
#打开配置文件
vim /etc/sysconfig/iptables
#删除指定规则
#保存
#重启防火墙即可
service iptables restart
```

添加防火墙自启动

```shell
chkconfig iptables on
```

其他

```shell
#允许所有入栈规则
iptables -p INPUT ACCEPT
#清空默认所有规则
iptables -F
#清空自定义的所有规则
iptables -X
#计数器置零
intables -Z
```

参考：[CentOS 6配置防火墙iptables规则 | 大专栏 (dazhuanlan.com)](https://www.dazhuanlan.com/2019/10/22/5dae102edc50f/)

**CentOS 7**

firewalld，也可以用iptables，需要手动下载

基本使用

```shell
#启动/关闭
systemctl start/stop/restart firewalld	#没有reload
#查看状态
systemctl status firewalld
#开机启用/开机禁用
systemctl enable/disable firewalld
```

systemctl的基本使用

```shell
#除了上面几个命令 我们还可以这样用systemctl

#查看服务是否开机启用
systemctl is-enabled firewalld
#查看所有服务列表
systemctl list-unit-files 
#配合 | grep可以查看已启用的服务列表
systemctl list-unit-files | grep enabled
#查看启动失败的服务列表
systemctl --failed
```

配置firewalld-cmd

```shell
#查看版本/帮助/状态
firewalld --version/help/state
#查看所有配置
firewall-cmd --list-all
#查看所有打开的端口	--list-ports         List ports added for a zone [P] [Z]
firewall-cmd --zone=public --list-ports

#重载防火墙规则
#--reload             Reload firewall and keep state information
#--complete-reload    Reload firewall and lose state information
firewall-cmd --reload
#查看区域信息
firewall-cmd --get-active-zones
#查看指定接口所属区域
firewall-cmd --get-zone-of-interface=ens33 #ens33 --get-active-zones可再此查看
#取消拒绝所有包（相对--panic-on，慎用，拒绝所有包，所有请求会被拒绝包括ssh，你只能进到系统里面去执行off操作）
firewall-cmd --panic-off
#查看是否拒绝所有包
firewall-cmd --query-panic	# --panic-off:yes  --panic-on:no
```

添加配置规则

```shell
#开放88端口
firewall-cmd --zone=public --add-port=88/tcp --permanent #--permanent永久生效，没有此参数重启后失效
#重载防火墙
firewall-cmd --reload
#查看是否成功（查看端口88是否开放）
firewall-cmd --zone=public --query-port=88/tcp
```

删除配置规则

```shell
firewall-cmd --zone=public --remove-port/tcp --permanent
#重载防火墙即可
```

参考：[CentOS 7使用firewalld打开关闭防火墙与端口 - 莫小安 - 博客园 (cnblogs.com)](https://www.cnblogs.com/moxiaoan/p/5683743.html)

### 默认数据库

**CentOS 6**

MySql

**CentOS 7**

MariaDB （mysql的另一分支）

### 文件结构

**CentOS 6**

/bin，/sbin，/lib，lib64在根目录（/）下

![image-20210220112532811](https://i.loli.net/2021/02/20/UVOnmdvkl4H2xRp.png)

**CentOS 7**

/bin，/sbin，/lib，lib64在/usr目录下，在根目录下以软连接的形式出现

![image-20210220112612925](https://i.loli.net/2021/02/20/S2gixMy4nseWTzH.png)

### 主机名 Hostname

**CentOS 6**

```shell
#查看主机名
hostname
#临时更改  切换用户生效，重启系统失效
hostname 新主机名
```

永久更改主机名：

1.修改/etc/sysconfig/network中的HOSTNAME

![image-20210220154946807](https://i.loli.net/2021/02/20/jHUK1LcMBVFg4kR.png)

2.在/etc/hosts 中的127.0.0.1开头那一行加上你的新主机名（设置FQDN）

![image-20210220155329349](https://i.loli.net/2021/02/20/hP6Qkjx4sXqFAZN.png)

3.有些是只设置了第一步，最好是host文件也给他改一下，设置完成后reboot重启后生效

![image-20210220160546305](https://i.loli.net/2021/02/20/zDFXLh8W9QZrsVO.png)

**CentOS 7**

```shell
#查看主机名
hostname
#临时更改  切换用户生效，重启系统失效
hostname 新主机名
```

永久修改主机名：

方式一：命令修改

```shell
hostnamectl set-hostname 新主机名
```

重启系统后生效

方式二：配置文件修改

将/etc/hostname的内容换成新主机名即可，重启后生效

![image-20210220161429396](https://i.loli.net/2021/02/20/QYZo7LSnuxRGOEN.png)

### 时间同步

**CentOS 6**

手动同步（一次性同步）：

```shell
#ntpdate 时间服务器域名/ip #Ip地址查看可以访问：http://www.ntp.org.cn/pool.php
ntpdate cn.ntp.org.cn
```

自动同步（ntp同步）：

```shell
#启动ntpd时间同步服务 （重启后失效）
service ntpd start #（不会立即生效，等1分钟）或者/etc/init.d/ntpd start
#设置开机自启动 （重启也会自动启用ntpd服务）
chkconfig --level 35 ntpd on
```

![image-20210220163854576](https://i.loli.net/2021/02/20/AXZowPav35lsJVx.png)

设置开机自启动

![image-20210220163935429](https://i.loli.net/2021/02/20/zH2wVADorn8XOva.png)

**CentOS 7**

ntp服务仍旧可用，但推荐chrony，chrony性能优于ntp。[chrony – Comparison of NTP implementations](https://chrony.tuxfamily.org/comparison.html)

修改/etc/chrony.conf，加入时间服务器

原始内容：

![image-20210220170315068](https://i.loli.net/2021/02/20/4aqYnXFA5QGkmTr.png)

修改后：

![image-20210220170515246](https://i.loli.net/2021/02/20/1omJkuYGM7ApISK.png)

启动服务添加自启动服务

```shell
#启动chronydw服务
systemctl start chronyd
#添加开机自启动
systemctl enable chronyd
#查看chronyd是否自启动
systemctl is-enabled chronyd
```

查看chronyc

```shell
# 查看 ntp_servers 状态
chronyc sources -v
# 查看 ntp_sync 状态
chronyc sourcestats -v
# 查看 ntp_servers 是否在线
chronyc activity -v
# 查看 ntp 详细信息
chronyc tracking -v
#chronyd服务未启动会报错 506 Cannot talk to daemon
```

参考：[CentOS 7时间同步程序chrony安装和使用 (zhangnq.com)](https://zhangnq.com/3237.html)

### 修改时间/时区

**CentOS 6**

查看/修改时区

```shell
date -R #+0800 表东八区及中国的东八区
#修改时区
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
#写入硬件 避免重启失效
hwclock -w
```

**CentOS 7**

查看/修改时区

```shell
date -R #+0800 表东八区及中国的东八区
#查看所有时区
timedatectl list-timezones
#设置时区（推荐）  也可以用centos6的方式
timedatectl set-timezone 时区 # Asia/Shanghai 上海时区
```

### 服务管理

**CentOS 6**

CentOS 6上的服务管理工具为chkconfig，Linux系统所有的预设服务都可以通过查看/etc/init.d/目录得到

![image-20210220173836683](https://i.loli.net/2021/02/20/KRWrqAexELX14nj.png)

可以通过下面这两条指令来管理服务 

```shell
service 服务名 start/stop/restart  
/etc/init.d/服务名 start/stop/restart
#列出服务
chkconfig --list
```

**CentOS 7**

CentOS 7之前采用的服务管理都是SysV，CentOS 7则换成了原生systemd服务。systemd支持多个服务并发启动，而SysV只能一个一个启动，systemd会优于Sysv。

常见指令

```shell
#列出系统所有服务
systemctl list-units -all --type=service
#开机禁用/启用
systemctl disable/enable 服务名
#查看服务状态
systemctl status 服务名
#停止/打开/重启服务
systemctl stop/start/restart 服务名
#查看服务是否开机启动
systemctl is-enabled 服务名
```

更多systemd的内容可查看：[Systemd 入门教程：命令篇 - 阮一峰的网络日志 (ruanyifeng.com)](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)

### 强制停止

**CentOS 6**

```shell
kill -9 pid #-15
```

**CentOS 7**

```shell
systemctl kill -singal=9 进程名  #上面仍旧可用
```

### 网络信息

**CentOS 6**

与网络配置相关的文件

```shell
#DNS配置
vim /etc/resolv.conf
#IP地址配置 网卡配置
vim /etc/sysconfig/network-scripts/ifcfg-eth0	#ifcfg-eth0 ifcfg-网卡名称
#网关配置
vim /etc/sysconfig/network
#主机名文件
vim /etc/sysconfig/network /etc/hosts
```

查看网络配置常用命令

```shell
#网卡配置信息
ifconfig
#网管信息
netstat -rn # 或者route -n
#查看DNS
cat /etc/resolv.conf
#查看路由表
route -n
#查看主机名称
hostname # 或者 uname -a 或者sysctl kernel.hostname
```

配置文件详解

网卡配置文件 #vim /etc/sysconfig/network-scripts/ifcfg-eth0 

```sh
DEVICE="eth0" 		#网卡名称
BOOTPROTO="dhcp"	#动态获取ip  static为固定ip
HWADDR="00:0C:29:C1:69:F8"	#mac地址
IPV6INIT="yes"		#是否支持ipv6
NM_CONTROLLED="yes"	#network manger的参数，实时生效 不知道有什么用  慎用
ONBOOT="yes"		#随开机自启动
TYPE="Ethernet"		#网卡类型
UUID="c1018975-b41b-4650-9764-6bf9bd9c3eb3"
```

网关配置文件 #cat /etc/sysconfig/network

```shell
NETWORKING=yes	#系统是否使用网络，为no则不能使用网络，而且很多系统服务将无法启动
HOSTNAME=hhh	#设置主机名 这里设置的主机名要和/etc/hosts中的主机名相对应（设置FQDN）
```

DNS配置文件 	#cat /etc/resolv.conf

```shell
domain localdomain			#设置本地域名 查询在这个domain中的names可以相对于本地domain使用短名称， 如果没有设置domain，则会使用主机名来决定domain
search localdomain			#定义域名的搜索列表
nameserver 192.168.171.2	#dns服务器 修改保存后生效
#有的系统会出现每次重启系统后还原DNS配置文件(/etc/resolv.conf)的情况 关闭 NetworkManager 服务即可
service NetworkManager stop
```

参考：[CentOS 6.X 查看、配置网络的方法_alvincat的博客-CSDN博客](https://blog.csdn.net/ljss321/article/details/53576627)

**CentOS 7**

```shell
#查看网卡信息
ip addr 	#lo 本地回环网卡  ens33 为第一块网卡的名称（ens33网卡名）
#每块网卡区域中，link后面跟的是网卡的MAC地址，inet后面跟的是该网卡的IP v4地址，inet6后面跟的是IP v6地址
#MAC link/ether 00:0c:29:06:e1:08
#ipv4 inet 192.168.171.130/24
#ipv6 inet6 fe80::73bf:9a0e:885d:93f5/64


#查看DNS
cat /etc/resolv.conf	#每个nameserver关键字后面接的都是DNS地址，排在上方的优先级高
#查看网关
ip route	#default via 192.168.171.0/24 网关地址	dev ens33网关所属的网卡名称（ens33）
```

### ip地址/Mac

**CentOS 6**

```shell
#查看ip/MAC地址
ipconfig
```

![image-20210222100449274](https://i.loli.net/2021/02/22/Gwl1Y2Jt5N9oynI.png)

**CentOS 7**

```shell
#查看网卡信息 
ip addr
```

![image-20210222100730709](https://i.loli.net/2021/02/22/OVrakzsm9WUA1Gu.png)

### 路由

**CentOS 6**

```shell
#查看路由
netstat -rn
route -n
#查看ipv6的地址
route -A inet6 -n
```

![image-20210222102119318](https://i.loli.net/2021/02/22/YL9ZczTXIxV2Qol.png)

**CentOS 7**

```shell
#查看路由
ip route
#查看ipv6路由
ip -6 route
```

![image-20210222102148932](https://i.loli.net/2021/02/22/7E35JARjDyT8itf.png)

### 重启

**CentOS 6**

重启命令

```shell
sudo init 6
#重启
sudo reboot
#立即重启
sudo shutdown -r now
#过十分钟后重启
sudo shutdown -r 10
#在20：00重启
sudo shutdown r 20:00	
# 取消重启
shutdown -c
```

关机命令（慎用）

```shell
#关机
sudo init 0
#立即关机
sudo halt
#立即关机
sudo poweroff
#立即关机
sudo shutdown -h now
#10分钟后关机
sudo shutdown -h 10
```

**CentOS 7**

```shell
sudo systemctl reboot
```

### 单用户模式

单用户模式最大的特点就是可以无密码登录，这里并不是简单的介绍init 1、init S（这两个是临时生效，重启后失效） 或者修改/etc/inittab或者systemctl set-default rescue

下面以一个案例来操作：进入单用户模式修改root密码 在linux上的终端执行

**CentOS 6**

1.开机/重启后，按空格使其停留在此页面

![image-20210222140742323](https://i.loli.net/2021/02/22/Jb3wktDrNSI72Tu.png)

2.（上下键可）选择内核，按e进入下一步，在这里选的是第一个

3.（上下键可）选择第二个 kernel开头的选项，按e进行编辑

![image-20210222140936780](https://i.loli.net/2021/02/22/qZxMSAcmNpbda7u.png)

4.输入single，按回车

![image-20210222141143485](https://i.loli.net/2021/02/22/EwAQizZbsSmfL3O.png)

5.回到此页面，输入b重新引导系统

![image-20210222140936780](https://i.loli.net/2021/02/22/qZxMSAcmNpbda7u.png)

6.成功进入系统，接着就可以修改root密码了，设置完后重启即可退出单用户模式

参考：[CentOS 6进入单用户模式 - 合衬-nfsnobody.com - 博客园 (cnblogs.com)](https://www.cnblogs.com/wenrulaogou/p/11995195.html#_label0)

**CentOS 7**

1.开机/重启后，按空格使其停留在此页面

![image-20210222114027578](https://i.loli.net/2021/02/22/LZth4qC6j5bTmGn.png)

2.（上下键可）选择内核，按e进入编辑，在这里选的是第一个

3.光标向下移动，找到该行

![image-20210222114245522](https://i.loli.net/2021/02/22/Y6xPqmgAFzyVOJf.png)

4.在该行末尾加上 init=/bin/sh，然后按"Ctrl + x"

![image-20210222114431265](https://i.loli.net/2021/02/22/d9Anyl8Y7zigvZo.png)

5.输入指令 #mount -o remount,rw /重新挂载，此时就可以调用linux的命令了

6.输入passwd 设置密码

![image-20210222114726684](https://i.loli.net/2021/02/22/82VbmtO6TSFJuQA.png)

7.输入 #touch /.autorelabel 更新系统信息（一定要加这一步 ）

![image-20210222115316084](https://i.loli.net/2021/02/22/stdyC4E6kigzprc.png)

7.重启系统即可

### 启动模式

**CentOS 6**

```shell
#查看运行级别
vim /etc/inittab
```

要修改的话，改这个数字5为指定的级别即可，用指令 #init n 是临时生效的，重启后失效

![image-20210222142912989](https://i.loli.net/2021/02/22/FJZGrtzT5DkIQcd.png)

**CentOS 7**

```shell
#查看当前的运行级别
systemctl get-default
#设置当前的运行级别（重启后生效）切换到图形界面下
systemctl set-default graphical.target	#init 5
#在不重启的情况下，切换到命令行模式下
systemctl isolate multi-user.target
```

运行级别对应表

| init级别 | 说明                                                     | systemctl target  | 说明                                                         |
| -------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------------------ |
| 0        | 表示关机级别（不要将默认的运行级别设置成这个值）         | shutdown.target   | 关机                                                         |
| 1        | 单用户模式                                               | emergency.target  | 紧急模式                                                     |
| 2        | 多用户模式，不带NFS（Network File Syetem），没网络       | rescure.target    | 救援模式 参考：[(1条消息) L4 详解centos7 emergency模式，rescue模式，linux相互登录，克隆_宁信1617-CSDN博客](https://blog.csdn.net/qq_38157974/article/details/78280601) |
| 3        | 多用户模式，完全的多用户模式（不带桌面的，纯命令行模式） | multi-user.target | 多用户，命令行模式                                           |
| 4        | 没有被使用的模式（被保留模式）                           | 无                |                                                              |
| 5        | X11，完整的图形化界面模式                                | graphical.target  | 图形界面                                                     |
| 6        | 表示重启级别（不要将默认的运行级别设置成这个值）         | reboot.target     | 重启                                                         |

参考：[centos7 设置当前运行级别和默认运行级别_cape的博客-CSDN博客_centos7运行级别](https://blog.csdn.net/capecape/article/details/78528761)