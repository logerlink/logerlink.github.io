[TOC]

### 说明

无聊整理一下线程相关操作——Thread篇

##### 什么是多线程

参考：[C#高级--多线程详解_c# 多线程-CSDN博客](https://blog.csdn.net/liyou123456789/article/details/120595489)

进程：当一个程序开始运行时，他就是一个进程。进程包括运行中的程序和程序所使用的内存和系统资源，进程是由多个线程所组成的

线程：线程是程序中的一个执行流，每个线程都有自己的专有寄存器（栈指针、程序计数器等），都可以执行同样的函数

多线程：多线程是指程序中包含多个执行流。一个程序可以同时运行多个不同的线程来执行任务

以下参考：From AI

进程：进程是指正在运行的程序的实例。每个进程都有自己的内存空间、系统资源和执行线程

线程：线程是指程序中的一个执行路径。当一个程序启动时，操作系统会为该程序创建一个主线程，用于执行程序的主要任务

多线程：多线程是指程序中的多个执行路径

通俗来讲，当我们运行一个程序，这个运行中的程序就是进程。进程默认创建一个主线程，基本所有的逻辑都在主线程上执行。我们可以主动创建线程用于执行任务，多个这样的线程就是所谓的多线程。如下图，不知道这样会不会更好理解一点

![image-20240403160209683](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240403160209683.png)

##### 多线程的优点

使用多线程可以提高CPU的利用率，在某个时间点同时执行多个（子）任务，从而减少（总）任务耗时，提高效率。

##### 多线程的缺点

多线程会占用计算机资源（占内存），消耗CPU资源（占cpu），而且多线程还会造成资源共享问题（线程不安全），调试困难（技巧：调试逻辑的时候可以把多线程改成单线程调试，逻辑通过后再将单线程改造成多线程即可）

##### 多线程怎么实现

我们可以使用**Thread**、ThreadPool、Task、TaskFactory、Parallel并行来实现多线程

#### Thread常见操作

篇幅太大，本篇先整理一下Thread常见操作，难免有疏漏，欢迎补充指正

##### 创建与开始

new、start这俩经常同时出现，创建一个线程一定要主动调用开始，不然这个线程就没有意义了（不会执行）。而且如果在子线程执行完成之前，主线程已执行完毕，那么子线程也不会完整执行（可能只执行了一部分）

```csharp
        [Test]
        public void StartTest()
        {
            var thread1 = new Thread(() => Console.WriteLine("thread1线程：完成xxx"));
            thread1.Start();
            var thread2 = new Thread(() => Console.WriteLine("thread2线程：完成xxx"));       // 未开始，thread2不会执行
            new Thread(() => Console.WriteLine("thread3线程：完成xxx")).Start();
            Thread.Sleep(1000);             // 睡眠等待

            new Thread(() =>
            {
                Console.WriteLine("thread4线程：开始执行xxx");
                Thread.Sleep(500);
                File.WriteAllText("D:\\1.txt", "Hello World");
                Console.WriteLine("thread4线程：完成xxx");                                   // 主线程已结束，thread4线程不够时间执行
            }).Start();
            Console.WriteLine("主线程：结束");
        }
```

如图，thread2没有调用start方法，所以不会执行；thread4执行的时候，主线程已经执行完成，所以只执行了一部分；thread1、thread3正常执行；

![image-20240407114124518](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407114124518.png)

 ##### 指定线程名称

```csharp
// 方式一
thread1.Name = "thread1";
// 方式二，其实都一样
var xx = new Thread(DoWork)
{
    Name = "线程1"
};
// 获取当前的name
var threadName = Thread.CurrentThread.Name;
```

##### start传入参数

start传入参数可以使用ParameterizedThreadStart、匿名函数（推荐）

参考：[C# Thread启动线程时传递参数_c# thread 传参-CSDN博客](https://blog.csdn.net/Pei_hua100/article/details/135627726)

```csharp
        [Test]
        public void Start2Test()
        {
            var thread1 = new Thread(new ParameterizedThreadStart(DoWork));
            thread1.Name = "thread1";
            thread1.Start("Hello Word");

            var thread2 = new Thread((param) => DoWork(param));
            thread2.Name = "thread2";
            thread2.Start("Hello Tom");


            void DoWork(object name)
            {
                Console.WriteLine($"{Thread.CurrentThread.Name} Output：{name.ToString()}");
            }
        }
```

![image-20240408120318329](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240408120318329.png)

##### 等待

等待可分为Sleep和SpinWait，作用是将当前线程挂起一定时长。Sleep会放弃CPU使用权，等待结束后重新竞争CPU。而SpinWait不会放弃CPU使用权，占用时间片，等待结束后立即执行，不用重新竞争CPU

```csharp
Thread.Sleep(1000); // 睡眠等待1000ms
Thread.SpinWait(1000)	// 等待1000ms，达不到预期
```

线程等待时，状态会变成WaitSleepJoin状态。主线程中执行则主线程等待，线程中执行则线程等待，不影响主线程。

后续还会介绍延迟等待——await Task.Delay(1000); 

##### 唤醒与等待（对象锁）

Monitor.Pulse：唤醒等待某个对象锁的线程

Monitor.PulseAll：唤醒等待对象锁的全部线程

Monitor.Wait：使当前线程等待某个对象锁

唤醒与等待一般都会成对出现，在一个线程中，当另一个线程等待某个条件满足时，可以使用唤醒机制来通知等待的线程

```csharp
        [Test]
        public void PulseTest()
        {
            Console.WriteLine("主线程：开始" + GetNow());
            var lockObj = new object();
            var isTrue = false;
            var thread = new Thread(() => {
                lock (lockObj)
                {
                    while (!isTrue) 			// isTrue初始为false时，仅会执行一次
                    {
                        Monitor.Wait(lockObj);  // 使当前线程等待对象锁-lockObj
                    }
                }
                Console.WriteLine("线程：完成xxx" + GetNow());
            });
            thread.Start();

            Thread.Sleep(5000);     		// 主线程睡眠等待5000ms
            lock (lockObj)
            {
                Console.WriteLine("主线程：完成yyy" + GetNow());
                isTrue = true;
                Monitor.Pulse(lockObj);     // 唤醒等待对象锁-lockObj的线程
            }

            thread.Join();  				// 阻塞线程完成为止
            Console.WriteLine("主线程：结束" + GetNow());
        }
```

如下图的执行顺序，尽管我们在执行主线程逻辑（yyy）前已经将线程thread开始执行，并强制让主线程休眠5000ms，但是线程thread依旧会进入等待（lockObj对象锁）。过了5000ms后，主线程开始执行（yyy）逻辑，并将条件满足（isTrue为True）同时唤醒等待lockObj对象锁的线程，此时thread线程才会往下执行，由于thread.Join()的原因，主线程会一直等待线程执行完成后，主线程才往下执行。

![image-20240403171145071](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240403171145071.png)

##### 阻塞

线程阻塞是由于某些原因（如等待资源、等待 I/O 操作完成、等待其他线程完成任务等）而**暂停该线程执行**的状态。当线程阻塞时，它不会占用 CPU 资源，操作系统会将其从运行队列中移除，并将其放入阻塞队列中。当阻塞的原因解除后，线程会重新进入运行队列，等待操作系统调度执行。

C#中实现线程阻塞的几种常见方法

- Thread.Sleep();
- Monitor.Enter(lock)和Monitor.Exit(lock)
- mutex.WaitOne()和mutex.ReleaseMutex()
- semaphore.WaitOne()和semaphore.Release()

```csharp
        [Test]
        public void SleepTest()
        {
            Console.WriteLine("主线程：开始");
            var thread = new Thread(() => {
                Console.WriteLine("内部thread线程状态：" + Thread.CurrentThread.ThreadState);
                Thread.Sleep(1000);
                Console.WriteLine("thread线程：完成xxx");
            });
            Console.WriteLine("thread线程状态：" + thread.ThreadState);
            thread.Start();
            Console.WriteLine("thread线程状态：" + thread.ThreadState);


            while (thread.ThreadState != ThreadState.Stopped)
            {
                Console.WriteLine("主线程监控thread线程状态：" + thread.ThreadState);
                Thread.Sleep(300);
            }
            Console.WriteLine("thread线程状态：" + thread.ThreadState);
            thread.Join();
            Console.WriteLine("主线程：结束");
        }
```

线程通过调用**Sleep**阻塞当前线程

![image-20240403173805990](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240403173805990.png)

```csharp
        [Test]
        public void MonitorTest()
        {
            var lockObj = new object();
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(() => DoWork());
            var thread2 = new Thread(() => DoWork());
            thread1.Start();
            thread2.Start();

            while (!(thread1.ThreadState == ThreadState.Stopped || thread2.ThreadState == ThreadState.Stopped))
            {
                Console.WriteLine($"主线程监控thread线程状态：thread1——{thread1.ThreadState}；thread2——{thread2.ThreadState}");
                Thread.Sleep(300);
            }
            thread1.Join();
            thread2.Join();
            Console.WriteLine("主线程：结束");


            void DoWork()
            {
                Console.WriteLine("内部thread线程状态：" + Thread.CurrentThread.ThreadState);
                Monitor.Enter(lockObj);                     // 获取对象的监视器锁
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s
                {

                }
                Console.WriteLine("thread线程：完成xxx");
                Monitor.Exit(lockObj);                      // 释放对象的监视器锁
            }
        }
```

**Monitor**类提供了一种同步机制，可以使用Enter和Exit方法来实现线程的阻塞和唤醒。Monitor.Enter用于获取对象的监视器锁，用于确保在同一时间只有一个线程可以访问共享资源。当一个线程获取了对象的监视器锁后，其他线程必须等待该锁被释放才能访问该对象。如图，我们可以看到多个线程只有一个线程处于运行中状态

![image-20240403180455518](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240403180455518.png)

```csharp
        [Test]
        public void MutexTest()
        {
            var muter = new Mutex();
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(() => DoWork());
            var thread2 = new Thread(() => DoWork());
            thread1.Start();
            thread2.Start();

            while (!(thread1.ThreadState == ThreadState.Stopped || thread2.ThreadState == ThreadState.Stopped))
            {
                Console.WriteLine($"主线程监控thread线程状态：thread1——{thread1.ThreadState}；thread2——{thread2.ThreadState}");
                Thread.Sleep(300);
            }
            thread1.Join();
            thread2.Join();
            Console.WriteLine("主线程：结束");


            void DoWork()
            {
                Console.WriteLine("内部thread线程状态：" + Thread.CurrentThread.ThreadState);
                muter.WaitOne();                            // 用于等待 Mutex 对象被释放
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s
                {

                }
                Console.WriteLine("thread线程：完成xxx");
                muter.ReleaseMutex();                       // 释放 Mutex 对象
            }
        }
```

**Mutex**类也提供了一种同步机制，可以使用WaitOne和ReleaseMutex方法来实现线程的阻塞和唤醒。Mutex.WaitOne 用于等待 Mutex 对象被释放。确保在同一时间只有一个线程可以访问共享资源。当一个线程获取了 Mutex 对象后，其他线程必须等待该对象被释放才能访问该资源。如图，我们可以看到多个线程只有一个线程处于运行中状态

![image-20240407103602809](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407103602809.png)

```csharp
        [Test]
        public void SemaphoreTest()
        {
            var semaphore = new Semaphore(1, 1);                // 设置初始值和同时最大并发数为1，不要设置成(0,1)
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(() => DoWork());
            var thread2 = new Thread(() => DoWork());
            var thread3 = new Thread(() => DoWork());
            thread1.Start();
            thread2.Start();
            thread3.Start();

            while (!(thread1.ThreadState == ThreadState.Stopped || thread2.ThreadState == ThreadState.Stopped || thread3.ThreadState == ThreadState.Stopped))
            {
                Console.WriteLine($"主线程监控thread线程状态：thread1——{thread1.ThreadState}；thread2——{thread2.ThreadState}；thread3——{thread3.ThreadState}");
                Thread.Sleep(300);
            }
            thread1.Join();
            thread2.Join();
            thread3.Join();
            Console.WriteLine("主线程：结束");


            void DoWork()
            {
                Console.WriteLine("内部thread线程状态：" + Thread.CurrentThread.ThreadState);
                semaphore.WaitOne();                        // 用于等待 Mutex 对象被释放
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s
                {

                }
                Console.WriteLine("thread线程：完成xxx");
                semaphore.Release();                       // 释放 Mutex 对象
            }
        }
```

**Semaphore**类也是一种用于同步的类，可以通过WaitOne和Release方法来实现线程的阻塞和释放。Semaphore.WaitOne() 用于等待 Semaphore 对象被释放。控制对共享资源的访问。当一个线程获取了 Semaphore 对象后，其他线程必须等待该对象被释放才能访问该资源。如图，我们可以看到多个线程只有一个线程处于运行中状态

![image-20240407105404666](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407105404666.png)

##### 阻塞等待

join也是阻塞的一种，join用于“阻塞”当前线程，等待被调用的线程执行完毕。join允许指定超时时间。

```csharp
        [Test]
        public void JoinTest()
        {
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(() => DoWork());

            new Thread(() => GetThread(Thread.CurrentThread, thread1)).Start();     // 新开线程监控主线程和thread1线程状态
            Thread.Sleep(1000);
            thread1.Start();
            Console.WriteLine("主线程：开始等待thread1执行" + GetNow());
            thread1.Join();                                 // 阻塞当前线程，等待thread1线程执行完成
            Console.WriteLine("主线程：thread1已执行完成" + GetNow());
            Console.WriteLine("主线程：结束");

            void DoWork()
            {
                var innerThred = new Thread(() => {
                    var time = DateTime.Now;
                    while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s
                    {

                    }
                });
                innerThred.Start();
                innerThred.Join();
                Console.WriteLine("thread线程：完成xxx");
            }

            void GetThread(Thread mainThread, Thread thread1)
            {
                while (thread1.ThreadState != ThreadState.Stopped)
                {
                    Console.WriteLine($"监控线程状态：thread1——{thread1.ThreadState}；主线程——{mainThread.ThreadState}");
                    Thread.Sleep(300);
                }
            }
        }
```

如图，thread1调用join后，主线程会等待thread1线程完成后才继续往下执行。（为啥主线程还是运行中状态？？？预期是WaitSleepJoin状态，子线程可达到预期）

![image-20240407160341436](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407160341436.png)

##### 中断

Interrupt可用于中断线程，但**只可以中断状态为WaitSleepJoin的线程**，中断成功会抛出异常。

```csharp
        [Test]
        public void InterruptTest()
        {
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(() => DoWork1());
            var thread2 = new Thread(() => DoWork2());
            new Thread(() => GetThread(thread1, thread2)).Start();     // 监控
            thread1.Start();
            thread2.Start();

            Thread.Sleep(1000);

            thread1.Interrupt();    // 主线程等待1s后中断thread1线程，此时thread1线程状态为运行中————无法中断
            thread2.Interrupt();    // 主线程等待1s后中断thread2线程，此时thread2线程状态为WaitSleepJoin————中断成功，需要手动处理异常

            thread1.Join();
            thread2.Join();
            Console.WriteLine($"主线程：结束，thread1——{thread1.ThreadState}；thread2——{thread2.ThreadState}");

            void DoWork1()
            {
                try
                {
                    var time = DateTime.Now;
                    while (DateTime.Now < time.AddSeconds(2))   // 模拟耗时，等待2s，当前线程状态为运行中
                    {

                    }
                    Console.WriteLine("thread1线程：完成xxx");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"thread1线程：出现异常，{ex.Message}。");
                }
            }

            void DoWork2()
            {
                try
                {
                    Thread.Sleep(2000);                         // 等待2s，当前线程状态为WaitSleepJoin
                    Console.WriteLine("thread2线程：完成xxx");
                }
                catch (Exception ex)
                {
                    // Interrupt时，线程从等待状态被中断，会抛出异常
                    Console.WriteLine($"thread2线程：出现异常，{ex.Message}。");
                }
            }


            void GetThread(Thread thread1, Thread thread2)
            {
                while (thread1.ThreadState != ThreadState.Stopped || thread2.ThreadState != ThreadState.Stopped)
                {
                    Console.WriteLine($"监控线程状态：thread1——{thread1.ThreadState}；thread2——{thread2.ThreadState}");
                    Thread.Sleep(300);
                }
            }

        }
```

如图，当我们对thread1、thread2调用Interrupt尝试中断线程时，thread1并没有中断成功，由于thread2处于WaitSleepJoin状态，所以thread2可以中断成功

![image-20240407163829904](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407163829904.png)

##### 终止

Abort用于终止当前线程的执行。在 .NET Core 和 .NET 5 及以后的版本中，该方法不再受支持并抛出 `PlatformNotSupportedException` 异常，**不推荐使用**，所以这里就不展开讲了，重点讲一下不使用Abort如何终止线程。

```csharp
thread1.Abort();	// 已弃用
```

我们可以是用其他方式终止线程

1. 使用 `CancellationToken` 来取消线程任务。
2. 使用 `Thread.Interrupt` 方法中断线程，注意只能中断WaitSleepJoin状态的线程还需要手动捕获异常——ThreadInterruptedException。（参考上方的Interrupt）
3. 使用 `Task` 和 `async/await` 来管理异步操作的取消和异常处理——Task章节补充。

```csharp
        [Test]
        public void CancellationTokenSourceTest()
        {
            var ctx = new CancellationTokenSource();
            Console.WriteLine("主线程：开始");
            Task.Run(DoWork, ctx.Token);

            Thread.Sleep(1000);

            ctx.Cancel();       // 取消任务
            Console.WriteLine($"主线程：结束");

            void DoWork()
            {
                Console.WriteLine("thread线程：开始执行");
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(2))
                {

                }
                Console.WriteLine("thread线程：完成xxx");
            }
        }
```

如图，我们使用 `CancellationToken` 来取消线程任务。可以看到，thread线程终止成功，仅执行了一部分就没有往下执行了

![image-20240407175539694](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240407175539694.png)

##### 线程死亡

线程死亡是指线程已经完成了其任务，并且已经被操作系统回收，我们可以通过`IsAlive`来判断线程是否存活。线程死亡后，**线程的资源会被操作系统回收**，因此**不能再次使用该线程**。以下操作会造成线程死亡

- 自然死亡，线程任务完成，自动结束。
- 线程被终止/中断——Abort/Interrupt
- 线程被取消——CancellationToken

thread.join(time)——注意**线程超时并不会造成线程死亡**。若主线程有足够的时间等待子线程（join超时后主线程仍未结束），那么子线程的逻辑依旧会完整执行

```csharp
        [Test]
        public void IsAliveTest()
        {
            Console.WriteLine("主线程：开始");
            var ctx = new CancellationTokenSource();
            var thread1 = new Thread(()=> DoWork1(ctx.Token));
            var thread2 = new Thread(() => DoWork2());
            var thread3 = new Thread(DoWork3);
            var thread4 = new Thread(DoWork2);
            new Thread(() => GetThread(thread1, thread2, thread3, thread4)).Start();     // 监控
            

            thread1.Name = "thread1";
            thread1.Start();
            thread2.Name = "thread2";
            thread2.Start();
            thread3.Name = "thread3";
            thread3.Start();
            thread4.Name = "thread4";
            thread4.Start();

            Thread.Sleep(500);

            ctx.Cancel();           // 取消thread1线程
            thread2.Interrupt();    // 中断thread2线程
            thread3.Join(1000);     // 等待超时thread3线程    1000<5000
            Console.WriteLine("111111111111111111111111");

            thread1.Join();
            thread2.Join();
            thread4.Join();         // thread4正常执行完成

            var strs = new List<Thread>() { thread1, thread2, thread3, thread4 }.Select(x => $"{x.Name}——状态：{x.ThreadState},是否存活：{x.IsAlive}").ToList();
            Console.WriteLine($"主线程：{GetNow()}，结束，" + string.Join(";", strs));

            thread3.Join();         // 等待thread3执行完成
            var strs2 = new List<Thread>() { thread1, thread2, thread3, thread4 }.Select(x => $"{x.Name}——状态：{x.ThreadState},是否存活：{x.IsAlive}").ToList();
            Console.WriteLine($"再次检测主线程：{GetNow()}，结束，" + string.Join(";", strs2));

            // 线程死亡后无法操作该线程
            // thread1.Start();     // 异常：System.Threading.ThreadStateException : Thread is running or terminated; it cannot restart

            void DoWork1(CancellationToken ctx)
            {
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(5) && !ctx.IsCancellationRequested)   // 模拟耗时，等待5s
                {

                }
                if (ctx.IsCancellationRequested)
                {
                    Console.WriteLine($"{Thread.CurrentThread.Name}线程：已经被取消，无法执行");
                    return;    // 判断是否被取消，若已取消则不往下执行
                }
                Console.WriteLine($"{Thread.CurrentThread.Name}线程：完成xxx");
            }

            void DoWork2()
            {
                try
                {
                    Thread.Sleep(2000);                         // 等待2s
                    Console.WriteLine($"{Thread.CurrentThread.Name}线程：完成xxx");
                }
                catch (Exception ex)
                {
                    // Interrupt时，线程从等待状态被中断，会抛出异常
                    Console.WriteLine($"thread2线程：出现异常，{ex.Message}。");
                }
            }

            void DoWork3()
            {
                var time = DateTime.Now;
                while (DateTime.Now < time.AddSeconds(5))   // 模拟耗时，等待5s
                {

                }
                Console.WriteLine($"{Thread.CurrentThread.Name}线程：完成xxx");
            }

            void GetThread(params Thread[] threads)
            {
                while (threads.Any(x=>x.ThreadState != ThreadState.Stopped))
                {
                    var strs = threads.Select(x => $"{x.Name}——状态：{x.ThreadState},是否存活：{x.IsAlive}").ToList();
                    Console.WriteLine($"监控线程状态：{GetNow()}，" + string.Join(";", strs));
                    Thread.Sleep(300);
                }
            }
        }
```

如图，thread1被取消、thread2被中断线程状态变为Stoped状态，此时线程未存活；thread3调用join等待超时，但线程状态仍然是Running且存活；最后thread3、thread4线程执行完成后，线程变为不存活；

![image-20240408114646360](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240408114646360.png)

##### 锁

线程锁是一种同步机制，用于**确保多个线程在访问共享资源时不会发生冲突**。因为线程需要等待锁被释放，线程锁会影响性能，在使用线程锁时，应**尽量减少锁定的代码块的大小**，以提高性能。此外，还可以使用其他同步机制，如 Monitor、Mutex、Semaphore 等，来实现线程同步。

```csharp
        [Test]
        public void LockTest()
        {
            var number = 0;
            var lockObj = new object();
            Console.WriteLine("主线程：开始，使用锁");
            var thread1 = new Thread(DoWork);
            var thread2 = new Thread(DoWork);

            Thread.Sleep(1000);
            thread1.Start();
            thread2.Start();

            thread1.Join();
            thread2.Join();
            Console.WriteLine($"主线程：结束，number：" + number);

            void DoWork()
            {
                for (int i = 0; i < 10000; i++) // 循环次数调大一点，不然看不出效果，多执行几遍看效果
                {
                    lock (lockObj)
                    {
                        number++;
                    }
                }
            }
        }
```

![image-20240408152352961](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240408152352961.png)

##### 死锁

线程死锁是指两个或多个线程在执行过程中，因**争夺资源而造成的一种互相等待的现象**，若无外力作用，它们都将无法继续执行下去。

如图，线程1拥有锁A的同时去等待获取锁B才能继续往下执行，而线程2拥有锁B的同时去等待获取锁A才能往下继续执行，这时局面就僵持住了，导致两个线程都没法继续往下执行。

![image-20240408160206650](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240408160206650.png)



**产生死锁的四个必要条件**

这部分内容通俗易懂，给原作者点赞。参考：[多线程——死锁详解_多线程事务死锁-CSDN博客](https://blog.csdn.net/qq_55072036/article/details/132574245)

发生死锁，必须要具备着四个条件，当同时具备时，才会出现死锁。

1. **互斥使用**。⼀个资源只能被⼀个线程占有，当这个资源被占⽤之后其他线程就只能等待——<u>线程1拿到了锁，线程2就得等着（锁的基本特性）</u>。
2. **不可抢占**。当⼀个线程不主动释放资源时，此资源⼀直被拥有线程占有，其他线程不能得到此资源——<u>线程1拿到锁之后，必须是线程1主动释放。线程2不能强行把锁获取。</u>
3. ***请求和保持**。 线程已经拥有了⼀个资源之后，又尝试请求新的资源——<u>线程1拿到锁A之后，又尝试获取锁B，A这把锁还是保持的（不会因为尝试获取锁B就给锁A释放了）。</u>
4. ***循环等待**。线程1尝试获取到锁A和锁B，线程2尝试获取到锁B和锁A——<u>线程1在尝试获取锁B的时候需要等待线程2释放锁B；同时线程2在尝试获取锁A的时候需要等待线程1释放锁A。</u>

```csharp
        [Test]
        public void DeathLockTest()
        {
            var lockA = new object();
            var lockB = new object();
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(DoWork1);
            var thread2 = new Thread(DoWork2);

            Thread.Sleep(1000);
            thread1.Start();
            thread2.Start();

            thread1.Join(200 * 1000);
            thread2.Join(200 * 1000);    // 最多执行200s
            Console.WriteLine($"主线程：结束");

            void DoWork1()
            {
                // 先获取锁A，再获取锁B
                lock (lockA)
                {
                    Console.WriteLine("thread1线程获取到锁A：lockA" + GetNow());
                    Thread.Sleep(1000);     // 模拟耗时
                    lock (lockB)
                    {
                        Console.WriteLine("thread1线程获取到锁B：lockB" + GetNow());
                    }
                }
                Console.WriteLine($"thread1线程：完成xxx");
            }

            void DoWork2()
            {
                // 先获取锁B，再获取锁A
                lock (lockB)
                {
                    Console.WriteLine("thread2线程获取到锁B：lockB" + GetNow());
                    Thread.Sleep(1000);     // 模拟耗时
                    lock (lockA)
                    {
                        Console.WriteLine("thread2线程获取到锁A：lockA" + GetNow());
                    }
                }
                Console.WriteLine($"thread2线程：完成xxx");
            }
        }
```

如图，演示死锁。程序执行了6分钟都没有执行完完整逻辑，如果不是加了`Join(200 * 1000)`限定等待时间，那么没有外力的作用影响下，程序永远都不会结束也永远不会往下执行

![image-20240409153616459](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240409153616459.png)

那**怎样避免死锁的发生**呢？我们都知道死锁的发生必须同时具备四个条件，缺一不可。所以我们只要不满足一个条件那么就能有效避免死锁的发生了。

1. 破坏互斥条件——将互斥资源改造成共享资源。
2. 破坏不剥夺条件——当（长时间）无法获取某个资源时，需要释放该线程所有占有资源，并做相应补偿操作（提醒、重试等）。
3. 破坏请求和保持条件——采用静态分配法，运行前一次性申请全部资源，全部获取到资源后才往下执行。在C#中，`lock`关键字会自动破坏保持和请求条件，因为它会在锁定锁对象之前等待，直到锁对象可用。使用lock时需要小心处理锁的顺序。如果锁的顺序不正确，可能会导致死锁
4. 破坏循环等待条件——采用顺序资源分配法。即给相同类型的互斥资源进行从小到大编号，当要获取编号大的资源时，必要先获取到排在他前面的所有同类资源

更多请参考：[死锁的处理策略—预防死锁、避免死锁、检测和解除死锁_死锁预防和死锁避免-CSDN博客](https://blog.csdn.net/daocaokafei/article/details/125531152)

常用的死锁避免方法

- 加锁时序——避免循环等待
- 加锁时限——尝试获取锁时，加上最大等待时间。当超过等待时间未获取到锁资源时，做相应补偿操作（提醒、回滚、重试等），并释放当前线程拥有的锁资源
- 死锁检测工具——jstack、jconsole、jvisualvm、jmc、vs的并行堆栈。我都没试过，具体可参考[排查死锁的 4 种工具，秀~_c#死锁检测工具-CSDN博客](https://blog.csdn.net/m0_71777195/article/details/127298130)、[C# 死锁的原理与排查方法详解_c#线程死锁的原因及解决方法-CSDN博客](https://blog.csdn.net/DotnetNb/article/details/131075198)

**加锁时序**

避免死锁最有效的方式就是**避免循环加锁**。如果真的需要循环加锁，那么我们可以使用加锁时序的方式来避免死锁。简单来讲就是给锁资源维护一个排序——锁ABCD...，当获取某个锁资源时必须要同时获取前面的所有锁才有可能获取到指定的锁资源。如线程2想要获取锁D，那么线程2要先获取锁A、锁B、锁C再获取锁D。当然了，这对性能肯定有非常大的影响的

```csharp
        [Test]
        public void UnDeathLockTest()
        {
            var lockA = new object();
            var lockB = new object();
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(DoWork1);
            var thread2 = new Thread(DoWork2);

            Thread.Sleep(1000);
            thread1.Start();
            thread2.Start();

            thread1.Join();
            thread2.Join();
            Console.WriteLine($"主线程：结束");

            void DoWork1()
            {
                // 先获取锁A，再获取锁B
                lock (lockA)
                {
                    Console.WriteLine("thread1线程获取到锁A：lockA " + GetNow());
                    Thread.Sleep(1000);     // 模拟耗时
                    lock (lockB)
                    {
                        Thread.Sleep(1000);     // 模拟耗时
                        Console.WriteLine("thread1线程获取到锁B：lockB " + GetNow());
                    }
                }
                Console.WriteLine($"thread1线程：完成xxx");
            }

            void DoWork2()
            {
                // 先获取锁A，再获取锁B
                lock (lockA)
                {
                    Console.WriteLine("thread2线程获取到锁A：lockA " + GetNow());
                    Thread.Sleep(2000);     // 模拟耗时
                    lock (lockB)
                    {
                        Thread.Sleep(2000);     // 模拟耗时
                        Console.WriteLine("thread2线程获取到锁B：lockB " + GetNow());
                    }
                }
                Console.WriteLine($"thread2线程：完成xxx");
            }
        }
```

如图，我们可以发现程序正常执行。每个线程都是按同类资源顺序先获取锁A再获取锁B，执行逻辑后先释放锁B再释放锁A，每个线程都能完整执行所有逻辑，因为每个线程开始前都会先去竞争锁A，获取到锁A才往下执行，自然就不会出现循环等待的情况了

![image-20240409161909645](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240409161909645.png)

**加锁时限**

在C#中，可以使用`Monitor`类的`TryEnter`方法来设置加锁时限，从而避免死锁。`TryEnter`不会抛出异常，我们可以根据返回值进行下一步补偿操作。返回true，说明获取到锁资源，返回false，说明在指定等待时间内没有获取到锁资源。

```csharp
        [Test]
        public void UnDeathLockTryEnterTest()
        {
            var lockA = new object();
            var lockB = new object();
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(DoWork1);
            var thread2 = new Thread(DoWork2);

            Thread.Sleep(1000);
            thread1.Start();
            thread2.Start();

            thread1.Join();
            thread2.Join();
            Console.WriteLine($"主线程：结束");

            void DoWork1()
            {
                // 先获取锁A，再获取锁B
                if (Monitor.TryEnter(lockA, 3000))
                {
                    Console.WriteLine("thread1线程获取到锁A：lockA " + GetNow());
                    Thread.Sleep(1000);     // 模拟耗时
                    if (Monitor.TryEnter(lockB, 3000))
                    {
                        Console.WriteLine("thread1线程获取到锁B：lockB " + GetNow());
                        Thread.Sleep(1000);     // 模拟耗时
                        Console.WriteLine("thread1线程释放锁B：lockB " + GetNow());
                    }
                    else
                    {
                        Console.WriteLine("Error：thread1线程获取锁B超时，请检查。" + GetNow());
                        return;
                    }
                    Console.WriteLine("thread1线程释放锁A：lockA " + GetNow());
                }
                else
                {
                    Console.WriteLine("Error：thread1线程获取锁A超时，请检查。" + GetNow());
                    return;
                }
                
                Console.WriteLine($"thread1线程：完成xxx");
            }

            void DoWork2()
            {
                // 先获取锁A，再获取锁B
                if (Monitor.TryEnter(lockB, 2000))
                {
                    Console.WriteLine("thread2线程获取到锁B：lockB " + GetNow());
                    Thread.Sleep(2000);     // 模拟耗时
                    if (Monitor.TryEnter(lockA, 2000))
                    {
                        Console.WriteLine("thread2线程获取到锁A：lockA " + GetNow());
                        Thread.Sleep(2000);     // 模拟耗时
                        Console.WriteLine("thread2线程释放锁A：lockA " + GetNow());
                    }
                    else
                    {
                        Console.WriteLine("Error：thread2线程获取锁A超时，请检查。" + GetNow());
                        return;
                    }
                    Console.WriteLine("thread2线程释放锁B：lockB " + GetNow());
                }
                else
                {
                    Console.WriteLine("Error：thread2线程获取锁B超时，请检查。" + GetNow());
                    return;
                }
                Console.WriteLine($"thread2线程：完成xxx");
            }
        }
```

如图、由于未获取到锁资源，有些线程没有完整执行。加锁时限可以有效避免发生死锁，我们可以根据返回值进行下一步补偿操作

![image-20240409163736534](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240409163736534.png)

##### volatile关键词

参考：[[C#.NET 拾遗补漏\]10：理解 volatile 关键字 - 精致码农 - 博客园 (cnblogs.com)](https://www.cnblogs.com/willick/p/13889006.html)

Release模式下，编译器会优化我们的代码，减少不必要的重复运算。

```csharp
    public int x;
    public void DoWork()
    {
        x = 5;
        var y = x + 10;
        Debug.WriteLine("x = " +x + ", y = " +y);
    }
```

在 Release 模式下，编译器读取 `x = 5` 后紧接着读取 `y = x + 10`，在单线程思维模式下，编译器会认为 `y` 的值始终都是 `15`。所以编译器会把 `y = x + 10` 优化为 `y = 15`，避免每次读取 `y` 都执行一次 `x + 5`的操作。但 `x` 字段的值可能在运行时被**其它的线程修改**，但是我们拿到的 `y` 值并不是修改后的值，`y` 的值永远都是 `15`。

在单线程中一般不会有问题，但如果在多线程中，就会出现这种情况：进程将某个变量number分配给两个线程，thread2线程修改number值，但是thread1线程并没有获取到修改后的number值，如下

```csharp

        [Test]
        public void NotVolatileTest()
        {
            int number = 0;
#if DEBUG
            Console.WriteLine("主线程：开始，当前环境：Debug");
#elif RELEASE
            Console.WriteLine("主线程：开始，当前环境：Release");
#else
            Console.WriteLine("主线程：开始，当前环境：未知");
#endif
            var thread0 = new Thread(DoWork0);
            var thread1 = new Thread(DoWork1);
            var thread2 = new Thread(DoWork2);

            thread0.Start();
            thread1.Start();
            thread2.Start();

            Thread.Sleep(3000);     // 等待足够时间执行完thread0、thread1、thread2。单元测试不要使用join，程序会一直等待的，无法看到效果
            Console.WriteLine($"主线程：结束");

            void DoWork0()
            {
                Console.WriteLine($"thread0读取到值——number:{number}");
                // release模式下会被编译器优化成 true。即使后续thread2修改number的值，这里仍然是true，编译器不会再次运算。
                while (number == 0)
                {
                }
                Thread.Sleep(500);
                Console.WriteLine($"thread0线程：完成xxx——number:{number}");
            }

            void DoWork1()
            {
                Console.WriteLine($"thread1读取到值——number:{number}");
                var i = 0;
                // release模式下会被编译器优化成 true。即使后续thread2修改number的值，这里仍然是true，编译器不会再次运算。
                while (number == 0)
                {
                    // Thread.Sleep(500);、Task.Delay(500).Wait(); 不能用这两个等待，这两种方法等待结束后会重新分配cpu等资源，此时可能会拿到修改后的number值，达不到预期效果。
                    // 使用SpinWait不会放弃当前的cpu等资源，但是达不到等待的效果
                    // 不能使用 Console.WriteLine 输出信息，否则达不到预期效果（很是疑问？？？）
                    // 我就纳闷了，DoWork1咋加个等待并输出，DoWork0和DoWork1的执行情况则不一样呢？这里真的卡了好久...
                    if (i % 50 == 0)
                    {
                        i++;
                    }
                }
                Thread.Sleep(500);
                Console.WriteLine($"thread1线程：完成xxx——number:{number}");
            }

            void DoWork2()
            {
                Thread.Sleep(1000);
                number = 100;
                Console.WriteLine($"thread2设置值——number:{number}");
                Console.WriteLine($"thread2线程：完成xxx");
            }
        }
```

如图，thread0、thread1线程并没有按照预期执行成功——thread2线程修改了number的值，但是thread0、thread1线程未能获取到thread2线程修改number后的值，导致一直处于while循环，无法往下操作——while(number == 0)始终成立

![image-20240509103334814](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509103334814.png)

为了解决这种情况，我们可以引入**volatile关键词修饰类的字段**，目的是告诉编译器该字段的值可能会被多个独立的线程改变，不要对该字段的访问进行优化

```csharp
        volatile int number = 0;
        [Test]
        public void VolatileTest()
        {
#if DEBUG
            Console.WriteLine("主线程：开始，当前环境：Debug");
#elif RELEASE
            Console.WriteLine("主线程：开始，当前环境：Release");
#else
            Console.WriteLine("主线程：开始，当前环境：未知");
#endif
            var thread0 = new Thread(DoWork0);
            var thread1 = new Thread(DoWork1);
            var thread2 = new Thread(DoWork2);

            thread0.Start();
            thread1.Start();
            thread2.Start();

            Thread.Sleep(3000);     // 等待足够时间执行完thread0、thread1、thread2。单元测试不要使用join，程序会一直等待的，无法看到效果
            Console.WriteLine($"主线程：结束");

            void DoWork0()
            {
                Console.WriteLine($"thread0读取到值——number:{number}");
                // release模式下会被编译器优化成 true。即使后续thread2修改number的值，这里仍然是true，编译器不会再次运算。
                while (number == 0)
                {
                }
                Thread.Sleep(500);
                Console.WriteLine($"thread0线程：完成xxx——number:{number}");
            }

            void DoWork1()
            {
                Console.WriteLine($"thread1读取到值——number:{number}");
                var i = 0;
                // release模式下会被编译器优化成 true。即使后续thread2修改number的值，这里仍然是true，编译器不会再次运算。
                while (number == 0)
                {
                    // Thread.Sleep(500);、Task.Delay(500).Wait(); 不能用这两个等待，这两种方法等待结束后会重新分配cpu等资源，此时可能会拿到修改后的number值，达不到预期效果。
                    // 使用SpinWait不会放弃当前的cpu等资源，但是达不到等待的效果
                    // 不能使用 Console.WriteLine 输出信息，否则达不到预期效果（很是疑问？？？）
                    // 我就纳闷了，DoWork1咋加个等待并输出，DoWork0和DoWork1的执行情况则不一样呢？这里真的卡了好久...
                    if (i % 50 == 0)
                    {
                        i++;
                    }
                }
                Thread.Sleep(500);
                Console.WriteLine($"thread1线程：完成xxx——number:{number}");
            }

            void DoWork2()
            {
                Thread.Sleep(1000);
                number = 100;
                Console.WriteLine($"thread2设置值——number:{number}");
                Console.WriteLine($"thread2线程：完成xxx");
            }
        }
```

如图，thread0、thread1线程均成功执行——这俩线程获取到修改后的值，跳出while循环，继续往下执行——while(number==0)不成立

![image-20240509103701058](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509103701058.png)

使用volatile需要注意以下几点。

###### volatile不能用来做线程同步

volatile 不能用来做线程同步（多次修改），它的主要作用是为了让多个线程之间能看到被修改过后最新的值。

```csharp
        private volatile int count;
        [Test]
        public void DontDoWithvolatile1()
        {
            
            Console.WriteLine("主线程：开始");
            var thread1 = new Thread(DoWork);
            var thread2 = new Thread(DoWork);

            Thread.Sleep(1000);
            thread1.Start();
            thread2.Start();

            thread1.Join();
            thread2.Join();
            Console.WriteLine($"主线程：结束，count：" + count);

            void DoWork()
            {
                for (int i = 0; i < 100000; i++) // 循环次数调大一点，不然看不出效果，多执行几遍看效果
                {
                    count++;
                }
            }
        }
```

如下，volatile 不能用来做线程同步（多次修改），无法代替锁

![image-20240509104616057](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509104616057.png)

###### volatile 仅支持类或结构的字段

如下，volatile **仅支持类或结构的字段**（自然不能用var声明），不支持局部变量

![image-20240509105104298](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509105104298.png)

###### volatile 支持常见简单类型、引用类型

volatile 支持常见简单类型、引用类型，但是**不支持long和double类型**。这些类型没有一一尝试，粗略尝试几个，见仁见智。更多请参考：[volatile - C# 参考 - C# | Microsoft Learn](https://learn.microsoft.com/zh-cn/dotnet/csharp/language-reference/keywords/volatile)

![image-20240509105647129](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509105647129.png)

###### volatile 仅在Release环境下起作用

volatile 仅在Release模式下"起作用"，因为只有在Release模式下，编译器才会进行优化代码，此时我们才需要使用volatile告知编译器某个变量无需优化。Debug环境不会优化，自然就不需要volatile。

如下，我们在**Debug环境下执行NotVolatileTest方法**，我们可以发现thread0、thread1均成功执行

![image-20240509110217053](https://gcore.jsdelivr.net/gh/logerlink/blogImg/typora-img/2024/image-20240509110217053.png)

#### 欢迎补充
