[TOC]

### 守护进程是什么？

守护进程( daemon )是一类在后台运行的特殊进程，用于执行特定的系统任务。很多守护进程在系统引导的时候启动，并且一直运行直到系统关闭。另一些只在需要的时候才启动，完成任务后就自动结束.[守护进程_百度百科 (baidu.com)](https://baike.baidu.com/item/守护进程/966835)

英文名是 daemon ，不是 deamon 写了好久看了百科才知道...

他与我们的主程序通常不会出现交互的情况，而且守护进程是脱离于我们主程序执行的。可以理解为两个单独的程序，当主程序A出现问题意外闪退时，守护程序B不会因为主程序A出问题而导致程序B无法运行，简单来说就是A挂了，B还可以正常运行，B不受A影响。

通常守护进程的名字比主程序多一个d，如主程序名为main.exe，那么守护进程应该时maind.exe。可参考mysql、mysqld，mongo、mongod

### 守护进程常用来做什么？

1.重启、流氓软件关也关不掉

2.记录主程序崩溃闪退的日志

3.检查网络连接、位置信息

### 如何实现一个简单的守护进程？

以下内容大部分都参考于：[c# 守护进程，WPF程序自守护_David-CSDN博客_wpf 守护进程](https://blog.csdn.net/lwwl12/article/details/79035246)  因为这个例子有一个无法处理的问题——守护进程无法隐藏。所以我拿过来改了一下。

![image-20211025172832911](https://i.loli.net/2021/10/25/xDtILZHJuK4MRea.png)

#### 主程序 MainPro

##### 替换 App.xaml.cs

```csharp
    public partial class App : Application
    {
        /// <summary>
        /// 当前（主）程序的双开标识
        /// </summary>
        private static Mutex mutex;
        protected override void OnStartup(StartupEventArgs e)
        {
            #region 避免双开
            //避免双开
            mutex = new System.Threading.Mutex(true, "MUTEX_MAIN");
            if (mutex.WaitOne(0, false))
            {
                RunMonitorTimer();
                base.OnStartup(e);
            }
            else
            {
                MessageBox.Show($"无法双开主程序");
                this.Shutdown();    //关闭此次打开的程序
            }
            #endregion
        }

        #region 监视并启动守护进程
        /// <summary>
        /// 守护进程互斥量
        /// </summary>
        private static Mutex mutex_daemon;

        /// <summary>
        /// 打开监视定时器
        /// </summary>
        public void RunMonitorTimer()
        {
            System.Timers.Timer timer = new System.Timers.Timer();
            timer.Elapsed += timer_Elapsed;
            timer.Interval = 5000;          //主进程启动后5秒  开始启动守护进程，后续每5秒检测一次守护进程是否存在,若不存在则启动守护进程
            timer.Start();
        }
        /// <summary>
        /// 守护进程是否已经启动过了
        /// </summary>
        private bool isStarted { get; set; } = false;

        /// <summary>
        /// 定时任务检测守护进程是否存在
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            if (mutex_daemon == null)
            {
                mutex_daemon = new Mutex(true, "MUTEX_DAEMON");
            }
            if (mutex_daemon.WaitOne(0, false))
            {
                try
                {
                    //必须释放mutex，否则将导致mutex被占用，主程序不能允许
                    mutex_daemon.Dispose();
                    mutex_daemon = null;
                    if (!isStarted)
                    {
                        isStarted = true;
                        RunProcess();
                    }
                    isStarted = false;
                }
                catch (Exception ex)
                {
                    isStarted = false;
                    MessageBox.Show($"【{DateTime.Now}】守护程序重启失败！" + ex.ToString());
                }
            }
        }

        /// <summary>
        /// 打开守护程序 MainProd
        /// </summary>
        public void RunProcess()
        {
            Process m_Process = new Process();
            var fileName = Process.GetCurrentProcess().MainModule.FileName; //当前程序exe完整路径
            m_Process.StartInfo.FileName = fileName.Replace("MainPro.exe", "MainProd.exe");
            //严谨一点可以判断进程名称  但是进程名称可能会冲突。。。
            //if(!ProcessHelper.CheckProcess("MainProd")) m_Process.Start();
            m_Process.Start();
        }
        #endregion
    }
```

利用 System.Timers.Timer 定时器来循环检测守护程序B是否存在——Mutex.WaitOne(0, false)

若不存在则启动守护程序B。

##### 替换 MainWindow.xaml

```xaml
<Window x:Class="MainPro.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:MainPro"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800" Closing="Window_Closing">
    <Grid>
        <Label Content="主程序"></Label>
        <Button Width="150" Height="50" Content="点击触发异常" Click="Button_Click"></Button>
    </Grid>
</Window>

```

##### MainWindow.xaml.cs 添加

```csharp
        private void Button_Click(object sender, RoutedEventArgs e)
        {
            new Thread(() => {
                string ss = null;
                var sss = ss.ToString();    //空指针异常
            }).Start();

            Thread.Sleep(1000);
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            //关闭主程序时，先关闭守护进程再关闭主程序
            ProcessHelper.KillProcess("MainProd", "MainPro");   //注意不要加exe
        }
```

方法 Button_Click 主要是测试主程序A异常时，守护进程B是否可以记录异常信息并重启主程序A。

![主程序A异常闪退](https://i.loli.net/2021/10/25/kQDTiRYdU7zG2mt.gif)

方法 Window_Closing 主要是为了关掉主程序A，因为守护线程会持续检测主程序A是否存在，若不存在则启动主程序A，这时我们关掉主程序A，守护进程检测不存在就又会帮我们把程序开起来，就会造成主程序A "关不掉" 的现象。要测试的话可以把这个函数的内容注释。

![image-20211025175407654](https://i.loli.net/2021/10/25/EoSMQ7c2qiUAOaH.png)

![关不掉](https://i.loli.net/2021/10/25/3JXAZNmH7MbBSFC.gif)

#### 守护程序 MainProd

##### 替换 App.xaml.cs

```csharp
    public partial class App : Application
    {
        /// <summary>
        /// 当前（守护）程序的双开标识
        /// </summary>
        private static Mutex mutex;
        protected override void OnStartup(StartupEventArgs e)
        {
            #region 避免双开
            //避免双开
            mutex = new Mutex(true, "MUTEX_DAEMON");
            if (mutex.WaitOne(0, false))
            {
                RunMonitorTimer();
                base.OnStartup(e);
            }
            else
            {
                MessageBox.Show($"无法双开守护程序"); 
                this.Shutdown();    //关闭此次打开的程序
            }
            #endregion
        }

        #region 检测主程序状态并重启
        /// <summary>
        /// 主进程互斥量
        /// </summary>
        private static Mutex mutex_main;

        /// <summary>
        /// 是否正在记录日志
        /// </summary>
        private bool isLoging { get; set; } = false;
        /// <summary>
        /// 是否记录日志完成
        /// </summary>
        private bool isLoged { get; set; } = false;

        /// <summary>
        /// 打开监视定时器
        /// </summary>
        public void RunMonitorTimer()
        {
            System.Timers.Timer timer = new System.Timers.Timer();
            timer.Elapsed += timer_Elapsed;
            timer.Interval = 2000;          //守护进程启动后2秒  每隔2秒检测一次主进程是否存在,若不存在则启动主进程
            timer.Start();
        }

        /// <summary>
        /// 定时任务检测守护进程是否存在   并记录闪退日志
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            if (mutex_main == null)
            {
                mutex_main = new Mutex(true, "MUTEX_MAIN");
            }
            if (mutex_main.WaitOne(0, false))
            {
                try
                {
                    //必须释放mutex，否则将导致mutex被占用，主程序不能允许
                    mutex_main.Dispose();
                    mutex_main = null;
                    if (!isLoging)  //避免多次执行
                    {
                        isLoging = true;
                        //"Application"应用程序, "Security"安全, "System"系统    这个记录很快的
                        //这里有一个很严重的bug就是  你每次通过守护进程启动主程序时，他都会去记录有关MainPro的错误日志，因为我们没有一个标识表明这次启动的原因是由于闪退重启还是其他原因（关不掉演示会重复记录错误日志）。
                        //不过我们可以通过时间筛选，如在只获取5或3分钟内的最后两条有关于MainPro的错误日志
                        int time = 0;
                        var eventLog = new EventLog("Application");
                        var logInfo = "";
                        for (int i = eventLog.Entries.Count - 1; i >= 0; i--)
                        {
                            var entry = eventLog.Entries[i];
                            if (time > 1) break;
                            if ((entry.EntryType == EventLogEntryType.Error || entry.EntryType == EventLogEntryType.FailureAudit) && entry.Message.Contains("MainPro.exe"))
                            {
                                //只记录近2分钟内的错误日志     减少重复录入相同的错误日志
                                if (entry.TimeGenerated.AddMinutes(3) > DateTime.Now)
                                {
                                    var info = $"在{entry.TimeGenerated}，程序闪退！！！！！{entry.Message}";
                                    logInfo += info + "\r\n";
                                }
                                time++;
                            }
                        }
                        if (!isLoged)   ////避免多次执行
                        {
                            isLoged = true;
                            if(!string.IsNullOrWhiteSpace(logInfo)) LogHelper.WriteLog(logInfo);
                            RunProcess();
                        }
                        isLoged = false;
                        isLoging = false;
                    }
                }
                catch (Exception ex)
                {
                    isLoged = false;
                    isLoging = false;
                    LogHelper.WriteLog($"【{DateTime.Now}】主程序崩溃记录异常失败！" + ex.ToString());
                }
            }
        }

        /// <summary>
        /// 打开主程序    MainPro
        /// </summary>
        public void RunProcess()
        {
            Process m_Process = new Process();
            var fileName = Process.GetCurrentProcess().MainModule.FileName;     ////当前程序exe完整路径
            m_Process.StartInfo.FileName = fileName.Replace("MainProd.exe", "MainPro.exe");
            m_Process.Start();
        }

        
        #endregion
    }
```

利用 System.Timers.Timer 定时器来循环检测主程序A是否存在——Mutex.WaitOne(0, false)

若不存在则搜索window错误日志，将有关程序A的错误日志记录并重启程序A，值得注意的是有可能会重复记录到相同的错误日志。

##### 替换 MainWindow.xaml 

```xaml
<Window x:Class="MainProd.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:MainProd"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800" ShowInTaskbar="False" Visibility="Hidden" Closing="Window_Closing"> 
    <!--
    ShowInTaskbar="False"   在任务栏中隐藏程序图标
    Visibility="Hidden"     隐藏窗体  不可设置为Collapsed
    演示Window_Closing效果或其他测试时，可以不要设置这两个属性  更容易理解一点   
    -->
    <Grid>
        <Label>守护程序</Label>
    </Grid>
</Window>

```

[上述那个例子](https://blog.csdn.net/lwwl12/article/details/79035246) 将窗体设置为隐藏 Visibility="Hidden" 无法启动程序，但现在却可以，不知道为什么。

##### MainWindow.xaml.cs 添加

```csharp
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            //关闭守护程序时，要先关闭主进程再关闭守护程序
            ProcessHelper.KillProcess("MainPro", "MainProd");   //注意不要加exe
        }
```

#### 添加 MainProd 引用

很重要的一步，MainPro 添加对 MainProd 的引用

![image-20211025183018759](https://i.loli.net/2021/10/25/ASRsIdoZ2zpQk1q.png)

#### 其他

```csharp
        /// <summary>
        /// 记录日志到本地
        /// </summary>
        /// <param name="content"></param>
        public static void WriteLog(string content)
        {
            var folderPath = AppDomain.CurrentDomain.BaseDirectory + "logs\\";
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
            var filePath = folderPath + "crash.log";
            File.AppendAllText(filePath, content);
        }

        /// <summary>
        /// 强制杀死进程
        /// </summary>
        /// <param name="processName"></param>
        /// <returns>全部杀死则返回true</returns>
        public static bool KillProcess(params string[] processNameArr)
        {
            bool isAllKill = false;
            foreach (var item in processNameArr)
            {
                try
                {
                    isAllKill = false;
                    Process[] p2 = Process.GetProcessesByName(item);
                    foreach (var process in p2)
                    {
                        if (process.MainWindowTitle != "信息")
                        {
                            process.Kill();
                            isAllKill = true;
                        }
                    }

                    //p[0].Kill();
                    //MessageBox.Show("进程关闭成功！");
                }
                catch (Exception ex)
                {
                    LogHelper.WriteLog($"杀死进程{item}失败！" + ex.ToString());
                    //MessageBox.Show("无法关闭此进程！");
                }
            }
            if (isAllKill == true) return true;
            return false;
        }


        /// <summary>
        /// 检测是否存在某线程
        /// </summary>
        /// <param name="processName"></param>
        /// <returns>存在则返回true</returns>
        public static bool CheckProcess(string processName)
        {
            Process[] p2 = Process.GetProcessesByName(processName);
            return p2.Length > 0;
        }

```

完整代码：[logerlink/DaemonDemo: .net core wpf 最简单的守护进程 (github.com)](https://github.com/logerlink/DaemonDemo)

<img src="https://i.loli.net/2021/10/25/zeRIqTOV425kYfc.gif" alt="剑神"/>