

[TOC]

C盘满了？使用工具（腾讯管家...）清理文件收效甚微？

![image-20240513100506380](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240513100506380.png)

#### 修改软件的存储路径

我们可以试试**修改软件的文件存储位置**，改成其他盘符，如**企业微信**，在设置中修改这两个路径，修改后会自动迁移，成功后会自动删除旧文件所在的目录。

![image-20240513100640925](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240513100640925.png)

若旧文件删除不成功，可以手动将旧文件删除（清空回收站）。删除成功又能挺过一年半载

![image-20240513101208873](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240513101208873.png)

还可以**修改浏览器的下载位置**，更改至D盘。手动将下载的旧数据迁移到D盘，再将C盘已下载的文件删除即可

- Edge浏览器：edge://settings/downloads

- Chrome浏览器：chrome://settings/downloads

- Firefox浏览器：about:preferences


![image-20240513102115360](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240513102115360.png)

![image-20240513102011368](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240513102011368.png)

#### 删除临时或日志文件

还可以考虑删除临时文件，可以全部删除也可以按时间排序删除一部分即可。路径：C:\Users\用户名\AppData\Local\Temp

![image-20240529103303395](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240529103303395.png)

可删除的日志或临时文件

- C:\Windows\Temp
- C:\Users\用户名\AppData\Local\Temp
- C:\Windows\debug

- C:\Windows\Logs

- C:\Windows\System32\LogFiles

- C:\Windows\System32\Logs
- C:\Windows\SoftwareDistribution\Download	  // 删除系统更新文件

![image-20240529104643221](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240529104643221.png)