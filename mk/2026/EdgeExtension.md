[TOC]

#### 前文

本文主要介绍，如何申请微软开发者账号并发布扩展。

目前chrome和edge已经全面禁用crx后缀的插件了，zip又不稳定。如何进行稳定的分发，只能依靠chrome和edg的插件市场了。
可惜的是chrome发布插件需要收费5美金，钱倒是有，就是不知道怎么支付。好在微软可以免费发布，整理好插件信息和个人信息即可

#### 准备工作

一个插件：打包成zip

一个微软账号：登录微软账号

参考：
[发布 Microsoft Edge 扩展 - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/zh-cn/microsoft-edge/extensions/publish/publish-extension)

[微软 Microsoft Edge 浏览器插件开发者注册指南_edge 插件注册开发者: 无法验证此地址。如果你确定此地址是正确的,请继续注册,或-CSDN博客](https://blog.csdn.net/wufeng55/article/details/160015650)

#### 申请合作伙伴

1. 请访问 [合作伙伴中心](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd)，这里可以申请合作伙伴账号
2. 选择国家
3. 选择公司还是个人
4. 填写主体名称（公司或个人名称）
5. 填写个人信息。

注意这里一定要填写拼音和英文，尽量不要英文，信息一定要正确。填写后，先点击黑色的 `Validate Address`（验证地址）按钮，有警告的话直接继续即可,，然后点击提交即可

|                          | 格式                                          | 示例                                                       |
| ------------------------ | --------------------------------------------- | ---------------------------------------------------------- |
| Publisher display name   | 你的名字                                      |                                                            |
| Address line 1           | Xxx Jiedao Xxx Lu xxx Hao<br />Xxx Lu xxx Hao | Yuexxx Jiedao Keyuan Lu 1115 Hao<br />Tianxxx Lu 20008 Hao |
| Address line 2           | 留空                                          |                                                            |
| Country/region           |                                               | China                                                      |
| State/province           |                                               | Guangdong                                                  |
| City                     | 你的城市名称  不要Shi                         | GuangZhou                                                  |
| ZIP/Postal Code          | 你的城市邮编                                  | 518104                                                     |
| First Name               | 晓翠                                          | XiaoCui                                                    |
| Last Name                | 刘                                            | Liu                                                        |
| Email address            | 你的邮箱<br />直接用当前的微软账号邮箱        | xxxx@outlook.com                                           |
| Phone number             | 第一格，国家代码                              | +86                                                        |
| Phone number             | 第二格，区号                                  | 手机号码不要填                                             |
| Phone number             | 第三格，真实手机号                            | 手机号码或座机。座机要填区号，不需要+86                    |
| Preferred email language | 简体中文                                      | Chinese (Simplified)                                       |

#### 上传插件

提交成功后大致展示如图

![image-20260612162422140](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20260612162422140.png)

接着就可以上传插件了。点击新增插件按钮，拖动zip到浏览器，然后根据提示填写信息即可

![image-20260612162400469](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20260612162400469.png)

#### 简体中文

注意，如果Store Listings 的语言不是简体中文的话
![image-20260612162614368](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20260612162614368.png)

我们可以修改插件的`mainfest.json`

```json
{
  "name": "__MSG_ext_name__",
  "description": "__MSG_ext_description__",
  "default_locale": "zh_CN", 
}
```

然后在`mainfest.json`所在的目录新增文件夹`_locales/zh_CN`，在`zh_CN`文件夹下新增文件`messages.json`

```json
{
  "ext_name": {
    "message": "xxxx中文名"
  },
  "ext_description": {
    "message": "xxxx中文描述。"
  }
}
```

接着打包zip

然后把浏览器地址的en-us改为zh-cn

重新上传zip，等待审批即可