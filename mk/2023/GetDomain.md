环境：.net core 3.0

如何从网址中提取获取域名？看到这我们首先会想到截取字符串、正则匹配这两种方式，但最近我发现了一种更为优雅的方式帮助我们快速从网址中提取获取域名——借助URI对象。

首先我们先看看截取、正则的具体实现方式。

```csharp
        /// <summary>
        /// 根据字符串截取域名
        /// </summary>
        /// <param name="url"></param>
        [Test]
        [TestCase("http://www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("www.testDomain.com/xx/xxx/xxxx.html")]
        public void TestGetDomainBySubString(string url)
        {
            var domain = string.Empty;
            if (url.StartsWith("http:") || url.StartsWith("https:"))
            {
                var start = url.IndexOf("/");
                var end = url.IndexOf("/", 8);   // 忽略http://、https:// 取第一个/的位置
                domain = url.Substring(start, end - start).Replace("/", "");    // url[start..end]
            }
            else
            {
                var end = url.IndexOf("/", 8);
                domain = url.Substring(0, end).Replace("/", "");
            }
            Console.WriteLine(domain);  // www.testDomain.com
        }

        /// <summary>
        /// 根据正则表达式匹配获取域名
        /// </summary>
        /// <param name="url"></param>
        [Test]
        [TestCase("http://www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("wss://127.0.0.1:5566/xx/xxx/xxxx.html")]
        public void TestGetDomainByRegex(string url)
        {
            var regex = new Regex("^((https|http|ftp|rtsp|mms|ws|wss):\\/\\/)?(?<domain>.*?)/.*");  // (?<domain>.*?) 正则具名分组
            var domain = string.Empty;
            var domainMatch = regex.Match(url);
            if (domainMatch.Success)
            {
                domain = domainMatch.Groups["domain"].Value;
            }
            Console.WriteLine(domain);  // www.testDomain.com
        }
```

看了队友借助URI对象的方式获取域名，着实让我眼前一亮。而且还可以更快更方便的获取其他信息，如端口、协议名称等等

```csharp
        /// <summary>
        /// 根据Uri获取域名，无需校验链接是否有效
        /// </summary>
        /// <param name="url"></param>
        [Test]
        [TestCase("http://www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("https://www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("wss://www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("www.testDomain.com/xx/xxx/xxxx.html")]
        [TestCase("127.0.0.1:5566/xx/xxx/xxxx.html")]
        public void TestGetDomainByUri(string url)
        {
            if (!"https|http|ftp|rtsp|mms|ws|wss".Split('|').Any(x => url.StartsWith(x))) url = "http://" + url;
            var uri = new Uri(url);
            var domain = uri.Authority; // 获取域名（IP:端口）
            var xx = new
            {
                uri.Scheme,     // 获取方案（协议）名称，如：http、ftp、https...
                uri.Port,       // 获取端口，如：http默认80，https默认443
                uri.Host,       // 也是域名（仅IP）
                uri.AbsoluteUri,    // 完整url
                uri.PathAndQuery,   // 获取绝对路径（不含域名）。/xx/xxx/xxxx.html
                uri.DnsSafeHost     // dns主机名，域名（仅IP）。www.testdomain.com
            };
            Console.WriteLine(domain);  // www.testDomain.com
        }
```

又水了一篇，本来想做个汇总的，算了，就这样吧。
