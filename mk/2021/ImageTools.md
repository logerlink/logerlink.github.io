[TOC]

#### 压缩图片

![image-20211120110834566](https://i.loli.net/2021/11/20/h69DItyO4rjNiaf.png)

减少压缩质量，图片大小变小，画质变差

![image-20211120110851911](https://i.loli.net/2021/11/20/XSwng3R1PQWyd67.png)

#### 压缩GIF

![image-20211120140611202](https://i.loli.net/2021/11/20/U4HIvKN2PalipSC.png)

【压缩质量】越大，图像大小越小，画质也越差

【图像收缩】：1，保持原图

【抽帧步长】：-1，不抽帧，步长小于等于0不抽帧

要想GIF得到有效压缩，最主要是受到压缩质量、图像收缩（占比重）这两个参数影响

![image-20211120140724316](https://i.loli.net/2021/11/20/QrOhTNXJe7aStE3.png)

#### 生成缩略图——图片

![image-20211120111322170](https://i.loli.net/2021/11/20/kjMemSaWfYw9dOX.png)

【收缩倍数】越大，图像尺寸越小，图像大小越小

![image-20211120111412966](https://i.loli.net/2021/11/20/OVl7f6DkapT2GPm.png)

#### 生成缩略图——GIF

![image-20211120111458726](https://i.loli.net/2021/11/20/hFk1gG2ofP9bBRS.png)

【收缩倍数】越大，图像尺寸越小，图像大小越小

![image-20211120111529275](https://i.loli.net/2021/11/20/rgBHmi8SaCL7KA6.png)

#### 生成文字水印——图片

![image-20211120111722776](https://i.loli.net/2021/11/20/VHcKNnJI1SuDlpo.png)

【水印位X，水印位Y】等于(0,0)，表示从左上角开始绘制

（0，0）左上角;（W,0）右上角；（0,H）左下角；（W,H）右下角；W、H为图片宽高具体数值

![image-20211120111857872](https://i.loli.net/2021/11/20/vU7IVgptNo3mTYd.png)

##### 全屏水印

【是否全屏】全屏绘制

![image-20211120112000873](https://i.loli.net/2021/11/20/NGxmCZgMpaiR8ns.png)

【水印行高】越小，水印行数越多，越密集

【水印间隔】越小，水印列数越多，越密集

![image-20211120112032579](https://i.loli.net/2021/11/20/EUGS9c4dHPpekvL.png)

#### 生成图片水印——图片

![image-20211120114922547](https://i.loli.net/2021/11/20/PbjsurzAp3JkF8B.png)

【水印缩放】越小，水印尺寸小

【透明度】越小，水印透明度越小

【水印位X，水印位Y】等于(0,0)，表示从左上角开始绘制

（0，0）左上角;（W,0）右上角；（0,H）左下角；（W,H）右下角；W、H为图片宽高具体数值

![image-20211120115116724](https://i.loli.net/2021/11/20/NUqWPHMYv4ld5hb.png)

#### 生成文字水印——GIF

![image-20211120115257589](https://i.loli.net/2021/11/20/WOaqmG1Tn83pDyj.png)

【水印缩放】越小，水印尺寸小

【透明度】越小，水印透明度越小，无太大效果

【水印位X，水印位Y】等于(0,0)，表示从左上角开始绘制

（0，0）左上角;（W,0）右上角；（0,H）左下角；（W,H）右下角；W,H为图片宽高，可以直接写W、H符号也可以写具体数值。如下方：（W/2，H/2）表示图片中心点

![image-20211120115445463](https://i.loli.net/2021/11/20/1esRJBiWl3orLYd.png)

##### 全屏水印

【是否全屏】全屏绘制

![image-20211120115524226](https://i.loli.net/2021/11/20/G8xjcT3qaLNPI9r.png)

【水印行高】越小，水印行数越多，越密集

【水印间隔】越小，水印列数越多，越密集

![image-20211120115610660](https://i.loli.net/2021/11/20/N2ynjEFkAvuVMLd.png)

#### 图片水印——GIF

![image-20211120115804162](https://i.loli.net/2021/11/20/5z9CpIHqNyc3Wls.png)

【透明度】越小，水印图片越透明

【水印倾斜】默认4，即不旋转，0 逆时针旋转90并垂直反转，1 顺时针旋转90 ，2 逆时针旋转90 ，3 顺时针旋转90并垂直翻转

【水印宽w，水印高h】默认（-1，-1）即原图，（300，-1）表示水印宽设置为300，水印高度自适应，（-1，300）：高300，宽度自适应

【水印位X，水印位Y】等于(0,0)，表示从左上角开始绘制

（0，0）左上角;（W,0）右上角；（0,H）左下角；（W,H）右下角；W,H为图片宽高，可以直接写W、H符号也可以写具体数值。如下方：（W/2，H/2）表示图片中心点

![image-20211120120103933](https://i.loli.net/2021/11/20/JbDvTgc6jYhnMGA.png)

#### 生成二维码、条形码

![image-20211120120227278](https://i.loli.net/2021/11/20/or8M6bE3gQNYhaD.png)

条形码要手动调整一下宽高比例，起码得生成一个长方形的吧

条形码不支持中文，仅支持数字和字母

![image-20211120120305636](https://i.loli.net/2021/11/20/poSdMv1tBbHJkm6.png)

【中心图片】二维码中心显示的图片，目前仅支持中心

![image-20211120120411984](https://i.loli.net/2021/11/20/t2ryWOiodNGmHFv.png)

查看二维码的内容，拖拽图片进来，直接点击 `查看二维码信息即可` 

![image-20211120120506173](https://i.loli.net/2021/11/20/ldMPVNiRIug61Fz.png)

#### 其他

未处理的问题：

1. 颜色调整
2. 点击执行时，UI会卡死，我已经用了 `Dispatcher.Invoke` 来执行，无济于事
3. 点击执行时，应该要加一个Loading页面

源码：[GitHub - logerlink/ImageTools: 简单的图片/GIF操作工具。可用于图片/GIF压缩、创建缩略图、添加文本水印、图像水印、创建/解析二维码、条形码](https://github.com/logerlink/ImageTools)