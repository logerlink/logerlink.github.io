import {initCategory} from './article.js'
import {initCategoryList} from './category.js'
import {resizeHandler} from './resize.js'

window.onload = function(){
    resizeHandler();
    initCategory();
    initCategoryList();
}

window.onresize = function(){
    resizeHandler();
}