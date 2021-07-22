[TOC]

#### 问题

[面试了十几个高级前端，竟然连（扁平数据结构转Tree）都写不出来 (juejin.cn)](https://juejin.cn/post/6983904373508145189)

将扁平的数据结构，转成树结构.

```html
<html>
<script>
let arr = [
    {id: 1, name: '部门1', pid: 0},
    {id: 2, name: '部门2', pid: 1},
    {id: 3, name: '部门3', pid: 1},
    {id: 4, name: '部门4', pid: 3},
    {id: 5, name: '部门5', pid: 4},

    {id: 6, name: '部门6', pid: 0},
    {id: 7, name: '部门7', pid: 2},
    {id: 8, name: '部门8', pid: 6},
    {id: 9, name: '部门9', pid: 8},
    {id: 10, name: '部门10', pid: 7},
]
</script>
</html>
```

无意看到一篇博客，兴起想挑战一下，结果完全被吊打。为什么别人写的代码那么优雅？为什么我的代码那么多if...else...，那么多for循环.

![1541](https://i.loli.net/2021/07/22/tojwPcYvTGs73yU.png)

#### 我的题解

```javascript
let aa = 0
function Totree(arr){
    let outputAll = []
    arr.forEach(element => {
        aa ++;
        if(element.pid <=0) {   //pid为0作为最高节点
            outputAll.push({...element,chirdren:[]})
        }else{
            outEleIndex = outputAll.findIndex(x=>x.id == element.pid)
            if(outEleIndex < 0){
                findNode(element,outputAll)
            }
            else{
                //根据pid找出指定的节点(outEle)，为该节点的children插入子节点(element)
                outEle = outputAll[outEleIndex]
                outEle.chirdren.push({...element,chirdren:[]})
            }
        }
    });
    return outputAll;
}

/**
 * 递归插入children
 */
function findNode(inputTemp,output){
    for (let index = 0; index < output.length; index++) {
        aa++;
        const element = output[index];
        if(inputTemp.pid == element.id){
            element.chirdren.push({...inputTemp,chirdren:[]})
            break
        }
        else if(element.chirdren){
            findNode(inputTemp,element.chirdren)
        }
    }
}
console.log(Totree(arr))
console.log(aa)
```

#### 作者题解一递归

```javascript
/**
 * 递归查找，获取children
 */
let aa = 0
 const getChildren = (data, result, pid) => {
  for (const item of data) {
    aa++
    if (item.pid === pid) {
      const newItem = {...item, children: []};
      result.push(newItem);
      getChildren(data, newItem.children, item.id);
    }
  }
}

/**
* 转换方法
*/
const arrayToTree = (data, pid) => {
  const result = [];
  getChildren(data, result, pid)
  return result;
}

console.log(arrayToTree(arr,0))
console.log(aa)
```

#### 作者题解一非递归

```javascript
function arrayToTree(items) {
  const result = [];   // 存放结果集
  const itemMap = {};  // 
  for (const item of items) {
    const id = item.id;
    const pid = item.pid;

    if (!itemMap[id]) {
      itemMap[id] = {
        children: [],
      }
    }

    itemMap[id] = {
      ...item,
      children: itemMap[id]['children']
    }

    const treeItem =  itemMap[id];

    if (pid === 0) {
      result.push(treeItem);
    } else {
      if (!itemMap[pid]) {
        itemMap[pid] = {
          children: [],
        }
      }
      itemMap[pid].children.push(treeItem)
    }

  }
  return result;
}
console.log(arrayToTree(arr))
```

