import {categoryArr,article} from './articleData.js'


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

