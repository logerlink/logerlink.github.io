[TOC]

#### 说明

本文使用WPS操作，微软Office应该大差不差，仅作记录。

以下这些操作工作中比较难遇到但却很有用，尤其是数据透视表，对于数据分析，数据校验的帮助很大，可以把它理解成Sql中的聚合运算查询。

#### E+ 格式的值转文本或者数字

在导出数据时时，数值过长，wps会自动变成E+格式，那我们怎样将其展开变成我们能看懂的内容呢？

![image-20220531171212714](https://s2.loli.net/2022/05/31/2pIRvhnGjCwfmUV.png)

##### 双击该单元格

当我们选中该单元格时，就可以在头上看到真实值了

![image-20220531171319381](https://s2.loli.net/2022/05/31/SU7armqzpRhidDZ.png)

此时我们双击该单元格，就可以将改内容显示为**文本**了

![image-20220531171513701](https://s2.loli.net/2022/05/31/ZCUcHBLE35YXNfv.png)

##### 批量修改格式

选中这些单元格—右键—选择【设置单元格格式】—左侧分类选择【自定义】—右侧类型选择【0】—确定即可

![image-20220531171830365](https://s2.loli.net/2022/05/31/YgW7IVyd25XEUCs.png)

按照上面的步骤，就可以批量将这些单元格都改成**数值**了

![image-20220531172033921](https://s2.loli.net/2022/05/31/aZ2UAqkbPx8pd9s.png)

##### 分列转为文本

选中这些单元格—选中菜单【数据】—点击【分列】操作

![image-20220531172349643](https://s2.loli.net/2022/05/31/j56tSX3dN9Ji4sf.png)

进入分列向导，点击下一步

![image-20220531172515744](https://s2.loli.net/2022/05/31/BxVDoRaUse3cLJg.png)

再点击下一步

![image-20220531172543035](https://s2.loli.net/2022/05/31/DoWbwn8JpISXLgB.png)

列数据类型选择【文本】，再点击完成

![image-20220531172713066](https://s2.loli.net/2022/05/31/KWrB1jsL5ID4eA6.png)

这样就可以批量转为**文本**了

![image-20220531172755599](https://s2.loli.net/2022/05/31/3pnZV9qhTwjRoCA.png)

#### VLOOKUP函数比较

如现在有如下名字：张三、王五、三毛、小二、老六、十一妹，我们要看一下这些名字是否包含在【Name列】中

VLOOKUP语法：VLOOKUP(指定查找的内容,查询的数据范围,列序数[,精确查询FALSE/近似查询 TRUE])。这个列序数大多为1，可以参考一下excel的自动提示，有什么就写什么

![image-20220531174300711](https://s2.loli.net/2022/05/31/JWSRaIUus8kc6iB.png)

如 VLOOKUP(E2,B2:B11,1,FALSE)

![image-20220531173920517](https://s2.loli.net/2022/05/31/FxqUWGIjipe5SzA.png)

如果我们要固定住查询范围，我们还需要把相对定位【B2:B11】改成绝对定位【$B$2:$B$11】。这样我们在拖动公式时，查询范围就不会随着单元格而改变了

![image-20220531174554484](https://s2.loli.net/2022/05/31/kuFRbjvPolBqch4.png)

此时回车，再拖动公式就可以查看比较结果了

![vlookup](https://s2.loli.net/2022/05/31/wJzgib5EATD2nlF.gif)

#### 数据透视表

选中菜单【数据】—点击【数据透视表】操作

![image-20220531180405619](https://s2.loli.net/2022/05/31/7JwfPAKQFm86gaN.png)

我们还可以自定义区域，选择生成的位置

![image-20220531180652254](https://s2.loli.net/2022/05/31/JXmWUjpYMwxrnEq.png)

点击确定后就可以进到数据透视表的区域了

![image-20220531180808991](https://s2.loli.net/2022/05/31/3PTjpy9fo4HSbNd.png)

如我们要按照【Gender】分组，再查看各组的数量

首先将【Gender】拖动到行区域，将【Id】拖动到值区域

![image-20220531181140727](https://s2.loli.net/2022/05/31/nB7IMorhG6xWmHd.png)

点击 Id，选择【值字段设置】

![image-20220531181343817](https://s2.loli.net/2022/05/31/R5yJpZDPfsBViTr.png)

选择计算类型【计数】，点击确定

![image-20220531181510180](https://s2.loli.net/2022/05/31/8zXklex1KCb6QjY.png)

结果就出来了

![image-20220531181550308](https://s2.loli.net/2022/05/31/nKdEHAL4btF8OW9.png)