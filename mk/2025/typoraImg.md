[Toc]

#### 前言

本文主要介绍Typora通过PicGo软件上传图片至GitHub仓库（图床），PicGo支持各种图床，可根据自己喜好选择不同的图床服务。

![image-20250718160414723](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718160414723.png)

本来没必要记录的，刚好换了台电脑，顺便记一下吧。参考：https://zhuanlan.zhihu.com/p/489236769

请确保你可以访问github，再用github作为图床

PicGo版本：2.4

#### 创建GitHub仓库

此行目的，使用GitHub做图床，所以我们需要先创建一个仓库用于存储我们的图片

在GitHub首页，点击【New】按钮创建仓库，或者也可以直接访问 [创建仓库](https://GitHub.com/new) 页面

![image-20250718151909837](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718151909837.png)

在创建仓库页面，输入仓库名称，选择Public公开模式，然后点击创建仓库按钮即可

![image-20250718152250878](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718152250878.png)

#### 准备Token

##### 进入创建token页面

在GitHub中，点击个人头像，选择【Settings】，进入[个人设置页面](https://GitHub.com/settings/profile)

![image-20250718143906981](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718143906981.png)

![image-20250718143850058](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718143850058.png)

在个人设置页面，选择【Developer settings】

![image-20250718143854529](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718143854529.png)

选择【Tokens（classic）】

![image-20250718144006134](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718144006134.png)

点击【Generate new token】，选择【Generate new token (classic)】进入创建GitHub Token页面

![image-20250718144012390](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718144012390.png)

##### 创建Token

当然，你可以直接点击链接进入[创建GitHub Token页面](https://GitHub.com/settings/tokens)

**创建token步骤**：填写token名称，选择token过期时间，选中权限范围为仓库repo，然后点击【创建Token按钮】即可

![image-20250718144355465](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718144355465.png)

创建成功，点击复制按钮复制token。注意token只会出现一次，记得复制并记录，如果忘记了，直接（删除）重新创建token即可

![image-20250718144549415](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718144549415.png)

#### PicGo上传图片

##### 下载PicGo

[PicGo下载页面](https://GitHub.com/Molunerfinn/PicGo/releases) 根据你的电脑选择相应的下载

![image-20250718154814906](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718154814906.png)

##### 图床配置

打开PicGo软件，点击【图床设置】选择【GitHub】进行配置。**图床配置**如下：

图床配置名：GitHub（自定义即可）

设定仓库名：username/repoName（用户名/GitHub仓库名）

设定分支名：main（目前GitHub创建仓库默认为main分支，你也可以自行选择分支）

设定Token：ghp_dWntOckkdT5Qxxx123456789XXXV0e3MdnMH（就是上面创建的GitHub token）

设定存储路径：typora-img/2025/（不填时默认上传图片至当前仓库下，不要以/开头）

设定自定义域名：https://gcore.jsdelivr.net/gh/username/repoName（不填时默认为GitHub的域名，不要以/结尾，gcore国内有时可以访问）

![image-20250718150824103](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718150824103.png)

##### 上传图片验证

点击【上传区】，上传图片看看是否成功

![image-20250718151137006](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718151137006.png)

如果配置没问题，基本可以上传成功，可以到GitHub仓库看看是否存在上传的图片

![image-20250718150400188](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718150400188.png)

也可以使用自定义的域名链接访问：https://gcore.jsdelivr.net/gh/loxxxlink/bxxxImg/typxxx-img/2025/image.png

如果上传失败我们可以看PicGo的日志，进行排查。一般是配置问题

![image-20250718151251618](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718151251618.png)

#### typora使用PicGo上传图片

##### 图像设置

点击【文件】选择【偏好设置】，点击【图像】，选择【上传服务】为**PicGo（app）**，选择【PicGo路径】为**本机的PicGo.exe**（安装路径）

![image-20250718151711313](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718151711313.png)

配置后，我们可以点击【验证图片上传选项】按钮，出现成功上传，说明图片上传服务设置成功。

![image-20250718151807988](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718151807988.png)

##### 上传图片

图像上传服务设置成功后，当我们粘贴图片到Typora时，就会自动上传，当然我们也可以右键图片手动上传图片

![image-20250718152623986](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250718152623986.png)