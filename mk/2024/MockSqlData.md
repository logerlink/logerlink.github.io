[TOC]

### 说明

记录一下，如何快速造数据。使用工具：

​	[Mock.js (mockjs.com)](http://mockjs.com/examples.html)

​	DBeaver（用于导入csv数据）

​	Sql Server

生成后的数据参考：[TKData.zip](https://github.com/logerlink/blogImg/blame/main/shareData/TKData.zip)

### 造数据

在 [Mock.js (mockjs.com)](http://mockjs.com/examples.html) 的控制台执行以下代码，生成虚拟数据，将这些数据复制到新的txt文档中进行保存。数据量越大执行越慢，等待脚本执行完即可

#### 公共方法

```javascript
// 使字符串乱序
function shuffleString(str) {
  var array = str.split(""); // 将字符串转换为字符数组
  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  // 当还有未洗牌的元素时
  while (0 !== currentIndex) {
    // 从剩余元素中随机选取一个索引
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // 将当前元素与随机选取的元素进行交换
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  // 将字符数组转换回字符串
  return array.join("");
}
// 解决 js 乘法精度损失问题
function accMul(arg1,arg2) 
{ 
	var m=0,s1=arg1.toString(),s2=arg2.toString(); 
	try{m+=s1.split(".")[1].length}catch(e){} 
	try{m+=s2.split(".")[1].length}catch(e){} 
	return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
} 
// 解决 js 加法精度损失问题
function accAdd(arg1,arg2){ 
	var r1,r2,m; 
	try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
	try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
	m=Math.pow(10,Math.max(r1,r2)) 
	return (arg1*m+arg2*m)/m 
} 
```

#### 生成用户数据

用户：用户编号，用户名、密码、电话、邮箱、身份证号，姓名、昵称.

```javascript
let userIds = []
let usercsv = ["UserId,UserName,PassWord,PhoneNumber,EmailAddress,CardNo,CardName,NickName"] // 设置表头
let symbols = ['!','_','&','%','#','^','*','(',')']
for(let i = 1; i < 5;i++){	// 50000
	let user = Mock.mock({
        "UserId": "UU" + i.toString().padStart(8, '0'),
        "UserName": Mock.mock('@string("upper", 1, 3)') + Random.word(6, 10),
    "PassWord": shuffleString(Random.word(4, 8) + Mock.mock('@string("upper", 1, 5)') + symbols[Math.floor(Math.random() * symbols.length)] + Mock.mock('@string("lower", 1, 5)')),
    "PhoneNumber": 1 + Mock.mock('@string("number", 10)'),
        "EmailAddress": Mock.mock('@email'),
    "CardNo": 4 + Mock.mock('@string("number", 5)') + Random.range(1950, 2020)[Math.floor(Math.random() * (2020 - 1950))] + Mock.mock('@date("MMdd")') + Mock.mock('@string("number", 4)'),
    "CardName": Math.random() * 10 > 8 ? Mock.mock('@cname(3)') : Mock.mock('@cname'),
        "NickName": shuffleString(Random.cword(2, 4) + Random.word(1, 3))
    })
    userIds.push(user.UserId)
    usercsv.push(`${ user.UserId},${ user.UserName},${ user.PassWord},${ user.PhoneNumber},${ user.EmailAddress},${ user.CardNo},${ user.CardName},${ user.NickName}`)
}
console.log(JSON.stringify(userIds))
console.log(usercsv.join('\r\n'))
```

建表语句

```sql
-- 创建表 TK_User
CREATE TABLE test.dbo.TK_User (
	UserId nvarchar(50) COLLATE Chinese_PRC_CI_AS NOT NULL,
	UserName nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	PassWord nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	PhoneNumber nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	EmailAddress nvarchar(100) COLLATE Chinese_PRC_CI_AS NULL,
	CardNo nvarchar(20) COLLATE Chinese_PRC_CI_AS NULL,
	CardName nvarchar(10) COLLATE Chinese_PRC_CI_AS NULL,
	NickName nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	CONSTRAINT PK_TK_User PRIMARY KEY (UserId)
);
```

#### 生成用户地址数据

用户地址：省、市、区、邮编、电话、签收人、用户Id

```javascript
let addrIds = { }
let addrcsv = ["AddressId,Country,Province,City,District,Detail,ZipCode,PhoneNumber,SignName,UserId"] // 设置表头
for(let i = 1; i< 10; i++){	// 100000
    var addrs = Random.county(true).split(' ')
    let addr = Mock.mock({
        "AddressId":"ADDR" + i.toString().padStart(10, '0'),
        "Country": "CN",
        "Province":addrs[0],
        "City":addrs[1],
        "District":addrs[2],
        "Detail":Random.cword(3, 7) + "xxx街yy号",
        "ZipCode":Mock.mock('@zip'),
        "PhoneNumber":1 + Mock.mock('@string("number", 10)'),
        "SignName":Random.cword(2, 3),
        "UserId": i < userIds.length ? userIds[i] : userIds[Math.floor(Math.random() * userIds.length)]	// 从用户表中获取
    })
    if (!addrIds[addr.UserId]) addrIds[addr.UserId] = []
    addrIds[addr.UserId].push(addr.AddressId)
    addrcsv.push(`${ addr.AddressId},${ addr.Country},${ addr.Province},${ addr.City},${ addr.District},${ addr.Detail},${ addr.ZipCode},${ addr.PhoneNumber},${ addr.SignName},${ addr.UserId}`)
}
console.log(addrcsv.join('\r\n'))
```

建表语句

```sql
-- 创建表 TK_Address
CREATE TABLE test.dbo.TK_Address (
	AddressId nvarchar(50) COLLATE Chinese_PRC_CI_AS NOT NULL,
	Country nvarchar(10) COLLATE Chinese_PRC_CI_AS NULL,
	Province nvarchar(20) COLLATE Chinese_PRC_CI_AS NULL,
	City nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	District nvarchar(100) COLLATE Chinese_PRC_CI_AS NULL,
	ZipCode nvarchar(10) COLLATE Chinese_PRC_CI_AS NULL,
	PhoneNumber nvarchar(20) COLLATE Chinese_PRC_CI_AS NULL,
	SignName nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
    UserId nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	CONSTRAINT PK_TK_Address PRIMARY KEY (AddressId)
);
```

#### 生成商品数据

商品：商品Id、商品编码、商品名称、商品描述、商品品类Id、供应商Id、重量、有效期、价格

```javascript
let productData = []
let productcsv = ["ProductId,ProductCode,ProductName,ProductTypeId,ProductStoreId,WeightG,LimitTime,Price,ProductDesc"]
for(let i = 1; i< 10; i++){// 50000
   let product = Mock.mock({
        "ProductId":"PO" + i.toString().padStart(8, '0'),
        "ProductCode": 1 + Mock.mock('@string("number", 7)'),
        "ProductName":Random.cword(2, 3) + "牌" + Random.cword(4, 6),
        "ProductDesc":Random.cparagraph(3, 6),
        "ProductTypeId":500 + Mock.mock('@string("number", 4)'),
        "ProductStoreId":800 + Mock.mock('@string("number", 4)'),
        "WeightG":Random.float(50, 1000, 2, 2),
        "LimitTime":Random.range(2020, 2024)[Math.floor(Math.random() * (2024 - 2020))] + Mock.mock('@date("-MM-dd")'),
        "Price":Random.float(0.5, 5000, 2, 2),
    })
    productData.push(product)
    productcsv.push(`${ product.ProductId},${ product.ProductCode},${ product.ProductName},${ product.ProductTypeId},${ product.ProductStoreId},${ product.WeightG},${ product.LimitTime},${ product.Price},${ product.ProductDesc}`)
}
console.log(productcsv.join('\r\n'))
```

建表语句

```sql
-- 创建表 TK_Product
CREATE TABLE test.dbo.TK_Product (
	ProductId nvarchar(50) COLLATE Chinese_PRC_CI_AS NOT NULL,
	ProductCode nvarchar(10) COLLATE Chinese_PRC_CI_AS NULL,
	ProductName nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	ProductDesc nvarchar(500) COLLATE Chinese_PRC_CI_AS NULL,
	ProductTypeId int NULL,
	ProductStoreId int NULL,
	WeightG decimal(20,4) NULL,
    LimitTime datetime2 NULL,
    Price decimal(20,4) NULL,
	CONSTRAINT PK_TK_Product PRIMARY KEY (ProductId)
);
```

#### 生成订单和订单明细数据

订单：订单号、总数量、总价格、订单状态、支付状态、用户Id、地址Id、支付时间（订单与订单明细关系：一对多，用户与订单关系：一对多，用户地址与订单关系：一对多）

订单明细：明细Id、订单Id、商品Id、单价、数量、小计（商品与订单明细关系：一对多）

```javascript
let ordercsv = ["OrderId,TotalCount,TotalAmount,OrderStatus,PayStatus,UserId,AddressId,PayTime"] // 设置表头
let orderItemcsv = ["ItemId,OrderId,ProductId,Price,Count,Amount"] // 设置表头
let itemId = 1;
for(let i = 1; i < 10; i++){ // 200000
    var orderId = "SO" + i.toString().padStart(14, '0')
    var count = parseInt(Math.random() * 10 > 8 ? Random.string('number', 1) : Random.string('number', 1, 2))
    var items = []
    for(let i = 0;i < count;i++){
        // 随机取产品信息
        let product = productData[Math.floor(Math.random() * productData.length)]
        let itemCount = parseInt(Random.string('number', 1, 2))
        let orderItem = Mock.mock({
            "ItemId":"SOI" + itemId.toString().padStart(20, '0'),
            "OrderId": orderId,
            "ProductId":product.ProductId, // 从商品表中获取
            "Price": product.Price,	// 从商品表中获取
            "Count": itemCount,
            "Amount": accMul(itemCount, product.Price), // 从商品表中获取并计算
        })
        itemId++
        items.push(orderItem)
        orderItemcsv.push(`${ orderItem.ItemId},${ orderItem.OrderId},${ orderItem.ProductId},${ orderItem.Price},${ orderItem.Count},${ orderItem.Amount}`)
    }
    // 随机取用户及用户地址信息
    let orderUserId = i < userIds.length ? userIds[i] : userIds[Math.floor(Math.random() * userIds.length)]
    let order = Mock.mock({
        "OrderId": orderId,
        "TotalCount":items.reduce(function (accumulator, item) {
          return  accumulator + item.Count;
        }, 0),
        "TotalAmount":items.reduce(function (accumulator, item) {
          return accAdd(accumulator, item.Amount);
        }, 0),
        "OrderStatus":Random.string('number', 1),
        "PayStatus":parseInt(100 + Random.string('number', 1, 2)),
        "UserId": orderUserId, // 从用户表中获取
        "AddressId": addrIds[orderUserId][Math.floor(Math.random() * addrIds[orderUserId].length)], //从用户关联的地址表中获取
        "PayTime": Random.range(2015, 2020)[Math.floor(Math.random() * (2020 - 2015))] + Mock.mock('@datetime("-MM-dd HH:mm:ss")')
    })
    ordercsv.push(`${ order.OrderId},${ order.TotalCount},${ order.TotalAmount},${ order.OrderStatus},${ order.PayStatus},${ order.UserId},${ order.AddressId},${ order.PayTime}`)
}
console.log(orderItemcsv.join('\r\n'))
console.log(ordercsv.join('\r\n'))
```

建表语句

```sql
-- 创建表 TK_Order
CREATE TABLE test.dbo.TK_Order (
	OrderId nvarchar(50) COLLATE Chinese_PRC_CI_AS NOT NULL,
	TotalCount int NULL,
	TotalAmount decimal(20,4) NULL,
	OrderStatus int NULL,
	PayStatus int NULL,
	UserId nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	AddressId nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
    PayTime datetime2 NULL,
	CONSTRAINT PK_TK_Order PRIMARY KEY (OrderId)
);

-- 创建表 TK_OrderItem
CREATE TABLE test.dbo.TK_OrderItem (
	ItemId nvarchar(50) COLLATE Chinese_PRC_CI_AS NOT NULL,
	OrderId nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	ProductId nvarchar(50) COLLATE Chinese_PRC_CI_AS NULL,
	Price decimal(20,4) NULL,
	Count int NULL,
	Amount decimal(20,4) NULL,
	CONSTRAINT PK_TK_OrderItem PRIMARY KEY (ItemId)
);
```

#### ER图预览

![image-20240123160713354](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240123160713354.png)

#### 导入数据

将刚才新建那些的txt文档，修改后缀为csv

![image-20240123162941271](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240123162941271.png)

使用DBeaver导入数据

![image-20240123173209323](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240123173209323.png)

注意：csv本身没有行数限制，限制的是你的工具，如果打开csv文档提示"数据长度超出工作表外..."，不用管可以正常导入



