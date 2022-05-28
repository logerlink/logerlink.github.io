[TOC]

### Github仓库地址

![image-20210628115431843](https://i.loli.net/2021/06/28/ubPUMKYSVzQpw7E.png)

### Azure DevOps仓库地址

![image-20210628114919785](https://i.loli.net/2021/06/28/LcsexjgWznYMdP1.png)

![image-20210708110009847](https://i.loli.net/2021/07/08/ev1qzBCJRIsx4fO.png)

### http验证

这个比较简单，直接加remote，然后pull（devOps在执行pull或clone操作时需要凭证，github则不用），执行git push 的时候git bash窗口会弹出来一个账号验证框，输入账号密码即可

![image-20210628145553310](https://i.loli.net/2021/06/28/xcM4fWPYlztiwoO.png)

![image-20210628145637341](https://i.loli.net/2021/06/28/YJVl3OLr48B7AC5.png)

```shell
#初始化仓库
git init
#查看远程仓库配置信息
git remote -v
#添加远程仓库 origin
git remote add origin https://github.com/logerlink/testGit.git
#获取远程仓库origin上的分支main   devOps默认主分支为master  git pull origin master 
git pull origin main
#本地仓库创建并切换到main分支	   devOps默认主分支为master 忽略该步骤
git checkout -b main
#添加一个文件
touch test222.txt
#查看本地仓库的状态，通常会提示那些文件改了，那些文件删除了
git status
#接受本地分支的所有修改
git add .
#查看本地仓库的状态
git status
#提交本次修改，并备注
git commit -m '添加test2222.txt'
#将本次修改提交到远程仓库    devOps默认主分支为master git push origin master
git push origin main
```

![image-20210628150623501](https://i.loli.net/2021/06/28/Otdk2rl1yTu3HnY.png)

#### 保存凭证信息

提交后，当我们再次更新提交时，发现还要我们输入账号密码，这样很不方便，我们先关掉账号密码输入框。执行以下命令

```shell
git config --global credential.helper store
# 推送到远程仓库
git push origin main
#在账号密码输入框输入账号密码
#下一次再有更新提交时就不用输入账号密码了
```

### ssh验证

Github和Azure DevOps的使用除了配置那里不一样，其他都是一样的。所以<span style="color:red">下面的两个配置按照你的需求选其一即可</span>

#### 生成本地公钥密钥

```shell
#打开git bash
#切到用户下的.ssh目录下，没有该先创建。loger为当前用户名
cd /c/Users/loger/.ssh
#git bash执行 连按3次
ssh-keygen -t rsa -C "logerxxx@outlook.com"
```

![image-20210628112254180](https://i.loli.net/2021/06/28/fpeYE5mS3cH9RZL.png)

#### Azure DevOps的配置

![image-20210628120714280](https://i.loli.net/2021/06/28/wIU9vuijY7DfE8T.png)

![image-20210628120739273](https://i.loli.net/2021/06/28/8Au2TLda3NU1KBl.png)

![image-20210628121217317](https://i.loli.net/2021/06/28/zRZTMLEvfr4QjwO.png)

#### Github的配置

![image-20210628121709044](https://i.loli.net/2021/06/28/hYlbs5TWPqH4JZI.png)

![image-20210628121809030](https://i.loli.net/2021/06/28/F9GIqlpwhBAO4oM.png)

![image-20210628121949480](https://i.loli.net/2021/06/28/Tob6sjdwBLQ5Hhv.png)

#### 从远程仓库获取内容

以github为例，devOps也是一样的

```shell
#新文件夹
#初始化git环境
git init
#查看git的远程仓库信息 如果有可以先删除或更换名称
git remote -v
#添加git的远程仓库信息 origin为名字，随便起，不要重复就行
git remote add origin git@github.com:jsreport/jsreport-dotnet-example-net-webapp.git
#从仓库获取最新内容 第一次获取记得加 origin master 后续直接git pull即可
git pull origin master
```

![image-20210628122327067](https://i.loli.net/2021/06/28/7QWbfOhizSv2Pt4.png)



### 一些问题

#### fatal: couldn't find remote ref master

远程仓库没有master分支，现在github默认main为主分支，更换分支名称即可

![image-20210628144502873](https://i.loli.net/2021/06/28/cOAIHDZ74MvrTaW.png)

#### fatal: not a git repository (or any of the parent directories): .git

不是git 仓库，执行git init即可

#### error: src refspec main does not match any

本地仓库没有main分支，建一个main分支即可。这种情况一般出现在github，现在github默认main为主分支，而git bash 执行git init初始化时，默认分支还是master

![image-20210628143906809](https://i.loli.net/2021/06/28/Jp1gj5L8C9HMSQu.png)

#### error: No such remote: 'main'

没有该远程名称

![image-20210628144928226](https://i.loli.net/2021/06/28/mwtdueGzMrQYjyS.png)

#### fatal: 'main' does not appear to be a git repository

没有该远程名称

![image-20210628144817723](https://i.loli.net/2021/06/28/fq9rLhilQSBHP8c.png)

#### 本地新仓库执行git pull后，Aborting错误

<span style="color:red">*</span>error: The following untracked working tree files would be overwritten by merge

<span style="color:red">*</span>Please move or remove them before you merge.

<span style="color:red">*</span>error: Your local changes to the following files would be overwritten by merge:

<span style="color:red">*</span>Please commit your changes or stash them before you merge.

本地仓库和远程仓库合并时存在冲突，通常是本地仓库和远程仓库存在同一个文件而导致的问题，如远程仓库中存在test.txt，本地也有test.txt，且这两份test.txt的文件内容不相同

![image-20210706152539038](https://i.loli.net/2021/07/06/OZo5vdXVuaGmgsB.png)

方案一：先暂存（stash）本地，再拉取（pull）远程仓库的内容，然后取出（pop）暂存

```shell
git stash
#提示：You do not have the initial commit yet 方案一不可行，不要继续往下了，用方案二
git pull origin main
#unrelated histories报错则执行 git pull origin main --allow-unrelated-histories
git status
git stash pop
```

![image-20210708102049165](https://i.loli.net/2021/07/08/YGs6tJPASgxTLoW.png)

方案二：先提交（commit）本地，再拉取（pull）远程仓库的内容

```shell
git add .
git commit -m '初始文件'
git pull origin main	
#unrelated histories报错则执行 git pull origin main --allow-unrelated-histories
```

![image-20210706153917712](https://i.loli.net/2021/07/06/ClAVNju1kSdh2Gb.png)

#### fatal: refusing to merge unrelated histories  拒绝合并无关的历史记录

```shell
git pull origin main --allow-unrelated-histories
```

![image-20210706154026074](https://i.loli.net/2021/07/06/bgrxP4f13dJ8Vci.png)

#### 二进制文件冲突，如何合并？

Automatic merge failed; fix conflicts and then commit the result.

![image-20210708103021061](https://i.loli.net/2021/07/08/Z1YTrGOClU26vKd.png)

方案一：取消合并

```shell
git merge --abort
```

方案二：以某个分支为准，如A、B两个分支冲突，A为本地分支

```shell
#若以A（源分支）的修改为主则用--ours，若以B（目标分支）的修改为主则用 --theirs
#.表示所有文件，此处也可以直接写文件名，类似与git add .中的.
git checkout . --ours
git add .
git commit -m '合并excel冲突，以本地修改为主'
```

![image-20210708103823247](https://i.loli.net/2021/07/08/73JyQjatZWC5PKV.png)

### git高级用法

[Git这些高级用法 - 李翰林 - 博客园 (cnblogs.com)](https://www.cnblogs.com/lihanlin/p/12581947.html)