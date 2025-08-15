[Toc]

### 问题

如何在Visual Studio中创建src文件夹？是不是很疑惑，这也要拿来水一篇文章吗？先不急，且往下看

如图，我想实现这样的项目风格，于是我尝试了以下操作均未成功。

![image-20250806145344724](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806145344724.png)

首先我们先建一个空白解决方案：打开 VS → 创建新项目 → 搜索 “空白解决方案” → 命名为 `TestProject` → 选择保存路径为 `D:\Work` 目录

#### 尝试一

在vs中新建解决方案文件夹

右键解决方案—选择新建解决方案文件夹，在解决方案确实可以看到文件夹，但是在文件资源管理器却看不到新建的（src）文件夹，而且明明是在modules文件夹下创建的项目，却跑到解决方案目录了

原来在vs中新建的解决方案文件夹属于虚拟文件夹，只是用于方便管理和查看解决方案而已，并非真实的文件夹，自然就不会在文件资源管理器生成

![image-20250806145753426](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806145753426.png)

#### 尝试二

先创建文件夹再加入到vs解决方案中

我们先在文件资源管理器创建（src）文件夹，然后在vs解决方案资源管理器上方点击"显示所有文件"按钮，不管用。手动将（src）文件夹拖动或复制到vs解决方案资源管理器中，也不管用。

![image-20250730171000263](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250730171000263.png)

### 解决方案

那应该怎么处理呢？首先我们需要准备一个空白的解决方案

#### 方案一

首先我们可以先在文件资源管理器创建（src）文件夹，然后修改`.sln`文件，加入类似的内容即可，有多少个文件夹就添加多少个

第一个GUID应该是解决方案ID，不用修改，第二个GUID是文件夹ID，改为唯一项即可

```shell
Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "src", "src", "{02EA681E-C7D8-13C7-8484-4AC65E1B89E8}"
EndProject
Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "modules", "modules", "{02EA681E-C7D8-13C7-8484-4AC65E1B1234}"
EndProject


	GlobalSection(NestedProjects) = preSolution
		{02EA681E-C7D8-13C7-8484-4AC65E1B1234} = {02EA681E-C7D8-13C7-8484-4AC65E1B89E8}
	EndGlobalSection

```

完整`.sln`文件如下图所示

![image-20250806150554634](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806150554634.png)

注意，要先修改`.sln`文件添加文件夹，再创建项目。若（src）文件夹下已有项目，是不会被自动加载到解决方案的，需要在vs解决方案手动添加项目。

注意，每次新增文件夹都要修改`.sln`文件

![image-20250806150948117](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806150948117.png)

注意，创建项目时记得选择到对应的src文件

![image-20250806150850170](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806150850170.png)

参考：https://www.cnblogs.com/Sea1ee/p/10915427.html

#### 方案二

使用vs插件：[Folder To Solution Folder](https://marketplace.visualstudio.com/items?itemName=CeciliaWiren-CeciliaSHARP.FolderToSolutionFolder&ssr=false#overview)

![extension](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/extension.gif)

不过我安装不了，具体可以参考：https://www.cnblogs.com/Kit-L/p/13888534.html

#### 推荐方案三

**推荐手动创建**，丰衣足食

在vs解决方案管理器手动创建（src）解决方案文件夹，然后在文件资源管理器中创建（src）文件夹，无需修改`.sln`文件

![image-20250806150948117](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806150948117.png)

然后，创建项目时记得选择到对应的（src\modules\xxx）文件夹

![image-20250806150850170](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250806150850170.png)

### 如何使用

那说了那么多，应该怎么使用呢？以方案三为例，快速搭建abp模块化单体项目：

1. 使用vs新建空白解决方案
2. 在vs解决方案中，创建src文件夹，在src文件夹下创建modules文件夹，在modules文件夹下创建user文件夹，作为user模块
3. 在文件资源管理器中，找到刚才的解决方案(.sln)所在位置，创建src文件夹，在src文件夹下创建modules文件夹，在modules文件夹下创建user文件夹，存放user模块的文件
4. 在vs中，右键src文件夹创建MyProject.Host项目（ASP.NET Core Web API），项目位置选择到src即可
5. 在vs中，右键user文件夹创建MyProject.User.Domain项目（类库），项目位置选择到src\modules\user
6. 在vs中，右键user文件夹分别创建Application、Application.Contracts、EntityframeworkCore、Shared项目，项目位置选择到src\modules\user

![image-20250801174420481](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250801174420481.png)

文件资源管理器目录结构和解决方案结构如下：

![image-20250801174413271](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250801174413271.png)
