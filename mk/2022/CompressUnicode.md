[Toc]

#### 说明

记录一下C#与JavaScript的字符串压缩和解压的方法以及字符串与Unicode互转。关键词：Gzip。

为什么要加上Unicode，为了防止汉字乱码。

#### C#实现解压缩字符串、字符串与Unicode互转

参考：[C# 使用GZip对字符串压缩和解压 - DotNet码农 - 博客园 (cnblogs.com)](https://www.cnblogs.com/yuwentao/p/9565747.html)

```csharp
    public static class StringHelper
    {
        #region 解压缩
        public static string CompressStr(string text)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(text);
            MemoryStream ms = new MemoryStream();
            using (GZipStream zip = new GZipStream(ms, CompressionMode.Compress, true))
            {
                zip.Write(buffer, 0, buffer.Length);
            }

            ms.Position = 0;
            MemoryStream outStream = new MemoryStream();

            byte[] compressed = new byte[ms.Length];
            ms.Read(compressed, 0, compressed.Length);

            byte[] gzBuffer = new byte[compressed.Length + 4];
            System.Buffer.BlockCopy(compressed, 0, gzBuffer, 4, compressed.Length);
            System.Buffer.BlockCopy(BitConverter.GetBytes(buffer.Length), 0, gzBuffer, 0, 4);
            return Convert.ToBase64String(gzBuffer);
        }

        /// <summary>
        /// 将传入字符串以GZip算法压缩后，返回Base64编码字符
        /// </summary>
        /// <param name="rawString">需要压缩的字符串</param>
        /// <returns>压缩后的Base64编码的字符串</returns>
        public static string GZipCompressString(string rawString)
        {
            if (string.IsNullOrEmpty(rawString) || rawString.Length == 0)
            {
                return "";
            }
            else
            {
                byte[] rawData = System.Text.Encoding.UTF8.GetBytes(rawString.ToString());
                byte[] zippedData = Compress(rawData);
                return (string)(Convert.ToBase64String(zippedData));
            }

        }
        /// <summary>
        /// GZip压缩
        /// </summary>
        /// <param name="rawData"></param>
        /// <returns></returns>
        public static byte[] Compress(byte[] rawData)
        {
            MemoryStream ms = new MemoryStream();
            GZipStream compressedzipStream = new GZipStream(ms, CompressionMode.Compress, true);
            compressedzipStream.Write(rawData, 0, rawData.Length);
            compressedzipStream.Close();
            return ms.ToArray();
        }
        /// <summary>
        /// 将传入的二进制字符串资料以GZip算法解压缩
        /// </summary>
        /// <param name="zippedString">经GZip压缩后的二进制字符串</param>
        /// <returns>原始未压缩字符串</returns>
        public static string GZipDecompressString(string zippedString)
        {
            if (string.IsNullOrEmpty(zippedString) || zippedString.Length == 0)
            {
                return "";
            }
            else
            {
                byte[] zippedData = Convert.FromBase64String(zippedString.ToString());
                return (string)(System.Text.Encoding.UTF8.GetString(Decompress(zippedData)));
            }
        }
        /// <summary>
        /// ZIP解压
        /// </summary>
        /// <param name="zippedData"></param>
        /// <returns></returns>
        public static byte[] Decompress(byte[] zippedData)
        {
            MemoryStream ms = new MemoryStream(zippedData);
            GZipStream compressedzipStream = new GZipStream(ms, CompressionMode.Decompress);
            MemoryStream outBuffer = new MemoryStream();
            byte[] block = new byte[1024];
            while (true)
            {
                int bytesRead = compressedzipStream.Read(block, 0, block.Length);
                if (bytesRead <= 0)
                    break;
                else
                    outBuffer.Write(block, 0, bytesRead);
            }
            compressedzipStream.Close();
            return outBuffer.ToArray();
        }
        #endregion

        #region unicode转换
        /// <summary>
        /// <summary>
        /// 字符串转Unicode
        /// </summary>
        /// <param name="source">源字符串</param>
        /// <returns>Unicode编码后的字符串</returns>
        public static string String2Unicode(string source)
        {
            byte[] bytes = Encoding.Unicode.GetBytes(source);
            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i += 2)
            {
                stringBuilder.AppendFormat("\\u{0}{1}", bytes[i + 1].ToString("x").PadLeft(2, '0'), bytes[i].ToString("x").PadLeft(2, '0'));
            }
            return stringBuilder.ToString();
        }

        /// <summary>
        /// Unicode转字符串
        /// </summary>
        /// <param name="source">经过Unicode编码的字符串</param>
        /// <returns>正常字符串</returns>
        public static string Unicode2String(string source)
        {
            return new Regex(@"\\u([0-9A-F]{4})", RegexOptions.IgnoreCase | RegexOptions.Compiled).Replace(
                source, x => string.Empty + Convert.ToChar(Convert.ToUInt16(x.Result("$1"), 16)));
        }
        #endregion
    }
```

##### C#调用解压缩、Unicode互转测试

```csharp
        [Test]
        public void CompressTest()
        {
            var objStr = "{'Name':'Tom','Age':18,'Gender':'male'}";
            var compressStr = StringHelper.GZipCompressString(objStr);
            var deCompressStr = StringHelper.GZipDecompressString(compressStr);
            Assert.AreEqual(objStr,deCompressStr);
        }

        [Test]
        public void Unicode2StrTest()
        {
            var objStr = "{'Name':'张三','Age':18,'Gender':'male'}";
            var unicodeStr = StringHelper.String2Unicode(objStr);
            var str = StringHelper.Unicode2String(unicodeStr);
            Console.WriteLine(unicodeStr);
            Console.WriteLine(str);
            Assert.AreEqual(unicodeStr, str);
        }
```

#### JavaScript实现解压缩字符串

参考：[Javascript 实现前端 Gzip 压缩字符串 (zzzmh.cn)](https://zzzmh.cn/single?id=74)

```html
<!DOCTYPE html>

<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title></title>
    <script src="https://cdn.staticfile.org/pako/1.0.10/pako.min.js"></script>
    <script>
        /**
         * 解压
         * @param b64Data 压缩后的base64字符串
         */
        function unzip(b64Data) {
            let strData = atob(b64Data);
            const charData = strData.split('').map(function (x) {
                return x.charCodeAt(0);
            });
            const binData = new Uint8Array(charData);
            const data = pako.inflate(binData);
            strData = String.fromCharCode.apply(null, new Uint16Array(data));
            return unescape(decodeURIComponent(strData).replace(/\\/g, "%"));
        }
        /**
         * 压缩
         * @param str 待压缩的字符串
         */
        function zip(str) {
            const binaryString = pako.gzip(encodeURIComponent(str), { to: 'string' })
            return btoa(binaryString);
        }
    </script>
    
</head>
<body>
    
</body>
</html>
```

##### JS调用解压缩测试

```javascript
		/**
         * 解压测试
         * */
        function zipTest() {
            let obj = { 'Name': 'Tom', 'Age': 18, 'Gender': 'male' }
            let str = JSON.stringify(obj)
            let zipStr = zip(str)
            let unzipStr = unzip(zipStr)
            console.log(unzipStr, zipStr)
            //{Name: 'Tom', Age: 18, Gender: 'male'} 'H4sIAAAAAAAAA1M1d1I1MvJLzE0FUqrGjkAyJD8XxDZyBpKO6VBxQwuIgHtqXkpqEVxtbmIOWIG5CwA9Jds3SQAAAA=='
        }
        zipTest()
```

#### JavaScript实现字符串与Unicode互转

参考：https://blog.csdn.net/a460550542/article/details/79986252

```javascript
        /**
         * str转换成Unicode编码
         * @param str
         */
        function encodeUnicode(str) {
            var res = [];
            for (var i = 0; i < str.length; i++) {
                res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
            }
            return "\\u" + res.join("\\u");
        }

        /**
          * unicode解码转换成字符串
          * @param str
          */
        function decodeUnicode(str) {
            str = str.replace(/\\/g, "%");
            return unescape(str);
        }
```

##### JS调用Unicode互转测试

```javascript
        function strAndUnicode() {
            var hello_str = "hello，张三123";
            //转Unicode
            let unicodeStr = encodeUnicode(hello_str)
            //Unicode转str
            let str = decodeUnicode(unicodeStr)
            console.log(`unicodeStr：${unicodeStr}，str：${str}`);
            //unicodeStr：\u0068\u0065\u006c\u006c\u006f\uff0c\u5f20\u4e09\u0031\u0032\u0033，str：hello，张三123
        }
        strAndUnicode()
```

