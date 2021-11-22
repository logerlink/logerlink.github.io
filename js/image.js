//offsetTop是元素与offsetParent的距离，循环获取直到页面顶部
function getTop(e) {
    var T = e.offsetTop;
    while(e = e.offsetParent) {
        T += e.offsetTop;
    }
    return T;
}

/**
 * 延迟加载图片
 * @param {*} imgs 当前页面所有的img元素
 */
function lazyLoad(imgs) {
    var H = document.documentElement.clientHeight //获取可视区域高度
    var S = document.documentElement.scrollTop || document.body.scrollTop
    for (var i = 0; i < imgs.length; i++) {
        if (H + S > getTop(imgs[i])) {
            if(!imgs[i].src || imgs[i].src.indexOf('/Image/loading.gif') > 0){
                imgs[i].src= imgs[i].getAttribute('data-src')
            }
        }
    }
}
/**
 * 点击图片查看大图
 * @param {*} imgs 当前页面所有的img元素
 */
function showImage(imgs){
    const maskTemp = `
    <div class="maskLayer">
        <button class="btn-close" title="关闭">X</button>
        <div class="maskDiv">
            <img src="TEMPTEMPTEMP" referrerpolicy="no-referrer">
        </div>
    </div>
    `
    const bodyNoScroll = "body-hidden-scroll"
    let bodyEL = document.querySelector('body')
    for (let index = 0; index < imgs.length; index++) {
        const element = imgs[index];
        element.addEventListener('click',()=>{
            let layerImg = document.querySelector('.maskLayer img')
            if(layerImg){
                let maskEl = document.querySelector('.maskLayer')
                layerImg.src = element.src
                maskEl.classList.remove('hidden')
                bodyEL.classList.add(bodyNoScroll)
                return
            }else{
                let maskDom = new DOMParser().parseFromString(maskTemp.replace("TEMPTEMPTEMP",element.src),"text/html")
                bodyEL.appendChild(maskDom.querySelector('.maskLayer'))
                bodyEL.classList.add(bodyNoScroll)
                document.querySelector('.maskLayer .btn-close').addEventListener('click',()=>{
                    close_img()
                })
                document.querySelector('.maskLayer').addEventListener('click',function(event){
                    if(event.target.localName != 'img') close_img()
                })
            }
        })
    }
}

function close_img(){
    let bodyEL = document.querySelector('body')
    let maskEl = document.querySelector('.maskLayer')
    maskEl.classList.add('hidden')
    bodyEL.classList.remove('body-hidden-scroll')
}

export {lazyLoad,showImage}