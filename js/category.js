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
    
    
]


//封装的日期排序方法
 function ForwardRankingDate(data, p) {
 for (let i = 0; i < data.length - 1; i++) {
     for (let j = 0; j < data.length - 1 - i; j++) {
         console.log(Date.parse(data[j][p]));
         if (Date.parse(data[j][p]) > Date.parse(data[j+1][p])) {
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

