[TOC]

.Net Core常见的文件下载功能和文件上传功能、大文件分片上传

### 下载功能

Get请求，直接发送get请求（浏览器访问）即可下载文件

```c#
        /// <summary>
        /// 正常get请求下载
        /// </summary>
        /// <returns></returns>
        [HttpGet("download")]
        public IActionResult GetDownload()
        {
            var filePath = AppDomain.CurrentDomain.BaseDirectory + "Files\\ManYou.pdf";
            return File(new FileStream(filePath, FileMode.Open), "application/pdf", "ManYou" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".pdf");
        }
```

post请求，后台返回流数据，前端处理再通过点击隐藏链接，达到下载效果。

```c#
        /// <summary>
        /// post请求下载
        /// </summary>
        /// <returns></returns>
        [HttpPost("download1")]
        public IActionResult PostDownload()
        {
            var filePath = AppDomain.CurrentDomain.BaseDirectory + "Files\\ManYou.pdf";
            return File(new FileStream(filePath, FileMode.Open), "application/pdf", "ManYou" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".pdf");
        }
```

前端请求

```html
<script>
    window.onload = function () {
        let btnGet = document.querySelector('.btn-get')
        btnGet.addEventListener('click', () => {
            console.log('111111111')
            location.href ="/Home/download"
        })

        let btnPost = document.querySelector('.btn-post')
        btnPost.addEventListener('click', () => {
            console.log('222222')
            postDownLoad()
        })
    }
    function postDownLoad() {
        fetch('/Home/download1',
            {
                method: 'post',
                headers: {}
            })
            .then(res => res.blob())    //res.arrayBuffer().也可以
            .then(res => {
                const link = document.createElement('a')
                let blob = new Blob([res], { type: 'application/pdf' })
                let url = URL.createObjectURL(blob)
                link.href = url
                link.download = 'ManYou.pdf'
                link.click()
            })
    }
</script>

<button class="btn-get">Get DownLoad</button>
<p></p>
<button class="btn-post">Post download</button><br />
```

<img src="https://i.loli.net/2021/05/13/65YalHWRNjXd8Dq.gif" alt="GetPost下载"/>

### 上传文件

#### 单文件上传

```c#
        /// <summary>
        /// 单文件上传
        /// </summary>
        /// <param name="formFile"></param>
        /// <returns></returns>
        [HttpPost("one")]
        public IActionResult UploadOneFile(IFormFile formFile)
        {
            //formFile 即前端传过来的单个文件
            var path = AppDomain.CurrentDomain.BaseDirectory + "\\Files\\" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".pdf";
            using (var fs = new FileStream(path,FileMode.OpenOrCreate))
            {
                formFile.CopyTo(fs);
            }

            return Ok("上传成功");
        }
```

```html
<input type="file" name="formFile" class="file">
<button type="button" class="btn-submit">单文件上传</button>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        file = document.querySelector('.file').files
        const formData = new FormData()
        formData.append("formFile", file[0])  //单个
        console.log(formData)
        fetch('/Upload/one', { method: 'post', body: formData })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

formData.append("formFile", file[0])  //单个

formData的键（formFile）要和方法的参数名（formFile）一致

![image-20210513152612253](https://i.loli.net/2021/05/13/WdHGbojtnisTg5M.png)

#### 单文件上传——表单方式

```c#
        /// <summary>
        /// 多文件上传
        /// </summary>
        /// <returns></returns>
        [HttpPost("multi")]
        public IActionResult UploadMultiFile(IFormFileCollection formFiles)
        {
            //formFiles无法获取到数据  需通过Request.Form.Files来获取
            var files = Request.Form.Files;
            // todo 保存到本地...
            return Ok("上传成功");
        }
```

```html
<form class="form-one">
    <input type="file" name="formFile" class="file">
    <button type="button" class="btn-submit">单文件表单上传</button>
</form>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        form = document.querySelector('.form-one')
        const formData = new FormData(form)
        console.log(formData)
        fetch('/Upload/oneForm', { method: 'post', body: formData })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

#### 多文件上传

```c#
        /// <summary>
        /// 多文件上传
        /// </summary>
        /// <returns></returns>
        [HttpPost("multi")]
        public IActionResult UploadMultiFile(IFormFileCollection formFiles)
        {
            //formFiles无法获取到数据  需通过Request.Form.Files来获取
            var files = Request.Form.Files;
            // todo 保存到本地...
            return Ok("上传成功");
        }
```

```html
<p>
    <input type="file" name="formFiles" class="file-multi" multiple>
    <button type="button" class="btn-submit">多文件上传</button>
</p>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        files = document.querySelector('.file-multi').files
        const formData = new FormData()
        //不可如此
        //formData.append("files", files)
        for (var i = 0; i < files.length; i++) {
            //此处的key可随便设置 后台都可获取
            formData.append("files", files[i])
        }
        console.log(formData)
        fetch('/Upload/multi', { method: 'post', body: formData })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

前端formData.append("aaaa", files[i]) 此处的key（即aaaa）是可以随便设置的

前端提交的区域不是Form表单时，后台不可以直接通过 IFormFileCollection 来获取前端提交的文件而是通过Request.Form.Files

![image-20210513154011079](https://i.loli.net/2021/05/13/gVoDijYhsNtJlX8.png)

#### 多文件上传——表单形式

```c#
        /// <summary>
        /// 表单内多文件上传
        /// </summary>
        /// <param name="formFiles"></param>
        /// <returns></returns>
        [HttpPost("multiForm")]
        public IActionResult UploadMultiFileForm(IFormFileCollection formFiles)
        {
            //formFiles 即前端input标签的name属性，必须一致否则无法获取到文件
            //直接对整个表单初始化formData，可以直接拿到IFormFileCollection
            var files = Request.Form.Files;
            // todo 保存到本地...
            return Ok("上传成功");
        }
```

```html
<form enctype="multipart/form-data" class="form-multi">
    <input type="file" name="formFiles" class="file-multi" multiple>
    <button type="button" class="btn-submit">多文件表单上传</button>
</form>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        form = document.querySelector('.form-multi')
        const formData = new FormData(form)
        fetch('/Upload/multiForm', { method: 'post', body: formData })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

前端Form表单形式上传可以通过IFormFileCollection和Request.Form.Files来获取客户端传过来的文件，多文件上传标签input的name值（formFiles）必须和后端方法的参数名（formFiles）一致，否则IFormFileCollection无法正常获取文件

![image-20210513155054980](https://i.loli.net/2021/05/13/XN614wEaxTP57ho.png)

#### model组合上传（多文件、单文件、文本信息）

```c#
        /// <summary>
        /// Model内携带文件
        /// </summary>
        /// <param name="formFiles"></param>
        /// <returns></returns>
        [HttpPost("model")]
        public IActionResult UploadModel()
        {
            // todo 保存到本地...
            //可获取到文件
            var formFile = Request.Form.Files;              //获取前端所有文件对象(单文件、多文件) 和前端的formData的key值无关
            //通过Name来区分多文件和单文件
            var names = formFile.Select(x => x.Name).ToList();
            var nameStr = string.Join(",", names);
            //非文件  对象的字符串   
            var formFiles = Request.Form["formFiles"];      //[object FileList]

            //可获取到json字符串
            var jsonModelStr = Request.Form["apiModel"];    //{"username":"多对对"}
            var jsonModel = JsonConvert.DeserializeObject<ApiModel>(jsonModelStr);

            //无法直接转换为json对象  
            var jsonModelStr2 = Request.Form["apiModel2"];  //[object Object]
            //此处报错
            var jsonModel2 = JsonConvert.DeserializeObject(jsonModelStr2);

            return Ok("上传成功");
        }
```

```html
   多文件：
<input type="file" name="formFiles" class="file-multi" multiple>
   单文件：
<input type="file" name="formFile" class="file">
   用户名：
<input type="text" name="username" class="text-username">
<button type="button" class="btn-submit">Model组合上传</button>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        file = document.querySelector('.file').files[0]
        formFiles = document.querySelector('.file-multi').files
        var apiModel = {
            username: document.querySelector('.text-username').value,
        }
        const formData = new FormData()
        formData.append('apiModel', JSON.stringify(apiModel))   //可正常解析
        formData.append('apiModel2', apiModel)                  //无法正常解析
        formData.append('formFiles', formFiles)                 //无法正常获取文件
        formData.append('formFile2', file)                      //可正常获取文件

        //处理多文件  多文件必须通过for循环以一个一个加   
        //不可直接formData.append('formFiles', formFiles) //无法正常获取文件
        for (var i = 0; i < formFiles.length; i++) {
            //此处的key可随便设置 后台都可获取
            formData.append("files", formFiles[i])
        }

        console.log(apiModel)
        fetch('/Upload/model', {
            method: 'post',
            body: formData,
        })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

红线为无法正常解析。

Request.Form.Files可获取到前端传过来的所有文件，我们可以通过Name来区分是单文件还是多文件即区分该文件是属于哪一类数据

前端提交数据示例，如下图

![image-20210513162116106](https://i.loli.net/2021/05/13/LlThoG8d1CqKX4f.png)

后端获取的数据，如下图

![image-20210513161609444](https://i.loli.net/2021/05/13/Ca7ph4I2WZlwVYo.png)

#### model组合上传（多文件、单文件、文本信息）——表单形式

```c#
        /// <summary>
        /// Model内携带文件 通过表单上传
        /// </summary>
        /// <param name="formFiles"></param>
        /// <returns></returns>
        [HttpPost("modelForm")]
        public IActionResult UploadModelForm()
        {
            //获取全部文件
            var files = Request.Form.Files;
            //单文件
            var formFile = files.Where(x => x.Name == "formFile").ToList();
            //多文件
            var formFiles = files.Where(x => x.Name == "formFiles").ToList();
            var username = Request.Form["username"];
            // todo 保存到本地...
            return Ok("上传成功");
        }
```

```html
<form enctype="multipart/form-data" class="model-form" name="apiUpload">
    多文件：
    <input type="file" name="formFiles" class="file-multi" multiple>
    单文件：
    <input type="file" name="formFile" class="file">
    用户名：
    <input name="username" />
    <button type="button" class="btn-submit">Model表单组合上传</button>
</form>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        form = document.querySelector('.model-form')
        const formData = new FormData(form)
        fetch('/Upload/modelForm', { method: 'post', body: formData })
            .then(res => {
                console.log(res)
            })
    }
</script>
```

![image-20210513164856422](https://i.loli.net/2021/05/13/nLMSrRwpOsAdU6q.png)

![image-20210513163802327](https://i.loli.net/2021/05/13/Eh16sAMjciJdrky.png)

#### 大文件分片上传

```c#
        /// <summary>
        /// 大文件分片上传
        /// </summary>
        /// <returns></returns>
        [HttpPost("chunk")]
        [DisableFormValueModelBinding]
        //Unexpected end of Stream, the content may have already been read by another component. 报错 DisableFormValueModelBindingAttribute
        public async Task<IActionResult> UploadChunkAsync([FromQuery] FileChunk chunk)
        {
            try
            {
                var boundary = GetBoundary(Request.ContentType);
                if (string.IsNullOrEmpty(boundary)) throw new Exception("错误请求");
                var reader = new MultipartReader(boundary, Request.Body);
                //读取下一片分片数据
                var section = await reader.ReadNextSectionAsync();
                while (section != null)
                {
                    var buffer = new byte[chunk.Size];
                    var fileName = GetFileName(section.ContentDisposition);
                    fileName = fileName.Trim('"');
                    chunk.FileName = fileName;
                    var path = AppDomain.CurrentDomain.BaseDirectory + "Files\\" + fileName;
                    using (var stream = new FileStream(path, FileMode.Append))
                    {
                        int bytesRead;
                        do
                        {
                            bytesRead = await section.Body.ReadAsync(buffer, 0, buffer.Length);
                            stream.Write(buffer, 0, bytesRead);
                        } while (bytesRead > 0);
                    }
                    section = await reader.ReadNextSectionAsync();
                }
                if (chunk.PartNumber == chunk.Chunks)
                {
                    await MergeChunkFile(chunk);
                }

                return Ok("上传成功");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        /// <summary>
        /// 将分片文件合并成一个文件
        /// </summary>
        /// <param name="chunk"></param>
        /// <returns></returns>
        private async Task MergeChunkFile(FileChunk chunk)
        {
            //上传目录
            var path = AppDomain.CurrentDomain.BaseDirectory + "Files\\" + chunk.FileName;
            //分片文件命名约定
            var partToken = FileSort.PART_NUMBER;
            //上传文件的实际名称
            var baseFileName = chunk.FileName.Substring(0, chunk.FileName.IndexOf(partToken));
            //根据命名约定查询指定目录下符合条件的所有分片文件
            var searchPattern = $"{Path.GetFileName(baseFileName)}{partToken}*";
            //获取分片文件
            var fileList = Directory.GetFiles(Path.GetDirectoryName(path),searchPattern);
            if (!fileList.Any()) return ;

            var mergeFiles = new List<FileSort>();
            foreach (var file in fileList)
            {
                var sort = new FileSort
                {
                    FileName = file
                };
                baseFileName = file.Substring(0,file.IndexOf(partToken));
                var fileIndex = file.Substring(file.IndexOf(partToken)+partToken.Length);
                int.TryParse(fileIndex,out var number);
                sort.PartNumber = number;
                mergeFiles.Add(sort);
            }
            //排序所有分片
            mergeFiles = mergeFiles.OrderBy(x => x.PartNumber).ToList();
            //合并文件
            using (var fileStream = new FileStream(baseFileName,FileMode.Create))
            {
                foreach (var fileSort in mergeFiles)
                {
                    using (FileStream fileChunk = new FileStream(fileSort.FileName,FileMode.Open))
                    {
                        await fileChunk.CopyToAsync(fileStream);
                    }
                }
            }
            //删除分片文件
            DeleteFile(mergeFiles);
        }
        /// <summary>
        /// 合并后删除分片文件
        /// </summary>
        /// <param name="mergeFiles"></param>
        private void DeleteFile(List<FileSort> mergeFiles)
        {
            foreach (var file in mergeFiles)
            {
                System.IO.File.Delete(file.FileName);
            }
        }
        /// <summary>
        /// 根据请求信息获取文件名称
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        private string GetFileName(string content)
        {
            return content.Split(';')
                .SingleOrDefault(p => p.Contains("filename"))
                .Split('=')
                .Last()
                .Trim();
        }
        private string GetBoundary(string contentType)
        {
            var elements = contentType.Split(' ');
            var element = elements.Where(e => e.StartsWith("boundary=")).First();
            var boundary = element.Substring("boundary=".Length);
            if (boundary.Length >= 2 && boundary[0] == '"' && boundary[boundary[boundary.Length -1]] == '"')
            {
                boundary = boundary.Substring(1, boundary.Length - 2);
            }
            return boundary;
        }
```

```html
<div>
    <input name="file" class="file" type="file" />
    <input id="submit" type="button" value="分片上传" class="btn-submit" />
</div>
<script>
    window.onload = function () {
        let btnSubmit = document.querySelector('.btn-submit')
        btnSubmit.addEventListener('click', () => {
            UploadAsync()
        })
    }
    async function UploadAsync() {
        //目标文件
        let file = document.querySelector('.file').files[0]
        let fileChunks = []
        //分片缓冲区
        let maxFileSize = 8
        let bufferChunkSize = maxFileSize * (1024 * 1024)
        //读取文件流初始位置
        let fileStreamPos = 0
        //设置下一次读取缓冲区大小
        let endPos = bufferChunkSize
        //文件大小
        let size = file.size
        //将文件切片 装入数组
        while (fileStreamPos < size) {
            let fileChunkInfo = {
                file: file.slice(fileStreamPos, endPos),     //切片 0-80 80-160
                start: fileStreamPos,
                end: endPos
            }
            //装入数组
            fileChunks.push(fileChunkInfo)
            //改变下一次读取开始的位置
            fileStreamPos = endPos
            //改变下一次读取结束的位置
            endPos = fileStreamPos + bufferChunkSize
        }
        //分片数量
        let totalParts = fileChunks.length
        let partCount = 0
        //循环所有片段 上传
        while (chunk = fileChunks.shift()) {
            partCount++
            //自定义上传文件名称 并跟随chunk一起上传
            let filePartName = file.name + ".partNumber-" + partCount
            chunk.filePartName = filePartName
            //url参数
            let url = `partNumber=${partCount}&chunks=${totalParts}&size=${bufferChunkSize}&start=${chunk.start}&end=${chunk.end}&total=${size}`
            chunk.urlParameter = url
            UploadFileChunk(chunk)
        }
    }

    function UploadFileChunk(chunk) {
        let formData = new FormData()
        formData.append('file', chunk.file, chunk.filePartName)
        fetch('/Upload/chunk?' + chunk.urlParameter, {
            method: 'post',
            body: formData
        }).then(res => {
            console.log(res)
        })
    }
</script>
```

DisableFormValueModelBinding过滤器

```c#
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class DisableFormValueModelBindingAttribute : Attribute, IResourceFilter
{
    public void OnResourceExecuted(ResourceExecutedContext context)
    {
    }

    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        var factories = context.ValueProviderFactories;
        factories.RemoveType<FormValueProviderFactory>();
        factories.RemoveType<FormFileValueProviderFactory>();
        factories.RemoveType<JQueryFormValueProviderFactory>();
    }
}
```
FileChunk

```c#
    public class FileChunk
    {
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 当前分片
        /// </summary>
        public int PartNumber { get; set; }
        /// <summary>
        /// 缓冲区大小
        /// </summary>
        public int Size { get; set; }
        /// <summary>
        /// 分片总数
        /// </summary>
        public int Chunks { get; set; }
        /// <summary>
        /// 文件读取起始位置
        /// </summary>
        public int Start { get; set; }
        /// <summary>
        /// 文件读取结束位置
        /// </summary>
        public int End { get; set; }
        /// <summary>
        /// 文件大小
        /// </summary>
        public int Total { get; set; }
    }
```

FileSort

```c#
    public class FileSort
    {
        public const string PART_NUMBER = ".partNumber-";
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 文件分片号
        /// </summary>
        public int PartNumber { get; set; }
    }
```

大文件上传参考博客：[.NET Core Web APi大文件分片上传研究 - Jeffcky - 博客园 (cnblogs.com)](https://www.cnblogs.com/CreateMyself/p/13458917.html)

UploadChunkAsync报错：Unexpected end of Stream, the content may have already been read by another component.

解决方法：UploadChunkAsync方法加个DisableFormValueModelBinding特性

思路整理：

1.客户端对大文件切割成多分

2.客户端将每一份数据上传到服务器

3.服务器将上传的分片数据保存到硬盘

4.所有分片数据上传完成后，按照先后进行排序（通常是在上传的文件名标序号）

5.按照先后顺序合并成一个文件，得到目标文件

6.删除上述的分片文件

![分片上传流程](https://i.loli.net/2021/05/13/KXbeot2M3PZL8xH.png)



MultipartReader和IFormFile（IFormFileCollection）

参考博客：[NetCore3.0 文件上传与大文件上传的限制 - 一身大膘 - 博客园 (cnblogs.com)](https://www.cnblogs.com/hts92/archive/2019/11/22/11909626.html)

IFormFile：缓冲，通过模型将整个文件读到内存，后续通过IFormFile可以直接得到stream，优点是效率高，使用起来简单方便，缺点是对内存要求大，处理大文件效果差。

整个文件读取到IFormFile，文件上传所用的资源（磁盘、内存）取决于并发文件上传的数量和大小，如果文件上传的大小或频率会消耗应用资源，请使用流式传输.

MultipartReader：流式处理，直接读取请求体装载后的section对应的stream，后续直接操作stream即可，无需将整个请求体读入内存。

从多部份请求收到文件，流式传输无法显著提高性能（可通过异步来实现），可降低上传文件时对内存或磁盘空间的需求。

项目代码：[logerlink/NetCoreDownloadFileDemo: .NetCore常见的文件下载功能和文件上传功能、大文件分片上传 (github.com)](https://github.com/logerlink/NetCoreDownloadFileDemo)