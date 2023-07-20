[TOC]

#### 说明

一天，组长提了一个bug，让我先停下其他事情，优先处理这个bug，并特意说明在hotfix-xx分支（master切出来）上修改。三下五除二，咣咣一顿操作，成功解决。提PR合并到develop的时候，遇到冲突，我便取消了本次合并。接着在本地hotfix-xx分支通过`git pull`将develop分支代码拉取下来，解决冲突，再重新提合并。接着心满意足的报告组长让他评审，不过一会儿就收到自动通知，已经合并到develop。自己先点点，过会再让测试同学进行测试，结果不到五分钟便出现了以下对话：

![image-20221125111338816](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125111338816.png)

整个人都慌起来了，虽然组长提供了解决方案，但是我也没用过这个啊。尝试了一番没结果，最后我直接从master重新切一个hotfix-yy分支，然后将修改后的代码一点一点复制到yy分支上，最后重新提合并，由组长那边解决冲突。所幸修改的地方不多，不然就很麻烦了，那像这种场景应该怎么处理会更好呢？能否"挽回局面"让我们再试一下吧。

#### 场景重现

![image-20221125160255790](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125160255790.png)

```txt
master:
添加a、b
master切换创建develop:
添加c
fix:a、b
master切换创建hot-fix-a-bug:
fix:a bug
合并develop分支
hot-fix-a-bug切换至develop:
合并hot-fix-a-bug分支
```

![image-20221125171213521](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125171213521.png)

这样问题就来了，由于是线上bug，我们**只需要处理该bug并将hot-fix-a-bug合并到master进行发布就行**，结果一通操作下来，hot-fix分支包括了develop修改的内容，我们并不希望将develop的修改一同发布（可能会出问题、功能未测试、未验收等），但是我们又不得不将hot-fix分支先合并到develop分支发布测试版进行测试。

#### 撤销还原提交

##### 当前分支情况

###### master源分支

![image-20221125171733445](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125171733445.png)

###### hot-fix、develop分支

![image-20221125171851494](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125171851494.png)

我们按照组长说的看看能不能通过撤销把代码还原吧。

##### 首先撤销hot-fix-a-bug

查看提交日志，通过`git reset --hard id`撤销到某一次提交，此处我们需要撤销到 **fix:a bug** 的提交

```shell
# 切换hot-fix-a-bug
git checkout hot-fix-a-bug
# 查看commit提交记录
git log --pretty=oneline
# 撤销到某一次提交
git reset --hard 8f5f4fa0a3f501df49e54aaa557c1d2c97cdb3c8
git log --pretty=oneline
```

![image-20221125172115145](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125172115145.png)

此时hot-fix-a-bug分支将变成未合并develop的时候：

![image-20221125172400319](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125172400319.png)

##### 撤销develop的相关提交

查看提交日志，通过`git reset --hard id`撤销到某一次提交，此处我们需要撤销到 **fix:a、b** 的提交

```shell
# 切换develop
git checkout develop
# 查看develop分支的相关提交
git log --pretty=oneline
# 撤销develop分支的提交至某一次提交记录
git reset --hard 8df41a9c35c3b49a4d456f0d92472786137718a8
git log --pretty=oneline
```

![image-20221125173104116](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125173104116.png)

此时develop分支将变成未合并hot-fix-a-bug的时候：

![image-20221125173335576](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125173335576.png)

##### 撤销还原结果

我们再看分支图，此时hot-fix-a-bug分支和develop分支已经没有关联，已经还原成功

![image-20221125174014138](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125174014138.png)

#### 如何处理

现在代码已经还原，那么此时我们应该怎样处理呢？我们的目的就两个：**发布测试版进行测试、发布正式版解决bug**

若您没有develop的push权限，那么你需要从develop切一条分支dev-new-a，将hot-fix-a-bug合并至分支dev-new-a，并将分支dev-new-a提PR合并到develop，等待组长评审即可，如果有权限则直接将hot-fix-a-bug合并至分支develop，并将develop推送即可

##### 合并hot-fix-a-bug分支的修改

合并hot-fix-a-bug分支至分支dev-new-a，并解决冲突

```shell
# 切换develop分支
git checkout develop
# 获取线上develop，保证本地develop的分支为最新版本（此处为本地演示，忽略）
git pull origin develop
# 创建并切换dev-new-a分支
git checkout -b dev-new-a
# 在本地合并hot-fix-a-bug分支至dev-new-a分支
git merge hot-fix-a-bug
#手动解决冲突，无冲突则忽略
```

![image-20221125181805107](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125181805107.png)

提交dev-new-a，此时就可以将本地的dev-new-a推送至仓库，提PR合并

```shell
git status
git add .
git commit -m 'fix:合并fix-a'
# 推送至远程仓库（此处为本地演示，忽略）
git push origin dev-new-a
```

![image-20221125181907980](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125181907980.png)

此时我们再看git的分支图

![image-20221125182123285](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20221125182123285.png)

两条路线：master->develop、master->hot-fix-a-bug->dev-new-a

##### 总结线上出现bug的处理流程

###### 有权限的

1. 出现bug
2. 从master（正式环境）分支创建并切换到hotfix-xxx-bug分支
3. 在hotfix-xxx-bug分支处理bug
4. **切换develop（测试环境）分支，合并hotfix-xxx-bug分支修改的内容**，并解决冲突
5. 提交推送develop分支，并发布测试环境，进行测试
6. 若测试有bug，则执行3、4、5步骤
7. 测试完成后，切换master分支，合并hotfix-xxx-bug分支修改的内容，并解决冲突
8. 提交推送master分支、并发布

###### 没有权限的

1. 出现bug
2. 管理员在远程仓库从master（正式环境）分支创建hotfix-xxx-bug分支
3. 拉取hotfix-xxx-bug分支到本地
4. 在hotfix-xxx-bug分支处理bug
5. 在本地develop分支创建并**切换dev-fix-xxx分支**
6. **合并hotfix-xxx-bug分支**，并解决冲突
7. 提交推送dev-fix-xxx分支，提交PR到develop，等待评审合并
8. 管理员合并dev-fix-xxx分支到develop，并发布测试环境，进行测试
9. 若测试有bug，则切换到hotfix-xxx-bug分支处理，再执行6、7、8步骤
10. 测试完成后提交推送hotfix-xxx-bug分支，提交PR到master，等待评审合并
11. 管理员合并hotfix-xxx-bug分支到master，并解决冲突、发布
