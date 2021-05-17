export function resizeHandler(){
    let width = window.innerWidth
    if(width < 700){
        //左侧不要了
        let col_left = document.querySelector('.col-left') || ''
        if(col_left !== ''){
            col_left.style.width = 0
        }
        let category = document.querySelector('.col-left .category') || ''
        if(category !== ''){
            category.style.width = 0
            category.style.display = 'none'
        }
        let col_right = document.querySelector('.col-right') || ''
        if(col_right !== '') col_right.style.left = 0

        let article = document.querySelector('.container article') || ''
        if(article !== '') article.style.margin = 0
        
    }else{
        //左侧要了
        let col_left = document.querySelector('.col-left') || ''
        if(col_left !== ''){
            col_left.style.width = '300px'
        }
        let category = document.querySelector('.col-left .category') || ''
        if(category !== ''){
            category.style.width = '300px'
            category.style.display = 'flex'
        }
        let col_right = document.querySelector('.col-right') || ''
        if(col_right !== '') col_right.style.left = '300px'

        let article = document.querySelector('.container article') || ''
        if(article !== '') article.style.margin = '20px'
    }
}

export function toggleTOC(){
    let btn = document.querySelector('.btn-toggle') || ''
    if(btn != ''){
        btn.addEventListener('click',()=>{
            let text = btn.innerText
            let mdToc = document.querySelector('.md-toc') || ''
            if(text === '>'){
                //收起
                if(mdToc != '') {
                    mdToc.classList.add('toc-hidden')
                    mdToc.style.right = `-${mdToc.offsetWidth - 20}px`
                    btn.innerText = '<'
                }
            }else{
                if(mdToc != '')
                {
                    mdToc.classList.remove('toc-hidden')
                    mdToc.style.right = '0'
                    btn.innerText = '>'
                }
            }
        })
    }
}