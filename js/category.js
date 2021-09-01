var article = [
    {
        title:'CEFSharp如何打开多标签并管理多标签',
        cate:'1002',
        cateName:'c#',
        date:'2020-09-07',
        url:'/page/2020/cef_mutilTab.html'
    },
    {
        title:'日志',
        cate:'1001',
        cateName:'杂记',
        date:'2020-10-06',
        url:'/log.html'
    },
    {
        title:'前言',
        cate:'1001',
        cateName:'杂记',
        date:'2020-10-06',
        url:'/hello.html'
    },
    {
        title:'JS小问题汇总（不定期更新）',
        cate:'1004',
        cateName:'javascript',
        date:'2020-10-08',
        url:'/page/2020/js_question.html'
    },
    {
        title:'.Net MVC + Vue 初体验，MVC视图引入vue组件（不前后端分离）',
        cate:'1005',
        cateName:'VUE',
        date:'2020-10-09',
        url:'/page/2020/netMvcVueTest.html'
    },
    {
        title:'.Net Core使用EF连接数据库的两种方式，CodeFirst & DBFirst',
        cate:'1006',
        cateName:'.Net Core',
        date:'2020-10-16',
        url:'/page/2020/NetCore_DBFirst_CodeFirst.html'
    },
    {
        title:'最近',
        cate:'1001',
        cateName:'杂记',
        date:'2020-12-04',
        url:'/page/2020/20201204.html'
    },
    {
        title:'.Net Core在线预览打印PDF，JsReport的使用',
        cate:'1006',
        cateName:'.Net Core',
        date:'2021-01-27',
        url:'/page/2021/NetCore_Jsreport.html'
    },
    {
        title:'大年三十',
        cate:'1001',
        cateName:'杂记',
        date:'2021-02-11',
        url:'/page/2021/0211.html'
    },
    {
        title:'Linux整理',
        cate:'1007',
        cateName:'Linux',
        date:'2021-02-19',
        url:'/page/2021/Linux.html'
    },
    {
        title:'CentOS 7和CentOS 6的简单比较',
        cate:'1007',
        cateName:'Linux',
        date:'2021-02-22',
        url:'/page/2021/ComparisonOfCentOS7And6.html'
    },
    {
        title:'.Net Core常见的文件下载功能和文件上传功能',
        cate:'1006',
        cateName:'.Net Core',
        date:'2021-05-13',
        url:'/page/2021/NetCoreDownLoad.html'
    },
    {
        title:'git登录验证和一些小问题汇总',
        cate:'1008',
        cateName:'开发工具',
        date:'2021-07-08',
        url:'/page/2021/GitSSH.html'
    },
    {
        title:'mongodb从入门到放弃',
        cate:'1008',
        cateName:'开发工具',
        date:'2021-07-21',
        url:'/page/2021/mongodb_introduction.html'
    },
    {
        title:'js扁平化数据转换成树结构',
        cate:'1004',
        cateName:'javascript',
        date:'2021-07-22',
        url:'/page/2021/jsArrayToTree.html'
    },
    {
        title:'JavaScript compose、pipe、柯里化、防抖和节流大杂烩',
        cate:'1004',
        cateName:'javascript',
        date:'2021-07-29',
        url:'/page/2021/jsNote.html'
    },
    {
        title:'Video——网页视频的基本样式和基本功能实现',
        cate:'1004',
        cateName:'javascript',
        date:'2021-09-01',
        url:'/page/2021/webVideo_1.html'
    },
    
]


//封装的日期排序方法
 function ForwardRankingDate(data, p) {
 for (let i = 0; i < data.length - 1; i++) {
     for (let j = 0; j < data.length - 1 - i; j++) {
         console.log(Date.parse(data[j][p]));
         if (Date.parse(data[j][p]) < Date.parse(data[j+1][p])) {
             var temp = data[j];
             data[j] = data[j + 1];
             data[j + 1] = temp;
         }
     }
 }
     return data;
}

export function initCategoryList(){
    let bgLeft = document.querySelector('.col-left')
    let index = parseInt(Math.random() * 100);
    bgLeft.style.backgroundPosition = index + '%'
    bgLeft.style.backgroundSize = '190%'

    let cateEl = document.querySelector('.category-list') || ''
    if(cateEl !== ''){
        var id = /cate=(\d+)&?/.exec(document.location.href) || ''
        if(id.length >=2){
            article = article.filter(item=>{
                return item.cate === id[1]
            })
        }
        var artArr = ForwardRankingDate(article,"date")
        let html = ''
        artArr.forEach((item)=>{
            html+=`<p>[${item.date}] <span>[</span><a href='/category.html?cate=${item.cate}'><span>${item.cateName}</span></a><span>]</span><a href='${item.url}'><span>${item.title}</span></a></p>`;
        })
        cateEl.innerHTML = html
    }
}

