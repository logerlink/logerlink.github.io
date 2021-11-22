import {initCategory,initCategoryList,initTitleCate} from './article.js'
import {toggleTOC,toTop} from './resize.js?v=2'
import {showImage,lazyLoad,codeCopy} from './image.js'

window.onload = function(){
    let imgs = document.querySelectorAll('img');
    lazyLoad(imgs);
    showImage(imgs);
    initTitleCate();
    toTop();
    toggleTOC();
    initCategory();
    initCategoryList();
    window.onscroll = function(){
        lazyLoad(imgs);
    }
    let codeMirrors =  document.querySelectorAll('.CodeMirror')
    codeCopy(codeMirrors)
}