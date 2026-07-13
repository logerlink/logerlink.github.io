[Toc]

### 前言

#### 是什么

本文主要介绍如何不依赖 abp cli手动搭建模块化单体abp项目，并记录一下使用abp项目常见的约定和范式以及常见问题。

注意：本项目并没有实际的业务场景，仅仅只是"空项目"，具备swagger、自动Api（无需Controller）、仓储功能（SQL Server、dbFirst）。主要适用于以下场景：学习搭建abp项目、找一个可用的abp项目结构然后实现你的业务逻辑

版本：.net 8.0、Abp 8.3.4、SQL Server

源码：[MyProject v1.0.0](https://github.com/logerlink/MyProject/tree/v1.0.0) 。（注意：后期借助AI深刻理解后，重新更新了一次。可能会造成源码和文档有部分内容不一致的情况，建议以main分支为主，文档可作为辅助参考）

#### 为什么

abp可以通过cli工具创建项目，确实很全面也很好用，但为什么还要手动搭建abp项目呢？我给出以下原因

- abp cli最新版本（0.7.0+）需要团队许可证才支持`--tiered`模式
- abp cli创建的项目很全面，包含用户、权限、角色等很多功能，但有时候我们并不需要这些
- abp cli创建的项目会初始化很多表格，但有时候我们并不需要这些
- abp cli创建的项目附带很多（非核心）业务功能，对于初学者学习或了解框架不友好
- 有时我们只需要其中的一小部分功能，或者只需要abp这个项目架构
- 教练，我想学习abp框架

本文介绍的是模块化单体项目（Host+Module），包含swagger、自动Api（无需Controller）、仓储功能（SQL Server、dbFirst）

#### 怎么做

如果让你在一个当前项目（现成的abp项目结构）中添加一个业务接口，如用户信息管理加一个新业务，你会怎么做？如书籍管理

1. 在**Application.Contracts**层相关文件夹BookContracts新建一个接口**`IBookAppService`**（这个文件夹还会存放Book相关的Dto、Enum）
2. 在**Application**层相关文件夹BookApp新建一个类**`BookAppService`**，实现`IBookAppService`接口
3. 在**Domain**层相关文件夹BookDomain新建一个实体类**`Book`**，继承于`Entity<int>`，
4. 在**EntityFrameworkCore**层的DBContext维护该实体`DbSet<Book> Books`，有时无需这一步，但必须有`modelBuilder.Entity<Book>();`
5. 在**Domain**层相关文件夹BookDomain新建一个仓储接口**`IBookRepository`**，继承`IRepository<Book>`
6. 在**EntityFrameworkCore**层相关文件夹BookEF新建一个仓储实现**`BookRepository`**，继承EF泛型类`EfCoreRepository<ModuleDbContext, Book, int>`，并实现`IBookRepository`接口
7. 基础设施层建好之后，在`BookAppService`中通过构造函数注入`IBookRepository<Book>`即可访问仓储层
8. 增加api接口的顺序，在`IBookAppService`定义业务api接口，`BookAppService`重写方法，调用仓储层，实现业务逻辑。
9. 大部分仓储方法（增删改查）已在`IRepository`定义，可直接使用。若需要自定义可在`IBookRepository`定义接口方法，然后由`BookRepository`实现接口并重写方法
10. 各个层下最好能用文件夹区分一下业务，命名格式参考：Books或者`BookDomain、BookApp`

### abp项目结构

#### abp常见项目结构

abp常见项目结构：传统单体、模块化单体（Host+Module）、微服务分层部署的对比。当然模块化单体也支持做成分层部署的方式

| 维度       | 传统单体（无模块）         | 模块化单体（Host+Module）         | 微服务 / 分层部署 abp --tiered |
| ---------- | -------------------------- | --------------------------------- | ------------------------------ |
| 代码耦合度 | 高（所有代码混在一起）     | 低（模块内高内聚，模块间低耦合）  | 极低（服务独立）               |
| 部署复杂度 | 简单（单应用）             | 简单（单应用）                    | 复杂（多应用 / 多服务器）      |
| 开发效率   | 初期快，后期低（维护困难） | 全周期较均衡（模块化 + 单体优势） | 初期低（分布式设计成本高）     |
| 性能       | 高（进程内调用）           | 高（进程内调用）                  | 较低（grpc跨服务网络开销）     |
| 扩展性     | 差（无法单独扩展某功能）   | 中（可整体扩展，模块级扩展有限）  | 高（可单独扩展某服务）         |

#### 项目结构图

```plaintext
D:\WORK\MYPROJECT
├─.vscode
├─db
└─src
    ├─modules
    │  └─user
    │      ├─MyProject.User.Application
    │      │  ├─ApplicationCommon
    │      │  │  └─Helpers
    │      │  ├─bin
    │      │  ├─obj
    │      │  └─UserInfos
    │      ├─MyProject.User.Application.Contracts
    │      │  ├─bin
    │      │  ├─ContractCommon
    │      │  ├─obj
    │      │  └─UserInfos
    │      ├─MyProject.User.Domain
    │      │  ├─bin
    │      │  ├─DomainCommon
    │      │  │  └─Helpers
    │      │  ├─obj
    │      │  └─UserInfos
    │      ├─MyProject.User.EntityframeworkCore
    │      │  ├─bin
    │      │  ├─EFCoreCommon
    │      │  ├─EntityFrameworkCore
    │      │  ├─obj
    │      │  └─UserInfos
    │      └─MyProject.User.Shared
    │          ├─bin
    │          ├─obj
    │          └─SharedCommon
    └─MyProject.Host
        ├─bin
        ├─obj
        └─Properties
```

#### 搭建项目结构

快速搭建abp模块化单体项目

1. 使用vs新建空白解决方案
2. 在vs解决方案中，创建src文件夹，在src文件夹下创建modules文件夹，在modules文件夹下创建user文件夹，作为user模块
3. 在文件资源管理器中，找到刚才的解决方案(.sln)所在位置，创建src文件夹，在src文件夹下创建modules文件夹，在modules文件夹下创建user文件夹，存放user模块的文件
4. 在vs中，右键src文件夹创建MyProject.Host项目（ASP.NET Core Web API），项目位置选择到src即可
5. 在vs中，右键user文件夹创建MyProject.User.Domain项目（类库），项目位置选择到src\modules\user
6. 在vs中，右键user文件夹分别创建Application、Application.Contracts、EntityframeworkCore、Shared项目，项目位置选择到src\modules\user

![image-20250801174420481](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250801174420481.png)

参考：[如何在Visual Studio中创建src文件夹？](https://logerlink.github.io/page/2025/EFMigrationError.html)

#### 项目依赖

小技巧：你可以在vs双击项目，编辑项目依赖，然后把以下的xml内容添加到各个项目中，再右键解决方案进行还原Nuget包即可

##### MyProject.User.Application

依赖`Volo.Abp.AutoMapper、Volo.Abp.Ddd.Application`包，依赖`MyProject.User.Application.Contracts、MyProject.User.Domain`项目

```xml
  <ItemGroup>
    <PackageReference Include="Volo.Abp.AutoMapper" Version="8.3.4" />
    <PackageReference Include="Volo.Abp.Ddd.Application" Version="8.3.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MyProject.User.Application.Contracts\MyProject.User.Application.Contracts.csproj" />
    <ProjectReference Include="..\MyProject.User.Domain\MyProject.User.Domain.csproj" />
  </ItemGroup>
```

##### MyProject.User.Application.Contracts

依赖`Volo.Abp.Ddd.Application.Contracts`包，依赖`MyProject.User.Shared`项目

```xml
  <ItemGroup>
    <PackageReference Include="Volo.Abp.Ddd.Application.Contracts" Version="8.3.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MyProject.User.Shared\MyProject.User.Shared.csproj" />
  </ItemGroup>
```

##### MyProject.User.Domain

依赖`Volo.Abp.Ddd.Domain`包

```xml
  <ItemGroup>
    <PackageReference Include="Volo.Abp.Ddd.Domain" Version="8.3.4" />
  </ItemGroup>
```

##### MyProject.User.EntityframeworkCore

依赖`Volo.Abp.EntityFrameworkCore、Volo.Abp.EntityFrameworkCore.SqlServer`包，依赖`MyProject.User.Domain`项目

```xml
  <ItemGroup>
    <PackageReference Include="Volo.Abp.EntityFrameworkCore" Version="8.3.4" />
    <PackageReference Include="Volo.Abp.EntityFrameworkCore.SqlServer" Version="8.3.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MyProject.User.Domain\MyProject.User.Domain.csproj" />
  </ItemGroup>
```

##### MyProject.User.Shared

依赖`Volo.Abp.Core`包

```xml
  <ItemGroup>
	  <PackageReference Include="Volo.Abp.Core" Version="8.3.4" />
  </ItemGroup>
```

##### MyProject.Host

依赖`Swashbuckle.AspNetCore、Volo.Abp.AspNetCore、.Abp.Autofac、Volo.Abp.Core、Volo.Abp.Swashbuckle`包，依赖`MyProject.User.Application、MyProject.User.EntityframeworkCore`项目

```xml
  <ItemGroup>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
    <PackageReference Include="Volo.Abp.AspNetCore" Version="8.3.4" />
    <PackageReference Include="Volo.Abp.Autofac" Version="8.3.4" />
    <PackageReference Include="Volo.Abp.Core" Version="8.3.4" />
    <PackageReference Include="Volo.Abp.Swashbuckle" Version="8.3.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\modules\user\MyProject.User.Application\MyProject.User.Application.csproj" />
    <ProjectReference Include="..\modules\user\MyProject.User.EntityframeworkCore\MyProject.User.EntityframeworkCore.csproj" />
  </ItemGroup>
```

### 代码实现

#### 添加各个项目的Module文件

后续还会修改的

```csharp
    // Application
	[DependsOn(typeof(UserModuleApplicationContractsModule),
        typeof(UserModuleDomainModule)
        )]
    public class UserModuleApplicationModule : AbpModule
    {
    }
	// Application.Contracts
    [DependsOn(typeof(UserModuleSharedModule)
        )]
    public class UserModuleApplicationContractsModule:AbpModule
    {
    }
	// Domain
    public class UserModuleDomainModule : AbpModule
    {
    }
	// EntityframeworkCore
    [DependsOn(typeof(UserModuleDomainModule)
    )]
    public class UserModuleEntityFrameworkCoreModule:AbpModule
    {
    }
	// Shared
    public class UserModuleSharedModule:AbpModule
    {
    }
```

#### 创建实体——Domian层

在**Domian**层的UserInfos文件夹下创建实体`UserInfo`，有必要的话可以创建UserInfoManager领域服务（专门用于处理业务逻辑，避免把所有逻辑都堆积在AppService中）

```csharp
/**
 * abp自带的审计实体：
 * FullAuditedEntity：包含完整审计字段（创建时间、创建人、最后修改时间、修改人、软删除标记、删除人/时间）
 * AuditedEntity：仅包含创建和修改审计字段（无软删除相关字段）
 * Entity：仅包含Id
 * CreationAuditedEntity：仅包含创建时间和创建人
*/

/// <summary>
/// 自定义指定表名
/// </summary>
[Table("UserInfo")]
public class UserInfo : Entity<int>
{
    /// <summary>
    /// 自定义指定列名
    /// </summary>
    [Column("Username")]
    public required string Name { get; set; }   // required 表示不可空

    public required string Password { get; set; }

    public int Type { get; set; }
    public string? PhoneNumber { get; set; }    // 表示字段可空
    public DateTime CreateTime { get; set; }
}

```

```csharp
    public class UserInfoManager: DomainService     // 一定要继承 DomainService，否则无法注入到ApplicationService中
    {
        private readonly IUserInfoRepository _userInfoRepository;
        public UserInfoManager(IUserInfoRepository userInfoRepository)
        {
            _userInfoRepository = userInfoRepository;
        }
        public async Task<UserInfo> UpdateUserInfo(UpdateUserInfoModel userInfo)
        {
            var dbUserInfo = await _userInfoRepository.GetAsync(x => x.Id == userInfo.Id);
            if (dbUserInfo == null) throw new Exception("用户信息不存在");
            Merge2UserInfo(userInfo, dbUserInfo);
            return dbUserInfo;
        }

        private void Merge2UserInfo(UpdateUserInfoModel source, UserInfo target)
        {
            target.Name = source.Name;
            target.PhoneNumber = source.PhoneNumber;
            target.Type = source.Type;
        }
    }
}
```

#### 创建DBContext——EntityframeworkCore层

在**EntityframeworkCore**层的EntityframeworkCore文件夹下创建数据库上下文`UserModuleDbContext`

```csharp
[ConnectionStringName("UserModule")] // 指定连接字符串名称（与配置文件对应）
public class UserModuleDbContext : AbpDbContext<UserModuleDbContext>
{
    // 无需手动定义 DbSet，ABP 会通过 AddDefaultRepositories 自动处理
    public DbSet<UserInfo> Users { get; set; }                    
    // 注意：这里有个问题，如果这里不显示定义DBSet且没有任何的自定义IxxxRepository，那么就会报错，不知道是什么原因
    // 正常指定 options.AddDefaultRepositories(includeAllEntities: true); 就可以不用显示定义DbSet，并且可以自动识别注入的
    // 若这里不想显示定义DbSet，可以加一个IUserRepository、UserRepository

    public UserModuleDbContext(DbContextOptions<UserModuleDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // 配置实体映射（仅需配置领域层实体）
        modelBuilder.Entity<UserInfo>();
    }
}
```

在**Host**层的appsettings.json文件中加入数据库连接字符串配置

```json
{
      "ConnectionStrings": {
        "UserModule": "Server=.;Database=MyProjectAbp;Trusted_Connection=True;TrustServerCertificate=True"
      }
}
```

#### 注入DBContext——EntityframeworkCore层

修改**EntityframeworkCore**层的模块配置`UserModuleEntityFrameworkCoreModule`，注入数据库上下文信息

无需手动注入，配置即可

```csharp
[DependsOn(
    typeof(UserModuleDomainModule), // 依赖领域层
    typeof(AbpEntityFrameworkCoreSqlServerModule) // 依赖 SQL Server 集成
)]
public class UserModuleEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 注册模块专属 DbContext
        context.Services.AddAbpDbContext<UserModuleDbContext>(options =>
        {
            // 自动发现领域层实体并映射（无需手动添加 DbSet）
            options.AddDefaultRepositories(includeAllEntities: true);
        });

        // 配置数据库连接（从配置文件读取连接字符串）
        Configure<AbpDbContextOptions>(options =>
        {
            options.Configure<UserModuleDbContext>(dbContextOptions =>
            {
                dbContextOptions.UseSqlServer();
            });
        });
    }
}
```

#### 定义业务契约接口Dto——Application.Contracts层

在**Application.Contracts**层的UserInfos文件夹定义了业务接口`IUserInfoAppService`和相关Dto

```csharp
public interface IUserInfoAppService : IApplicationService  // 要继承IApplicationService
{
    Task<List<UserInfoDto>> GetListAsync();

    Task<UserInfoDto> GetByIdAsync(int id);

    Task<UserInfoDto> CreateAsync(CreateUserInfoDto input);
}


// 以下单独建一个类
public class CreateUserInfoDto : IValidatableObject     // 实现自动验证接口。注意要放在Dto中实现
{
    [Required(ErrorMessage = "用户名不能为空")]
    [StringLength(50, MinimumLength = 5, ErrorMessage = "用户名长度不能少于5个字符")]
    public required string Name { get; set; }
    [Required(ErrorMessage = "密码不能为空")]
    [DisableAuditing]   // 禁用审计，不要记录密码日志，保护用户隐私
    public required string Password { get; set; }
    public int Type { get; set; }
    public string? PhoneNumber { get; set; }    // 表示字段可空

    /// <summary>
    /// 实现 IValidatableObject 接口，自动触发验证逻辑。不要手动调用
    /// </summary>
    /// <param name="validationContext"></param>
    /// <returns></returns>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // 规则 1：密码不能包含用户名
        if (Password.Contains(Name))
        {
            yield return new ValidationResult(
                "密码安全系数低：密码中不能包含用户名！",
                new[] { nameof(Password) } // 指定是哪个字段错的
            );
        }

        // 规则 2：排除常见弱口令
        var blackList = new List<string> { "12345678", "password", "qwertyui" };
        if (blackList.Contains(Password.ToLower()))
        {
            yield return new ValidationResult(
                "该密码属于常用弱口令，请重新输入！",
                new[] { nameof(Password) }
            );
        }
    }
}

public class UserInfoDto
{
    public string Name { get; set; }

    public string Password { get; set; }

    public int Type { get; set; }
    public string? PhoneNumber { get; set; }    // 表示字段可空
    public DateTime CreateTime { get; set; }
}
```

#### 实现业务接口——Application层

在**Application**层的UserInfos文件夹定义业务实现`UserInfoAppService`，继承`ApplicationService`，实现`IUserInfoAppService`

无需手动注入`IUserInfoAppService`

```csharp
/// <summary>
/// 禁用日志审计和自动校验
/// </summary>
[DisableAuditing,DisableValidation]
// swagger：非必须，默认值为true，如果设为false，则不会展示该service
[RemoteService(IsEnabled = true)]
// swagger：必须
public class UserInfoAppService : ApplicationService, IUserInfoAppService   // 不强制实现IUserInfoAppService，不过一般都会实现
{
    private readonly IRepository<UserInfo, int> _userInfoRepository;
    private readonly UserInfoManager _userInfoManager;
    /// <summary>
    /// 自定义User仓储接口
    /// </summary>
    private readonly IUserInfoRepository _myUserInfoRepository;

    public UserInfoAppService(IRepository<UserInfo, int> userInfoRepository, IUserInfoRepository myUserInfoRepository, UserInfoManager userInfoManager)
    {
        _userInfoRepository = userInfoRepository;
        _myUserInfoRepository = myUserInfoRepository;
        _userInfoManager = userInfoManager;
    }

    /// <summary>
    /// 获取集合
    /// </summary>
    /// <returns></returns>
    // swagger：必须，类或方法使用 public 公开访问
    public async Task<List<UserInfoDto>> GetListAsync()
    {
        //_myUserInfoRepository.MyAdd(null);
        var models = await _userInfoRepository.GetListAsync();
        return ObjectMapper.Map<List<UserInfo>, List<UserInfoDto>>(models);
    }
    /// <summary>
    /// 根据Id获取实体
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<UserInfoDto> GetByIdAsync(int id)
    {
        var model = await _userInfoRepository.GetAsync(id);
        return ObjectMapper.Map<UserInfo, UserInfoDto>(model);
    }
    public async Task<UserInfoDto> CreateAsync(CreateUserInfoDto inputDto)
    {
        var model = ObjectMapper.Map<CreateUserInfoDto, UserInfo>(inputDto);
        model.CreateTime = DateTime.Now;
        model = await _userInfoRepository.InsertAsync(model);
        return ObjectMapper.Map<UserInfo, UserInfoDto>(model);
    }
    public async Task<UserInfoDto> UpdateAsync(UpdateUserInfoDto inputDto)
    {
        var model = ObjectMapper.Map<UpdateUserInfoDto, UpdateUserInfoModel>(inputDto);

        var updateModel = await _userInfoManager.UpdateUserInfo(model);

        //updateModel = await _userInfoRepository.UpdateAsync(updateModel);     // 这里可以不用调用，由abp处理
        return ObjectMapper.Map<UserInfo, UserInfoDto>(updateModel);
    }
}
```

#### 配置并使用AutoMapper——Application层

在**Application**层下创建AutoMapper映射文件`UserModuleApplicationAutoMapperProfile`

```csharp
    internal class UserModuleApplicationAutoMapperProfile:Profile
    {
        public UserModuleApplicationAutoMapperProfile()
        {
            CreateMap<UserInfo, UserInfoDto>();
            CreateMap<CreateUserInfoDto, UserInfo>();

            CreateMap<UpdateUserInfoDto, UpdateUserInfoModel>();
        }
    }
```

在**Application**层修改module文件`UserModuleApplicationModule`

```csharp
[DependsOn(
    typeof(AbpAutoMapperModule),    // 依赖automapper模块，否则automapper不生效
    typeof(UserModuleDomainModule),
    typeof(AbpDddApplicationModule)
)]
public class UserModuleApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 配置对象映射
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<UserModuleApplicationModule>();
        });
    }
}
```

#### 定义自定义仓储接口（可选）——Domain层

在**Domain**层下的UserInfos文件夹定义仓储接口`IUserInfoRepository`，可以在里面自定义接口以实现不同功能

```csharp
    /// <summary>
    /// 自定义仓储层，大多数情况下是不需要自定义的
    /// </summary>
    public interface IUserInfoRepository:IRepository<UserInfo>	// 记得继承父接口
    {
        void MyAdd(UserInfo user);
    }
```

#### 定义自定义仓储实现（可选）——EntityframeworkCore层

在**EntityframeworkCore**层的UserInfos文件夹下创建仓储实现`UserInfoRepository`，可以在里面实现自定义仓储接口以实现不同的功能

无需手动注入`IUserInfoRepository`

```csharp
    /// <summary>
    /// User仓储实现 实现自定义仓储
    /// </summary>
    public class UserInfoRepository : EfCoreRepository<UserModuleDbContext, UserInfo, int>, IUserInfoRepository
    {
        public UserInfoRepository(IDbContextProvider<UserModuleDbContext> dbContextProvider) : base(dbContextProvider)
        {
        }

        public void MyAdd(UserInfo user)
        {
            var xx = DbContext.Database;
        }
    }
```

**注意：若不自定义仓储，需要在DbContext中显示定义`DbSet<Entity>`，不然会注入仓储失败**

#### 配置和使用abp——Host层

在**Host**层的`MyProjectHostModule`配置abp相关功能——swagger、autofac、丢弃Controller自动api

```csharp
// 必须继承 AbpModule
[DependsOn(
    typeof(AbpAutofacModule),       // 依赖autofact模块
    typeof(AbpSwashbuckleModule),      // 依赖Swagger模块
    typeof(UserModuleApplicationModule),      // 依赖用户应用层
    typeof(UserModuleEntityFrameworkCoreModule) // 依赖用户仓储层
)]
public class MyProjectHostModule : AbpModule
{
    // 配置服务
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        ConfigureAutoApiControllers(context.Services, configuration);

        // 配置Swagger
        // swagger：必须
        context.Services.AddAbpSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new() { Title = "MyProject API", Version = "v1" });

            // swagger：必须，关键：确保所有API都被Swagger包含（默认可能过滤动态生成的接口）
            options.DocInclusionPredicate((docName, description) => true);

            // swagger：非必须，包含动态 API 的程序集 XML 注释文件
            var xmlPath = Path.Combine(AppContext.BaseDirectory, "MyProject.User.Application.xml");     // 需要指定DepensOn(typeof(UserModuleApplicationModule))才会把这个xml文件加载到Host项目中
            options.IncludeXmlComments(xmlPath, true);
        });

        // swagger：非必须，添加控制器支持
        context.Services.AddControllers();
    }

    /// <summary>
    /// 自动API
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <remarks>
    /// HTTP Method
    /// ABP在确定服务方法的HTTP Method时使用命名约定:
    /// Get: 如果方法名称以GetList,GetAll或Get开头.
    /// Put: 如果方法名称以Put或Update开头.
    /// Delete: 如果方法名称以Delete或Remove开头.
    /// Post: 如果方法名称以Create,Add,Insert或Post开头.
    /// Patch: 如果方法名称以Patch开头.
    /// 其他情况, Post 为 默认方式.https://docs.abp.io/zh-Hans/abp/latest/API/Auto-API-Controllers
    /// </remarks>
    private void ConfigureAutoApiControllers(IServiceCollection services, IConfiguration configuration)
    {
        // swagger: 必须
        services.Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(UserModuleApplicationModule).Assembly, op => op.RootPath = "user");   // 自动controller，指定api基路由。/api/user/...
        });
        // swagger：非必须 配置 MVC 选项，添加自定义 请求头
        services.AddControllers(options =>
        {
            // 可以再此配置表头
        });
    }

    // 配置中间件
    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            // swagger：必须
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "MyProject API v1");
            });
        }

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

#### 使用abp和autofac——Host层

在**Host**层的`Program`中使用abp和autofact

```csharp
using Volo.Abp;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseAutofac();  // 使用autofac，不然dbcontext注入不成功，导致dbcontext抛出空指针异常。除此还需要在MyProjectHostModule的DepensOn加入typeof(AbpAutofacModule)模块
// 配置ABP
builder.Services.AddApplication<MyProjectHostModule>(); // ABP v8.x初始化方式

var app = builder.Build();

// 无需调用InitializeAbp()，v8.x已集成到UseAbp()中

app.InitializeApplication();
app.Run();
```

### 常见问题

#### abp约定

abp毕竟不是从0到1的项目，可能是从0.5到1的项目，大多数还是要靠约定和范式来开发项目，有了这些，才能更方便更高效进行开发

1. 项目结构按模块划分，每个模块都有单独的应用层、契约层、领域层
2. 与实体相关的文件夹最好使用复数——UserInfos；每层的公共文件夹以Common结尾——DomainCommon、ApplicationCommon；项目命名方式：[项目名称].[模块名称].层——MyProject.User.Application
3. 一定要通过`[DependsOn(typeof(xxxModule))]`**显示声明模块依赖**，可以避开绝大部分的报错
4. 所有的Module文件都要继承`AbpModule`
5. 跨模块交互通过**应用服务接口**或**事件总线**，不直接引用其他模块的领域层
6. **领域层**包括实体、聚合根、领域服务（xxxManager）、领域事件（xxxEvent）、审计字段；仓储接口（IxxxRepository），继承IRepository接口。实现`IDomainService`会自动注册为领域服务（可以访问仓储，xxxAppServicek而已直接用）
7. 应用层包括应用服务实现服务（xxxAppService），继承ApplicationService；在应用服务中可以通过特性`[UnitOfWork]`开启事务
8. **契约层**包括应用应用服务接口（IxxxAppService），继承IApplicationService；各类输入输出Dto
9. **基础设施层**包括数据库上下文(xxxDbContext)，仓储实现（xxxRepository），仓储实现继承于`EfCoreRepository<UserModuleDbContext, UserInfo, int>`
10. 命名规范：领域服务——xxxManager；领域事件——xxxEvent；仓储接口——IxxxRepository；仓储实现——xxxRepository；应用服务接口——IxxxAppService；应用服务实现——xxxAppService；数据库上下文——xxxDbContext；实体类、文件夹都应该要用单数形式（我上面的演示内容不规范）
11. abp支持autofac自动注入Service、Repository，
12. 无需手动配置。如有需求，可以继承`ITransientDependency、IScopedDependency、ISingletonDependency`接口来完成`瞬时、作用域、单例`注入
13. abp自带全局异常过滤器，会处理未捕获的异常，统一返回格式。自定义异常可以继承`AbpException`
14. 权限命名格式：[模块名].[实体名].[操作]——OrderManagement.Orders.Create
15. 使用AutoMapper或者ObjectMapper，而不是一一赋值
16. 无特殊操作，无需创建自定义仓储，可以通过`IRepository<UserInfo, int>`注入相应实体的仓储
17. `IApplicationService` 接口的返回值，会被自动包装为统一格式的json响应体，包含 `success`、`result`、`error` 等字段
18. 分页查询应该继承PagedAndSortedResultRequestDto，分页结果则使用`IPagedResult<T>` 或 `PagedResultDto<T>`
19. ABP 会自动记录关键操作的审计日志，无需手动编写日志代码，包含操作人、操作时间、执行方法、参数、耗时、IP 地址等。可以通过[DisableAuditing]关闭
20. 实体支持多租户（`IMultiTenant` 接口），软删除（`ISoftDelete` 接口）
21. 可以配置丢弃Controller，自动api，支持将方法名自动映射HTTP 方法：Getxxx——Get、Createxxx——Post，Updatexxx——Put，Deletexxx——Delete

#### swagger不显示UserInfoAppService的api接口

当swagger不显示AppService的api接口，swagger提示No operations defined in spec!。我们可以检查这几个地方:

- UserInfoAppService要继承`ApplicationService`基类或实现`IApplicationService`接口
- UserInfoAppService类或方法不能用`[RemoteService(IsEnabled = false)]`修饰
- UserInfoAppService类或方法只能用`public`访问类型修饰
- Host项目，必须配置`AddAbpSwaggerGen`，而且AddAbpSwaggerGen必须要加上`options.DocInclusionPredicate((docName, description) => true);`
- Host项目，必须配置`AbpAspNetCoreMvcOptions`
- Host项目，必须使用中间件`UseSwagger`和`UseSwaggerUI`

完整MyProjectHostModule如下：

```csharp
using MyProject.User.Application;
using MyProject.User.EntityFrameworkCore;   // 引用用户模块的EF层
using Volo.Abp;
using Volo.Abp.AspNetCore;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Modularity;
using Volo.Abp.Swashbuckle;

// 必须继承 AbpModule
[DependsOn(
    typeof(AbpAspNetCoreModule),       // 依赖ABP核心Web模块
    typeof(AbpSwashbuckleModule),      // 依赖Swagger模块
    typeof(UserModuleApplicationModule),      // 依赖用户应用模块
    typeof(UserModuleEntityFrameworkCoreModule)
)]
public class MyProjectHostModule : AbpModule
{
    
    // 配置服务
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        ConfigureAutoApiControllers(context.Services, configuration);

        // 配置Swagger
        // swagger：必须
        context.Services.AddAbpSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new() { Title = "MyProject API", Version = "v1" });

            // swagger：必须，关键：确保所有API都被Swagger包含（默认可能过滤动态生成的接口）
            options.DocInclusionPredicate((docName, description) => true);

            // swagger：非必须，包含动态 API 的程序集 XML 注释文件
            var xmlPath = Path.Combine(AppContext.BaseDirectory, "MyProject.User.Application.xml");     // 需要指定DepensOn(typeof(UserModuleApplicationModule))才会把这个xml文件加载到Host项目中
            options.IncludeXmlComments(xmlPath, true);
        });

        // swagger：非必须，添加控制器支持
        context.Services.AddControllers();
    }

    /// <summary>
    /// 自动API
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <remarks>
    /// HTTP Method
    /// ABP在确定服务方法的HTTP Method时使用命名约定:
    /// Get: 如果方法名称以GetList,GetAll或Get开头.
    /// Put: 如果方法名称以Put或Update开头.
    /// Delete: 如果方法名称以Delete或Remove开头.
    /// Post: 如果方法名称以Create,Add,Insert或Post开头.
    /// Patch: 如果方法名称以Patch开头.
    /// 其他情况, Post 为 默认方式.https://docs.abp.io/zh-Hans/abp/latest/API/Auto-API-Controllers
    /// </remarks>
    private void ConfigureAutoApiControllers(IServiceCollection services, IConfiguration configuration)
    {
        // swagger: 必须
        services.Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(UserModuleApplicationModule).Assembly, op => op.RootPath = "user");   // 自动controller，指定api基路由。/api/user/...
        });
        // swagger：非必须 配置 MVC 选项，添加自定义 请求头
        services.AddControllers(options =>
        {
            // 可以再此配置表头
        });
    }

    // 配置中间件
    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            // swagger：必须
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "MyProject API v1");
            });
        }

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}

```

#### swagger不显示模块的注释信息

**问题**：未指定xml文档文件 

**解决方案**：在Application增加xml文档文件，并手动加载xml文件，如下

1. 先增加xml文件——MyProject.User.Application.xml

​	项目右键-属性-找到输出区域-点击勾选文档文件-点击浏览，没有xml则创建一个空文件（记得选择到bin目录下的debug文件夹，release模式会自动生成到release文件夹，无需再次配置）

![image-20250805105536391](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250805105536391.png)

2. MyProjectHostModule类要依赖UserApplication模块， `DepensOn(typeof(UserModuleApplicationModule))`

3. 在MyProjectHostModule类AddAbpSwaggerGen方法中，手动加载上述的xml文件

```csharp
        // 配置Swagger
        // swagger：必须
        context.Services.AddAbpSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new() { Title = "MyProject API", Version = "v1" });

            // swagger：必须，关键：确保所有API都被Swagger包含（默认可能过滤动态生成的接口）
            options.DocInclusionPredicate((docName, description) => true);

            // swagger：非必须，包含动态 API 的程序集 XML 注释文件
            var xmlPath = Path.Combine(AppContext.BaseDirectory, "MyProject.User.Application.xml");     // 需要指定DepensOn(typeof(UserModuleApplicationModule))才会把这个xml文件加载到Host项目中
            options.IncludeXmlComments(xmlPath, true);
        });
```

#### DBContext注入不成功

手动搭建框架时遇到一个很**基本的问题**：调用仓储Repository时一直报空指针异常，调试才发现原来时DBContext未注入成功（构造方法的断点都进不去）导致内部方法`(await GetDbContextAsync()).Set<TEntity>()`抛出空指针异常（GetDbContextAsync()为null）

![image-20250807114622578](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807114622578.png)

**解决方案**：在Program中使用Autofac，并且Host模块的DepensOn必须引入Autofac

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseAutofac();  // 使用autofac
```

![image-20250807114902913](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807114902913.png)

为什么AppService接口、Repository仓储接口都可以自动注入成功，唯独DbContext无法自动注入？必须得要引入Autofac才可以。而且注入不成功也应该给个合理的错误或者提示吧，直接报空指针异常，我也知道时dbcontext的问题，但就是无从下手。

这个问题卡了两天了，对照其他abp项目愣是看不出问题，我就纳闷了为什么同样的写法，其他项目可以运行，我的却不行。最后花了100块在闲鱼处理，才知道原来是Program没有使用autofac模块

abp的Depenson很重要，有时候代码逻辑看着没问题，程序仍然报错，很大概率是DepensOn的问题。不过我们很难从报错和异常信息中定位是哪个DepensOn出问题，有时候甚至不知道少了哪些模块，修复很困难，对于小白无疑是一个棘手的问题。

如果你在abp项目碰到一个问题，无论怎么调整代码逻辑都不起作用，这时可以多多关注DepensOn，很有可能是DepensOn的问题

#### 报错'The requested service UnitOfWorkInterceptor xxx has not been registered'

<span style="color:red;">The requested service 'Volo.Abp.Castle.DynamicProxy.AbpAsyncDeterminationInterceptor`1[[Volo.Abp.Uow.UnitOfWorkInterceptor, Volo.Abp.Uow, Version=8.3.4.0, Culture=neutral, PublicKeyToken=null]]' has not been registered</span>

**问题**：Program使用了Autofac相关内容，但Host层没有指定依赖AbpAutofacModule模块

**解决方案**：去掉Autofac相关内容或者在Host层的DepensOn加入`typeof(AbpAutofacModule)`即可

![image-20250807114427188](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807114427188.png)

#### 报错'Cannot create a DbSet for xxx because this type is not included'

<span style="color:red;">Cannot create a DbSet for 'UserInfo' because this type is not included in the model for the context</span>

**问题**：未识别到实体

**解决方案**：在DbContext指明实体DbSet或者在OnModelCreating方法中配置实体映射，选其一即可，推荐后者

![image-20250807112137994](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807112137994.png)

#### 报错'using the connection to database 'xxxx''

<span style="color:red;">An error occurred using the connection to database 'xxxx' on server 'xxxxxx'</span>

问题：数据库字符串链接错误

解决方案：调整链接字符串内容或检查ConnectionStringName是否正确。注意ConnectionStringName指的是ConnectionStrings下的UserModule

![image-20250807112440939](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807112440939.png)

#### 报错'None of the constructors found on type xxxDbContext'

<span style="color:red;">None of the constructors found on type 'MyProject.User.EntityFrameworkCore.UserModuleDbContext' can be invoked with the available services and parameters</span>

**问题**：没有指定注入DbContext模块

**解决方案**：在xxxEntityFrameworkCoreModule加入以下代码即可

```csharp
public override void ConfigureServices(ServiceConfigurationContext context)
{
    // 注册模块专属 DbContext
    context.Services.AddAbpDbContext<UserModuleDbContext>(options =>
    {
        // 自动发现领域层实体并映射（无需手动添加 DbSet）
        options.AddDefaultRepositories(includeAllEntities: true);
    });

    // 配置数据库连接（从配置文件读取连接字符串）
    Configure<AbpDbContextOptions>(options =>
    {
        options.Configure<UserModuleDbContext>(dbContextOptions =>
        {
            dbContextOptions.UseSqlServer();
        });
    });
}
```

#### 报错'None of the constructors found on type xxxRepository'

<span style="color:red;">None of the constructors found on type 'MyProject.User.EntityframeworkCore.Users.UserInfoRepository' can be invoked with the available services and parameters</span>

**问题**：EntityFrameworkCore层没有指定依赖数据库模块

**解决方案**：在xxxEntityFrameworkCoreModule的DependsOn加入数据库模块即可，如：typeof(AbpEntityFrameworkCoreSqlServerModule)。根据不同的数据库引入相应数据库模块

![image-20250807113158081](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807113158081.png)

**还有个地方可能会引发这个问题**：在UserModuleDbContext中，如果不显示定义DBSet且没有任何的自定义IxxxRepository，那么就会报错。一句话就是abp识别和自动注入仓储未成功

**解决方案**：在UserModuleDbContext中显示定义DBSet或者加一个自定义的IxxxRepository即可解决问题

#### 报错'None of the constructors found on type 'Castle.Proxies.xxxAppServiceProxy'

<span style="color:red;">None of the constructors found on type 'Castle.Proxies.UserInfoAppServiceProxy' can be invoked with the available services and parameters</span>

问题：Host层没有指定依赖EntityFrameworkCore层

解决方案：在ProjectHostModule的DependsOn加入仓储层即可，如：typeof(UserModuleEntityFrameworkCoreModule)

![image-20250807114255393](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807114255393.png)

#### 报错'Error mapping types'

<span style="color:red;">AutoMapper.AutoMapperMappingException: Error mapping types.</span>

<span style="color:red;">AutoMapper.AutoMapperMappingException: Missing type map configuration or unsupported mapping.</span>

<span style="color:red;">Mapping types:</span>
<span style="color:red;">	      UserInfo -> UserInfoDto</span>

**问题**：缺少Automapper映射、未配置对象映射、未依赖AutoMapper模块

解决方案：应用层添加Automapper映射文件、应用层配置对象映射、应用层依赖AutoMapper模块

```csharp
    internal class UserModuleApplicationAutoMapperProfile:Profile
    {
        // // 构造Automapper映射
        public UserModuleApplicationAutoMapperProfile()
        {
            CreateMap<UserInfo, UserInfoDto>();
        }
    }

[DependsOn(
    typeof(AbpAutoMapperModule),    // 依赖automapper模块，否则automapper不生效
    typeof(UserModuleDomainModule),
    typeof(AbpDddApplicationModule)
)]
public class UserModuleApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 自动扫描配置对象映射
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<UserModuleApplicationModule>();
        });
    }
}
```

#### 报错'The requested service IApplicationBuilder xxx has not been registered'

<span style="color:red;">The requested service 'Volo.Abp.DependencyInjection.ObjectAccessor`1[[Microsoft.AspNetCore.Builder.IApplicationBuilder, Microsoft.AspNetCore.Http.Abstractions, Version=8.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60]]' has not been registered</span>

**问题**：Program中初始化abp应用报错——`app.InitializeApplication();`

**解决方案**：Host层的DepensOn必须依赖`AbpAspNetCoreModule`模块。也可以依赖`AbpSwashbuckleModule`、`AbpAspNetCoreMvcModule`，因为这些最终都会依赖`AbpAspNetCoreModule`

![image-20250807144111099](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2025/image-20250807144111099.png)

#### DisableAuditing与DisableValidation

[DisableAuditing, DisableValidation] 常用于修饰类或方法，用于禁用ABP自带的审计日志功能和自动数据验证功能

ABP 框架默认会对应用服务方法进行审计日志记录，包括调用者、调用时间、参数等信息

ABP 会自动对应用服务方法的输入参数进行数据验证（基于 DataAnnotations 或自定义验证器）

#### domain公共方法应该放在哪里？

对于多个领域（Domain）都需要共享的公共类或方法（如ADomain和BDomain都会用到某个方法C），**建议优先放在 Domain 层的 Common 文件夹中**，而非 **Shared** 层

Shared层，一般用于存放**跨层共享的基础设施代码**（如通用工具类、常量、枚举、扩展方法等），这些代码**不依赖于具体业务领域**，具有更广泛的通用性（例如：字符串工具、日期处理、权限常量等）
