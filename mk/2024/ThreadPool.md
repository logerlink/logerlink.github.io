[TOC]

#### 说明

无聊整理一下线程相关操作——ThreadPool篇

在日常开发中，开发人员对线程和线程池直接使用较少，使用Task来实现多线程更为简单方便

#### .Net线程池介绍

##### 线程池是什么

线程池是一种用于管理和优化线程资源的技术，通俗来讲，就是装有一堆线程的"池子"，我们不需要也无法控制池子内部的线程

##### 线程池工作原理

FromAI：

- **线程池初始化**：当.NET应用程序启动时，线程池会根据系统配置和资源可用性自动初始化。线程池会创建一定数量的工作线程（通常与系统的处理器数量相对应），并将它们置于空闲状态。
- **任务队列**：线程池使用一个任务队列（也称为工作项队列）来存储等待执行的任务。任务队列是一个先进先出（FIFO）的队列，新任务会被添加到队列的末尾，而工作线程会从队列的头部获取任务。
- **任务调度**：当有新任务到达时，线程池会将任务添加到任务队列中。线程池会尝试在空闲的工作线程上调度这些任务。如果所有工作线程都在忙碌，线程池可能会根据需要创建新的工作线程，直到达到最大线程数限制。
- **线程执行任务**：空闲的工作线程会从任务队列中获取任务，并开始执行它们。每个工作线程都有一个与之关联的任务，直到任务完成。
- **任务完成**：当任务完成时，工作线程会返回空闲状态，等待执行下一个任务。如果任务队列为空，工作线程会进入休眠状态，直到有新任务到达。
- **线程池关闭**：当应用程序关闭时，线程池会销毁所有工作线程，释放资源。

通俗来讲，线程池启动时会创建部分线程等待工作项。线程池自动调度分配空闲可用的线程执行这些工作项，若没有空闲可用的线程，则会自动等待，或者创建新的工作线程，直到达到最大线程数限制。

##### 线程池内部线程的特点

- 都是后台线程
- 都是用默认堆栈大小
- 都是相同的优先级
- 都处于多线程单元中
- 无法人工干预控制（启动、销毁、终止、休眠等）
- 无序

```csharp
        [Test]
        public void GetThreadPoolInfoTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            for (int i = 0; i < 10; i++)
            {
                ThreadPool.QueueUserWorkItem(_ =>
                {
                    Console.WriteLine($"i={_}，Id：{Thread.CurrentThread.ManagedThreadId}，是否后台线程：{Thread.CurrentThread.IsBackground}，优先级：{Thread.CurrentThread.Priority}，是否在线程池中：{Thread.CurrentThread.IsThreadPoolThread}");
                    Thread.Sleep(100);
                }, state: i);
            }
            Thread.Sleep(2000);

            Console.WriteLine($"所有执行完成。" + GetNow());
        }
```

![image-20240530195404325](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530195404325.png)

##### 线程池的优点

- 适合于执行需要多个线程的任务。线程池能够优化这些任务的执行过程，从而提高吞吐量
- 操作简单，自动调度管理线程。相比较线程Thread使用一大堆方法让开发人员管理线程，线程池使用起来更为简单，无需人为管理线程
- 线程池内的线程可重复使用。避免重复开辟线程和销毁线程消耗大量的资源，节省内存资源，提高性能
- 方便管控线程的总数量（设置最大最小线程）。防止滥用

严格来讲，线程的系统开销很大。系统必须为线程分配并初始化一个线程内核对象，还必须为每个线程保留1mb的地址空间 （按需提交）用于线程的用户模式堆栈，分配12kb左右的地址空间用于线程的内核模式堆栈。然后，紧接着线程创建后，windows调用进程中每个dll都有的一个函数来通知进程中所有的dll操作系统创建了一个新的线程。同样，销毁一个线程的开销也不小，进程中的每个dll都要接收一个关于线程即将“死亡”的通知，而且内核对象及堆栈还需释放。

参考：[C#.Net使用线程池(ThreadPool)与专用线程(Thread)-开发框架文库 (cscode.net)](https://www.cscode.net/archive/newdoc/cs-210903193520433-92.html)

##### 线程池的局限性

- 无法单独设置线程的属性。如是否后台线程、线程名字、优先级、控制线程生命周期等等
- 只能用于时间较短的任务。长时间的任务可能会让其他工作项一直处于等待状态，造成线程饥饿
- 对于COM对象，入池的所有线程都是多线程单元(Multi-threaded apartment,MTA)线程。而许多COM对象都需要单线程单元(Single -threaded apartment,STA)线程。
- 无法保证线程的执行顺序
- 线程切换会产生额外开销

#### .Net线程池功能及使用

##### QueueUserWorkItem

QueueUserWorkItem 用来将一个工作项添加到线程池队列中，以便在可用线程上执行。注意该方法是一个**异步方法，不会阻塞调用该方法的线程**，如果需要阻塞，需要手动阻塞。

```csharp
        [Test]
        public void QueueUserWorkItemTest1()
        {
            int count = 0;
            var objLock = new object();
            for (int i = 0; i < 100; i++)
            {
                ThreadPool.QueueUserWorkItem(_ =>
                {
                    lock (objLock)
                    {
                        count = count + 1;
                        Console.WriteLine($"线程{Environment.CurrentManagedThreadId}，i={i} 执行完成" + GetNow());
                        Thread.Sleep(50);
                    }
                });
            }
            
            Thread.Sleep(10000);    // 主动等待10s，QueueUserWorkItem是异步的，不会阻塞调用线程
            Console.WriteLine($"执行完成，count：{count}。" + GetNow());
        }
```

观察一下输出结果，我们可以发现线程Id是重复出现的，而且没有规律。说明线程池有**复用**线程，且任务是**无序**执行的。

![image-20240529153114366](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240529153114366.png)

那为什么`变量i`的输出都是相同的呢？

首先`变量i`输出并不都是"相同"的，当我们把循环增大到1w或者在循环中主动等待一段时间（模拟耗时），我们可以发现前几个输出将会是其他值。而上面演示为什么输出都是100，那是因为当for循环完成后，线程池还没完成调度开始执行，此时`变量i`的值已经是循环后的值——100，这时线程池内的线程开始执行，输出的值自然也是100。若要输出每次循环的`变量i`真正的值，应该借助**state传入参数**

![image-20240529154132707](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240529154132707.png)

QueueUserWorkItem可以传递参数state。等待任务执行完成可以借助CountdownEvent 、ManualResetEvent对象进行阻塞等待，ManualResetEvent只要一个任务执行完成，就不会继续等待了，而CountdownEvent 多用于循环，等待所有任务完成后，便不再等待。

```csharp
        [Test]
        public void QueueUserWorkItemTest2()
        {
            int count = 0;
            var objLock = new object();
            var resetEvent = new ManualResetEvent(false);	// 为true不会等待
            var countdownEvent = new CountdownEvent(10);   	// 初始化计数为10，跟任务数一致
            for (int i = 0; i < 10; i++)
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    var stateParam = state as ThreadStateParam<int>;
                    if (stateParam == null) return;
                    lock (objLock)
                    {
                        count = count + 1;
                        Console.WriteLine($"线程{Environment.CurrentManagedThreadId}，i={stateParam.Value}，执行完成" + GetNow());
                        // resetEvent、countdownEvent 可以使用外部的对象也可以使用传进来的对象。对象引用，无影响
                        stateParam.ManualResetEvent.Set();                          // 执行完一个，告诉ManualResetEvent无需阻塞等待了
                        countdownEvent.Signal();                                    // 执行完一个，将计数减少1
                        Thread.Sleep(500);
                    }
                },
                    new ThreadStateParam<int>()
                    {
                        Value = i,
                        ManualResetEvent = resetEvent,
                        CountdownEvent = countdownEvent
                    }
                );  // 传递参数
            }

            resetEvent.WaitOne();
            Console.WriteLine($"有任务执行完成了，待完成任务：{countdownEvent.CurrentCount}。" + GetNow());     // CurrentCount获取当前计数，有点延迟
            countdownEvent.Wait();  // 等待计数为0时不再阻塞等待
            Console.WriteLine($"所有执行完成，待完成任务：{countdownEvent.CurrentCount}。count：{count}。" + GetNow());
        }

    public class ThreadStateParam<T>
    {
        public T Value { get; set; }
        public ManualResetEvent ManualResetEvent { get; set; }

        public CountdownEvent CountdownEvent { get; set; }
    }
```

我们可以发现，`变量i`值的输出正常，当其中一个任务执行完成时，manualResetEvent对象会取消阻塞等待，当所有任务执行完成时（等待计数也递减为0），countdownEvent对象会取消阻塞等待

![image-20240529174821396](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240529174821396.png)

QueueUserWorkItem还有一个`preferLocal`参数，表示是否应该优先使用当前线程的本地队列来执行任务。在.NET Core 3.0及更高版本中，`QueueUserWorkItem`方法的`preferLocal`参数已被弃用，因为线程池的实现已经改变，不再使用本地队列，任务始终被添加到全局队列

**UnsafeQueueUserWorkItem**与QueueUserWorkItem类似，区别是UnsafeQueueUserWorkItem不保证回调方法在线程池线程上执行，性能更优，但是存在线程安全问题

##### RegisterWaitForSingleObject

RegisterWaitForSingleObject 用于注册一个等待操作，当指定的 WaitHandle 变为已终止状态时（调用Set方法），线程池将执行指定的回调方法，常与AutoResetEvent、ManualResetEvent对象一起使用

```csharp
        [Test]
        public void RegisterWaitForSingleObjectTest()
        {
            Console.WriteLine("Start" + GetNow());
            var waitHandle = new AutoResetEvent(false);	// 入参为true，则一开始就会触发，不用调用Set()
            ThreadPool.RegisterWaitForSingleObject(waitHandle, (state, timeout) =>
            {
                Console.WriteLine($"任务开始执行。线程{Environment.CurrentManagedThreadId}。" + GetNow());
                Thread.Sleep(2000);
                Console.WriteLine($"任务执行成功。线程{Environment.CurrentManagedThreadId}。" + GetNow());
            }, state: null, millisecondsTimeOutInterval: -1, executeOnlyOnce: false);

            Thread.Sleep(2500);
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

RegisterWaitForSingleObject 额外的三个参数

- state：参数
- millisecondsTimeOutInterval：超时时间，为-1时，线程一直等待 waitHandle 变为已终止状态才会触发线程。大于等于0时，则等待指定时间(ms)，若超过指定时间waitHandle还未终止，则触发线程。
- executeOnlyOnce。是否只执行一次。waitHandle 是否可以重复调用`Set()`触发线程。重复调用`Set()`，如果该值为true，则不会触发线程，若为false，则仍会触发线程

**UnsafeRegisterWaitForSingleObject**与RegisterWaitForSingleObject 类似，区别是UnsafeRegisterWaitForSingleObject不是线程安全的，在使用时，请确保正确处理回调函数中的异常，以避免潜在的应用程序崩溃

##### GetMaxThreads

GetMaxThreads 获取线程池中允许的最大工作线程数和最大I/O线程数。（默认值可能随机器配置改变）

```csharp
        [Test]
        public void GetMaxTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            ThreadPool.GetMaxThreads(out var workerThreads, out var completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}");
            Console.WriteLine($"最大IO线程数：{completionPortThreads}");
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

![image-20240530171148591](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530171148591.png)

##### SetMinThreads

SetMinThreads 可以设置线程池中允许的最小工作线程数和最小I/O线程数

```csharp
        [Test]
        public void SetMinTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            int workerThreads, completionPortThreads;
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}，最大IO线程数：{completionPortThreads}");
            Console.WriteLine("设置最小线程数10，最小IO线程数5");
            ThreadPool.SetMinThreads(10, 5);
            for (int i = 0; i < 10; i++)
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    Console.WriteLine($"线程{Environment.CurrentManagedThreadId}，执行完成" + GetNow());
                });
            }
            Thread.Sleep(15000);
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}，最大IO线程数：{completionPortThreads}");
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

如图，设置与不设置最小工作线程差别不大，设置最小工作线程数，机器会根据这个数目尽可能提前创建好指定数量的线程，等待调度

![image-20240530173402940](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530173402940.png)

##### SetMaxThreads

SetMaxThreads 可以设置线程池中允许的最大工作线程数和最大I/O线程数。这两个数都要设置大于5的数，否则会失败（我的机器是这样的）

```csharp
        [Test]
        public void SetMaxTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            int workerThreads, completionPortThreads;
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}，最大IO线程数：{completionPortThreads}");
            bool isSuccess = ThreadPool.SetMaxThreads(6, 6);    // 这两个数要大于5，否则设置失败
            Console.WriteLine($"设置最大工作线程数6，最大IO线程数6。设置成功：{isSuccess}");
            var threadIds = new ConcurrentBag<int>();
            for (int i = 0; i < 1000; i++)
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    threadIds.Add(Environment.CurrentManagedThreadId);
                    Thread.Sleep(10);
                });
            }
            Thread.Sleep(5000);
            Console.WriteLine("共使用线程：" + string.Join(",", threadIds.Distinct()));
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}，最大IO线程数：{completionPortThreads}");
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

如图，我们可以发现 SetMaxThreads 成功返回True，是可以有效控制最大线程数的

![image-20240530190451055](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530190451055.png)

最后提一下，SetMinThreads、SetMaxThreads 这两个方法在使用的时候尽量**判断方法返回值**，以免达不到预期时，方便解惑。使用这两个方法会对性能产生或优或差的影响。

##### GetAvailableThreads

GetAvailableThreads 可以获取线程池中可用工作线程和I/O线程

```csharp
        [Test]
        public void GetAvailableThreadsTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            int workerThreads, completionPortThreads;
            ThreadPool.GetMaxThreads(out workerThreads, out completionPortThreads);
            Console.WriteLine($"最大工作线程数：{workerThreads}，最大IO线程数：{completionPortThreads}");
            bool isSuccess = ThreadPool.SetMaxThreads(10, 10);
            Console.WriteLine($"设置最大工作线程数10，最大IO线程数10。设置成功：{isSuccess}");
            var threadIds = new ConcurrentBag<int>();
            for (int i = 0; i < 1000; i++)
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    threadIds.Add(Environment.CurrentManagedThreadId);
                    Thread.Sleep(10);
                });
            }
            Thread.Sleep(2000);
            Console.WriteLine("共使用线程：" + string.Join(",", threadIds.Distinct()));

            ThreadPool.GetAvailableThreads(out var ableWorkerThreads, out var ableIOThreads);
            Console.WriteLine($"当前可用工作线程数：{ableWorkerThreads}，可用IO线程数：{ableIOThreads}");
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

![image-20240530190709676](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530190709676.png)

##### 查看工作项数目

ThreadPool.ThreadCount：总线程数

ThreadPool.CompletedWorkItemCount：已完成工作项数

ThreadPool.PendingWorkItemCount：等待中工作项数

```csharp
        [Test]
        public void GetThreadCountTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            bool isSuccess = ThreadPool.SetMaxThreads(10, 10);
            Console.WriteLine($"设置最大工作线程数10，最大IO线程数10。设置成功：{isSuccess}");
            var threadIds = new ConcurrentBag<int>();
            Console.WriteLine($"执行前====总线程数：{ThreadPool.ThreadCount}，已完成工作项数：{ThreadPool.CompletedWorkItemCount}，等待中工作项数：{ThreadPool.PendingWorkItemCount}");
            for (int i = 0; i < 1000; i++)
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    threadIds.Add(Environment.CurrentManagedThreadId);
                    Thread.Sleep(50);
                });
            }
            Console.WriteLine($"执行中====总线程数：{ThreadPool.ThreadCount}，已完成工作项数：{ThreadPool.CompletedWorkItemCount}，等待中工作项数：{ThreadPool.PendingWorkItemCount}");

            var checkThread = new Thread(() =>
            {
                while (ThreadPool.PendingWorkItemCount > 0)
                {
                    Console.WriteLine($"总线程数：{ThreadPool.ThreadCount}，已完成工作项数：{ThreadPool.CompletedWorkItemCount}，等待中工作项数：{ThreadPool.PendingWorkItemCount}");
                    var time = DateTime.Now;
                    while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s
                    {

                    }
                }
                Console.WriteLine($"总线程数：{ThreadPool.ThreadCount}，已完成工作项数：{ThreadPool.CompletedWorkItemCount}，等待中工作项数：{ThreadPool.PendingWorkItemCount}");
            });
            checkThread.Start();
            checkThread.Join(10000);

            Console.WriteLine($"执行后====总线程数：{ThreadPool.ThreadCount}，已完成工作项数：{ThreadPool.CompletedWorkItemCount}，等待中工作项数：{ThreadPool.PendingWorkItemCount}");
            Console.WriteLine($"所有执行完成。线程{Environment.CurrentManagedThreadId}。" + GetNow());
        }
```

![image-20240530192339589](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530192339589.png)

##### 线程饥饿

线程饥饿：在多线程环境中，某些线程**长时间无法获得足够的资源**（如 CPU 时间、内存等）来执行任务，导致它们**无法继续执行或完成任务**，一直在等待调度中。

![image-20240530194232256](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240530194232256.png)

##### 异常处理

线程池的异常处理不能直接用try-catch包住QueueUserWorkItem

![image-20240531102102135](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240531102102135.png)

应该**用try-catch将回调方法**包住，这样才可以捕获异常，并且不会由于某一个工作项出现异常而影响其他工作项的正常执行，不过性能会有所降低

```csharp
        public void ThreadPoolExceptionTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            for (int i = 0; i < 10; i++)
            {
                ThreadPool.QueueUserWorkItem(_ =>
                {
                    try
                    {
                        var state = (int)_;
                        if (state == 5) throw new Exception("Error!!!!");
                        Console.WriteLine($"i={state}");
                        Thread.Sleep(100);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }, state: i);
            }

            Thread.Sleep(2000);
            Console.WriteLine($"所有执行完成。" + GetNow());
        }
```

![image-20240531102455266](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240531102455266.png)

##### 取消机制

Thread和ThreadPool都可以借助`CancellationTokenSource`来中途取消任务执行

```csharp
        [Test]
        public void ThreadPoolCancelTest()
        {
            Console.WriteLine($"Start。" + GetNow());
            var cts = new CancellationTokenSource();
            ThreadPool.SetMaxThreads(6, 6);
            for (int i = 0; i < 10; i++)
            {
                ThreadPool.QueueUserWorkItem(_ =>
                {
                    if (!cts.IsCancellationRequested)   // 判断是否取消
                    {
                        Thread.Sleep(3000);
                        Console.WriteLine($"i={_}");
                    }
                    else
                    {
                        Console.WriteLine($"任务已取消，i={_}");
                    }
                }, state: i);
            }

            Thread.Sleep(1000);
            cts.Cancel();       // 等待1s后取消任务。不能及时取消
            Thread.Sleep(2000);
            Console.WriteLine($"所有执行完成。" + GetNow());
        }
```

![image-20240531103755488](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240531103755488.png)