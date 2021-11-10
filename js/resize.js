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

export function toTop(){
    let btn = document.querySelector('.btn-toTop')
    if(btn){
        btn.addEventListener('click',()=>{
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
        })
    }
}