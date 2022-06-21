[TOC]

#### 说明

本文简单的介绍一下值类型和引用类型，以及在平常工作中经常碰到的坑，大多数概念都是参考别人的博客，只是加了点自己的理解，并动手体验了一把。

参考：[c#中的值类型有哪些 - CSDN](https://www.csdn.net/tags/MtzaEgwsNTE4NDctYmxvZwO0O0OO0O0O.html)

#### 值类型

值类型主要包括：结构体（struct）、枚举（Enum）

如我们常见的：int、long、bool、byte、char、DateTime、double、float、decimal，我们也可以使用 struct 关键字自定义值类型

![c#long源码结构](https://s2.loli.net/2022/06/13/SC7QsyLl3xcOAmn.png)

##### 值类型的特征

- 值类型不可被继承，也不可继承，但是可以实现接口

![image-20220613164212724](https://s2.loli.net/2022/06/13/63qy2OuXS8YPht5.png)

- 值类型不能包含Null值

![image-20220613164530725](https://s2.loli.net/2022/06/13/7hyNeWtAX3YoDUw.png)

- 值类型具有默认值

![image-20220613165308179](https://s2.loli.net/2022/06/13/6exGh5wIiLCAbrQ.png)

|  类型  |  默认值  |
| :----: | :------: |
|  int   |    0     |
| String |   null   |
|  long  |    0L    |
| double |   0.0d   |
| float  |   0.0f   |
|  char  |  \u0000  |
|  byte  | (byte)0  |
| short  | (short)0 |

##### 存储位置

值类型总是分配在它声明的地方：作为字段时，跟随其所属的变量（实例）存储；作为局部变量时，存储在栈上。

值类型在内存管理方面具有更好的效率，并且不支持多态，适合用作存储数据的载体。当作用域结束时，所占空间自行释放，效率高，无需进行地址转换

##### 函数参数传递

值类型经过函数传递，并且在函数中进行将值修改，外部的值是不会受影响的，如下我们在函数中将value的值加1，而外部value的值并没有改变

```csharp
        public void TestParameter()
        {
            var value = 10;
            Action<int> nextValue = (x) => x += 1;
            nextValue.Invoke(value);
            Console.WriteLine(value);   // 10
        }
```

![image-20220616144416367](https://s2.loli.net/2022/06/16/3XewC7iInxaLUqA.png)

##### 如何比较

如何比较两个值类型是否一致呢?最简单的方法就是`==`符号了，再有一个就是Equals

`==`比较有限制，两边的类型需要”一致“，如两边都是数值类型或者布尔类型，而不管你是整形还是浮点型，只要两边的数值一样，都会返回True。

通过重载，基本值类型之间都可以通过Equals进行比较，如布尔类型与数值类型比较。只有两者类型相同且数值相同，才会返回True，如整形和浮点型通过Equals进行比较，永远返回False

```csharp
        public void TestParameter()
        {
            var a = 2;
            var b = false;
            var c = 2;
            var d = true;
            double e = 2.0d;
            Console.WriteLine("a==c:" + (a == c));  //  True
            Console.WriteLine("b==d:" + (b == d));  //  False
            Console.WriteLine("a==e:" + (a == e));  //  True
            // Console.WriteLine(a == b);   报错：a、b不同类型不可通过==进行比较
            Console.WriteLine("a.Equals(b):" + a.Equals(b));    //  False
            Console.WriteLine("b.Equals(d):" + b.Equals(d));    //  False
            Console.WriteLine("a.Equals(c):" + a.Equals(c));    //  True
            Console.WriteLine("a.Equals(e):" + a.Equals(e));    //  False
        }
```

![image-20220618162808390](https://s2.loli.net/2022/06/18/WSyJuHax5XFGzfl.png)

#### 引用类型

值类型主要包括：类（class）、数组（array）、接口（interface）、委托（delegate）、object、字符串、匿名类

如我们常见的：string[]、int[]、用户自定义的类、List、Dictionary

##### 引用类型的特征

- 当我们读取引用对象时，实际上我们读取的是他指向的引用地址，他变我也变（string类型除外）

```csharp
namespace CompressTest
{
    internal class TypeTest
    {
        [Test]
        public void TestList()
        {
            var a = new List<int> { 1, 2, 3 };
            var b = a;
            a.Add(4);
            Console.WriteLine("a：" + a.Count); // 4
            Console.WriteLine("b：" + b.Count); // 4
        }
        [Test]
        public void TestAge()
        {
            var a = new A() { Age = 10 };
            var b = a;
            a.Age = 88;
            Console.WriteLine("a：" + a.Age); // 88
            Console.WriteLine("b：" + b.Age); // 88
        }

        [Test]
        public void TestA()
        {
            var a = new A() { Age = 10 };
            var b = a;
            a = new A();    //重新分配a的内存引用地址，此时a、b指向的并不是同一个地址
            Console.WriteLine("a：" + a.Age); // 0
            Console.WriteLine("b：" + b.Age); // 10
        }
    }

    public class A {
        public int Age { get; set; }
    }
}
```

![image-20220614102601863](https://s2.loli.net/2022/06/14/sIBgxaDwhYtTVj6.png)

- 判断对象是否相等时，不可直接使用==比较，(string除外)

```csharp
namespace CompressTest
{
    internal class TypeTest
    {
        [Test]
        public void TestEqual()
        {
            var a = new A() { Age = 10 };
            var b = a;
            // a、b指向同一个引用地址，==和equals均为true
            Console.WriteLine("a == b：" + (a == b)); // True
            Console.WriteLine("a.Equals(b)：" + a.Equals(b)); // True

            var aa = new A() { Age = 10 };
            var bb = new A() { Age = 10 };
            // aa、bb看上去是一样的（Age=10），但是是不同的两个对象（new），指向不同的引用地址，==和equals均为false
            Console.WriteLine("aa == bb：" + (aa == bb)); // False
            Console.WriteLine("aa.Equals(bb)：" + aa.Equals(bb)); // False

            // 有一个特殊情况就是在匿名类中，若两个对象字段和值一致，Equals判断会返回 True
            var aaa = new { Age = 10, Name = "xiaoming", Gender = "男" };
            var bbb = new { Age = 10, Name = "xiaoming", Gender = "男" };
            Console.WriteLine("aaa.Equals(bbb)：" + aaa.Equals(bbb)); // True
        }
    }

    public class A {
        public int Age { get; set; }
    }
}
```

![image-20220621100200275](https://s2.loli.net/2022/06/21/rBfTKU4Vbhaounl.png)

##### 存储位置

引用类型在栈中存储一个引用，其实际的存储位置位于托管堆，即引用类型存储在托管推上。

引用类型支持多态，适合用于定义应用程序的行为，引用类型由GC来控制其回收，需要进行地址转换，效率降低

##### 函数参数传递

引用类型经过函数传递，并且在函数中进行将值修改，外部的值也会受影响。因为函数传递过去是变量的引用地址。如下我们在函数中将age的值加1，外部age的值也跟着改变了（string字符串类型除外）

```csharp
        public void TestParameter()
        {
            var a = new A { Age = 10 };
            Action<A> nextAge = (x) => x.Age += 1;
            nextAge.Invoke(a);
            Console.WriteLine(a.Age);   // 11
        }
```

![image-20220616144732934](https://s2.loli.net/2022/06/16/g8URNa7CyhTvIfo.png)

##### 如何比较

如何比较两个值类型是否一致呢?最常见的两种方式：Equals、ReferenceEquals

Equals、ReferenceEquals判断的是引用，当两个对象指向同一个引用地址时，则返回True（当然匿名类，string类除外）

```csharp
        public void TestParameter()
        {
            var a = new A{ Age = 10, Name = "xiaoming", Gender = "男" };
            var b = new A{ Age = 10, Name = "xiaoming", Gender = "男" };
            var c = a;
            c = b;
            Console.WriteLine(ReferenceEquals(a, b));   //  False
            Console.WriteLine(ReferenceEquals(a, c));   //  False
            Console.WriteLine(ReferenceEquals(b, c));   //  True

            Console.WriteLine(b == c);          //  True,引用地址一致
            Console.WriteLine(a == b);          //  False,引用地址不一致
            Console.WriteLine(a.Equals(b));     //  False,字段一致且值相同
            Console.WriteLine(Equals(a, c));    //  False                Equals(x, y)  等同于  x.Equals(y)
            
            var aa = new { Age = 18, Name = "xiaoming", Gender = "男" };
            var bb = new { Age = 18, Name = "xiaoming", Gender = "男" };            
            Console.WriteLine("aa.Equals(bb)：" + aa.Equals(bb));    //  True 匿名类，字段一致，值相同
            var cc = new { Age = 10, Name = "xiaoming" };
            Console.WriteLine("aa.Equals(cc)：" + aa.Equals(cc));    //  False 字段不一致
            var dd = new { Age = 18, Name = "xiaoming", Gender = "女" };
            Console.WriteLine("aa.Equals(dd)：" + aa.Equals(dd));    //  False 字段一致，但 Gender 值不相同
        }
```

![image-20220621101131012](https://s2.loli.net/2022/06/21/w7MfuYN154QbSVc.png)

#### 其他

##### Visual Studio如何查看引用地址

开启调试—>头部菜单【调试】—>选择【窗口】选项—>选择【内存】选项—>选择【内存1】

![image-20220614180908272](https://s2.loli.net/2022/06/14/7txZYCH3DKnQ4yN.png)

打开如下图，我么只要关注【地址】输入框即可

![image-20220614183034695](https://s2.loli.net/2022/06/14/EmLUKaceXOVwq3v.png)

接着我们把对应的变量名输入到【地址】框，回车后就可以看到地址了，如输入a、b，我们可以看到这两个变量的内存地址是一致的，说明他俩指向的是同一个内存地址

![image-20220614183440613](https://s2.loli.net/2022/06/14/8VFktxB4rzNEeDs.png)

##### 如何判断值类型或者引用类型

```csharp
        public void TestType()
        {
            var a = new A() { Age = 10 };
            var b = 10;
            var c = new { Name = "XiaoMing" };
            Console.WriteLine("a是值类型：" + a.GetType().IsValueType);  // False
            Console.WriteLine("b是值类型：" + b.GetType().IsValueType);  // True
            Console.WriteLine("c是值类型：" + c.GetType().IsValueType);  // False
        }
```

![image-20220614170202033](https://s2.loli.net/2022/06/14/kwfBvpAlJXMqnI6.png)

##### 特殊引用类型——string

参考：[C# 引用类型之特例string - 走看看 (zoukankan.com)](http://t.zoukankan.com/djzxjblogs-p-7536959.html)

###### 字符串的赋值操作

正常创建引用类型我们都需要使用关键词new，才能得到一个对象，而string却可以像值类型一样直接用赋值。这是微软为了方便大家，可以直接定义字符串变量并且赋值操作（具体怎么回事，没查到...）看起来大概如下

```csharp
        public void TestString()
        {
            var x = new String("你好");
            var xx = new string("你好");
            var xxx = "你好";
            Console.WriteLine(x);            
            Console.WriteLine(xx);
            Console.WriteLine(xxx);
        }
```

![image-20220614174942520](https://s2.loli.net/2022/06/14/FkfmC15RIip4tGj.png)

###### 字符串的引用地址

正常引用类型a赋值给b，那么a、b均指向同一个内存地址，而字符串a赋值给b，指向的却是不同的内存地址

```csharp
        public void TestAddress()
        {
            var a = new A { Age = 10 };
            var b = a;
            a.Age = 100;
            Console.WriteLine(a.Age);
            Console.WriteLine(b.Age);

            var aa = "你好";
            var bb = aa;
            aa = "Hello";
            Console.WriteLine(aa);
            Console.WriteLine(bb);
        }
```

我们先来看一下对象a、b的内存地址，我们可以看到他俩都指向同一个引用地址

![ab对象引用地址](https://s2.loli.net/2022/06/16/ZbTpC7gVe19PDz2.gif)

再来看字符串aa、bb的引用地址，尽管字符串也是引用类型，但这俩的引用地址并不一样

这是因为我们给字符串赋值时，默认会创建一个新字符串对象——`aa = new String('你好')`。此时如果字符串的值不一样，那么就会默认指向另一个的地址。

![aabb字符串引用地址](https://s2.loli.net/2022/06/16/1lnKJuxZFmykTbg.gif)

###### 字符串的函数参数传递

字符串通过引用传递，并且在函数中将值修改，并不会修改函数外部的值。如下

```csharp
        public void TestParameter()
        {
            string value = "你好";
            Action<string> translate = (x) =>
            {
                if (x == "你好") x = "Hello";
                else if (x == "再见") x = "bye-bye";
            };
            translate.Invoke(value);
            Console.WriteLine(value);   // 你好
        }
```

![image-20220616145746713](https://s2.loli.net/2022/06/16/RFyVgWtLs3e2mwK.png)

这是由于在c#中字符串是不可变（sealed）的，当我们将x重新赋值时，并不会更改原来的值，而是重新分配一块内存，创建一个新的对象。如下图我们分别查看value、x的引用地址，这两个指向的并不是同一个地址

```csharp
        public void TestParameter()
        {
            string value = "你好";
            Action<string> translate = (x) =>
            {
                if (x == "你好") x = "Hello";
                else if (x == "再见") x = "bye-bye";
                else x = "未知";
                var aa = "1111111111111111";
            };
            translate.Invoke(value);
            Console.WriteLine(value);   // 你好
        }
```

![290](C:\Users\loger\Desktop\290.gif)

###### 字符串的比较

在C#中字符串作为引用类型除了Equals、ReferenceEquals还可以像值类型一样使用`==`做判断，原因是string类中已经帮我们实现`==`的判断方法，而且Equals也可以直接比较值而不是引用地址。我们可以看一下string的源码预览，如下

![image-20220620111336542](https://s2.loli.net/2022/06/20/omMR4HqljNDVukx.png)

```csharp
        public void TestParameter()
        {
            string a = "hello";
            var b = new String("hello");
            var c = new StringBuilder("hello").ToString();
            var d = "你好";

            Console.WriteLine("a==d：" + (a == d));  //  False
            Console.WriteLine("a==b：" + (a == b));  //  True
            Console.WriteLine("a==c：" + (a == c));  //  True
            Console.WriteLine("a.Equals(b)：" + a.Equals(b));    //  True
            Console.WriteLine("a.Equals(c)：" + a.Equals(c));    //  True
            Console.WriteLine("ReferenceEquals(a,b)：" + ReferenceEquals(a,b));  //  False   不同对象，引用地址不同
            Console.WriteLine("ReferenceEquals(b,c)：" + ReferenceEquals(b, c)); //  False   不同对象，引用地址不同
        }
```

![image-20220620112552533](https://s2.loli.net/2022/06/20/i8yALJTjaZw7OzX.png)

###### 字符串的内存驻留

当我们创建两个字符串且值一致时，这两个字符串对象指向的是同一个内存地址，但是有个很强制的要求，那就是这两个字符串的创建方式要以赋值的方式创建

```csharp
        public void TestParameter()
        {
            string a = "hello";
            var aa = "hello";
            var b = new String("hello");
            var bb = new String("hello");
            var c = new StringBuilder("hello").ToString();
            var cc = new StringBuilder("hello").ToString();

            string d = "hello";
            d = "HiHi";
            var dd = "HiHi";
        }
```

如上代码，我们先来看一下执行效果，为了方便查看我直接把相应字段的内存地址直接截图查看。

我们可以看到除了a、d这两个变量所指向的地址和对应aa、dd一致，而以其他方式得到的string对象指向的都是不同内存地址

![image-20220620114301870](https://s2.loli.net/2022/06/20/DfT6PQ8FjXkOtKd.png)

##### 如何将函数参数传递的值类型或string类型变成引用传递呢

在c#中我们可以借助ref、out关键词，将函数参数传递的值类型或string类型变成引用传递

ref、out都能实现一样的效果，只是ref需要先定义再使用，而out不需要但一定要在被调用函数内对其进行赋值操作，记住这一点就行.

接下来我们来对比一下使用ref、out和不使用的区别，ref、out真的是非常实用的语法糖

```csharp
        public void TestRefAndOut()
        {
            var age = 18;
            var info = "你好！我是小明！";
            var nextAge = 0;
            TestAction(age,info, nextAge);
            Console.WriteLine(info);
            Console.WriteLine($"age：{age}，nextAge：{nextAge}");      //  age：18，nextAge：0

            TestActionRef(age, ref info, out int nextAgeRef);
            Console.WriteLine(info);
            Console.WriteLine($"age：{age}，nextAge：{nextAgeRef}");   //  age：18，nextAge：19
        }
        private void TestAction(int age, string info, int nextAge)
        {
            nextAge = age + 1;
            info += $"今年{age}岁！";
        }
        private void TestActionRef(int age,ref string info, out int nextAge)
        {
            nextAge = age + 1;
            info += $"今年{age}岁！";
        }
```

![image-20220620155958723](https://s2.loli.net/2022/06/20/lWmgvuZ8pCUEaQN.png)

##### 如何避免引用传递呢

如现在有两个对象，我想把对象A拷贝到B，但我不希望改对象B的时候影响到对象A

```csharp
    //准备一个 class A
    public class A
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Age { get; set; }
    }
```

###### 重新创建对象

```csharp
        public void TestClone()
        {
            var a = new A() { Id = 1, Name = "a", Age = 10 };
            var b = new A() { Id = a.Id, Name = a.Name, Age = a.Age };
            b.Age = 18;
            Console.WriteLine($"a.Age：{a.Age}，b.Age：{b.Age}");  //  a.Age：10，没改变对象a
            var c = a;
            c.Age = 18;
            Console.WriteLine($"a.Age：{a.Age}，b.Age：{c.Age}");  //  a.Age：18，a、c指向同一个引用地址
        }
```

![image-20220620161929483](https://s2.loli.net/2022/06/20/q6LQzlew8B5iRMy.png)

###### 序列化与反序列化

先将对象A序列化成json串，再将json串反序列化成对象B。不过当对象A很大，有可能会超内存，速度也会受到影响

```csharp
        public void TestClone()
        {
            var a = new A() { Id = 1, Name = "a", Age = 10 };
            var b = Newtonsoft.Json.JsonConvert.DeserializeObject<A>(Newtonsoft.Json.JsonConvert.SerializeObject(a));
            b.Age = 18;
            Console.WriteLine($"a.Age：{a.Age}，b.Age：{b.Age}");  //  a.Age：10，没改变对象a
        }
```

![image-20220620163142498](https://s2.loli.net/2022/06/20/m5XbOzkAYKZS2H8.png)

###### 深拷贝

浅拷贝：修改复制之后的对象，如果是值类型不会改变原对象，但如果是引用类型，原对象也会跟着改变，`=赋值`就是浅拷贝

深拷贝：新旧对象不是指向的不是同一个引用地址，修改新对象不会改变就对象

改一下class A，实现ICloneable接口

```csharp
    internal class TypeTest
    {
        [Test]
        public void TestClone()
        {
            var a = new A() { Id = 1, Name = "a", Age = 10 };
            var b = a;  //浅拷贝
            b.Age = 18;
            Console.WriteLine($"a.Age：{a.Age}，b.Age：{b.Age}");      //  a.Age：10
            
            var aa = new A() { Id = 1, Name = "a", Age = 10 };
            var bb = (A)aa.Clone(); //深拷贝
            bb.Age = 18;
            Console.WriteLine($"aa.Age：{aa.Age}，bb.Age：{bb.Age}");  //  aa.Age：10，没改变对象a
        }
    }
    //准备一个 class A，并实现ICloneable接口
    public class A:ICloneable
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Age { get; set; }

        public object Clone()
        {
            return (A)this.MemberwiseClone();
        }
    }
```

![image-20220620165205726](https://s2.loli.net/2022/06/20/ieFOBSNrhad1MUj.png)

###### 其他

当然如何避免引用传递，其实有很多方法，如反射、[Auto Mapper](https://github.com/AutoMapper/AutoMapper)、[Adapt Mapper](https://github.com/ADAPT/ADAPT)

##### 集合的对象引用

如两个集合之间如何避免引用传递呢，最简单直接用Linq的Select方法

```csharp
        public void TestClone()
        {
            var aList = new List<int>() { 1,2,3,4};
            var bList = aList.Select(x=>x).ToList();
            bList.Add(5);
            Console.WriteLine($"Count——aList：{aList.Count}，bList：{bList.Count}");   // aList：4

            var cList = aList;
            cList.Add(5);
            Console.WriteLine($"Count——aList：{aList.Count}，bList：{cList.Count}");   //  aList：5
        }
```

![image-20220620172635545](https://s2.loli.net/2022/06/20/8SnYUu3yF5TdZVm.png)

##### 集合元素的对象引用

集合元素如果是引用类型，仅仅用Linq的Select方法是无法避免集合元素的引用传递，这一点需要注意一下。如下：

```csharp
        public void TestClone()
        {
            var aList = new List<A>() { new A() { Name = "小明" } };
            var bList = aList.Select(x => x).ToList();
            Console.WriteLine($"Name——aList：{aList.FirstOrDefault()?.Name}，bList：{bList.FirstOrDefault()?.Name}");   // aList：小明

            bList.FirstOrDefault().Name = "小红";
            Console.WriteLine($"Name——aList：{aList.FirstOrDefault()?.Name}，bList：{bList.FirstOrDefault()?.Name}");   // aList：小红
        }
```

![image-20220621103027183](https://s2.loli.net/2022/06/21/TgKNcozJ267taDB.png)

那应该怎么处理呢？参考【如何避免引用传递呢】循环一个个的处理里面的元素，或者直接用[Auto Mapper](https://github.com/AutoMapper/AutoMapper)、[Adapt Mapper](https://github.com/ADAPT/ADAPT)

```csharp
        public void TestClone()
        {
            //using Mapster; 
            var aList = new List<A>() { new A() { Name = "小明" } };
            var bList = aList.Adapt<List<A>>();
            Console.WriteLine($"Name——aList：{aList.FirstOrDefault()?.Name}，bList：{bList.FirstOrDefault()?.Name}");   // aList：小明

            bList.FirstOrDefault().Name = "小红";
            Console.WriteLine($"Name——aList：{aList.FirstOrDefault()?.Name}，bList：{bList.FirstOrDefault()?.Name}");   // aList：小明，aList不受bList元素的改变而改变
        }
```

![image-20220621103321789](https://s2.loli.net/2022/06/21/XrS5pgid7xOa6MA.png)