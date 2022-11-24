import {categoryArr,article} from './articleData.js'


//封装的日期排序方法
 function ForwardRankingDate(data, p) {
 for (let i = 0; i < data.length - 1; i++) {
     for (let j = 0; j < data.length - 1 - i; j++) {
        //  console.log(Date.parse(data[j][p]));
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
    bgLeft.style.backgroundSize = '280%'

    let cateEl = document.querySelector('.category-list') || ''
    if(cateEl !== ''){
        var id = /cate=(\d+)&?/.exec(document.location.href) || ''
        let articleArr = article
        if(id.length >=2){
            articleArr = articleArr.filter(item=>{
                return item.cate === id[1]
            })
        }
        var artArr = ForwardRankingDate(articleArr,"date")
        let html = ''
        artArr.forEach((item)=>{
            html+=`<p>[${item.date}] <span>[</span><a href='/category.html?cate=${item.cate}'><span>${item.cateName}</span></a><span>]</span><a href='${item.url}'><span>${item.title}</span></a></p>`;
        })
        cateEl.innerHTML = html
    }
}

export function initCategory(){
    let bgLeft = document.querySelector('.col-left')
    let index = parseInt(Math.random() * 100);
    bgLeft.style.backgroundPosition = index + '%'
    bgLeft.style.backgroundSize = '280%'

    let category = document.querySelector('.category') || ''
    if(category != ''){
        let cateHtml = ''
        categoryArr.forEach(element => {
            let count = article.filter(x=>x.cate == element.cate).length
            cateHtml+=`
                    <a class="circle ${element.className}" href='/category.html?cate=${element.cate}'>
                        <p>${element.title}</p>
                        <span>${count}</span>
                    </a>
            `
        });
        category.innerHTML = cateHtml
    }
}

export function initTitleCate(){
    let dateTitle = document.querySelector('.dateTime') || ''
    let title = document.querySelector('.title') || ''
    if(!dateTitle || !title) return
    let index = article.findIndex(x=>x.title == title.innerText)
    if(index >=0){
        const articleTemp = article[index]
        let domStr = `<span style="font-size: 14px;margin-left: 10px;">[<a href="/category.html?cate=${articleTemp.cate}">${articleTemp.cateName}</a>]</span>`
        let dom =new DOMParser().parseFromString(domStr,"text/html")
        let span = dom.querySelector('span')
        dateTitle.appendChild(span)
    }
}

export function initComment(){
    // 忽略非文章页
    let pathname = location.pathname || ''
    if(pathname.indexOf('/page/') < 0){
        if(pathname.indexOf('log') < 0) return
    }
    let div = document.createElement('div')
    div.id = 'gitalk-container';
    document.querySelector('article').appendChild(div)
    let style = document.createElement('link')
    style.setAttribute('rel','stylesheet')
    style.setAttribute('href','../../css/gitalk.css')
    document.querySelector('body').appendChild(style)
    var script = document.createElement('script')
    script.src = "../../js/gitalk.min.js"
    document.querySelector('body').appendChild(script)
    setTimeout(()=>{
        renderGitalk()
    },3000)
}

export function renderGitalk(){
    var _0x7f44=["\x65\x32\x30\x36\x36\x61\x32\x63\x34\x63\x61\x30\x61\x30\x35\x39\x65\x34\x64\x33","\x62\x63\x65\x30\x32\x39\x37\x66\x31\x35\x34\x61\x61\x30\x32\x66\x32\x36\x33\x35\x37\x32\x66\x33\x34\x32\x63\x38\x39\x31\x36\x64\x32\x64\x35\x30\x32\x33\x62\x62","\x67\x69\x74\x43\x6F\x6D\x6D\x65\x6E\x74","\x6C\x6F\x67\x65\x72\x6C\x69\x6E\x6B","\x70\x61\x74\x68\x6E\x61\x6D\x65","\x67\x69\x74\x61\x6C\x6B\x2D\x63\x6F\x6E\x74\x61\x69\x6E\x65\x72","\x72\x65\x6E\x64\x65\x72"];var gitalk= new Gitalk({clientID:_0x7f44[0],clientSecret:_0x7f44[1],repo:_0x7f44[2],owner:_0x7f44[3],admin:[_0x7f44[3]],id:location[_0x7f44[4]],distractionFreeMode:false,proxy:'http://pigass.cn/proxy/https://github.com/login/oauth/access_token'});gitalk[_0x7f44[6]](_0x7f44[5])
}
export function renderGitalkTxt(){
    var gitalk = new Gitalk({
        clientID: '',
        clientSecret: '',
        repo: '',
        owner: '',
        admin: [''],
        id: location.pathname,      // Ensure uniqueness and length less than 50
        distractionFreeMode: false  // Facebook-like distraction free mode
    })
    gitalk.render('gitalk-container')
}
