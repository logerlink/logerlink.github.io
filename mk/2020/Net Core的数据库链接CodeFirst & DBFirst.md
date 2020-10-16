​	[新建一个Core类库项目 CodeFirstCore](#新建一个Core类库项目 CodeFirstCore)

​	[新建一个.Net Core API项目](#新建一个.Net Core API项目)

​	[新建一个Service项目](#新建一个Service项目)

​	[CodeFirst 通过命令使用模型生成数据库](#CodeFirst 通过命令使用模型生成数据库)

​	[DBFirst](#接下来再说说DBFirst)

​	[新建一个Core 类库项目DBFirstCore](#新建一个Core 类库项目DBFirstCore)

​	[新建一个Core API项目](#新建一个Core API项目)

​	[新建一个Service项目](#新建一个Service项目，同样只贴出Userservice)

​	[值得一提](#值得一提)

​	[其他](#其他)

​	今天简单整理一下.Net Core使用EF连接数据库的两种方式，Code First和DBFirst。VS未提供图形化界面，所以连接操作基本是以命令行的方式完成的。本文以MySql为例，先从Code First开始吧。

###### 新建一个Core类库项目 CodeFirstCore

下载依赖包 

```
Install-package Microsoft.EntityFrameworkCore
Install-package Pomelo.EntityFrameworkCore.MySql
```

新建一个Person类

```c#
    public class Person
    {
        [Key]
        public int Id { get; set; }
        [MaxLength(100)]
        [Required]
        public string Name { get; set; }
        [Required]
        public int Age { get; set; }
    }
```

新建一个Context类

```c#
    public class CodeFirstContext:DbContext
    {
        public CodeFirstContext(DbContextOptions options):base(options)
        {

        }

        public DbSet<Person> Person { get; set; }
    }
```

项目结构图

![image-20201015212107120](https://i.loli.net/2020/10/15/cyHRl4frYW3Nq5X.png)

###### 新建一个.Net Core API项目

安装依赖包

```
Install-package Microsoft.EntityFrameworkCore
Install-package Microsoft.EntityFrameworkCore.Tools
```

在Startup.cs的ConfigureServices方法中加入数据库配置

```c#
			//mysql数据库链接字符串
			var connection = "server=localhost;user=root;pwd=123456;database=TestCodeFirst";
            services.AddDbContextPool<CodeFirstContext>(options => options.UseMySql(connection, b => b.MigrationsAssembly("CodeFirst")));
//CodeFirst  即Startup.cs所在的命名空间

            //DI 
            services.AddScoped<IPersonService,PersonService>();
```

新建PersonController，用于测试（会单元测试的，建议用单元测试）

```c#
    [ApiController]
    [Route("person")]
    public class PersonController : Controller
    {
        private IPersonService _personService;
        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }
        [HttpGet]
        public IActionResult Get()
        {
            return Json(new List<string> {"CodeFirst测试" });
        }

        [HttpGet]
        [Route("AddOne")]  //         person/GetList
        public IActionResult AddOne()
        {
           var result =  _personService.Add(new Person() {Name="小石",Age=88 });
            return Json(new { success=result> 0});
        }


        [HttpGet]
        [Route("GetList")]  //         person/GetList
        public IActionResult GetList()
        {
            return Json(_personService.GetList());
        }

        
    }
```

项目结构

![image-20201015215211153](https://i.loli.net/2020/10/15/lJiHsRoqOCkbew2.png)

###### 新建一个Service项目

用于操作数据库，具体就不贴出来了，这里主要贴一下PersonService.cs

```c#
    public class PersonService : BaseService, IPersonService
    {
        public PersonService(CodeFirstContext db) : base(db) { }

        public int Add(Person person)
        {
            _db.Add(person);
            return _db.SaveChanges();
        }

        public IQueryable<Person> GetList()
        {
            return _db.Person.AsQueryable();
        }
    }
```

项目结构

![image-20201015213413832](https://i.loli.net/2020/10/15/z3byUaoEVO7Grdp.png)

###### CodeFirst 通过命令使用模型生成数据库

再往下就是重点了，也不是很重点，就基本的仨命令（一条一条执行）

```
Enable-Migrations
Add-Migration [起个名字]
update-database
```

![image-20201015213820982](https://i.loli.net/2020/10/15/H8RgsvPQxkFG6I4.png)

![image-20201015214150835](https://i.loli.net/2020/10/15/Cuv5H3nwdUai92Q.png)

![image-20201015214240679](https://i.loli.net/2020/10/15/A5Zh3zfIqQt4s2r.png)

值得注意的是这里的默认项目和启动项目都要一致而且都是==API项目==（StartUp所在的项目）

![image-20201015214724075](https://i.loli.net/2020/10/15/iuMCbx24JrwyK8e.png)

==如果执行命令的过程中发生错误，请查看项目有没有安装所需的依赖包或者复制错误信息自行搜索==

项目搭建好之后就可以启动api项目进行测试了

![image-20201016221613665](https://i.loli.net/2020/10/16/l97gHLKr5ZphTeS.png)

------

###### 接下来再说说DBFirst

先执行sql，在你本地新建一个数据库

​	DBFirst，先在本地建好数据库，再通过命令行将已存在的数据库生成模型

###### 新建一个Core 类库项目DBFirstCore

下载依赖包

```
Install-package Microsoft.EntityFrameworkCore.Design
Install-package Microsoft.EntityFrameworkCore.Relational
Install-package Microsoft.EntityFrameworkCore.Tools
Install-package Pomelo.EntityFrameworkCore.MySql
```

执行以下命令即可

```
Scaffold-DbContext -f "server=localhost;user id=root;password=123456;persistsecurityinfo=True;database=test" Pomelo.EntityFrameworkCore.MySql -o DB

//-o 即输出的路径
```

![image-20201015220200713](https://i.loli.net/2020/10/15/qHdQtPn9DGAe3Ro.png)

值得注意的是，这回默认项目和启动项目都选当前的==Core 类库项目==

![image-20201015221748654](https://i.loli.net/2020/10/15/EWwtcvkRBfZ8zAK.png)

项目结构，自动生成User类和context文件（手动将context文件的无参构造删了）

![image-20201015220446969](https://i.loli.net/2020/10/15/mMDhc5wVBde8rEJ.png)

###### 新建一个Core API项目

下载依赖包

```
Install-package Microsoft.EntityFrameworkCore
```

在startup文件的ConfigureServices方法中加入以下代码

```c#
            //mysql数据库连接和Scaffold-DbContext一样
            var connection = "server=localhost;user id=root;password=123456;persistsecurityinfo=True;database=test";
            services.AddDbContextPool<testContext>(options => options.UseMySql(connection, b => b.MigrationsAssembly("DBTest.DBFirst")));

            //配置依赖注入   
            services.AddScoped<IUserService, UserService> ();
```

新增UserController用于测试

```c#
    [ApiController]
    [Route("[controller]")]
    public class UserController : Controller
    {
        private IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet]
        public IEnumerable<string> Get()
        {
           // var users = _userService.GetUsers();
            return new List<string>() { "4444", "5555" };

        }
        [HttpGet]
        [Route("getUser")]
        public ActionResult GetUser()
        {
            var users = _userService.GetUsers();
            return Json(users);

        }
    }
```

项目结构

![image-20201015221326567](https://i.loli.net/2020/10/15/Is8Y3RDr7yLJnBV.png)

###### 新建一个Service项目，同样只贴出Userservice

```c#
    public class UserService : BaseService, IUserService
    {
        public UserService(testContext testContext) : base(testContext) { }
        public IQueryable<User> GetUsers()
        {
            return _db.User.AsQueryable();
        }
    }
```

项目结构：

![image-20201015222039399](https://i.loli.net/2020/10/15/4bXVeFCtBD1ZQ3g.png)

项目搭建好之后就可以启动api项目进行测试了

![image-20201016222011240](https://i.loli.net/2020/10/16/d7gKHf4LGruYnzx.png)

###### 值得一提

1.目前只有.Net framework和.Net Core可以链接数据库，.Net standard是不可以的。

![image-20201015222347217](https://i.loli.net/2020/10/15/ikyueUQx7NqfJVa.png)

2.执行命令报错：Your startup project 'DBFirst' doesn't reference Microsoft.EntityFrameworkCore.Design

​	你没装 Microsoft.EntityFrameworkCore.Design

3.执行命令报错：Unable to connect to any of the specified MySQL hosts.

​	数据库连接字符串错了，或者不存在数据库

4.执行命令报错：Unable to create an object of type 'DataContext'

​	请把默认项目和启动项目改为startup所在的项目

5.执行命令报错：无法将“Scaffold-DbContext”项识别为 cmdlet、函数、脚本文件或可运行程序的名称

​	你没装Microsoft.EntityFrameworkCore.Tools

###### 其他

源码参考：https://github.com/logerlink/.NetCoreDBTest

源码拉取下来无法直接执行，仅作为本文参考。