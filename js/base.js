import {initCategory} from './article.js'
import {initCategoryList} from './category.js'
import {resizeHandler,toggleTOC} from './resize.js?v=2'

window.onload = function(){
    toggleTOC();
    resizeHandler();
    initCategory();
    initCategoryList();
}

window.onresize = function(){
    resizeHandler();
}