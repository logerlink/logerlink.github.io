​	[修改部署平台](#修改部署平台)

​	[NuGet下载还原程序包](#NuGet下载还原程序包)

​	[修改部分代码](#修改部分代码)

​	[如何把软件Title去掉](#如何把软件Title去掉)

​	[如何主动打开新标签页](#如何主动打开新标签页)

​	[多标签同步Cookie](#多标签同步Cookie)

​	[右键功能](#右键功能)

​	[搜索文字功能](#搜索文字功能)

​	[其他](#其他)

本文核心部分为转载内容，下方为转载来源

[CefSharp禁止弹出新窗体，在同一窗口打开链接，或者在新Tab页打开链接，并且支持带type="POST" target="_blank"的链接](https://my.oschina.net/u/4266515/blog/3330018/print)

原博做的已经能实现大部分功能，本文主要是在此基础上修改或添加一点东西，重复的操作不再赘述。下面的操作都是在原博代码的基础上进行改动。

###### 修改部署平台

改成x64平台

![image-20200909115307417](https://i.loli.net/2020/09/10/VLBdq285yNX4veG.png)

![image-20200909115355211](https://i.loli.net/2020/09/10/5v6shjmRVwo4EqL.png)

###### NuGet下载还原程序包

1.项目点开引用手动删除带黄色感叹号的引用（不存在的引用，原博安装包未提供cef引用）.

2.项目——右键引用——打开NuGet管理程序包，搜索cefsharp，点击CefSharp.Wpf（wpf项目）右侧选择最新版（当前版本v84.4.10，原博版本v75.1.143.0）下载，等待下载完成即可.

###### 修改部分代码

由于原博版本太低或其他原因，我们需要修改一下代码

BrowserCtrl.xaml.cs

<span style="color:red">路径错误</span>

![image-20200909115811474](https://i.loli.net/2020/09/10/wFKj4Br7V9AN5i8.png)

```c#
        public static void InitCef()
        {
            string cefsharpFolder = "CefSharp";

            var settings = new CefSettings();
            //The location where cache data will be stored on disk. If empty an in-memory cache will be used for some features and a temporary disk cache for others.
            //HTML5 databases such as localStorage will only persist across sessions if a cache path is specified. 
            var cacheDir = AppDomain.CurrentDomain.BaseDirectory + cefsharpFolder + "\\cache";
            if (!Directory.Exists(cacheDir))
            {
                Directory.CreateDirectory(cacheDir);
            }
            settings.CachePath = cacheDir; //设置cache目录

            settings.MultiThreadedMessageLoop = true;
            CefSharpSettings.FocusedNodeChangedEnabled = true;
            CefSharpSettings.LegacyJavascriptBindingEnabled = true;
            CefSharpSettings.ShutdownOnExit = true;
            CefSharpSettings.SubprocessExitIfParentProcessClosed = true;

            string logDir = AppDomain.CurrentDomain.BaseDirectory + cefsharpFolder + "\\log";
            if (!Directory.Exists(logDir))
            {
                Directory.CreateDirectory(logDir);
            }

            settings.BrowserSubprocessPath = AppDomain.CurrentDomain.BaseDirectory + "CefSharp.BrowserSubprocess.exe";
            settings.LogFile = logDir + DateTime.Now.ToString("yyyyMMdd") + ".log";
            settings.LocalesDirPath = AppDomain.CurrentDomain.BaseDirectory + "locales";
            settings.CefCommandLineArgs.Add("disable-gpu", "1");
            settings.CefCommandLineArgs.Add("enable-media-stream", "1");

            if (!Cef.Initialize(settings, performDependencyCheck: true, browserProcessHandler: new BrowserProcessHandler()))
            {
                throw new Exception("Unable to Initialize Cef");
            }
        }
```

<span style="color:red">版本兼容</span>

BrowserCtrl.xaml.cs

低版本将c#对象注册到js已经弃用

![image-20200909115951346](https://i.loli.net/2020/09/10/fpXN7JKWeiwMaL4.png)

```c#
CefSharpSettings.LegacyJavascriptBindingEnabled = true;
CefSharpSettings.WcfEnabled = true;
browser.JavascriptObjectRepository.Register("jsObj", _jsObject, isAsync: false, options: BindingOptions.DefaultBinder);
```

RequestHandler.cs

![image-20200909145355807](https://i.loli.net/2020/09/10/fZmY1oSIa2ptbic.png)

<span style="color:red">Post处理</span>

原博说是可以实现_blank Post操作的，不过我有一个地方遇到了类似的情况，但post无法成功请求

我稍微改动了一下，即监听访问链接——循环JS将Form表单中的_blank给去掉，有点鸡肋...

Cef的FrameLoadStart事件

```c#
private void Browser_FrameLoadStart(object sender, FrameLoadStartEventArgs e)
{
    //页面中的iframe不考虑
    if (e.Frame.IsMain && e.Url.IndexOf("file") != 0)
    {
        //post暂不成功，临时解决方案
        if (e.Url.IndexOf("workflow/index.html") >0)
        {
            //removeAttr是注入JS的方法名称，当然你也可以直接写完一整段js
            browserCtrl.Browser.ExecuteScriptAsync("removeAttr", "form.content", "target");
        }
    }
}
```

```js
(function () {
    window.removeAttr = function (selector, attrName) {
        let timer = setInterval(() => {
            let aa = document.querySelector(selector) || '';
            if (aa !== '') {
                aa.removeAttribute(attrName);
                clearInterval(timer);
            }
        }, 2000);
    }
})();
```

###### 如何把软件Title去掉

如果不用其他UI框架的话，直接在主窗口设置WindowStyle="None"即可，但是这种方式有个弊端，他会把右上角那三个操作按钮（最大化、最小化、关闭）也给删除了，目前没找到好的处理方案。

如果用框架的话会比较简单，以Mahapps为例，主窗口设置ShowTitleBar="False"就可以将Title删除，这种方式会保留右上角的操作按钮。

![image-20200909150706001](https://i.loli.net/2020/09/10/IgJVwy2zHcTiMr5.png)

效果如下图：

![image-20200910140944654](https://i.loli.net/2020/09/10/gOPZF914ouxm8Ta.png)

不论使用那种方式，一般删除了Title软件是无法用鼠标进行拖动的，此时我们需要重写OnMouseLeftButtonDown方法即可以实现拖动。

```c#
/// <summary>
/// 重写该方法，当无标题栏时也可进行拖动
/// </summary>
/// <param name="e"></param>
protected override void OnMouseLeftButtonDown(MouseButtonEventArgs e)
{
    base.OnMouseLeftButtonDown(e);

    // 获取鼠标相对标题栏位置
    Point position = e.GetPosition(window_cef);

    // 如果鼠标位置在标题栏内，允许拖动
    if (e.LeftButton == MouseButtonState.Pressed)
    {
        if (position.X >= 0 && position.X < window_cef.ActualWidth && position.Y >= 0 && position.Y < window_cef.ActualHeight)
        {
            this.DragMove();
        }
    }
}
```

###### 如何主动打开新标签页

一般我们都是右键打开新标签或者Ctrl+左单击打开新标签两种方式，此处展示一下==Ctrl+左单击打开新标签==，右键打开新标签没能实现...

RequestHandler.cs

源码摘要:
            Called on the UI thread before OnBeforeBrowse in certain limited cases where
            navigating a new or different browser might be desirable. This includes user-initiated
            navigation that might open ==in a special way== (e.g. links clicked via middle-click
            or ctrl + left-click) and certain types of cross-origin navigation initiated
            from the renderer process (e.g. navigating the top-level frame to/from a file
            URL).

```c#
/// <summary>
/// 按住Ctrl点击链接会触发此方法
/// </summary>
/// <param name="chromiumWebBrowser"></param>
/// <param name="browser"></param>
/// <param name="frame"></param>
/// <param name="targetUrl"></param>
/// <param name="targetDisposition"></param>
/// <param name="userGesture"></param>
/// <returns></returns>
public bool OnOpenUrlFromTab(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, string targetUrl, WindowOpenDisposition targetDisposition, bool userGesture)
{
    var browserControl = chromiumWebBrowser as ExtChromiumBrowser;
    IRequest request = null;

    browserControl.Dispatcher.Invoke(new Action(() =>
    {
        NewWindowEventArgs e = new NewWindowEventArgs(targetUrl, request);
        browserControl.OnNewWindow(e);
    }));

    return true;
}

```

###### 多标签同步Cookie

原博的多标签没有做cookie处理，我给他加上了，大概逻辑是网页启动前从文件（此处不一定要存文件，可以有更好的方案）加载一次cookie，网页加载完成后保存一次cookie（存到上诉的文件中）

修改的地方比较多，我主要放cookie操作的代码吧（以下展示非完整代码，完整代码在后面会放出来的）

此处我选择将BrowserCtrl.cs 里面的browser.IsBrowserInitializedChanged（已注释）放到BrowserDemoCtrl.xaml.cs中

BrowserDemoCtrl.xaml.cs

```c#
private void Browser_FrameLoadStart(object sender, CefSharp.FrameLoadStartEventArgs e)
{
    if (e.Frame.IsMain && e.Url.IndexOf("file") != 0)
    {
        this.Dispatcher.InvokeAsync(() =>
        {
                        
                txtUrl.Text = e.Url;
        });
    }
    //post暂不成功，临时解决方案
    //todo
}
private async void Browser_IsBrowserInitializedChanged(object sender, DependencyPropertyChangedEventArgs e)
{
    try
    {
        //这里可以处理UA、代理、cookie
        var cefBrowser = browserCtrl.Browser;
        if (!cefBrowser.IsBrowserInitialized) return;
        var path = AppDomain.CurrentDomain.BaseDirectory + "UserCookies\\" + "myCookie.json";
        await cefBrowser?.SetCookiesAsync(path, cefBrowser.Address);
        //_currentUrl由MainWindow.cs 中的CreateTabItem方法传入
        cefBrowser.Address = _currentUrl;
    }
    catch (Exception ex)
    {
        
        //加载错误  可能是cookie引起的
    }
}
```

BrowserCtrl.xaml.cs 

```c#
browser.FrameLoadEnd += async (ss, ee) =>
{
    if (ee.Frame.IsMain)
    {
        var path = AppDomain.CurrentDomain.BaseDirectory + "UserCookies\\" + "myCookie.json";
        await _browser.SaveCookieAsync(path, "");
    }
    await this.Dispatcher.BeginInvoke(new Action(() =>
        {
            loadingWait.Visibility = Visibility.Collapsed;
        }));
    if (FrameLoadEnd != null)
    {
        FrameLoadEnd(null, null);
    }
};
```

ExtChromiumBrowser.cs

```c#
/// <summary>
/// 为当前的浏览器设置cookie
/// </summary>
/// <param name="cookiePath"></param>
/// <param name="dbCookie"></param>
/// <param name="host"></param>
public async Task SetCookiesAsync(string cookiePath, string host)
{
    try
    {
        var manager = RequestContext.GetCookieManager(null);
        await manager.DeleteCookiesAsync("", "");
        await Task.Delay(1000);
        if (File.Exists(cookiePath))
        {
            //设置文件cookie
            var jsonCookie = "[]";
            var json = File.ReadAllText(cookiePath);
            jsonCookie = string.IsNullOrWhiteSpace(json) ? jsonCookie : json;
            await SetCookieFromJson(jsonCookie);
        }
    }
    catch (Exception ex)
    {
        throw ex;
    }
}


/// <summary>
/// 设置jsoncookie
/// </summary>
/// <param name="jsonCookie"></param>
/// <returns></returns>
private async Task SetCookieFromJson(string jsonCookie)
{
    try
    {
        var cookies = JsonConvert.DeserializeObject<IEnumerable<Cookie>>(jsonCookie);
        bool success = false;
        foreach (var item in cookies)
        {
            if (item?.Domain?.FirstOrDefault() == null) continue;
            var url = item.Domain?.FirstOrDefault() == '.' ? "https://www" : "https://";
            var time = 0;
            L1:
            await Task.Delay(10);
            success = await RequestContext.GetCookieManager(null).SetCookieAsync(url + item.Domain, new Cookie() { Name = item.Name, Value = item.Value, Domain = item.Domain });
            if (!success)
            {
                time++;
                //Debug.WriteLine("设置cookie失败：" + JsonConvert.SerializeObject(item));
                if (time <= 5) goto L1;
                else continue;
            }
            //Debug.WriteLine("设置cookie成功");
        }
    }
    catch (Exception ex)
    {
        throw new Exception("Cookie设置失败 " + ex.Message);
    }
}
/// <summary>
/// 获取cookie
/// </summary>
/// <param name="removaDomain"></param>
/// <returns></returns>
public async Task<string> SaveCookieAsync(string path,string removaDomain)
{
    StringBuilder cookieSB = new StringBuilder();
    var manager = RequestContext.GetCookieManager(null);
    List<Cookie> cookies = new List<Cookie>();
    try
    {
        cookies = await manager.VisitAllCookiesAsync();
        if (!string.IsNullOrWhiteSpace(removaDomain))
        {
            for (int i = cookies.Count - 1; i > -1; i--)
            {
                if (removaDomain.Contains(cookies[i].Domain))
                {
                    cookies.RemoveAt(i);
                }
            }
        }
        string jsonCookie = JsonConvert.SerializeObject(cookies);
        if (!File.Exists(path))
        {
            var fs = File.Create(path);
            fs.Close();
            fs.Dispose();
        }
        File.WriteAllText(path, jsonCookie);
        return jsonCookie;
    }
    catch (Exception ex)
    {
        //Debug.WriteLine("获取Cookie异常" + ex.Message);
        return null;
    }
}
```

###### 右键功能

这个很简单，实现IContextMenuHandler接口即可，默认会给出一些选项，你可以根据自己的需求自定义添加删除或修改

###### 搜索文字功能

实现IFindHandler接口即可，重写OnFindResult方法，可以在此方法中展示搜索结果

效果如下

![GIF 2020-9-10 14-14-32](https://i.loli.net/2020/09/10/1ZoGbIktzi8JjcR.gif)

###### 其他

说明：右键功能、搜索文字功能均没有给出代码，只是给出一个思路。

具体代码：https://github.com/logerlink/CefSharpDemo

详细操作请按照Readme文件进行