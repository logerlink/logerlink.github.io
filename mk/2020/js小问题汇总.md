**Uncaught SyntaxError: Cannot use import statement outside a module**

![image-20201008101915491](https://i.loli.net/2020/10/08/BEyvkhFXWbIz7C8.png)

解决方法：修改script标签引入的类型为type="module"   *（不加type）默认为type="javascript"*

<script src="./js/base.js" type="module"></script>

值得一提：如果以file协议直接打开页面会出现跨域错误，处理的办法是在本地创建一个服务器，总之就是避免用file协议访问页面。此处以live-server为例。

![image-20201008095649193](https://i.loli.net/2020/10/08/taYKQkxZJDTe2om.png)

参考：[使用type = “module“出现跨域问题](https://blog.csdn.net/weixin_45045689/article/details/108816145)

live-server的使用：[live-server实时简易服务器](https://www.jianshu.com/p/6661aaebf412)

vscode控制台进行安装：

​	npm install -g live-server

安装成功后直接运行即可：

​	live-server

live-server参数详解↓↓↓↓   [图片来源](https://www.jianshu.com/p/a162131e22d0)

![image-20201008094544953](https://i.loli.net/2020/10/08/hUnCLWZiSQBkvcs.png)



