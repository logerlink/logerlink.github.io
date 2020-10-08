const categoryArr = [
    {
        title:'杂记',
        cate:'1001',
        count:1,
        className:'circle-max'
    },
    {
        title:'C#',
        cate:'1002',
        count:1,
        className:'circle-min'
    },
    {
        title:'JavaScript',
        cate:'1004',
        count:1,
        className:'circle-mid'
    }
]

export function initCategory(){
    let bgLeft = document.querySelector('.col-left')
    let index = parseInt(Math.random() * 100);
    bgLeft.style.backgroundPosition = index + '%'
    bgLeft.style.backgroundSize = '190%'

    let category = document.querySelector('.category') || ''
    if(category != ''){
        let cateHtml = ''
        categoryArr.forEach(element => {
            cateHtml+=`
                    <a class="circle ${element.className}" href='/category.html?cate=${element.cate}'>
                        <p>${element.title}</p>
                        <span>${element.count}</span>
                    </a>
            `
        });
        category.innerHTML = cateHtml
    }
}