# Linux

## 基础指令

### 安装

### ls

- #ls [选项] 路径

	- 列出目录

		- -a 显示所有的文档（包含隐藏）
		- -h 可读性较高的形式
		- -l 详细列表

### pwd

- #pwd

	- 打印当前工作目录

### cd

- #cd 【路径】

	- 进入目录

		- ~为当前登录用户的家目录，不写路径也会进到当前用户的家目录

### mkdir

- #mkdir [选项] 路径 [路径1 路径2]

	- 创建目录

		- -p 一次性创建不存在的目录

			- #mkdir -p a/b/c/d
			- #mkdir dir1 dir2 dir3

### touch

- #touch 文件名称1 【文件名称2】

	- 创建【多个】文件

### cp

- #cp [选项] 被复制的文档路径 文档被复制到的路径

	- 复制文件

		- -r 递归复制

### mv

- #mv 【选项】需要移动的文档路径 文档被移动到的位置

	- 移动、剪切、重命名

### rm

- #rm 【选项】路径（可通配符）

	- 删除

		- -f force强制删除 无提示
		- -r 递归删除

### vim

- #vim 文件路径

	- 打开一个文件

### 重定向

- 指令 > 路径

	- 覆盖输出

- 指令 >> 路径

	- 追加输出

### cat

- #cat 文件路径

	- 查看文件

- #cat 路径1 路径2 > 合并之后路径

	- 合并文件并输出到某路径

## 进阶指令

### df

- #df 【选项】

	- 查看磁盘空间

		- -h 可读性较高的形式

### free

- #free 【选项】

	- 查看内存使用情况

		- -m 以mb单位查看（推荐）
		- -g 以g单位查看

### head

- # head -n 文件路径

	- 查看文件前n行【n为数字】

### tail

- # tail -n 文件路径

	- 查看文件末n行【n为数字】、用于查看日志或配置居多

### less

- #less 路径

	- 以较少内容查看 ，辅助功能键（数字+回车、空格键+上下方向键），q退出

### wc

- #wc 【选项】统计文件路径

	- -l lines 行数
	- -w words 单词数（按照空格拆分）
	- -c bytes 字节数

### date

- #date

	- 时间读取 默认2018年 3月 24日 星期六 15:54:28

		- +%F 2018-03-24
		- %T 16:01:00
		- “+%F %T” 等价于 “+%Y-%m-%d %H:%M:%S”
		- -d  “-1 day”  “+%F %T”  获取之前或者之后的某个时间

### cal

- #cal

	- 直接输出当前月份日历 等价于 #cal 1

		- #cal 3 输出上月+本月+下月的日历
		- cal -y 年份 输出某一个年份的日历

### clear /ctrl + L

- 清控制台

### |

- 指令 | grep 关键词

	- 过滤，不能单独使用，需要配合前面的指令一起使用，辅助作用

## 高级指令

### hostname

- #hostname [-f]

	- 读取主机名，也可设置，不过是临时性的切换用户后生效，重启后失效

		- -f 输出当前主机名中的FQDN（全限定域名）

### id

- #id [用户名]

	- 查看用户的基本信息（用户id，组id，附加组id），可不指定用户，默认为当前用户

		- 验证用户信息：通过文件/etc/passwd
		- 验证用户组信息：通过文件/etc/group

### whoami

- #whoami

	- 显示当前登录的用户名

### ps

- #ps -ef | grep 关键词

	- 查看服务器的进程信息

		- -e 列出所有进程

			- UID：该进程执行的用户id；
PID：进程id；
PPID：该进程的父级进程id，如果一个程序的父级进程找不到，该程序的进程称之为僵尸进程（parent process ID）；

		- -f 显示所有字段

			- C：Cpu的占用率，其形式是百分数；
STIME：进行的启动时间；
TTY：终端设备，发起该进程的设备识别符号，如果显示“?”则表示该进程并不是由终端设备发起；
TIME：进程的执行时间；
CMD：该进程的名称或者对应的路径；

### top

- #top

	- 查看服务器进程所占用的资源，按q退出

		- 快捷键 m 按内存从高到低降序排列

			- PID：进程id；
USER：该进程对应的用户；
PR：优先级；
VIRT：虚拟内存；
RES：常驻内存；
SHR：共享内存  计算一个进程实际使用的内存 = 常驻内存（RES）- 共享内存（SHR）

		- 快捷键 p cpu 从高到低排

			- S：表示进程的状态status（sleeping，其中S表示睡眠，R表示运行）；
%CPU：表示CPU的占用百分比；
%MEM：表示内存的占用百分比；
TIME+：执行的时间；
COMMAND：进程的名称或者路径；

		- 当服务器拥有多个cpu的时候可以使用“1”快捷键来切换是否展示显示各个cpu的详细信息

### du

- #du 【选项】目录路径

	- 查看目录的真实大小

		- -s summaries 汇总大小
		- -h 可读性较高

### find

- #find 路径范围  【选项】【选项值】

	- 查找文件

		- -name 文档名称 可通配符 
		- type f表示文件 d表示文件夹

### service

- #service  服务名 start/stop/restart

	- 控制服务的启动/停止/重启

### kill

- #kill 进程pid

	- 结束进程

### killall

- #killall 进程名称

	- 结束进程

### ifconfig

- #ifconfig

	- 获取网卡信息，inet addr就是网卡的ip地址

		- eth0 网卡名称
		- lo loop 本地回还网卡 ip一般为127.0.0.1，网卡名称
		- 当服务器拥有多个cpu的时候可以使用“1”快捷键来切换是否展示显示各个cpu的详细信息

### reboot

- #reboot

	- 重启

		- -w 模拟重启，但不重启（只写关机和开机日志信息）

### shutdown

- #shutdowm  【选项】 

	- 关机（慎用）

		- -h 小时

			- #shutdown -h 12:10 "系统计划在12:10"关机

		- 取消计划关机

			- 7.x- ctrl + c
			- 7.x+ shutdown -c

		- 拓展

			- poweroff
			- init 0
			- halt

### uptime

- #uptime

	- 输出计算机持续在线时间（开机到现在）

### uname

- #uname 【选项】

	- 获取计算机操作系统相关信息

		- -a all 获取全部的系统信息（类型、全部主机名、内核版本、发布时间、开源计划）

### netstat

- #netstat -tnlp

	- 查看网络连接状态

		- -t 列出tcp协议的链接
		- -n 字母组合转化成ip地址，将协议转换成端口号显示
		- -l 过滤出“state（状态）”列中其值为LISTEN（监听）的连接
		- -p 显示发起连接的进程pid和进程名称

### man

- #man 命令

	- manual 查看手册 按q退出

## vim

### 打开方式

- vim 路径

	- 打开指定文件

- vim +数字 路径

	- 打开指定文件，将光标移动到指定行

- vim +/关键词 路径

	- 打开指定文件，高亮显示关键词

- vim 路径1 路径2

	- 同时打开多个文件

### 退出方式

- :wq

	- 保存并退出

- :q

	- 退出

- :q!

	- 不保存直接退出

- :x

	- 子主题 1

### 命令模式（打开文件后默认进入的模式）

- 不能对文件直接编辑，可通过快捷键标记文件（删除行、复制行、移动光标、粘贴等）
- 光标移动

	- shift +^

		- 行首

	- shift + $

		- 行尾

	- gg

		- 移动到首行

	- G

		- 移动到末行
		- 数字 G

			- 快速移动到指定行

	- 数字 ↑/数字 ↓ 

		- 以当前光标为准向上/向下移动n行

	- 数字 ←/数字 → 

		- 以当前光标为准向左/向右移动n字符

	- :n

		- 末行模式下 快速移到n行

	- ctrl + b或者PgUp

		- 上一页

	- ctrl + f 或者PgDw

		- 下一页

- 复制/粘贴/删除

	- yy

		- 复制所在行
		- 数值 yy 以光标所在行为准（包括该行）向下复制指定行数

	- 可视化复制

		- 子主题 1

			- 按键：ctrl + v（可视块）或V（可视行）或v（可视），然后按下↑↓←→方向键来选中需要复制的区块，按下y键进行复制

	- p

		- 粘贴

	- dd

		- 剪切/删除所在行
		- 数字 dd  以光标所在行为准（包括该行）向下剪切指定行数

	- D

		- 删除所在行数据，下面的数据不会上移

	- 可视化删除

		- 按键：ctrl + v（可视块）或V（可视行）或v（可视），上下左右移动，按下D表示删除选中行，d表示删选中块

	- u 或 :u（末行模式）

		- 撤销

	- ctrl + r

		- 恢复

### 编辑模式（输入模式）按i、a等进入

- 有多个命令  只介绍i，a
- i

	- 在光标所在字符前开始插入

- a

	- 在光标所在字符后开始插入

### 末（尾）行模式  输入：或/进入

- 退出方式

	- 按下esc
	- 连按两次esc
	- 删除末行全部输入字符

- 保存/退出

	- :w

		- 保存文件
		- :w 路径

			- 另存为

	- :q

		- 退出文件

	- :wq

		- 保存并退出

	- :q!

		- 强制退出 不做保存

	- ! 命令

		- 调用外部命令

- 查找/替换

	- / 关键词

		- 上一个结果 N
		- 下一个结果 n

	- :nohl

		- 取消高亮

	- 替换

		- :s/搜索词/新内容

			- 替换光标所在行的第一处符合条件的内容

		- :s/搜索词/新内容/g

			- 替换光标所在行全部符合条件的内容

		- :%s/搜索词/新内容

			- 替换整个文档中每行第一个符合条件的内容

		- :%s/搜索词/新内容/g

			- 替换整个文档符合条件的内容

	- :set nu

		- 显示行号（临时）
		- :set nonu 不显示行号

- 扩展，打开多个文件，如何切换

	- :files

		- 查看已经打开的文件夹名称
		- 状态%a  当前打开的文件
		- 状态#  上一个打开的文件

	- :open 文件名
	- :bn

		- back next 下一个文件

	- :bp

		- back prev上一个文件

### 扩展

- :syntax on

	- 代码着色 不着色为off

- 计算器的使用

	- a. 进入编辑模式
b. 按下按键“ctrl + R”，然后输入“=”，此时光标会变到最后一行
c. 输入需要计算的内容，按下回车

- 配置

	- 在文件打开时在末行模式下输入配置（如：:set nu）
	- 个人配置文件（~/.vimrc，如没有则新建即可）

		- 若个人配置和系统配置冲突，以个人配置为准

	- 全局配置文件（vim自带，/etc/vimrc）

- 异常退出

	- 定义：在编辑文件后并没有正常的去wq，再次打开文件时会引发异常
	- 解决方案：删除临时文件.wp，或按照提示操作即可

- 别名机制

	- 定义

		- 创建一些属于自己的自定义命令，依赖~/.bashrc，添加alias mv='mv -i'即可

	- 需重新登录当前用户

- :x 退出

	- “:x”在文件没有修改的情况下，表示直接退出，在文件修改的情况下表示保存并退出
	- 如果文件没有被修改，但是使用wq进行退出的话，则文件的修改时间会被更新；但是如果文件没有被修改，使用x进行退出的话，则文件修改时间不会被更新的；主要是会混淆用户对文件的修改时间的认定

- 加密

	- X

- 解密

	- X 不输入密码即可

## 自有服务（1）

### 运行模式（运行级别）

- 配置文件 /etc/inittab（版本不同，各有区别）
- centos6.x

	- 0 — 表示关机级别（不要将默认的运行级别设置成这个值）
1 — 单用户模式
2 — 多用户模式，不带NFS（Network File Syetem）
3 — 多用户模式，完全的多用户模式（不带桌面的，纯命令行模式）
4 — 没有被使用的模式（被保留模式）
5 — X11，完整的图形化界面模式
6 — 表示重启级别（不要将默认的运行级别设置成这个值）
	- #init 0

		- 关机

	- #init 3

		- 切换到命令行模式

	- #init 5

		- 切换到桌面模式

	- #init 6

		- 重启电脑

	- 设置模式永久为命令行模式

		- 修改inittab文件末行  id:3:initdefault:

- centos7.x

	- multi-user.target类似于runlevel 3
	- graphical.target类似于runlevel5
	- #systemctl get-default

		- 查看默认运行级别的方式

	- #init n 仍可用

		- 0	 shutdown.target
1	 emergency.target
2	 rescure.target
3	 multi-user.target
4	 无
5	 graphical.target
6	 无

	- #systemctl set-default TARGET.target

		- 设置默认运行级别的方式

	- #systemctl 【选项】【级别】

		- systemctl get-default				获得当前的运行级别
systemctl set-default multi-user.target	设置默认的运行级别为mulit-user
systemctl isolate multi-user.target		在不重启的情况下，切换到运行级别mulit-user下
systemctl isolate graphical.target		在不重启的情况下，切换到图形界面下

## 用户和用户组

### 注意

- 用户名不可重复
- /etc/passwd 存储用户信息  查看用户主组
- /etc/group 存储用户组信息  查看附加组
- /etc/shadow 存储用户密码信息

### 用户操作

- #user add 【选项】 用户名

	- -g 用户主组 可以是用户组id，也可以是组名
	- -G 用户附加组 可以实用户组id，也可以是组名
	- -u uid（用户id标识），不指定的话系统默认从500之后按顺序分配uid
	- -c 注释
	- 验证成功

		- 验证/etc/passwd的最后一行
		- 验证是否存在同名家目录（centos）#ls /home
		- 在不添加选项时执行useradd 会创建同名家目录，会创建同名用户组

	- passwd文件

		- user1:x:1001:1001::/home/user1:/bin/bash
用户名:密码:用户ID:用户组ID:注释:家目录:解释器shell
		- 用户名：创建新用户名称，后期登录的时候需要输入；
密码：此密码位置一般情况都是“x”，表示密码的占位；
用户ID：用户的识别符；
用户组ID：该用户所属的主组ID；
注释：解释该用户是做什么用的；
家目录：用户登录进入系统之后默认的位置；
解释器shell：等待用户进入系统之后，用户输入指令之后，该解释器会收集用户输入的指令，传递给内核处理；

- #usermod 【选项】 用户名

	- -g 用户主组 可以是用户组id，也可以是组名
	- -G 用户附加组 可以实用户组id，也可以是组名
	- -u uid（用户id标识），不指定的话系统默认从500之后按顺序分配uid
	- -l 新用户名

		- #usermod -l 新的用户名 旧的用户名

- #passwd 用户名

	- 设置密码

- #su 【用户名】

	- 切换用户，用户名不指定则表示切换到root用户

		- a. 从root往普通用户切换不需要密码，但是反之则需要root密码；
b. 切换用户之后前后的工作路径是不变的；
c. 普通用户没有办法访问root用户家目录，但是反之则可以；

- #userdel 【选项】 用户名

	- 删除用户

		- -r 删除用户时，同时删除家目录
		- 已经登录的的用户要先结束此用户进程才可删除

### 用户组操作

- 文件结构

	- geoclue:x:991:
用户组名:密码:用户组ID:组内用户名

- #groupadd 【选项】 用户组名

	- -g 自定义组id，不指定则默认500之后递增

- #groupmod 【选项】 用户组名

	- -g 自定义组id，不指定则默认500之后递增
	- -n 新用户组名

- #groupdel 用户组名

	- 若这个组时某个用户的主组，则不允许删除。要删除，先从组内移除所有用户

## 网络设置

### 网卡配置文件路径

- /etc/sysconfig/network-scripts
- 命名格式：ifcfg-网卡名称
- ifcfg-eth0（举例）

	- TYPE="Ethernet"
BOOTPROTO="dhcp"    #ip地址分配方式，DHCP表示动态主机分配协议
DEFROUTE="yes"
PEERDNS="yes"
PEERROUTES="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_PEERDNS="yes"
IPV6_PEERROUTES="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="bb47ac5c-c613-4a71-87f2-1369029fc1d4"
DEVICE="ens33"
ONBOOT="yes"   #是否开机启动

### 重启所有网卡

- #service network restart
- #/etc/init.d/network restart

### 扩展

- #ln -s 原始路径 快捷方式路径

	- 软连接（快捷方式）（ls -l可查看详情，文件类型位置的“l”表示其类型为link（连接类型））

		- ln -s /etc/sysconfig/network-scripts/ifcfg-ens33 ifcfg-ens33

- #ifdown 网卡名

	- 停止单个网卡（慎用）

- #ifup 网卡名称

	- 启动单个网卡

## SSH服务

### 服务启动/停止/重启

- #service sshd start/stop/restart
- #/etc/init.d/sshd start/stop/restart
- 默认端口22，在/etc/ssh/ssh_config可自定义修改

### 远程终端 

- Xshell
- secureCRT
- Putty小

### 文件传输

- Filezilla

## 自有服务2

### #hostname

- -f FQDN（全限定域名）
- 设置主机名

	- #hostname 新主机名

		- 临时设置主机名，切换用户后生效，重启后失效

	- centos6.x

		- 主机名配置文件：/etc/sysconfig/network
修改其中的HOSTNAME为自己需要设置的永久主机名
修改linux服务器的hosts文件（/etc/hosts），将 新主机名 指向本地（设置FQDN）重启后生效

			- 为什么要设置FQDN

				- 很多开源服务器软件（例如Apache）则无法启动，或出现报错；
方便记忆，看到主机名对其作用有一个初步判断；
如果不设置则会影响本地的域名的解析（本地访问）；

	- centos7.x

		- 修改/etc/hostname内容即可

			- 重启后生效，ping 新hostname 能通则表示成功

### #chkconfig 

- “开机启动项”管理服务

	- --list 服务查询

		- #chkconfig --list

	- 0-6 表示各个启动级别
	- --del 

		- #chkconfig --del 服务名

	- --add

		- #chkconfig --add 服务名   （必须保证服务正常运行，才可以添加）

	- --level

		- #chkconfig --level 级别名1【级别名2】  服务名 on/off

			- 设置服务在某个级别下开机启动/不启动

### ntp服务

- 对计算机的时间进行同步管理

	- 一次性同步

		- 操作之前先做个快照（方便下面设置时间同步服务的测试）
		- #ntpdate 时间服务器的域名或ip地址（http://www.ntp.org.cn/pool）
		- #ntpdate 120.25.115.20

	- 设置时间同步服务（启动ntpd服务）

		- centos6.x

			- #service ntpd start
			- 设置ntpd服务开机启动
chkconfig --level 35 ntpd on

		- centos7.x

### 防火墙服务

- centos6.x（iptables ）

	- 启动/关闭/重启（默认启动）

		- #service iptables start/stop/restart

	- 查看状态（规则）

		- #service iptables status

	- 查看规则命令

		- #iptables -L -n

			- -l 列出规则
			- -n 将单词表达形式改为数字显示

		- #vim /etc/sysconfig/iptables

			- 开放80端口

				- 配置文件加入  -A RH-Firewall-1-INPUT -m state –state NEW -m tcp -p tcp –dport 80 -j ACCEPT
				- 重启iptables

					- #service iptables restart

	- 简单设置防火墙

		- #iptables -I INPUT -p tcp --dport 80 -j ACCEPT    #允许访问80端口
/etc/init.d/iptables save  #添加完后要保存

			- Iptables：主命令
-I：表示将规则放到最前面
-A：add，添加规则（最后）
INPUT：进站请求【出站output】
-p：protocol，指定协议（icmp/tcp/udp）
--dport：指定端口号
-j：指定行为结果，允许（accept）/禁止（reject）/丢弃（drop）

	- 用于过滤数据包，属于网络层防火墙

- centos7.x（firewaild）

	- 能够允许哪些服务可用，那些端口可用...属于更高一层的防火墙
	- centos7/redhat7已经默认使用firewalld作为防火墙，其使用的方式已经变化，基于iptables的防火墙默认不启用，但是仍可以继续使用
centos7/redhat7中有几种防火墙共存：firewalld、iptables、ebtablesd、默认使用的是firewalld作为防火墙，管理工具是firewalld
	- 查看状态

		- #systemctl status 【firewalld,iptables,ip6tables,ebtables】

	- #firewall-cmd

		- 开启端口

			- #firewall-cmd --zone=public --add-port=80/tcp --permanent

				- --zone 作用域
				- --add-port 添加端口 格式:端口/通讯协议
				- --permanent 永久生效，无此参数，重启后失效

		- 检测端口

			- #firewall-cmd --query-port=80/tcp

		- 重启

			- #firewall-cmd --reload

		- 列表

			- #firewall-cmd --list-port

		- 关闭

			- #systemctl stop firewalld.service

		- 禁止开机启动

			- #systemctl disable firewalld.service

	- centos7与6的区别

### rpm管理

- 查询某个软件的安装情况

	- # rpm -qa |grep yum
	- -q 查询
	- -a 全部

- #rpm -e 软件名称

	- 没有依赖关系可以直接卸载
	- 当存在依赖关系的时候又不想去解决这个问题的时候可以：
#rpm -e 软件包名 --nodeps

- #lsblk 

	- 查看块状设备信息

		- Name：名称
Size：设备大小
Type：类型
MountPoint：挂载点（类似windows下盘符）

- 光盘挂在和解挂

	- 解挂

		- #umount 当前设备的挂载点

	- 挂载

		- #mount 设备原始地址 要挂在的位置路径
		- 设备原始地址：/dev/名字（大小确定具体name值）
		- 要挂在的位置路径：挂载目录一般在mnt下，以/mnt/dvd为例

- #rpm -ivh 软件包完整名称

	- 安装软件
	- -i 安装
	- -v 显示进度
	- -h 表示已#的形式显示进度条

### cron/crontab计划任务

- #crontab 【选项】

	- -l 列出用户的计划任务列表
	- -e edit 编辑指定用户的计划任务列表
	- -u 指定用户名  不指定表示当前用户
	- -r remove 删除指定用户的计划任务列表

- 编辑计划任务

	- 格式：行为单位，一行为一个计划（cron表达式 需要执行的命令）

- 权限

	- 任何用户都可以创建自己的计划任务
	- 黑名单配置不允许用户设置计划任务

		- 在/etc/cron.deny 添加用户名，一行一个

	- 白名单允许用户创建计划任务

		- /etc/cron.allow（不存在则重建）一行有一个，当白名单和黑名单同时存在某用户，以白名单为准

## 权限管理

### 概述

- 权限操作与用户、用户组是兄弟操作
- 一般将文件可存/取访问的身份分为3个类别：owner、group、others，且3种身份各有read、write、execute等权限
- 读

	- 对于文件夹来说，读权限影响用户是否能够列出目录结构（#ls）
	- 对于文件来说，读权限影响用户是否可以查看文件内容（vim、cat、tail、more、head）

- 写

	- 对文件夹来说，写权限影响用户是否可以在文件夹下“创建/删除/复制到/移动到”文档（mkdir、touch、rm、cp、mv）
	- 对于文件来说，写权限影响用户是否可以编辑文件内容（vim）

- 执行

	- 一般都是对于文件来说，特别脚本文件，当文档拥有执行权限（任意部分），其颜色在终端是绿色的

- lrwxr-xr--

	- l 文件类型为软连接，-表文件，d表目录，s表套接字
	- rwx 所有者拥有的权限  读写执行
	- r-x 同组用户拥有的权限 读执行
	- r-- 其他人拥有的权限 读，-表无权限

### 身份

- Owner

	- 文件所有者，默认为文档的创建者

- Group

	- 与文件所有者同组的用户

- Others

	- 其他人，相对于所有者

- Root

	- 超级用户

### #chmod 【选项】 权限模式 文档

- 如果想要给文档设置权限，操作者要么是root用户，要么就是文档的所有者
- -r 递归，文件夹
- 字母形式

	- 用户
u 所有者
g 所属组
o 其他人
a 所有人
	- 操作
+ 增加权限
-  减少权限
= 确定权限（直接赋值）
	- 权限
r  可读
w 可写
x  可执行
-  无权限
	- 如果在设置权限的时候不指定给谁设置，则默认给所有用户设置
	- eg:#chmod u+x,g+rx,o+r aa.txt

		- aa.txt（-rw-------.）设置权限，要求所有者拥有全部的权限，同组用户拥有读和执行权限，其他用户只读权限

- 数字形式（二进制&的结果）

	- r  4
w 2
x  1
无任何权限设为0即可
	- 0 ---  0
1 --x  0+0+1
2 -w- 0+2+0
3 -wx 0+2+1
4 r--   4+0+0
5 r-x   4+0+1
6 rw-  4+2+0
7 rwx  4+2+1
	- 在写权限的时候千万不要设置类似于上面的这种“奇葩权限”。如果一个权限数字中但凡出现2与3的数字，则该权限有不合理的情况
	- 在Linux中，如果要删除一个文件，不是看文件有没有对应的权限，而是看文件所在的目录是否有写权限，如果有才可以删除
	- #chmod 775 aa.txt

### 属主和属组的设置

- 所属用户  所属用户组
root root
- #chowm 【-R】 用户名 文档

	- 更改文档属主

- #chowm 【-R】 用户名:用户组 文档

	- 一次更改文档属主属组

		- #chown -R loger:loger passwd

- #chgrp 【-R】 用户组 文档（了解即可）

	- 更改文档属组

### sudo

- 管理员赋予普通用户执行管理员专属命令（reboot、shutdown、init、halt、user管理）
- 配置/etc/sudoers

	- 无法用vim直接编辑 使用#visudo进行编辑
	- root    ALL=(ALL)       ALL
Root表示用户名，如果是用户组，则可以写成“%组名”
ALL：表示允许登录的主机（地址白名单）
(ALL)：表示以谁的身份执行，ALL表示root身份
ALL：表示当前用户可以执行的命令，多个命令可以使用“,”分割
	- 案例：本身test用户不能添加用户，要求使用sudo配置，将其设置为可以添加用户，并且可以修改密码（但是不能修改root用户密码）

		- 在写sudo规则的时候不建议写直接形式的命令，而是写命令的完整路径。
路径可以使用which命令来查看
语法：#which 指令名称
		- 禁止修改root密码的配置（先允许全部，再拒绝root密码设置）

			- /usr/bin/passwd [A-Za-z]*, !/usr/bin/passwd root

		- loger   ALL=(ALL)       /usr/sbin/useradd,/usr/bin/passwd [A-za-z]*,!/us        r/bin/passwd root

	- #sudo 需要执行的命令

- -l 在普通用户下查看自己有哪些sudo权限
- sudo不是任何Linux分支都有的命令，常见centos与ubuntu都存在sudo命令

*XMind: ZEN - Trial Version*