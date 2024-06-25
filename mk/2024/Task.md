[TOC]

#### 说明

无聊整理一下线程相关操作——Task篇

FromAI：表明例子或者知识点由AI提供，这AI真是写作一大能手，有些晦涩难懂的例子或者不达预期的例子，很轻松便能找到突破口，帮助理解

对线程有兴趣可参考往期文章：

[c#多线程相关整理02——ThreadPool篇 (logerlink.github.io)](https://logerlink.github.io/page/2024/ThreadPool.html)

[c#多线程相关整理01——Thread篇 (logerlink.github.io)](https://logerlink.github.io/page/2024/Thread.html)

本文内容参考但不局限于以下文章，谢谢分享！

[C# 多线程七 任务Task的简单理解与运用一_c# task-CSDN博客](https://blog.csdn.net/SmillCool/article/details/127266096)

[C# 多线程八 任务Task的简单理解与运用二_task asyncstate-CSDN博客](https://blog.csdn.net/SmillCool/article/details/127281963)

[C# Task详解 - 漫思 - 博客园 (cnblogs.com)](https://www.cnblogs.com/sexintercourse/p/17761547.html)

#### Task相关

在了解Task之前我们先搞清楚什么是同步操作？什么是异步操作？为什么要使用异步？

##### 同步和异步

同步和异步主要用于修饰方法。

同步操作是指线程在执行某个操作（方法）时，**必须等待**操作（方法）完成才能继续往下执行。在操作完成之间调用线程**处于阻塞**状态。

异步操作是指线程在执行某个操作（方法）时，**无需等待**操作（方法）完成，而是立即返回并继续往下执行代码。在异步操作中，异步和主线程是并发进行的，在操作完成之间并**不会阻塞**。不过要注意若调用者线程在异步操作完成之前结束，异步操作大概率也无法继续往下执行了

如下图

![image-20240607151226677](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240607151226677.png)

更多请参考官方解释：[使用 Async 和 Await 的任务异步编程 (TAP) 模型 - C# | Microsoft Learn](https://learn.microsoft.com/zh-cn/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model#BKMK_WhatHappensUnderstandinganAsyncMethod)

##### 为什么要使用异步

异步的好处在于**非阻塞**（调用线程不会暂停执行去等待子线程完成）。一个字那就是："快"，异步操作可以提高程序的整体性能和相应能力，特别适用于处理I/O操作、网络请求、长时间运行的计算、数据库查询、需要并发执行的任务。因此我们可以把一些不需要立即使用结果、较耗时的任务设为异步执行

##### 代码演示同步和异步

```csharp
        private string GetNow()
        {
            return DateTime.Now.ToString("HH:mm:ss");
        }

        [Test]
        public void TestSync()
        {
            Console.WriteLine("TestSync 同步开始" + GetNow());
            Thread.Sleep(2000);     // 同步
            Console.WriteLine("TestSync 同步结束" + GetNow());
        }

        [Test]
        public void TestAsync()
        {
            Console.WriteLine("TestAsync 异步开始" + GetNow());
            // 异步操作
            var task = Task.Run(() =>
            {
                Thread.Sleep(2000);
            });
            Console.WriteLine("TestAsync 异步结束" + GetNow());
        }
```

观察开始和结束时间，我们可以发现TestAsync方法并没有等待异步操作完成，便直接继续往下执行了

![image-20240607152536451](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240607152536451.png)

讲完同步和异步，那怎么去创建一个异步操作任务呢？这就是我们接下来要讲的Task了

##### 什么是Task

`Task` 是一种用于表示异步操作的类型，它是 .NET Framework 4.0 引入的。`Task` 类型允许你以异步方式执行代码，而**无需显式创建和管理线程**。这使得编写并发和异步代码变得更加简单和直观。

简单来说便是，我们可以使用`Task`创建一个异步操作任务，并对该操作进行管理

##### 关于Task和线程

任务Task并不是线程，但是Task的执行需要线程池中的线程或者独立线程来完成。任务Task是架构在线程之上的，也就是说**任务最终还是要抛给线程去执行**。

任务Task跟线程**不是一对一**的关系，比如开10个任务并不是说会开10个线程。这一点任务有点类似线程池，但是任务相比线程池有很小的开销和精确的控制。

##### 为什么出现Task

为什么会出现Task呢？开头讲到现在，就一个核心：开启一个线程去执行某些操作，但不阻塞调用线程。那直接开线程不是也能实现异步操作吗？线程、线程池都可以完成这个操作啊，为什么还要引入一个新东西Task。~~我又要多学一点知识了，啊啊啊~~

其实不然，我们上一篇说到，ThreadPool更优于直接使用Thread，但**ThreadPool仍有些不足**：

- ThreadPool 不支持线程的取消、完成、失败通知等交互性操作；
- ThreadPool 不支持线程执行的先后顺序；
- ThreadPool 无法直接获取线程执行结果
- Task可以将子任务的异常传播到父任务，捕获异常更简单更直观
- Task使用Cancellation取消任务，操作更简单

**Task拥有线程池的优点，同时也解决了使用线程池不易控制的弊端**。所以我们才引用Task类型和异步编程模型（如 `async/await`）来实现异步操作，它们能够提供更好的资源管理和错误处理机制，方便对线程进程调度和获取线程的执行结果。

##### 异步编程模型 async/await示例

```csharp
        /// <summary>
        /// 等待异步方法，无返回值
        /// </summary>
        /// <returns></returns>
        public async Task AwaitAsync()
        {
            var result = await AwaitResultAsync();
            Console.WriteLine($"结果：{result} 同步结束" + GetNow());
        }
        /// <summary>
        /// 等待异步方法，有返回值
        /// </summary>
        /// <returns></returns>
        public async Task<bool> AwaitResultAsync()
        {
            await Task.Delay(1000); // 等待1s
            return true;
        }
```

- async、await一般都是成对出现的
- 异步方法无返回值，返回类型可返回Task类型或者void，不推荐返回void。无法等待void
- 异步方法有返回值，返回类型要返回`Task<T>`，T为返回值的具体类型
- 异步方法的方法名建议加上Async后缀，方便区分同步和异步方法，对开发和维护提供极大方便

![image-20240607163020781](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240607163020781.png)

#### Task核心使用

常用，多了解

##### Task创建与开始

创建任务一般有两种方式`new Task()`和`Task.Run`。`Task.Run`会创建并立即开始执行任务，`new Task()`只会创建任务，直到调用`Start()`才开始执行，更推荐使用`Task.Run`或者`Task.Factory.StartNew`

当你使用`Task.Run`时，它内部实际上使用了`Task.Factory.StartNew`，并且默认地为你处理了异步执行的细节

```csharp
        /// <summary>
        /// Task.Run创建并开始执行任务
        /// </summary>
        [Test]
        public void TestCreateAsync1()
        {
            Console.WriteLine("Start" + GetNow());

            var task1 = Task.Run(() => {    // Task.Run创建并开始执行任务
                Console.WriteLine($"开始执行异步操作，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                Thread.Sleep(2000);
                Console.WriteLine($"异步操作执行完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            });
            var task2 = new Task(() => AsyncAction());      //  无参可以写成 Task.Run(AsyncAction)
            Console.WriteLine($"task1：{task1.Status}，task2：{task2.Status}");

            Console.WriteLine($"所有执行结束，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }

        /// <summary>
        /// new Task创建任务
        /// </summary>
        [Test]
        public void TestCreateAsync2()
        {
            Console.WriteLine("Start" + GetNow());

            var task1 = new Task(() =>  // new创建的任务，需要主动调用Start()才会执行
            {
                Console.WriteLine($"开始执行异步操作，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                Thread.Sleep(2000);
                Console.WriteLine($"异步操作执行完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            });
            var task2 = new Task(() => AsyncAction());

            task1.Start();  
            Console.WriteLine($"task1：{task1.Status}，task2：{task2.Status}");

            Console.WriteLine($"所有执行结束，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }

        /// <summary>
        /// 异步操作
        /// </summary>
        /// <returns></returns>
        private bool AsyncAction(string name = "")
        {
            Console.WriteLine($"{name}，开始执行异步操作，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            Thread.Sleep(2000);
            Console.WriteLine($"{name}，异步操作执行完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            return true;
        }
```

![image-20240607155954902](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240607155954902.png)

**值得注意**：如果委托是一个异步方法，如`async () => { await ... }`，请一定要使用`Task.Run(async () => { await ... })`，不要使用new Task。new Task无法按预期等待内部的异步方法执行完成

具体原因可参考（FromAI）：

当你尝试在`new Task`的构造函数中使用`async` lambda表达式时，你实际上是将一个异步方法包装在一个同步的`Action`委托中。这种情况下，`await`关键字的行为可能不会按预期工作，因为它依赖于上下文是否能够正确处理异步等待。如果没有适当的上下文来处理异步等待，`await`可能会在内部立即返回，导致任务看起来没有等待

`Task.Run`可以接受一个`Action`或`Func<Task>`作为参数。当你传递一个`async` lambda表达式给`Task.Run`时，它实际上是在创建一个异步任务。`Task.Run`内部会处理异步方法的启动和等待，确保异步操作能够正确地执行。

`Task.Run`内部使用了线程池来管理线程，这意味着异步方法可以在一个线程池线程上执行，而不会阻塞调用者的线程。当异步方法中的`await`表达式被执行时，它会释放线程池线程，直到异步操作完成，这是异步编程的正确行为。

```csharp
        /// <summary>
        /// 创建异步任务
        /// </summary>
        [Test]
        public async Task TestCreateAsync3()
        {
            Console.WriteLine("Start，" + GetNow());

            var task1 = new Task(async () =>
            {
                await Task.Delay(5000);
                Console.WriteLine("task1 执行完成");    
            });
            var task2 = Task.Run(async () =>
            {
                await Task.Delay(1000);
                Console.WriteLine("task2 执行完成");
            });
            var task3 = Task.Factory.StartNew(async () =>
            {
                await Task.Delay(1000);
                Console.WriteLine("task3 执行完成");
            });

            task1.Start();
            await task1;    // 异步等待
            task1.Wait();   // 同步等待
            // task1 这两个等待并没有按预期等待5s，而且task1已执行完成。但是内部还是会执行的，只要主线程留够时间还是能执行完成的，

            await task2;    // 异步等待，按预期等待1s
            await task3;    // 异步等待，按预期等待1s
            Console.WriteLine($"task1：{task1.Status}，task2：{task2.Status}，task3：{task3.Status}，" + GetNow());

            // await Task.Delay(5000);  // 单元测试中。再等待5s，主线程留够时间执行任务
            Console.WriteLine($"所有执行结束，" + GetNow());
        }
```

如图，我们分别用不同方式创建任务去执行异步方法，`Task.Run`和`Task.Factory.StartNew`均按预期执行，`new Task`创建的任务并没有等待内部的异步方法执行成功，自己先成功了，未按预期执行

![image-20240620164557584](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240620164557584.png)

##### Task返回值

异步方法签名的返回值有以下三种：

`Task<T>`：如果调用方法想通过调用异步方法获取一个T类型的返回值，那么签名必须为`Task<T>`

`Task`：如果调用方法不想通过异步方法获取一个值，仅仅想追踪异步方法的执行状态，那么我们可以设置异步方法签名的返回值为Task;

`void`：如果调用方法仅仅只是调用一下异步方法，不和异步方法做其他交互，我们可以设置异步方法签名的返回值为void，这种形式也叫做“调用并忘记”。

创建一个任务Task，返回值类型一般为`Task`、`Task<T>`。

若返回值为`Task<T>`，我们可以使用关键词`await`、`.Result`、`.GetAwaiter().GetResult()`获取任务的执行结果（await关键词是异步执行，其他都是同步执行的）

##### 等待任务完成

我们可以使用`Wait()`或者`await`关键词等待异步任务完成，不过这两种方式实现有些不同，更推荐使用`await`关键词

- await：异步等待，通常与`async`关键词一起使用。await会暂停当前方法的执行，**不会阻塞当前线程**，直到等待任务完成。在等待期间，控制权会返回给调用者（调用方法），允许在等待任务完成时执行其他任务，有效避免了线程阻塞。这通常用于等待动画、模拟实时行为或实现超时等场景
- Wait：同步等待，Wait()**会阻塞当前线程**，直到任务执行完成，可能会导致死锁

```csharp
        /// <summary>
        /// Wait()等待任务执行完成
        /// </summary>
        [Test]
        public void TestWait()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            var task1 = Task.Run(() => AsyncAction("task1"));
            task1.Wait();

            Console.WriteLine($"等待任务完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }

        /// <summary>
        /// await等待任务完成
        /// </summary>
        [Test]
        public async Task TestWaitAsync()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            var task1 = Task.Run(() => AsyncAction("task1"));
            await task1;

            Console.WriteLine($"等待任务完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }
```

我们可以发现，`await`、`Wait()`都可以实现等待任务执行完成。但比较好奇的是，为何`await`关键词，执行异步前后输出的线程Id不一致？是因为等待任务完成的过程中，主程序线程（即调用线程）可能会被释放，允许其他任务执行。（查了很久都没有头绪，这个说法是有很大可能的）

![image-20240612100903259](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612100903259.png)

##### await与Wait

`await`相比与`Wait()`的优势

- 更自然、更直观
- 异常处理：await允许使用标准的 `try/catch` 语句处理异步操作中可能发生的异常.
- 结果处理：await可以直接获取异步操作的结果，而无需调用 `Result` 属性。避免死锁
- 非阻塞性：`await` 关键字等待异步操作时，调用线程不会被阻塞，调用线程可以继续执行其他任务。适用于UI动画
- 更好的资源利用：`await` 关键字允许开发者在等待异步操作完成时释放系统资源，如线程和内存。适用于处理大量API请求
- 更好的兼容性

###### await 异常处理演示

```csharp
        /// <summary>
        /// await与wait捕获异常对比
        /// </summary>
        [Test]
        public async Task TestAwaitExceptionAsync()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            try
            {
                await Task.Run(ActionException);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"await 捕获异常：{ex.Message}.是否存在内部异常：{ex.InnerException != null}");
            }

            try
            {
                Task.Run(ActionException).Wait();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Wait 捕获异常：{ex.Message}.是否存在内部异常：{ex.InnerException != null}");
            }

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            void ActionException()
            {
                Thread.Sleep(2000);
                throw new Exception("Error：报错了！");
            }
        }
```

我们可以发现，await和Wait都可以通过try-catch成功捕获异常，但是await捕获的异常会更直观一点，不会像Wait在原有异常上再包上一层异常

![image-20240612105616678](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612105616678.png)

###### await 结果处理演示

```csharp
        /// <summary>
        /// await与wait获取异步结果 对比
        /// </summary>
        [Test]
        public async Task TestAwaitResultAsync()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            var res = await Task.Run(ActionResult);             // 异步获取异步结果
            Console.WriteLine($"await 获取异步方法结果：{res}");

            var resWait = Task.Run(ActionResult).GetAwaiter().GetResult();        // 同步获取异步结果
            Console.WriteLine($"Wait 获取异步方法结果：{resWait}");

            var resWait2 = Task.Run(ActionResult).Result;        // 同步获取异步结果
            Console.WriteLine($"Wait 获取异步方法结果：{resWait2}");

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            string ActionResult()
            {
                Thread.Sleep(2000);
                return "Hello World";
            }
        }
```

同步获取异步结果时，使用`.Result`即可，也可以使用`.GetAwaiter().GetResult()`，这两种都是同步的，会阻塞调用线程

![image-20240612110718913](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612110718913.png)

###### await 非阻塞性演示

MainWindow.xaml

```csharp
<Window x:Class="TestLoop.Client.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:TestLoop.Client"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <TextBlock Name="TB_Status" Height="65" TextAlignment="Left" Margin="162,50,418,0" VerticalAlignment="Top"/>
        <Button Content="同步执行" Width="100" Height="30" Margin="400,50,300,355" Click="Button_Click"></Button>
        <Button Content="异步执行" Width="100" Height="30" Margin="400,85,300,320" Click="Button_ClickAsync"></Button>
    </Grid>
</Window>

```

MainWindow.xaml.cs

```csharp
using System.Windows;

namespace TestLoop.Client
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            TB_Status.Text = "Wait，运行中...";
            var task = Task.Delay(2000);
            task.Wait();
            TB_Status.Text = "Wait，运行结束";
        }

        private async void Button_ClickAsync(object sender, RoutedEventArgs e)
        {
            TB_Status.Text = "Await，运行中...";
            var task = Task.Delay(2000);
            await task;
            TB_Status.Text = "Await，运行结束";
        }
    }
}
```

非阻塞性用WPF来演示效果会明显一点。如下图，当我们点击同步执行按钮时，页面不会输出"Wait，运行中..."，此时**UI是卡住**的。当点击异步执行按钮时，页面按预期输出"Await，运行中..."，并且**UI不会卡住**（此时我们可以去做一下Loading提示动画）

![同步](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/%E5%90%8C%E6%AD%A5.gif)

###### await API接口演示

await能更好的利用资源，适用于处理大量API请求。

```csharp
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }
        private string GetNow()
        {
            return DateTime.Now.ToString("HH:mm:ss");
        }

        /// <summary>
        /// 大量请求某个接口
        /// </summary>
        /// <param name="action">接口</param>
        /// <param name="name">名称</param>
        /// <returns></returns>
        [HttpGet("test")]
        public string GetTextTest([FromQuery] string action, [FromQuery] string name)
        {
            var stop = new Stopwatch();
            stop.Start();
            var contents = "";
            var tasks = new List<Task>();
            for (int i = 0; i < 100; i++)
            {
                var task = Task.Run(async () => {
                    using (var client = new HttpClient())
                    {
                        var content = await client.GetStringAsync($"http://localhost:5107/Test/{action}?name={name}");   //改为本机
                        content = content + $" ThreadId：{Environment.CurrentManagedThreadId}  ====  ";
                        contents += content;
                        Console.WriteLine(content);
                    }
                });
                tasks.Add(task);
            }
            Task.WaitAll(tasks.ToArray());
            stop.Stop();
            contents += $"\n总耗时：{stop.ElapsedMilliseconds} ms";
            Console.WriteLine($"总耗时：{stop.ElapsedMilliseconds} ms");
            return contents;
        }
        /// <summary>
        /// 模拟同步接口
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpGet("hello")]
        public string GetText([FromQuery]string name = "Tom")
        {
            _logger.LogInformation($"{name}，开始。" + GetNow());
            Task.Delay(5000).Wait();
            return $"Hello {name}。" + GetNow();
        }
        /// <summary>
        /// 模拟异步接口
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpGet("helloAsync")]
        public async Task<string> GetTextAsync([FromQuery] string name = "Jerry")
        {
            _logger.LogInformation($"{name}，开始。" + GetNow());
            await Task.Delay(5000);
            return $"Hello {name}。" + GetNow();
        }
    }
```

如下图，在某段时间大量请求某个接口，观察接口响应情况。我们可以发现，使用异步要不使用同步总耗时短，效率更高。所以在接口中调用异步方法时，更推荐使用异步等待(await)

![image-20240612145510452](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612145510452.png)



##### 等待任务完成2

除了使用await关键词，我们还可以使用这些方法等待任务完成

- task.Wait(time) 等待任务完成，若超过等待时间(ms)则不再继续等待
- task.Result 同步获取异步方法（void返回值类型的方法不能使用.Result）
- task.GetAwaiter().GetResult() 同步获取异步方法（若是void返回值类型的方法，不可赋值）
- Task.WaitAll() 等待所有任务执行完成
- Task.WaitAny() 等待其中一个任务执行完成
- Task.WhenAll() 当所有任务执行完成时，也是等待的一种
- Task.WhenAny() 当其中一个任务执行完成，也是等待的一种
- task1.ContinueWith(Action) Action等待task1执行完成后才开始执行Action。注意这里建议传入委托，而不是一个Task任务

###### Wait(time)

演示一下：Wait(time)、.Result、.GetAwaiter().GetResult() 

```csharp
        /// <summary>
        /// Wait等待异步方法 超时
        /// </summary>
        [Test]
        public void TestWaitTime()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            var task = Task.Run(ActionResult);
            task.Wait(500);
            Console.WriteLine($"task等待完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            Task.Run(ActionResult).GetAwaiter().GetResult();    // 同步等待，但不可赋值
            // var task1 = Task.Run(ActionResult).Result;       // void返回值类型的方法不能使用.Result

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            void ActionResult()
            {
                Thread.Sleep(2000);
            }
        }
```

![image-20240612153419930](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612153419930.png)

###### WaitAll和WaitAny

`WaitAny`会返回一个下标，表明是第几个任务完成了。`WaitAll`无返回值（void）

```csharp
        /// <summary>
        /// WaitAll和WaitAny 等待异步方法
        /// </summary>
        [Test]
        public void TestWaitAllAndWaitAny()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            var task1 = Task.Run(ActionResult);
            var task2 = Task.Run(LongActionResult);

            var finishIndex = Task.WaitAny(task2, task1);
            // WaitAny、WaitAll 接收数组类型
            // Task.WaitAny(new List<Task>() { task1, task2 }.ToArray());
            Console.WriteLine($"其中一个任务等待完成，ThreadId：{Environment.CurrentManagedThreadId}，已完成的任务下标：{finishIndex}，" + GetNow());

            Task.WaitAll(task1, task2);

            Console.WriteLine($"所有任务等待完成，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            void ActionResult()
            {
                Thread.Sleep(2000); // 等待2s
            }

            void LongActionResult()
            {
                Thread.Sleep(5000); // 等待5s
            }
        }
```

![image-20240612155244914](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240612155244914.png)

###### WhenAll和WhenAny

WhenAll和WhenAny都是返回一个新的任务，相当于这两个方法属于**异步方法**，我们需要手动等待，不然不会等待指定任务完成的

WhenAny、WhenAll指定泛型或者task1、task2的异步方法的返回值类型是相同的，才可以通过`.Result`获取任务结果，为了按预期执行，建议手动指定泛型

```csharp
        /// <summary>
        /// WhenAll和WhenAny 等待异步方法
        /// </summary>
        [Test]
        public async Task TestWhenAllAndWhenAny()
        {
            Console.WriteLine($"Start，" + GetNow());

            var task1 = Task.Run(ActionResult);
            var task2 = Task.Run(LongActionResult);
            var task3 = Task.Run(LongLongActionResult);

            // WhenAny、WhenAll加上泛型或者task1、task2的异步方法的返回值类型是相同的，才可以通过.Result 获取任务结果
            // 为了按预期执行，建议手动加上泛型
            var finishTask = await Task.WhenAny<string>(task1, task2);
            Console.WriteLine($"其中一个任务等待完成，已完成的任务输出：{finishTask.Result}，" + GetNow());

            var twoTasks = await Task.WhenAll(task1, task2);

            Console.WriteLine($"所有任务等待完成，已完成的任务输出：{string.Join(",", twoTasks)}，" + GetNow());

            // var allTasks = await Task.WhenAll(task1, task2, task3);     // 报错，task3 返回值类型与task1、task2不一致

            Console.WriteLine($"End，" + GetNow());

            string ActionResult()
            {
                Thread.Sleep(2000); // 等待2s
                return "Hello 2s";
            }

            string LongActionResult()
            {
                Thread.Sleep(5000); // 等待5s
                return "Hello 5s";
            }

            object LongLongActionResult()
            {
                Thread.Sleep(8000); // 等待8s
                return "Hello 8s";
            }
        }
```

![image-20240624173242529](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624173242529.png)

###### ContinueWith

ContinueWith常用来等待某个任务执行完成再执行下一个任务，但由于不常用，所以写法上千奇百怪。以下列举了一些<span style="color:red">错误写法</span>，请大家规避，不然没按预期执行，找bug的时候真的心力交瘁

```csharp
        string ActionResult(string input = "")
        {
            Thread.Sleep(2000); // 等待2s
            Console.WriteLine($"ActionResult 接收参数：{input}，执行完成." + GetNow());
            return "Hello 2s";
        }

        string LongActionResult(string input = "")
        {
            Thread.Sleep(4000); // 等待4s
            Console.WriteLine($"LongActionResult 接收参数：{input}， 执行完成." + GetNow());
            return "Hello 4s";
        }

        object LongLongActionResult(string input = "")
        {
            Thread.Sleep(6000); // 等待6s
            Console.WriteLine($"LongLongActionResult 接收参数：{input}， 执行完成." + GetNow());
            return "Hello 6s";
        }

        void VoidActionResult()
        {
            Thread.Sleep(3000); // 等待3s
            Console.WriteLine($"VoidActionResult 执行完成." + GetNow());
        }


        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，错误演示
        /// </summary>
        [Test]
        public async Task TestContinueWithError1Async()
        {
            Console.WriteLine($"Start，" + GetNow());

            Console.WriteLine("错误演示1：");
            var task1 = Task.Run(() => ActionResult());
            var task2 = Task.Run(() => LongActionResult());
            var task3 = Task.Run(() => VoidActionResult());
            var resultVoid = task1.ContinueWith(_ => task2)
                .ContinueWith(_ => task3);
            await resultVoid;
            // 错误1：任务没有按预期执行完成，所有任务同时执行，但有些任务未执行完成。

            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，错误演示
        /// </summary>
        [Test]
        public async Task TestContinueWithError2Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("错误演示2：");
            var task1 = Task.Run(() => ActionResult());
            var task2 = Task.Run(() => LongActionResult());
            var task3 = Task.Run(() => VoidActionResult());
            var task4 = Task.Run(() => LongLongActionResult());
            var resultVoid = task1.ContinueWith(_ => task2)
                .ContinueWith(_ => task3)
                .ContinueWith(_ => task4);
            await (await resultVoid);   // resultVoid类型为Task<Task>  所以加两次等待看看能不能正常执行完成

            // 错误2：任务没有按预期执行完成，所有任务同时执行，但任务执行顺序错乱，甚至有些任务也没有执行完成，主线程便结束了，说明两次等待是无法保证任务完成的。
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，错误演示
        /// </summary>
        [Test]
        public async Task TestContinueWithError3Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("错误演示3：");
            var task1 = new Task(() => ActionResult());
            var task2 = new Task(() => LongActionResult());
            var task3 = new Task(() => VoidActionResult());
            var task4 = new Task(() => LongLongActionResult());
            task1.Start();
            var resultVoid = task1.ContinueWith(_ => task2.Start())
                .ContinueWith(_ => task3.Start())
                .ContinueWith(_ => task4.Start());
            await resultVoid;

            // 错误3：任务没有按预期执行完成，创建任务后，理论按照ContinueWith顺序执行，但任务执行顺序错乱，甚至有些任务也没有执行完成，主线程便结束了
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，错误演示
        /// </summary>
        [Test]
        public async Task TestContinueWithError4Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("错误演示4：");
            var task1 = new Task(() => ActionResult());
            var task2 = new Task(() => LongActionResult());
            var task3 = new Task(() => VoidActionResult());
            var task4 = new Task(() => LongLongActionResult());
            task1.Start();
            var resultVoid = task1.ContinueWith(_ => { task2.Start(); return task2; })
                .ContinueWith(_ => { task3.Start(); return task3; })
                .ContinueWith(_ => { task4.Start(); return task4; });
            await (await resultVoid);   // resultVoid类型为Task<Task>  所以加两次等待看看能不能正常执行完成

            // 错误4：任务没有按预期执行完成，创建任务后，理论按照ContinueWith顺序执行，但任务执行顺序错乱，甚至有些任务也没有执行完成，主线程便结束了，说明两次等待是无法保证任务完成的。
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，错误演示
        /// </summary>
        [Test]
        public async Task TestContinueWithError5Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("错误演示5：");
            var task1 = new Task(() => ActionResult());
            var task2 = new Task(() => LongActionResult());
            var task3 = new Task(() => VoidActionResult());
            var task4 = new Task(() => LongLongActionResult());
            var resultVoid = task1.ContinueWith(_ => task2)
                .ContinueWith(_ => task3)
                .ContinueWith(_ => task4);
            await resultVoid;

            // 错误5：任务没有按预期执行完成，创建任务后，这四个任务都没有调用Start()，所以这几个任务都不会被执行，主线程会一直等待
            Console.WriteLine($"End，" + GetNow());
        }
```

执行结果如下图，所有程序都没有按 ContinueWith 预期执行——任务执行顺序错乱，甚至有些任务没有执行完成

![image-20240614113132563](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240614113132563.png)

对此整理了一下使用`ContinueWith `要了解这几点：

- 多个任务会根据 ContinueWith 顺序执行，并**最终返回最后一个ContinueWith **的任务
- 第一个任务(task1)一定要**记得开启任务**（task1.Start() 或者 使用Task.Run）,不然程序会一直等待的
- ContinueWith 的入参是一个委托，直接**传入方法或者匿名委托**即可，不需要用Task包一层
- 如果一定非得要把Task当成委托传入 ContinueWith 中（其实没这个必要），一定要在 ContinueWith 中**同步等待任务完成**（使用Wait()，不要使用await关键词），否则可能会出现任务执行顺序错乱，甚至有些任务没有执行完成。
- 与其强行把Task当委托传入 ContinueWith中，不如直接使用await关键词一个一个等待Task任务，更简洁明了
- ContinueWith 可以使用`task.Result`获取**上一个任务**的返回结果，若上一个任务无返回值（void），则不允许获取结果。无法直接跨任务获取任务结果（如获取上上一个任务的结果），更不能获取下一个任务的结果...

```csharp
        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，正确演示
        /// </summary>
        [Test]
        public async Task TestContinueWith1Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("正确演示1：");

            // 多个任务会根据 ContinueWith 顺序执行，并最终返回最后一个 ContinueWith 的任务
            var resultTask = Task.Run(() => ActionResult())
                    .ContinueWith(_ => LongActionResult())
                    .ContinueWith(_ => VoidActionResult())
                    .ContinueWith(_ => LongLongActionResult());
            await resultTask;

            Console.WriteLine($"End，" + GetNow());
        }
        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，正确演示
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestContinueWith2Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("正确演示2：");

            {
                var task1 = new Task(() => ActionResult());
                var task2 = new Task(() => LongActionResult());
                var task3 = new Task(() => VoidActionResult());
                var task4 = new Task(() => LongLongActionResult());

                // 如果一定非得要把Task当委托传入 ContinueWith中（其实没这个必要），一定要在 ContinueWith中 同步等待任务完成。
                task1.Start();
                var resultTask = task1
                        .ContinueWith(_ => { task2.Start(); task2.Wait(); })     // 注意不能使用await 等待
                        .ContinueWith(_ => { task3.Start(); task3.Wait(); })
                        .ContinueWith(_ => { task4.Start(); task4.Wait(); });
                await resultTask;
            }

            Console.WriteLine($"End，" + GetNow());
        }
        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，正确演示
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestContinueWith3Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("正确演示3：");

            var task1 = new Task(() => ActionResult());
            var task2 = new Task(() => LongActionResult());
            var task3 = new Task(() => VoidActionResult());
            var task4 = new Task(() => LongLongActionResult());

            //与其把Task当委托传入 ContinueWith中  不如直接使用await关键词一个一个等待Task任务，更简洁明了
            task1.Start();
            await task1;

            task2.Start();
            await task2;

            task3.Start();
            await task3;

            task4.Start();
            await task4;

            Console.WriteLine($"End，" + GetNow());
        }
        /// <summary>
        /// ContinueWith 等待任务一完成，再执行任务二，正确演示
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestContinueWith4Async()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("正确演示4：");

            // ContinueWith 可以获取上一个任务的返回结果
            var resultTask = Task.Run(() => ActionResult())
                    .ContinueWith(inputResult => LongActionResult(inputResult.Result))
                    .ContinueWith(inputResult => LongLongActionResult(inputResult.Result))
                    .ContinueWith(_ => VoidActionResult())
                    ;
            await resultTask;

            Console.WriteLine($"End，" + GetNow());
        }
```

如下图，这四种方式都可以实现等待任务一完成，再执行任务二的效果

![image-20240614175643362](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240614175643362.png)

##### 任务等待

在Task中，可以使用`Task.Delay`暂停一个`Task`的执行，程序暂停执行x毫秒，然后继续执行下一行代码。`Task.Delay`与`Thread.Sleep`虽然都有暂停执行的意思，但这两种不同，`Thread.Sleep`会阻塞当前线程，而`Task.Delay`则不会。在异步编程中，推荐使用`Task.Delay`暂停等待，可以避免阻塞线程。

```csharp
        /// <summary>
        /// 非阻塞异步等待
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestDelayAsync()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            await Task.Delay(2000);    // 非阻塞异步等待，等待期间，该线程可以执行其他操作。
            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }

        /// <summary>
        /// 阻塞等待
        /// </summary>
        /// <returns></returns>
        [Test]
        public void TestSleep()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            Thread.Sleep(2000);     // 阻塞等待，等待期间，该线程无法执行其他操作
            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }
```

![image-20240617110508281](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240617110508281.png)

##### 任务暂停、继续、取消

C#并没有直接的方法来暂停一个正在运行的任务，我们需要借助`ManualResetEvent`、`CancellationToken`来完成任务的暂停、继续与取消，使用CancellationToken取消任务要记得捕获异常

**CancellationTokenSource**用于取消异步操作或长时间运行的任务，它提供了一个取消令牌（**CancellationToken**）可以将该令牌传递给需要取消的操作，当调用CancellationTokenSource的Cancel方法时，与该源关联的所有取消令牌将被取消，从而通知相关的操作停止执行

```csharp
        /// <summary>
        /// 任务暂停和继续
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestWaitOneAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            // 建议换成ManualResetEventSlim，轻量、适合高并发场景
            var manualReset = new ManualResetEvent(false);   // 初始设置成未设置状态
            var task1 = Task.Run(async () =>
            {
                Console.WriteLine("task1，开始执行，" + GetNow());
                await Task.Delay(2000);
                Console.WriteLine("task1，等待信号，" + GetNow());
                manualReset.WaitOne();  // 等待信号。WaitOne(3000) 等待3s，若超过等待时间，还没有信号则继续往下执行
                Console.WriteLine("task1，收到信号，继续执行，" + GetNow());
                Console.WriteLine("task1，结束执行，" + GetNow());
            });

            await Task.Delay(5000);
            Console.WriteLine("主线程，设置为已设置状态，" + GetNow());
            manualReset.Set();      //设置为已设置状态。发出信号，等待的线程将继续执行
            await task1;
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// 任务取消
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestCancelAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            var cts = new CancellationTokenSource();
            var task1 = Task.Run(() => ActionAsync(cts.Token));     // 使用token，以便取消任务

            await Task.Delay(2000);
            Console.WriteLine("主线程，主线程等待2s后取消任务，" + GetNow());
            cts.Cancel();   // 取消任务

            await task1;

            Console.WriteLine($"End，" + GetNow());


            async Task ActionAsync(CancellationToken token)
            {
                try
                {
                    Console.WriteLine("task1，开始执行，" + GetNow());
                    Console.WriteLine("task1，模拟执行5s，" + GetNow());
                    await Task.Delay(5000, token);  // 使用token，以便取消任务
                    Console.WriteLine("task1，结束执行，" + GetNow());
                }
                catch (TaskCanceledException ex)
                {
                    Console.WriteLine($"task1，任务已取消，{ex.Message}，" + GetNow());  // Cancel()取消成功默认会抛异常，需要手动捕获
                }
            }
        }
```

![image-20240617155653167](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240617155653167.png)

##### 处理任务中的异常

```csharp
        /// <summary>
        /// 异常处理
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestExceptionAsync()
        {
            try
            {
                await Task.Run(ThrowException);     // await一定要在try范围内，否则可能无法捕获异常
            }
            catch (Exception ex)
            {
                Console.WriteLine("出现异常1：" + ex.Message);
            }

            try
            {
                Task.Run(ThrowException).Wait();     // Wait()一定要在try-catch范围内，否则可能无法捕获异常
            }
            catch (Exception ex)
            {
                Console.WriteLine("出现异常2：" + ex.Message);
            }

            try
            {
                Task.Run(ThrowException);           // 无法捕获异常，因为当异步方法出现异常时，主线程已经跳出try-catch范围，所以无法正常捕获异常
            }
            catch (Exception ex)
            {
                Console.WriteLine("出现异常3：" + ex.Message);
            }


            await Task.Delay(2000);

            void ThrowException()
            {
                Thread.Sleep(1000);
                throw new Exception("异常了!!!");
            }
        }
```

Task的异常处理很简单，只需要使用await等待即可，使用`Wait()`同步等待也可以捕获异常，但会在异常包一层父异常。需要注意的是，await、Wait()一定要在try-catch范围等待执行任务完成，否则可能会无法捕获异常

##### 任务状态TaskStatus

```csharp
        /// <summary>
        /// 查看任务状态-Created、RanToCompletion
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskStatus()
        {
            Console.WriteLine($"Start，" + GetNow());
            // 创建一个新任务
            var task1 = new Task(() =>
            {
                Console.WriteLine("task1 started.");
                Thread.Sleep(2000); // 模拟耗时操作
                Console.WriteLine("task1 finished.");
            });
            Console.WriteLine($"task1 status: {task1.Status}，" + GetNow());     // Created状态
            task1.Start();
            var breakStatusList = new List<TaskStatus>() { TaskStatus.RanToCompletion, TaskStatus.Faulted, TaskStatus.Canceled };
            // 检查任务状态
            while (true)
            {
                Console.WriteLine($"task1 status: {task1.Status}，" + GetNow());
                if (breakStatusList.Contains(task1.Status)) break;
                await Task.Delay(500);
            }
            Console.WriteLine($"IsCanceled：{task1.IsCanceled}，IsCompleted：{task1.IsCompleted}，IsCompletedSuccessfully：{task1.IsCompletedSuccessfully}，IsFaulted：{task1.IsFaulted}");    // false,true,true,false
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// 查看任务状态-Canceled、WaitingForActivation
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskStatusCancel()
        {
            Console.WriteLine($"Start，" + GetNow());
            var cts = new CancellationTokenSource();

            // 创建一个新任务
            var task1 = Task.Run(async () =>
            {
                Console.WriteLine("task1 started.");
                await Task.Delay(5000, cts.Token);      // Task.Delay会使当前任务进入 WaitingForActivation 状态
                Console.WriteLine("task1 finished.");
            }, cts.Token);


            var breakStatusList = new List<TaskStatus>() { TaskStatus.RanToCompletion, TaskStatus.Faulted, TaskStatus.Canceled };
            // 检查任务状态
            var time = 0;
            while (true)
            {
                if (time++ > 3)
                {
                    Console.WriteLine("执行取消任务操作。");
                    cts.Cancel();   // 过2s后取消任务
                }
                Console.WriteLine($"task1 status: {task1.Status}，" + GetNow());
                if (breakStatusList.Contains(task1.Status))
                {
                    Console.WriteLine($"task1 status: {task1.Status}，" + GetNow());
                    break;
                }
                await Task.Delay(500);
            }
            Console.WriteLine($"IsCanceled：{task1.IsCanceled}，IsCompleted：{task1.IsCompleted}，IsCompletedSuccessfully：{task1.IsCompletedSuccessfully}，IsFaulted：{task1.IsFaulted}");    // true,true,false,false
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// 查看任务状态-Faulted
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskStatusFaulted()
        {
            Console.WriteLine($"Start，" + GetNow());
            Task? task1 = null;
            try
            {
                // 创建一个新任务
                task1 = Task.Run(async () =>
                {
                    Console.WriteLine("task1 started.");
                    await Task.Delay(2000);
                    throw new Exception("异常了");
                });
                await task1;
            }
            catch (Exception ex)
            {
                Console.WriteLine("出现异常：" + ex.Message);
                Console.WriteLine($"task1 status: {task1?.Status}，" + GetNow());
            }
            Console.WriteLine($"IsCanceled：{task1.IsCanceled}，IsCompleted：{task1.IsCompleted}，IsCompletedSuccessfully：{task1.IsCompletedSuccessfully}，IsFaulted：{task1.IsFaulted}");    // false,true,false,true
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// 查看任务状态-WaitingToRun、Running
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskStatusWaitingToRun()
        {
            Console.WriteLine($"Start，" + GetNow());
            ThreadPool.SetMaxThreads(6, 6);   // 调整线程池最大数量为6，
            var tasks = new List<Task>();
            // 创建100个Task一起执行，有些任务不能执行那么快，会进入WaitingToRun等待执行状态
            for (int i = 0; i < 100; i++)
            {
                tasks.Add(Task.Run(() =>
                {
                    Thread.Sleep(2000);
                }));
            }
            await Task.Delay(2000);
            foreach (var item in tasks)
            {
                Console.WriteLine("status：" + item.Status);
            }
            ThreadPool.SetMaxThreads(1000, 1000);   // 调整回来
            Console.WriteLine($"End，" + GetNow());
        }

        /// <summary>
        /// 查看任务状态-WaitingForChildrenToComplete
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskStatusWaitingForChildrenToComplete()
        {
            Console.WriteLine($"Start，" + GetNow());
            // 创建一个父任务
            var parentTask = Task.Factory.StartNew(async () =>      // 不要使用new Task或者Task.Run，否则无法看到WaitingForChildrenToComplete状态
            {
                var childTask = Task.Factory.StartNew(() =>
                {
                    Console.WriteLine("子任务 started.");
                    Thread.Sleep(2000); // 模拟耗时操作
                    Console.WriteLine("子任务 finished.");
                }, TaskCreationOptions.AttachedToParent);      // 附加类型子任务
                await childTask;
            });
            Console.WriteLine($"parentTask status: {parentTask.Status}，" + GetNow());
            var breakStatusList = new List<TaskStatus>() { TaskStatus.RanToCompletion, TaskStatus.Faulted, TaskStatus.Canceled };
            // 检查父任务状态
            while (true)
            {
                Console.WriteLine($"parentTask status: {parentTask.Status}，" + GetNow());
                if (breakStatusList.Contains(parentTask.Status)) break;
                await Task.Delay(500);
            }
            Console.WriteLine($"End，" + GetNow());
        }
```

TaskStatus表示`Task`对象的状态：

1. `Created`：任务已创建但尚未开始执行。
2. `WaitingForActivation`：任务正在等待被激活。通常在任务由`TaskCompletionSource`创建时出现此状态，`Task.Delay`也会进入该状态。
3. `WaitingToRun`：任务已调度但尚未开始运行。这通常发生在任务被添加到任务队列中，但尚未分配给线程执行。
4. `Running`：任务正在执行。
5. `WaitingForChildrenToComplete`：父任务正在等待其子任务完成。当父任务使用`TaskCreationOptions.AttachedToParent`选项创建子任务时，父任务会进入此状态。
6. `RanToCompletion`：任务已成功完成。这意味着任务的所有工作都已完成，没有错误发生。（IsCompleted：True，IsCompletedSuccessfully：True）
7. `Canceled`：任务被取消。这通常是因为任务的`CancellationToken`被触发。（IsCanceled：True，IsCompleted：True）
8. `Faulted`：任务出错。这表示在执行过程中发生了未捕获的异常。(IsCompleted：True，IsFaulted：True)

我们可以使用`IsCanceled`、`IsCompleted`、`IsCompletedSuccessfully`、`IsFaulted`这几个属性快速获取当前任务的执行状况，分别代表是否取消、是否完成（可能会失败）、是否成功完成、是否失败

分别执行以上方法，观察任务状态

![image-20240620195502074](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240620195502074.png)

#### Task边角料

不常用，可了解

##### 父任务和子任务

线程之间可能发生的另一种类型的关系是父子关系，子任务被创建为父任务（Parent Task）主体内的嵌套任务。

子任务的类型：附加（Attached）、分离（Detached）。两种类型的任务都在父任务内部创建，并且在默认情况下，创建的子任务是**分离类型**。

要将子任务指定为附加任务，可以将任务的 AttachedToParent 属性设置为 true。考虑**创建附加类型任务**的场景：

- 子任务中引发的所有异常都必须传播到父任务
- 父任务的状态取决于子任务
- 父任务需要等待子任务完成。

使用子任务要注意这两点：

父任务内部要等待子任务完成，不然可能会出现父任务已完成，但子任务只执行一半的情况

**创建附加类型子任务**，父任务、子任务只能用`Task.Factory.StartNew(ChildAction, TaskCreationOptions.AttachedToParent)`，不要使用`new Task`，也不建议使用`Task.Run`

```csharp
        /// <summary>
        /// 附加类型子任务
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestAttachedTaskAsync()
        {
            Console.WriteLine($"Start，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            try
            {
                var parentTask = Task.Run(async () =>
                {     // 父任务
                    try
                    {
                        Console.WriteLine($"父任务，开始，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                        var childTask = Task.Factory.StartNew(ChildAction, TaskCreationOptions.AttachedToParent);    // 创建附加类型子任务不能使用new Task创建，使用Task.Factory.StartNew，具体就不解释了，我也没搞懂。可以试一下效果
                        // await Task.Delay(3000);  // 不能使用Delay，当childTask在大约1秒后抛出异常时，父任务已经进入了等待3s阶段，此时childTask的异常不会被捕获，应该主动等待childTask完成
                        await childTask;
                        Console.WriteLine($"父任务，结束，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"父任务，出现异常：{ex.Message}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                    }
                });
                await parentTask;

                await Task.Delay(3000);  // 单元测试中，主线程等待，留够时间给所有任务执行
                Console.WriteLine($"主线程，任务已完成，任务状态：{parentTask.Status}，" + GetNow());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"主线程，任务出现异常：{ex.Message}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
            }

            Console.WriteLine($"End，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());

            // 子任务逻辑
            void ChildAction()
            {
                Console.WriteLine($"子任务，开始，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                Thread.Sleep(1000);
                Console.WriteLine($"子任务，触发异常，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                throw new Exception("子任务异常！！！");
            }
        }
```

// TODO：说实话子任务没太理解，卡了两天了，待定，就这样，去死吧

##### Task.Yield 让出执行权

yield，翻译为让出，让出什么呢？让出执行权。如有多个任务都需要执行很长时间，由于资源不足，部分任务（前10个）先执行，任务1执行到一半满足某个特定条件调用Yield，让出执行权，给其他Task执行的机会。相当于把任务1搁置(让它重新去排队)，让其他排队中的任务有机会执行。`Task.Yeild()`和`Thread.sleep(0)`有点相同

参考：[C#中关于Task.Yeild()的探究 - 白烟染黑墨 - 博客园 (cnblogs.com)](https://www.cnblogs.com/hkfyf/p/13276411.html)（思路还行，能看懂，不过Yield写错了，设置线程池最大数量也错了）

```csharp
        /// <summary>
        /// Yield 让出执行权
        /// </summary>
        /// <returns></returns>
        [Test]
        public void TestYield()
        {
            Console.WriteLine($"Start，" + GetNow());
            var isOk = ThreadPool.SetMaxThreads(6, 6);
            if (!isOk) return;
            var list = new List<Task>();
            for (int i = 0; i < 10; i++)
            {
                var index = i;  // 重新赋值一下
                list.Add(
                    Task.Run(async () => await ActionAsync(index))
                    );
            }
            Task.WaitAll(list.ToArray());
            ThreadPool.SetMaxThreads(1000, 1000);   // 调整回来
            Console.WriteLine($"End，" + GetNow());


            async Task ActionAsync(int index)
            {
                var time = 0;
                while (true)
                {
                    time++;
                    if (time == 2)
                    {
                        Console.WriteLine($"task{index} 让出执行权，进度：{time}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                        await Task.Yield(); // 让出执行权，给其他Task执行的机会
                    }
                    if (time >= 3)
                    {
                        Console.WriteLine($"task{index} 执行完成，进度：{time}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                        break;   // 运行结束
                    }
                    await Task.Delay(2000);
                    Console.WriteLine($"task{index} 执行中，进度：{time}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
                }
            }
        }
```

如下图，第一批任务执行第2次时，让出执行权（此时任务并没有完全执行完成），重新排队。给其他任务有机会执行（可以看到有些线程ID是重复的）

![image-20240621150541226](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240621150541226.png)

##### Task.FromResult 返回结果

Task.FromResult核心是支持以同步的方式实现一个异步接口方法。

Task.FromResult是一个同步方法，它会创建并返回一个已完成的`Task<T>`实例。但是它并不会阻塞调用线程。需要注意：只有`Task.FromResult`不会阻塞而已，不是说整个方法（ActionAsync）不阻塞，如果需要在异步方法中执行耗时操作，还是得使用`Task.Run`

参考：[C# Task.FromResult的用法 - 还可入梦 - 博客园 (cnblogs.com)](https://www.cnblogs.com/stilldream/p/10184778.html)

```csharp
        /// <summary>
        /// Task.FromResult
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestResultAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            await ActionAsync();
            ActionAsync();                  // Task.FromResult本身是一个同步方法，此处不需要等待也可以执行完成

            Task<string> ActionAsync()      
            {
                var result = Action();      // 同步方法
                return Task.FromResult<string>(result);     // 加上这个就变成了异步方法
            }

            string Action()
            {
                Thread.Sleep(1000);
                Console.WriteLine("程序执行，" + GetNow());
                return "Hello World";
            }
            Console.WriteLine($"End，" + GetNow());
        }
```

![image-20240624175420082](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624175420082.png)

为什么要用Task.FromResult呢？如下解答（FromAI）

![image-20240624105453418](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624105453418.png)

##### Task.FromException 返回异常任务

Task.FromException可以返回一个特定的异常任务，跟`throw`抛出异常不一样的是，我们无需使用try-catch捕获异常，只需要在等待任务执行前判断是否异常即可

```csharp
        /// <summary>
        /// 返回异常
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestFromExceptionAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            for (int i = 1; i < 10; i++)
            {
                var index = i;
                var task = ActionException(index);
                if (task.Exception != null)     // 同步等待
                {
                    Console.WriteLine($"程序正常，循环{index}，调用方法有异常，跳过不执行，异常：" + task.Exception?.Message);
                }
                else
                {
                    await task;
                }
            }

            Console.WriteLine($"End，" + GetNow());


            // 异步的话改成：返回Task<Task>，var task = await ActionException(index);
            Task ActionException(int index)
            {
                Thread.Sleep(1000);
                if(index % 3 == 0)
                {
                    var exception = new Exception("出错了！！！");
                    return Task.FromException(exception);
                }
                Console.WriteLine($"循环{index}，执行成功");
                return Task.CompletedTask;  
            }
        }

        /// <summary>
        /// 抛出异常
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestThrowExceptionAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            try
            {
                for (int i = 1; i < 10; i++)
                {
                    var index = i;
                    var task = ActionException(index);
                    if (task.Exception != null)     // 使用throw，此处Exception永远为null
                    {
                        Console.WriteLine($"程序正常，循环{index}，调用方法有异常，跳过不执行，异常：" + task.Exception?.Message);
                    }
                    else
                    {
                        await task;     // 直接抛异常
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"程序异常，异常：" + ex.Message);
            }

            Console.WriteLine($"End，" + GetNow());

            Task ActionException(int index)
            {
                Thread.Sleep(1000);
                if (index % 3 == 0)
                {
                    var exception = new Exception("出错了！！！");
                    throw exception;
                }
                Console.WriteLine($"循环{index}，执行成功");
                return Task.CompletedTask;
            }
        }
```

如下图，我们可以明显看出Task.FromException和throw的区别

使用`throw`抛出异常，直接中断整个for循环。若不想整个循环失效，则需要在循环内部进行try-catch捕获异常

使用`Task.FromException`返回带异常的任务，要注意在await执行前，要先判断是否存在异常，不然可能会抛出异常。`.Exception`是同步执行的

![image-20240621161745094](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240621161745094.png)

参考：[c# - How to throw an exception in an async method (Task.FromException) - Stack Overflow](https://stackoverflow.com/questions/41736312/how-to-throw-an-exception-in-an-async-method-task-fromexception)

##### Task.FromCanceled 返回已取消的任务

`Task.FromCanceled` 接受一个 `CancellationToken` 作为参数，并返回一个表示已取消操作的 `Task`，支持泛型。

当你需要表示一个异步操作已经被取消，而不是正常完成或出现异常时，可以使用 `Task.FromCanceled` 方法。这在异步编程中很有用，因为它允许你区分不同类型的任务结束状态。

```csharp
        /// <summary>
        /// 取消任务
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestCanceledAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            // 创建一个取消标记实例
            CancellationTokenSource cts = new CancellationTokenSource();
            CancellationToken token = cts.Token;
            try
            {
                for (int i = 1; i < 10; i++)
                {
                    var index = i;
                    var task = ActionCanceled(token);
                    if (task.IsCanceled)     // 同步等待
                    {
                        Console.WriteLine($"程序正常，任务已取消");
                    }
                    else
                    {
                        await task;
                        Console.WriteLine($"循环{index}，执行成功");
                    }
                    if (i == 3) cts.Cancel();   // 取消任务
                }
            }
            catch (OperationCanceledException ex)
            {
                Console.WriteLine("程序异常，任务已取消: " + ex.Message);
            }
            Console.WriteLine($"End，" + GetNow());

            Task ActionCanceled(CancellationToken cancellationToken)
            {
                Thread.Sleep(1000);
                if (cancellationToken.IsCancellationRequested)  // 记得判断
                {
                    // 返回一个表示已取消操作的Task
                    return Task.FromCanceled(token);
                }
                return Task.CompletedTask;
            }
        }
```

以上代码没有任何意义，只是演示Task.FromCanceled而已

![image-20240621175019605](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240621175019605.png)

没想到一个好的例子，正常应该像`Task.Delay`源码这样使用的

![image-20240621173248296](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240621173248296.png)

##### Task.CurrentId 查看任务ID

查看任务的Id。需要注意：

- 任务Id不等于线程Id；
- 线程Id会重复，任务Id一般不会重复；
- Task.CurrentId等价于task.Id；
- Task.CurrentId常用于任务内部（Task.Run、new Task内部）

```csharp
        /// <summary>
        /// Task.CurrentId
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestCurrentIdAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            for (int i = 1; i < 10; i++)
            {
                var msg = "";
                var task = Task.Run(() => {
                    Thread.Sleep(1000);
                    msg += $"ThreadId：{Environment.CurrentManagedThreadId}，TaskId：{Task.CurrentId}。";
                });
                await task;
                msg += $"TaskId2：{Task.CurrentId}，TaskId3：{task.Id}";   // 此处Task.CurrentId无法获取值，因为当前操作并不是在任务上执行的
                Console.WriteLine(msg);
            }
            Console.WriteLine($"End，" + GetNow());
        }
```

![image-20240624175900592](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624175900592.png)

##### Task.CompletedTask

Task.CompletedTask 返回一个已经完成的 `Task`，无需执行任何异步操作.

```csharp
        /// <summary>
        /// Task.CompletedTask
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestCompletedTaskAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            var result = ActionAsync();
            if (result.Exception == null) await result;
            else
            {
                Console.WriteLine(result.Exception);
            }
            Console.WriteLine($"End，" + GetNow());

            Task ActionAsync()
            {
                var value = new Random().Next(10);
                if (value > 5) return Task.CompletedTask;
                else return Task.FromException(new Exception("出错了!!!"));

            }
        }
```

![image-20240624180046077](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624180046077.png)

##### For循环的临时变量

在`for`循环中使用`Task`和闭包时，可能会遇到变量作用域的问题。这通常是因为循环变量的捕获导致所有任务共享同一个变量实例。为了解决这个问题，需要在每次循环迭代中创建一个新的变量实例作为临时变量。（FromAI）

```csharp
        /// <summary>
        /// For循环变量
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestForAsync()
        {
            Console.WriteLine($"Start，" + GetNow());
            Console.WriteLine("----------------Task不使用临时变量------------------");
            for (int i = 0; i < 10; i++)
            {
                Task.Run(() => ActionWrite(i));     // 每个循环加上await等待的话，不需要临时变量也可以正常输出i值
            }
            await Task.Delay(3000);

            Console.WriteLine("----------------Task使用临时变量------------------");
            for (int i = 0; i < 10; i++)
            {
                var tempI = i;
                Task.Run(() => ActionWrite(tempI));
            }
            await Task.Delay(3000);

            Console.WriteLine("----------------Thread不使用临时变量------------------");
            for (int i = 0; i < 10; i++)
            {
                var t = new Thread(() => ActionWrite(i));
                t.Start();
            }

            await Task.Delay(3000);
            Console.WriteLine($"End，" + GetNow());

            void ActionWrite(int index)
            {
                Thread.Sleep(200);
                Console.WriteLine(index);
            }
        }
```

![image-20240624151308728](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624151308728.png)

##### 究竟是在for循环内开启Task还是在Task内开启for循环呢？

不知道大家有没有这个疑惑？如果有一批大数据需要使用多线程循环，那么我应该是在for循环内部开启Task任务还是直接开启Task任务并在其内部执行for循环？或者大家是否见过类似代码（TestTaskForAsync）？

```csharp
        /// <summary>
        /// 循环创建任务
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestForTaskAsync()
        {
            Console.WriteLine($"Start，5000，" + GetNow());
            var list = new List<Task>();
            for (int i = 0; i < 5000; i++)
            {
                list.Add(Task.Run(() => ForAction("for循环开启并执行任务")));
            }
            Task.WaitAll(list.ToArray());
            Console.WriteLine($"End，5000，" + GetNow());
        }

        void ForAction(string name)
        {
            Thread.Sleep(50);  // 模拟耗时50ms
            Console.WriteLine($"{name}，执行成功，TaskId：{Task.CurrentId}，ThreadId：{Environment.CurrentManagedThreadId}，" + GetNow());
        }

        /// <summary>
        /// 开启任务循环
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestTaskForAsync()
        {
            Console.WriteLine($"Start，1000，" + GetNow());
            await Task.Run(() =>
            {
                for (int i = 0; i < 1000; i++)   
                {
                    ForAction("开启任务执行for循环");
                }
            });
            Console.WriteLine($"End，1000，" + GetNow());
        }
```

如下图，差异是很明显的。TestForTaskAsync——在for循环内部开启Task执行任务的效率远远要高于TestTaskForAsync

TestTaskForAsync 相当于只开启了一个任务，只使用了一个线程，并没有达到多线程的效果

![image-20240624152730228](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624152730228.png)

##### 控制线程数量

无法直接控制线程数量，不过我们可以通过限制线程池的最大最小数量，达到控制线程数量的效果。但有个弊端，线程池是公共的，相当于某个任务限制了线程池，其他任务也会受限制。我们也可以通过SemaphoreSlim或ParallelOptions来实现，这里先不展开了

```csharp
        /// <summary>
        /// 限制线程池数量
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestMaxAsync()
        {
            Console.WriteLine($"Start，" + GetNow());

            var isOk = ThreadPool.SetMaxThreads(6, 6);  // 最小6  
            if (!isOk) return;

            ThreadPool.GetMaxThreads(out var workerThreads, out var _);
            Console.WriteLine("限制最大线程数：" + workerThreads);
            for (int i = 0; i < 1000; i++)
            {
                Task.Run(() => ActionWrite("task1"));
            }


            for (int i = 0; i < 1000; i++)
            {
                Task.Run(() => ActionWrite("task222222"));
            }
            await Task.Delay(10000);    // 在单元测试中，等待一段时间

            ThreadPool.SetMaxThreads(1000, 1000);   // 调整回来
            Console.WriteLine($"End，" + GetNow());


            void ActionWrite(string name)
            {
                Thread.Sleep(1000);
                Console.WriteLine($"{name}，ThreadId：{Environment.CurrentManagedThreadId}");
            }
        }
```

![image-20240624161256210](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624161256210.png)

##### 任务调度器

任务调度器（Task Scheduler）负责管理和调度这些任务的执行。任务调度器允许你将任务排队以在将来的某个时间点执行，或者在特定的线程上执行。默认使用`TaskScheduler.Default`任务调度器，它使用线程池来管理和调度任务

**TaskScheduler.FromCurrentSynchronizationContext()**：返回一个任务调度器，该调度器将任务调度在与当前同步上下文关联的线程上。这在UI应用程序中很有用，因为它允许你在UI线程上执行任务，以避免跨线程操作的问题。

常见使用

1. `task1.Start(TaskScheduler)`：这个方法允许你在指定的任务调度器上启动任务。通过传递一个自定义的任务调度器，你可以控制任务的执行方式和位置。
2. `task1.ContinueWith(Action, TaskScheduler)`：这个方法允许你在前一个任务完成后，使用指定的任务调度器继续执行另一个任务。
3. `Task.Factory.StartNew(Action, CancellationToken.None, TaskCreationOptions.None, TaskScheduler)`：创建任务，并指定任务调度器

演示一下调度器的使用，时间不多，没有细致了解，其实也没什么。以下代码演示（FromAI）

**自定义任务调度器**

```csharp
    /// <summary>
    /// 自定义任务调度器
    /// </summary>
    public class LimitedConcurrencyLevelTaskScheduler : TaskScheduler
    {
        private readonly int _maxDegreeOfParallelism;
        private readonly LinkedList<Task> _tasks = new LinkedList<Task>();
        private readonly object _lockObject = new object();

        public LimitedConcurrencyLevelTaskScheduler(int maxDegreeOfParallelism)
        {
            if (maxDegreeOfParallelism < 1) throw new ArgumentOutOfRangeException(nameof(maxDegreeOfParallelism));
            _maxDegreeOfParallelism = maxDegreeOfParallelism;
        }
        /// <summary>
        /// 循环队列取任务
        /// </summary>
        /// <param name="task"></param>
        protected override void QueueTask(Task task)
        {
            lock (_lockObject)
            {
                _tasks.AddLast(task);
                if (_tasks.Count <= _maxDegreeOfParallelism)    // 判断任务数量
                {
                    TryExecuteTask(task);   // 执行任务
                }
            }
        }

        protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
        {
            lock (_lockObject)
            {
                if (taskWasPreviouslyQueued)
                {
                    return false;
                }

                return TryExecuteTask(task);
            }
        }

        protected override IEnumerable<Task> GetScheduledTasks()
        {
            lock (_lockObject)
            {
                return _tasks.ToArray();
            }
        }
    }
```

**使用任务调度器**

```csharp
        /// <summary>
        /// 使用任务调度器
        /// </summary>
        /// <returns></returns>
        [Test]
        public async Task TestScheduleAsync()
        {
            // 使用默认的任务调度器
            Task task1 = Task.Run(() =>
            {
                Console.WriteLine("Task 1 is running on a thread pool thread.");
            });

            // 创建一个自定义的任务调度器，限制最大并发线程数为2
            LimitedConcurrencyLevelTaskScheduler customScheduler = new LimitedConcurrencyLevelTaskScheduler(2);

            // 使用自定义的任务调度器
            Task task2 = Task.Factory.StartNew(() =>
            {
                Console.WriteLine("Task 2 is running on a custom scheduler thread.");
            }, CancellationToken.None, TaskCreationOptions.None, customScheduler);

            await Task.WhenAll(task1, task2);
        }
```

![image-20240624164152259](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240624164152259.png)


