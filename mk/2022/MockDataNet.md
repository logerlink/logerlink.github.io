[TOC]

#### 说明

[MockData.Net](https://github.com/logerlink/MockData)旨在协助开发人员快速构建虚拟数据，希望对您有帮助

```shell
dotnet add package MockData.Net
```

#### 常用方法

##### Common

随机获取guid、ip、域名、true/false，重复获取指定数据源，还可以从指定数据源中随机获取数据

```csharp
var x = MockData.Common.GetGuid();
// 8a19d279-c016-4243-80af-4faabff84b3a
var xx = MockData.Common.GetIP();
// 185.116.230.205
var xxx = MockData.Common.GetFlag();
// False
var xxxx = MockData.Common.GetDomain();
// www.kfcmwla.info
```

重复随机次数获取指定数据源，请注意当重复引用类型时，获得数据的引用地址均指向同一地址

```csharp
var y = MockData.Common.RepeatStr("Hello");
// HelloHelloHelloHello
var yy = MockData.Common.RepeatArr(555);
// [555,555,555]
var yyy = MockData.Common.RepeatArr(new A() { Age = 18}).ToList();
// [{ Age = 18},{ Age = 18}]
yyy[0].Age = 58;
var yAge = yyy[1].Age;  //58
```

从指定数据源中随机获取数据，支持集合和字符串，字符串会根据指定分隔符进行分割

```csharp
var x = MockData.Common.GetRandomArr(Enumerable.Range(0, 100), 5).ToList();
// [1,15,16,88,99]
var y = MockData.Common.GetRandomArr("Hello World!", "", 2).ToList();
// [" ","H"]
```

##### Country

随机获取世界主要国家、国家代码、国家货币、中国省份、中国城市等信息

```csharp
var city = MockData.Country.GetCity();
// 许昌市
var province = MockData.Country.GetProvince();
// 河北省
var fullCity = MockData.Country.GetFullCity();
// 天津市-和平区
var country = MockData.Country.GetCountry();
// 印度
var currency = MockData.Country.GetCurrencyCode();
// SDG
var countryCode = MockData.Country.GetCountryCode();
// DK
```

##### Number

随机获取自然数、小数、自然数集合、小数集合，随机数取值默认在-100000至100000之间，若超越该区间，请在调用方法时自行指定min、max值

```csharp
var x = MockData.Number.Get(10, 100);
// 75
var xArr = MockData.Number.GetArr(3, 0, 10, false);
// [0, 6, 9]
var y = MockData.Number.GetDecimal(false);
// -12613.38
var yArr = MockData.Number.GetDecimalArr(3, 100, 500, 3);
// [122.365, 366.111, 289.451]
```

##### Time

随机获取某个时间点、时间戳、指定时间格式，随机时间限制在前后一百年

```csharp
var x = MockData.Time.GetDateTime();
// {1941/4/25 7:08:23}
var xxxxx = MockData.Time.GetTimeStamp(false,false);
// 3230899783409	//随机获取未来某个点的时间戳，并精确至毫秒
var xxxxxx = MockData.Time.GetDateTimeFormat(format:"yyyy-MM-dd");
// 1942-07-26
```

##### UserInfo

随机获取姓氏、名称、身高、体重、邮件、住址信息（中文）、电话号码、手机号码、邮编、身份证信息

```csharp
var firstName = MockData.UserInfo.GetFirstName();
// 张
var lastName1 = MockData.UserInfo.GetLastName(lang: Lang.EN);
// Kqbydd
var fullName = MockData.UserInfo.GetFullName();
// 任漾湾
var tallStr = MockData.UserInfo.GetTallStr();
// 178cm
var weight = MockData.UserInfo.GetWeight();
// 66
var email = MockData.UserInfo.GetEmail();
// kdWC4c@kdwly.com
var tel = MockData.UserInfo.GetPhone();
// 0155-6865259
var phone = MockData.UserInfo.GetTelPhone();
// 13074356193
var address = MockData.UserInfo.GetAddress();
// 署股街道汰炙迸路0655号4761室
var zipCode = MockData.UserInfo.GetZipCode();
// 985624
var id = MockData.UserInfo.GetID();
// 482004199209118478
```

##### Word

随机获取文字，支持中英文混合，指定随机文字/数字前后缀、获取标题、文本内容、文本集合、验证码、密码

```csharp
var x = MockData.Word.GetWord(50, true, Lang.EN);
// Uolynd tcekaqzls uvw
var xx = MockData.Word.GetDecimalFormat(10, 50, "￥");
// ￥35.90
var title = MockData.Word.GetTitle();
// Rceztrb。泥煽凛肌细僻廖拥lpcandt swwtn捅然掐椰罕瘴仟研俐，硕漳嘘噪uilni。
var content = MockData.Word.GetContent(Lang.EN);
// Tuwgwd,aubicu txermgya ...... mukhf dxlov,juq.
var code = MockData.Word.GetCode(8, true);
// vb9kBFqP
var password = MockData.Word.GetPassword();
// s!!c17Iw$05X
```

