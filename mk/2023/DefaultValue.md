[TOC]

#### 说明

.net core 3.0

本文整理了一些关于c#默认值和可空类型常见的操作

#### 常见值类型默认值

值类型包括简单类型、枚举类型、结构类型、可以为null的值类型

##### 简单类型

- 有符号的整型：sbyte、short、int、long。默认值为 0
- 无符号的整型：byte、ushort、uint、ulong。默认值为 0
- Unicode 字符：char。默认值为 0'\0'
- IEEE 二进制浮点：float、double。默认值为 0
- 高精度十进制浮点数：decimal。默认值为 0
- 布尔：bool。默认值为 false(0)

```csharp
        [Test]
        public void TestDefaualt()
        {
            // 有符号的整型
            sbyte sbyteValue = default;
            short shortValue = default;
            int intValue = default;
            long longValue = default;
            // 无符号的整型
            byte byteValue = default;
            ushort ushortValue = default;
            uint uintValue = default;
            ulong ulongValue = default;
            // Unicode 字符
            char charValue = default;
            // IEEE 二进制浮点
            float floatValue = default;
            double doubleValue = default;
            // 高精度十进制浮点数
            decimal decimalValue = default;
            // 布尔
            bool boolValue = default;

            Console.WriteLine($"sbyteValue={sbyteValue};shortValue={shortValue};intValue={intValue};longValue={longValue};");   // sbyteValue=0;shortValue=0;intValue=0;longValue=0;
            Console.WriteLine($"byteValue={byteValue};ushortValue={ushortValue};uintValue={uintValue};ulongValue={ulongValue};");   // byteValue=0;ushortValue=0;uintValue=0;ulongValue=0;
            Console.WriteLine($"charValue={charValue};");   // charValue=\u0000;
            Console.WriteLine($"floatValue={floatValue};doubleValue={doubleValue};");   // floatValue=0;doubleValue=0;
            Console.WriteLine($"decimalValue={decimalValue};boolValue={boolValue};");   // decimalValue=0;boolValue=False;
        }
```

##### 枚举、结构类型、可以为null的值类型

- 枚举类型默认值会取值为0的枚举项
- 结构类型的默认值指的是该结构内部字段的默认值，会将所有值类型的字段设置为其默认值，将所有引用类型的字段设置为 null
- 可空的值类型，默认值为null

```csharp
        [Test]
        public void TestEnumDefaualt()
        {
            // 枚举类型的default，默认会取值为0的枚举项
            CheckOptionEnum enumValue = default;
            CatStruct catStruct = default;
            // 结构类型default相当于无参构造，结构类型的无参构造会将所有值类型的字段设置为其默认值，将所有引用类型的字段设置为 null
            DogStruct dogStruct = default;
            System.IO.FileInfo fileInfo = default;
            DateTime timeValue = default;   // 0001/1/1...
            Guid guidValue = default;       // 000...-...000

            // 可以为 null 的值类型
            int? intNullValue = default;
            long? longNullValue = default;
            bool? boolNullValue = default;

            

            Console.WriteLine($"enumValue={enumValue};");   // enumValue=No;
            Console.WriteLine($"catStruct={catStruct};");   // catStruct=Test20231110.Test.Tests+CatStruct;
            Console.WriteLine($"fileInfo={fileInfo};");     // fileInfo=;
            Console.WriteLine($"dogStruct={dogStruct};");     // dogStruct=0号，名字：; 
            Console.WriteLine($"timeValue={timeValue};guidValue={guidValue};");     // timeValue=0001/1/1 0:00:00;guidValue=00000000-0000-0000-0000-000000000000;
            // 可空的值类型，默认值为null
            Console.WriteLine($"intNullValue={intNullValue};longNullValue={longNullValue};boolNullValue={boolNullValue}");     // intNullValue=;longNullValue=;boolNullValue=
        }
```

#### 如何有效判断

各种类型，如何有效判断？

- 对于引用类型，我么可以使用 `x != null` 判断是否为默认值
- 对于值类型，我们可以使用 `x != default` 判断是否为默认值。若该变量的值刚好等于该类型的默认值，则该变量为默认值
- 对于可空的值类型，我们还可以使用 `x.HasValue` 判断是否有值，而且 **HasValue 不会引发空指针异常**

```csharp
        [Test]
        public void TestCheckIsDefault()
        {
            System.IO.FileInfo fileInfo = default;
            int intValue = 0;
            DateTime timeValue = default;
            DateTime nowValue = DateTime.Now;
            DateTime? nullTimeValue = default;  // 完整：default(DateTime?)

            DateTime? nullTimeValue2 = default(DateTime);   // 此处赋值的是DateTime的默认值
            int? intValue2 = null;


            Console.WriteLine($"fileInfo 为默认值？ {fileInfo == null};");    // True

            Console.WriteLine($"timeValue 为默认值？ {timeValue == default};");  // True
            Console.WriteLine($"nowValue 为默认值？ {nowValue == default};");    // False
            Console.WriteLine($"intValue 为默认值？ {intValue == default};");    // True
            // 可空的值类型，默认值为null
            Console.WriteLine($"nullTimeValue 为默认值？ {nullTimeValue == default};nullTimeValue 为null？{nullTimeValue == null}");    // True;True
            Console.WriteLine($"nullTimeValue2 为默认值？{nullTimeValue2 == default};nullTimeValue2 为null？{nullTimeValue2 == null}");    // False;False

            // 对于可空的值类型，我们还可以使用HasValue来进行判断，而且 HasValue 不会引发空指针异常
            Console.WriteLine($"nullTimeValue2 是否有值？ {nullTimeValue2.HasValue};intValue2 是否有值？{intValue2.HasValue}");    // True;False
        }
```

#### 统一判断默认值

统一判断各种类型是否为默认值，参考：[c# - Check to see if a given object (reference or value type) is equal to its default - Stack Overflow](https://stackoverflow.com/questions/6553183/check-to-see-if-a-given-object-reference-or-value-type-is-equal-to-its-default)

```csharp
        [Test]
        public void TestIsDefault()
        {
            List<int> listValue = new List<int>();
            string strValue = default;
            int intValue = default;
            DateTime timeValue = default;
            DateTime? timeNullValue = default;
            DateTime? timeNullValue2 = DateTime.Now;

            Console.WriteLine($"listValue 是否为默认值？{IsNullOrDefault(listValue)};strValue 是否为默认值？{IsNullOrDefault(strValue)};");   // False;True
            Console.WriteLine($"intValue 是否为默认值？{IsNullOrDefault(intValue)};timeValue 是否为默认值？{IsNullOrDefault(timeValue)};");   // True;True
            Console.WriteLine($"timeNullValue 是否为默认值？{IsNullOrDefault(timeNullValue)};timeNullValue2 是否为默认值？{IsNullOrDefault(timeNullValue2)};");   // True;False
        }

        /// <summary>
        /// 统一判断是否为默认值
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="argument"></param>
        /// <returns></returns>
        public bool IsNullOrDefault<T>(T argument)
        {
            // deal with normal scenarios
            if (argument == null) return true;
            if (object.Equals(argument, default(T))) return true;

            // deal with non-null nullables	可空类型
            Type methodType = typeof(T);
            if (Nullable.GetUnderlyingType(methodType) != null) return false;

            // deal with boxed value types	装箱类型
            Type argumentType = argument.GetType();
            if (argumentType.IsValueType && argumentType != methodType)
            {
                object obj = Activator.CreateInstance(argument.GetType());
                return obj.Equals(argument);
            }

            return false;
        }
```

#### 反射中应用

准备一个类和数据，我们要一步一步演示如何将利用反射机制给类的属性进行赋值

```csharp
        public class TestCheck
        {
            public DateTime NowValue { get; set; }
            public DateTime? NullValue { get; set; }
            public DateTime? NullNowValue { get; set; }
            public string StrValue { get; set; }
            public int? NullIntValue { get; set; }
            public List<string> ListValue { get; set; }
        }

        Dictionary<string, string> DataDic = new Dictionary<string, string>()
        {
            {"NowValue" ,"2008-08-08"},
            {"NullValue" ,null},
            {"NullNowValue" ,"2018-08-08"},
            {"StrValue" ,null},
            {"NullIntValue" ,null},
            {"ListValue" ,null}
        };
```

##### 第一步：直接根据key，给对应的属性赋值

```csharp
        [Test]
        public void TestCheckNullType3()
        {
            var obj = new TestCheck();
            var properties = obj.GetType().GetProperties();
            foreach (var property in properties)
            {
                var valueStr = DataDic[property.Name];
                property.SetValue(obj, valueStr);
            }
        }
```

![image-20231120172104679](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20231120172104679.png)

运行时SetValue处出现类型转换异常：<span style="color:red">Object of type 'System.String' cannot be converted to type 'System.DateTime'</span>。无法将字符串隐式转换为DateTime类型，我们要先手动转换类型再进行赋值

#####  第二步：先手动转换为属性对应的类型再进行赋值

```csharp
        [Test]
        public void TestCheckNullType4()
        {
            var obj = new TestCheck();
            var properties = obj.GetType().GetProperties();
            foreach (var property in properties)
            {
                var valueStr = DataDic[property.Name];
                // 将值转换成property对应的类型，再进行赋值
                property.SetValue(obj, Convert.ChangeType(valueStr, property.PropertyType));
            }
        }
```

![image-20231120172320655](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20231120172320655.png)

运行时 Convert.ChangeType 处出现类型转换异常：<span style="color:red">Null object cannot be converted to a value type</span>。Convert.ChangeType 无法处理null，我们要先手动判断一下。

##### 第三步：在Convert.ChangeType 处理前，手动判断是否为null

```csharp
        [Test]
        public void TestCheckNullType5()
        {
            var obj = new TestCheck();
            var properties = obj.GetType().GetProperties();
            foreach (var property in properties)
            {
                var valueStr = DataDic[property.Name];
                if(valueStr == null)
                {
                    // 若值为null，则直接赋值null
                    property.SetValue(obj, null);
                    continue;
                }
                // 将值转换成property对应的类型，再进行赋值
                property.SetValue(obj, Convert.ChangeType(valueStr, property.PropertyType));
            }
        }
```

![image-20231120173304578](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20231120173304578.png)

运行时 Convert.ChangeType 处出现类型转换异常：<span style="color:red">Invalid cast from 'System.String' to 'System.Nullable`1[[System.DateTime...</span> 无法将字符串转换为DateTime?(可空)类型，对于可空类型我们要单独处理

##### 第四步：判断属性是否为可空类型，并对可空类型进行转换处理

判断属性是否为可空类型：`property.PropertyType.IsGenericType && property.PropertyType.GetGenericTypeDefinition().Equals(typeof(Nullable<>))`

```csharp
        [Test]
        public void TestCheckNullType6()
        {
            var obj = new TestCheck();
            var properties = obj.GetType().GetProperties();
            foreach (var property in properties)
            {
                var valueStr = DataDic[property.Name];
                if (property.PropertyType.IsGenericType && property.PropertyType.GetGenericTypeDefinition().Equals(typeof(Nullable<>)))
                {
                    if (valueStr == null)
                    {
                        // 若值为null，且类型为可空类型，则直接赋值null。避免Convert.ChangeType处理null报错：Null object cannot be converted to a value type.
                        property.SetValue(obj, null);
                        continue;
                    }
                    // 将值转换成property对应类型的可空类型，再进行赋值
                    var nullType = property.PropertyType;
                    NullableConverter nullableConverter = new NullableConverter(nullType);
                    nullType = nullableConverter.UnderlyingType;
                    property.SetValue(obj, Convert.ChangeType(valueStr, nullType));
                }
                else
                {
                    // 将值转换成property对应的类型，再进行赋值
                    property.SetValue(obj, Convert.ChangeType(valueStr, property.PropertyType));
                }
            }
        }
```

执行后，基本可以满足需求。关于反射能想到的就这些，后面遇到再补充了。

![image-20231120173950952](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/image-20231120173950952.png)