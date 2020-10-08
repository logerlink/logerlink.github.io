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
    }
}