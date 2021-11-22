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

/**
 * 初始化复制按钮
 * @param {*} codeMirrors 代码区域
 * 
 */
function codeCopy(codeMirrors){
    /**
     * 1.mouseover与mouseenter
        不论鼠标指针穿过被选元素或其子元素，都会触发 mouseover 事件。
        只有在鼠标指针穿过被选元素时，才会触发 mouseenter 事件。
        2.mouseout与mouseleave
        不论鼠标指针离开被选元素还是任何子元素，都会触发 mouseout 事件。 
        只有在鼠标指针离开被选元素时，才会触发 mouseleave 事件。
     */
    const btnCopyTemp =`<span title="复制" class="btn-copy"></span>`
    const textCopyTemp = `<span class="hidden text-copy-success">复制成功</span>`
    let btnCopyDom = new DOMParser().parseFromString(btnCopyTemp,"text/html")
    let btnCopy = btnCopyDom.querySelector('span')
    let textCopyDom = new DOMParser().parseFromString(textCopyTemp,"text/html")
    let textCopy = textCopyDom.querySelector('span')

    btnCopy.addEventListener('click',function(){
        copyContent(this.parentNode.innerText)
        textCopy.classList.remove('hidden')
        setTimeout(()=>{
            if(!textCopy.classList.contains('hidden')) textCopy.classList.add('hidden')
        },2000);
    })
    for (let index = 0; index < codeMirrors.length; index++) {
        const element = codeMirrors[index];
        element.addEventListener('mouseenter',()=>{
            element.appendChild(btnCopy)
            if(!textCopy.classList.contains('hidden')) textCopy.classList.add('hidden')
            element.appendChild(textCopy)
        })
        element.addEventListener('mouseleave',function(){
            setTimeout(()=>{
                //鼠标移出 隐藏悬浮框
                element.removeChild(btnCopy)
                element.removeChild(textCopy)
            },300)
        })
    }
    
}

/**
 * 复制文本到剪贴板
 * @param {*} text 复制的内容
 */

function copyContent(text){
    //擦靠张鑫旭的  https://www.zhangxinxu.com/wordpress/2021/10/js-copy-paste-clipboard/
    if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(text);
    } else {
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        // 隐藏此输入框
        textarea.style.position = 'fixed';
        textarea.style.clip = 'rect(0 0 0 0)';
        textarea.style.top = '10px';
        // 赋值
        textarea.value = text;
        // 选中
        textarea.select();
        // 复制
        document.execCommand('copy', true);
        // 移除输入框
        document.body.removeChild(textarea);
    }
}

export {lazyLoad,showImage,codeCopy}