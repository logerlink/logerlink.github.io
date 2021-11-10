import {initCategory,initCategoryList,initTitleCate} from './article.js'
import {toggleTOC,toTop} from './resize.js?v=2'

window.onload = function(){
    initTitleCate();
    toTop();
    toggleTOC();
    initCategory();
    initCategoryList();
}
