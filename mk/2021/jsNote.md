[TOC]

#### 场景分析

需求：正式员工——(日薪*天数) + 绩效工资

我们很快就能写出来了

```javascript
        /**
         * 月总工资
        */
        const calculate = function(num){
            return (num * 30) + 1000
        }
        let resultA = calculate(500)
        console.log(resultA)
```

需求变更：试用期员工——((日薪*天数) + 绩效工资) * 0.8

我们很快又能写出来了

```javascript
        /**
         * 月总工资
        */
        const calculateA = function(num){
            return (num * 30) + 1000
        }
        /**
         * 试用期月总工资
        */
        const calculateB = function(num){
            return (num * 30) * 0.8
        }
        let resultA = calculateA(500)
        let resultB = calculateB(500)
        console.log(resultA,resultB)	//16000 12000
```

此时我们应该意识到，如果后面还有一大堆“无理取闹”的新需求，而我们以前的函数也无法满足新需求，这个时候不免会出现calculateC、calculateD、、、类似的方法

#### 面向过程

需求变更：对所有员工进行考勤审核

按我们正常逻辑，那肯定是加上万能的if  else   

```javascript
        /**
         * 计算工资
        */
        function calAmount(num,isAdd,isTest,isSub){
            let amount = (num * 30);    //月工资
            if(isAdd) amount += 1000;   //绩效工资
            if(isTest) amount *= 0.8;   //是否试用期
            if(isSub) amount -= 100;    //是否扣考勤
            return amount
        }

        let resultA = calAmount(500,true,false,false)        //正式员工正常考勤
        let resultB = calAmount(500,false,true,true)         //试用期员工扣考勤
        let resultC = calAmount(500,false,false,true)      //正式员工扣考勤且无绩效
        console.log(resultA,resultB,resultC)	//16000 11900 14900
```

#### compose

那有没有办法不用if else也能实现，终于要引出compose了...

```javascript
        const compose = function(){
            // 将接收的参数存到一个数组， args == [multiply, add]
            const args = [].slice.apply(arguments);
            return function(x) {
                return args.reduceRight((res, cb) => cb(res), x);
            }
        }
        /**
         * 月总工资
        */
        const calAmount = function(num){
            return (num * 30)
        }
        /**
         * 绩效工资
        */
        const calAdd = function (num){
            return num + 1000
        }
        /**
         * 试用期月总工资
        */
        const calTestAmount = function(num){
            return num * 0.8
        }
        /**
         * 考勤扣除
        */
        const calsub = function(num){
            return num - 100
        }
        
        //方法从右往左执行,先calAmount再calAdd
        let resultA = compose(calAdd,calAmount)(500)        //正式员工正常考勤
        let resultB = compose(calsub,calTestAmount,calAmount)(500)     //试用期员工扣考勤
        let resultC = compose(calsub,calAmount)(500)    //正式员工扣考勤且无绩效
        console.log(resultA,resultB,resultC)    //16000 11900 14900
```

#### pipe

与compose相对应还有一个pipe

```javascript
        const pipe = function(){
            // 将接收的参数存到一个数组， args == [multiply, add]
            const args = [].slice.apply(arguments);
            return function(x) {
                return args.reduce((res, cb) => cb(res), x);
            }
        }
        /**
         * 月总工资
        */
        const calAmount = function(num){
            return (num * 30)
        }
        /**
         * 绩效工资
        */
        const calAdd = function (num){
            return num + 1000
        }
        /**
         * 试用期月总工资
        */
        const calTestAmount = function(num){
            return num * 0.8
        }
        /**
         * 考勤扣除
        */
        const calsub = function(num){
            return num - 100
        }
		//方法从左往右执行,先calAmount再calAdd
        let resultA = pipe(calAmount,calAdd)(500)        //正式员工正常考勤
        let resultB = pipe(calAmount,calTestAmount,calsub)(500)       //试用期员工扣考勤
        let resultC = pipe(calAmount,calsub)(500)    //正式员工扣考勤且无绩效
        console.log(resultA,resultB,resultC)         //16000 11900 14900
```

#### composePromise

如果是执行的方法是Promise，那建议用composePromise

```javascript
        const composePromise = (...args)=>{
            const init = args.pop()
            return function(...arg){
                return args.reverse().reduce(function(sequence,func){
                    return sequence.then(function(result){
                        return func.call(null,result)
                    })
                },Promise.resolve(init.apply(null,arg)))
            }
        }
        let ap = async(query)=>{
            return new Promise((resolve,reject)=>{
                //todo
                console.log('开始了')
                resolve(query)
            })
        }
        let bp = async(res)=>{
            return new Promise((resolve,reject)=>{
                //todo
                if(res === '200') resolve('成功了')
                else reject('失败了')
            })
        }
        let cp = async(res)=>{
            //todo
            console.log(res)
        }

        const composeTest = function(query){
            let steps = [cp,bp, ap] // 从右向左执行
            let composeFn = composePromise(...steps)

            composeFn('200').then(res => { console.log(666) }).catch(err=>console.log(err))
            // 控制台输出
            // 开始了
            // 成功了
            // 666

            // composeFn('201').then(res => { console.log(666) }).catch(err=>console.log(err))
            // //控制台输出
            // //开始了
            // //失败了
        }
        composeTest('200')
        // composeTest('201')
```

再看一下这两个函数aTest、bTest，都和上面composeTest的执行结果一致，但是composeTest会更好一点（同事说的...）

Promise正常写法

```javascript
        const bTest = async (query)=>{
            ap(query)
            .then(res=>bp(res))
            .then(res=>cp(res))
            .then(res=>console.log(666))
            .catch(err=>console.log(err))
        }
        bTest('200')
        //bTest('201')
```

await/async 

```javascript
        const aTest = async (query)=>{
            try{
                let res = await ap(query)
                res = await bp(res)
                res = await cp(res)
                console.log(666)
            }catch(err){
                console.log(err)
            }
        }
        aTest('200')
        // aTest('201')
```

#### 函数副作用（Side Effects）

函数副作用是指当调用函数时，除了返回函数值之外，还对主调用函数产生附加的影响.

如下代码，当我们执行foo函数时，函数内部改变了(全局变量)y的值.

```javascript
        function foo(){
            y = 1   
        }
        var y = 0;
        foo()
        console.log(y+1)    //期望y+1等于1，可实际输出2
```

副作用可能包含，但不限于以下行为：

- 更改文件系统
- 往数据库中插入记录
- 发送一个 http 请求
- 改变数据
- 打印 log
- 获取用户输入
- DOM 操作
- 访问系统状态
- ...

javaScript内置的一些函数是有**副作用**的，如pop、push、splice、shift、unshift

```
[1, 2, 3].pop() // 每次执行pop函数，原数组都会减少一个元素
[1, 2, 3].splice(1, 1) // 会删除原数组里面的元素
...
```

我们不能保证禁止函数副作用，而是尽可能避免。

#### 纯函数（Pure Functions）

对于相同的输入，永远得到相同的输出，而且没有任何可观察的副作用。

```javascript
        function foo1(x){
            return x+1
        }
        foo1(1)
```

如上代码，无论我们执行多少次foo1(1)，都会得到（1+1=）2，而且并没有影响foo1函数外的任何东西

使用纯函数将会有以下好处：

- 可缓存性（Cacheable）
- 可移植性／自文档化（Portable / Self-Documenting）
- 可测试性（Testable）
- 合理性（Reasonable）
- 并行代码（Parallel Code）

### 常见的函数式编程模型

#### 闭包（Closure）

```javascript
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures
        function f1(){
    　　　　var n = 999     //n为f1函数的局部变量
            nAdd = function(){
                n+=1
            }
    　　　　function f2(){      //f2是内部函数，一个闭包
    　　　　　　console.log(n)  //使用了父函数中声明的变量n
    　　　　}
    　　　　return f2
    　　}

    　　var result=f1();
        result() // 999
        nAdd()     //nAdd没有用var、let、const声明，默认为全局变量
        result() // 1000 说明变量n存在内存中，并不是调用完f1()后就销毁变量n
```

闭包的用途：**可以读取函数内部的变量，而且这些变量的值始终保持在内存中**

闭包的弊端：**持久化变量不会被正常释放，持续占用内存空间，很容易造成内存浪费，需要手动释放**

参考：[过程或函数的副作用是_一文带你了解 JavaScript 函数式编程_weixin_39632057的博客-CSDN博客](https://blog.csdn.net/weixin_39632057/article/details/111095854)

[什么是闭包？闭包的作用，用法及优缺点 - 为系归舟 - 博客园 (cnblogs.com)](https://www.cnblogs.com/amcy/p/9912528.html#4、闭包的用途)

闭包例子：add1(1)(2)(3)(4)()、add2(1,2)(3,4)()求和

```javascript
        function add1(arg) {
            let sum = 0;
            sum += arg      //add1(1)
            return function (tmarg) {
                if (arguments.length == 0) {    
                    //add1(1)(2)(3)(4)()
                    return sum;
                }else{
                    //add1(1)(2)
                    //add1(1)(2)(3)
                    //add1(1)(2)(3)(4)
                    sum += tmarg
                    return arguments.callee;    //callee属性是一个指针，指向拥有这个 arguments 对象的函数 相当于做了一个递归回调
                }
            }
        }
        console.log(add1(1)(2)(3)(4)())


        function add2(arg) {
            let sum = 0;
            sum = Array.prototype.slice.call(arguments).reduce((sumTemp,b) => sumTemp += b,sum); //add2(1,2)
            return  function (tmarg) {
                if (arguments.length == 0) {
                    //add2(1,2)(3,4)()
                    return sum;
                }else{
                    //add2(1,2)(3,4)
                    sum = Array.prototype.slice.call(arguments).reduce((sumTemp,b) => sumTemp += b,sum);
                    return arguments.callee;
                }
            }
        }
        console.log(add2(1,2)(3,4)())
```

参考：[一道javascript面试题（闭包与函数柯里化） - Qcer - 博客园 (cnblogs.com)](https://www.cnblogs.com/qcblog/p/6858947.html)

#### 组合函数

通过多个函数来获取我们期待的值，如上面的compose

```javascript
        function foo2(x){
            return "Hello!"+x
        }

        function foo3(x){
            return x.toUpperCase()
        }

        let name = 'loger'
        let nameUpper = foo3(foo2(name))
        
        console.log(nameUpper)
```

如上代码，foo2负责链接字符串，foo3负责转为大写，两个合一起使用即达到期望的效果（例子有点牵强...）

参考资料：[JavaScript 函数式编程（一） (juejin.cn)](https://juejin.cn/post/6844903655397654535#heading-4)

#### 高阶函数

某个函数（foo3）接收另一个函数（foo2）作为参数，这样的参数称之为高阶函数。

js常见的高阶函数：map,reduce,filter,sort

##### map

```javascript
        //map遍历获得新数组
		let arr = [1,4,7,1,3,1,7,9,2,6,4,0,5,3]
        let arrMap = arr.map(value=>value + 100)
        console.log(arrMap)	
		//[101, 104, 107, 101, 103, 101, 107, 109, 102, 106, 104, 100, 105, 103]
```

##### reduce

```javascript
        //reduce叠加实现数组去重，并获得新数组
        let arr = [1,4,7,1,3,1,7,9,2,6,4,0,5,3]
        let arrReduce = arr.reduce((list,value)=> list.indexOf(value) != -1 ? list: [...list,value],[])
        let arrReduce1 = arr.reduce((list,value)=> list.indexOf(value) != -1 ? list: (list.push(value),list),[])
        console.log(arrReduce,arrReduce1)
```

##### filter

```javascript
        //filter去重，并获得新数组
        let arr = [1,4,7,1,3,1,7,9,2,6,4,0,5,3]
        let arrFilter = arr.filter((value,index)=>arr.indexOf(value) == index)
        console.log(arrFilter)
        //[1, 4, 7, 3, 9, 2, 6, 0, 5]
```

#### 函数柯里化

柯里化通常也称部分求值，其含义是给函数分步传递参数，每次传递参数后部分应用参数，并返回一个更具体的函数接受剩下的参数，这中间可嵌套多层这样的接受部分参数函数，直至返回最后结果。
因此柯里化的过程是逐步传参，逐步缩小函数的适用范围，逐步求解的过程。

最简单的例子

```javascript
        function oldAdd(x,y) {
            return x + y
        }

        function curryingAdd(x) {
            return function currying(y) {
                return x+ y
            }
        }
```

以下案例参考：[JS实现add(1)(2)(3)(4)_哆姆的博客-CSDN博客](https://blog.csdn.net/weixin_38099964/article/details/116020919)

案例1：add(1)(2)(3)(4)、add(1)(2)(3)(4)() 求和

```javascript
        function add(a) {
            function currying(b) {
                a += b || 0
                return currying
            }
            currying.toString = function () {return a}   //重写toString方法
            return currying
        }

        let total = add(1)(2)(3)(4)
        alert(total) //console.log(total)   //10
        console.log(total+7)    //17

        let total1 = add(1)(2)(3)(4)()
        alert(total1) //console.log(total1)   //10
        console.log(total1+7)    //17
```

案例2：add(1,2)(3,4)、add(1,2)(3,4,5)() 、add(1)(2)(3)(4)(5)()求和

```javascript
        function add(...arg) {
            let arr = [...arguments]
            function currying(params) {
                arr = [
                    ...arr,
                    ...arguments
                ]
                return currying
            }
            currying.toString = ()=>{
                return arr.reduce((sum,value)=>sum+value,0)
            }
            return currying
        }

        let total = add(1,2)(3,4)
        console.log(total+7)


        let total1 = add(1,2)(3,4,5)()
        console.log(total1+7)

        let total2 = add(1)(2)(3)(4)(5)()
        console.log(total2+7)

        console.log(total)
```

这两个案例都是利用闭包变量持久化的特点，以及重写函数的toString方法，当我们去调用函数的输出结果时（total+7），或者alert函数的输出结果会调用toString方法。Edge浏览器下console.log(total) 不会输出结果，如下

![image-20210729144627551](https://i.loli.net/2021/07/29/GYQwn9KpTbLWxS2.png)

以 add(1,2)(3,4)为例，执行顺序为 add——>currying——>currying.toString![GIF 2021-7-29 14-42-06](https://i.loli.net/2021/07/29/aUyXwnKMBO3khDS.gif)

防抖和节流也是柯里化的一个经典应用场景

参考：[浅谈 JS 防抖和节流 - SegmentFault 思否](https://segmentfault.com/a/1190000018428170)

[手写js函数节流与抖动 - SegmentFault 思否](https://segmentfault.com/a/1190000025164986#item-2)

#### 防抖

在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时

```javascript
<html>
    <script>
        function test() {
            console.log('防抖点击' + '!!!')
        }
        function debounce(fn,delay) {
            console.log('decounce执行')
            let timer
            return function() {
                if(timer) clearTimeout(timer);
                timer = setTimeout(fn,delay)  //在指定时间(delay)内仅触发一次fn事件
            }
        }
        function foo() {
            console.log(this.value + '!!!')
        }
        window.onload = function() {
            //这里绑定的函数并不是debounce而是debounce内部的闭包函数  debounce仅触发一次
            document.querySelector('.btn-debounce').addEventListener('click',debounce(test,1000))

            document.querySelector('.btn').addEventListener('click',foo)
        }

        const handleDebounce = debounce(test,1000)
    </script>
    <body>
        <input type="button" class="btn-debounce" value="防抖点击"/>
        <hr/>
        <input type="button" class="btn" value="普通点击"/>
        <hr/>
        <input type="button" value="防抖点击测试2" onclick="debounce(test,1000)()"/>    <!--！！！无法实现防抖  debounce每次都会触发-->
        <hr/>
        <input type="button" value="防抖点击测试3" onclick="handleDebounce()"/>       <!--成功  建议用addEventListener监听事件，而不是onclick直接绑定-->
    </body>
</html>
```

![防抖演示](https://i.loli.net/2021/07/29/LKk9R87pq3EcJAH.gif)

#### 节流

限制某个事件在指定时间(delay)内仅触发一次,，如果在指定时间内某事件被触发多次，仅一次有效

```javascript
<html>
    <script>
        function test(count) {
            console.log('节流点击-'+count + '!!!')
        }
        //flag标识实现节流
        function throttle(fn,delay) {
            console.log('throttle执行')
            let canRun = true
            let count = 1
            return function() {
                if(!canRun) return false
                canRun = false
                setTimeout(()=>{
                    fn(count++)
                    canRun = true
                },delay)
            }
        }

        // //时间戳实现节流
        // function throttle2(fn, delay) {
        //     var preTime = Date.now()
        //     return function () {
        //         var nowTime = Date.now()
        //         if (nowTime - preTime >= delay) {
        //         preTime = nowTime
        //         fn.apply(this, arguments)
        //         }
        //     }
        // }

        window.onload = function() {
            //这里绑定的函数并不是throttle而是throttle内部的闭包函数  throttle仅触发一次
            document.querySelector('.btn-throttle').addEventListener('click',throttle(test,1000))
        }
    </script>
    <body>
        <input type="button" class="btn-throttle" value="节流点击"/>
    </body>
</html>
```

比如我们限制点击事件间隔1秒执行一次，然后我们一直点击该按钮，可实际生效的事件只有4个而已，如下图

![节流演示](https://i.loli.net/2021/07/29/zilmvYXxNAu1eBr.gif)