[TOC]

### Mongodb聚合命令

聚合管道（ aggregate ）

Map-Reduce

单用聚合操作（ estimatedDocumentCount、count、distinct ）

### 数据准备

```shell
use test
data = [
  { _id: 1, name: 'tom', sex: '男', score: 100, age: 34 },
  { _id: 2, name: 'jeke', sex: '男', score: 90, age: 24 },
  { _id: 3, name: 'kite', sex: '女', score: 40, age: 36 },
  { _id: 4, name: 'herry', sex: '男', score: 90, age: 56 },
  { _id: 5, name: 'marry', sex: '女', score: 70, age: 18 },
  { _id: 6, name: 'john', sex: '男', score: 100, age: 31 }
]
db.students.insertMany(data)
data = [
  { _id: 1, province: 'GuangGong', country: 'China', detail: '幸福小区001弄',student_id:6},
  { _id: 2, province: 'Tokyo', country: 'Japan', detail: '幸福小区002弄',student_id:6},
  { _id: 3, province: 'ShangHai', country: 'China', detail: '幸福小区003弄',student_id:5},
  { _id: 4, province: 'BeiJing', country: 'China', detail: '幸福小区004弄',student_id:4},
  { _id: 5, province: 'MingGuWu', country: 'Japan', detail: '幸福小区005弄',student_id:3},
  { _id: 6, province: 'XiNi', country: 'Australia', detail: '幸福小区006弄',student_id:2},
  { _id: 7, province: 'NewYork', country: 'America', detail: '幸福小区006弄',student_id:1},
]
db.address.insertMany(data)
# 查看数据
db.students.find().limit(1)
db.address.find().limit(1)
```

查看其中一条数据

![image-20220110102744052](https://s2.loli.net/2022/01/10/YlgTEbB8resMfU3.png)

### 聚合管道（aggregate）

#### 参考

参考资料：[聚合管道快速参考 - MongoDB-CN-Manual (mongoing.com)](https://docs.mongoing.com/aggregation/aggregation-reference/aggregation-pipeline-quick-reference)

[MongoDB聚合 - MongoDB-CN-Manual (mongoing.com)](https://docs.mongoing.com/aggregation)

注意：除 `$out`, `$merge`和`$geoNear`阶段之外的所有阶段都可以在管道中多次出现

聚合管道只作查询用途，任何操作都是基于查询结果，并不会影响源文档信息

#### $addFields	向文档添加新字段

如向文档中添加老师信息：

```shell
db.students.aggregate([
{$addFields:{teacher_name:'lao wang'}}
])
# 查看源文档信息
db.students.find().limit(1)
```

![image-20220105163629038](https://s2.loli.net/2022/01/05/hHIPSZ638FArDbG.png)

#### $bucket	根据指定的表达式和存储区边界分组。

如按照成绩分组分为，0-60：不及格、60-80：及格、80-90：良好、90-100：优秀

注意这是一个左闭右开的区间范围，如 90-100 是不包含 100 分的，而我们提供的区间又没有 100分 这个区间，所以会默认分到"其他"区间

```shell
# groupBy:指定分组字段	boundaries:分组边界（一个数组会分成多个）	
# default：不满足分组边界的组	output 输出格式
db.students.aggregate([
	{
        $bucket:{
            groupBy:'$score',
            boundaries:[0,60,80,90,100],
            default:'其他',
            output:{
                'count':{$sum:1},
                'name':{$push:'$name'}
            }
         }
	}
])
```

![image-20220105170710890](https://s2.loli.net/2022/01/05/7QVd2Tqu6wWYjGh.png)

#### $bucketAuto	* 根据指定的表达式和存储区数量分组

如按照成绩分成3组：

```shell
# groupBy:指定分组字段	buckets:分组数量
db.students.aggregate([
	{$bucketAuto:{groupBy:'$score',buckets:3}}
])
# 不指定output默认输出count，指定格式输出加上output即可
db.students.aggregate([
	{
		$bucketAuto:{
			groupBy:'$score',
			buckets:3,
			output:{
				'count':{$sum:1},
				'name':{$push:'$name'}
			}
		}
	}
])
```

![image-20220105173926425](https://s2.loli.net/2022/01/05/NBwrt6FKO9PlqLi.png)

#### $collStats	返回有关集合或视图的统计信息。

语法：

```shell
{
  $collStats:
    {
      latencyStats: { histograms: <boolean> },
      storageStats: {},
      count: {}
    }
}
```

latencyStats	查看延迟信息

latencyStats.histograms	如果`true`，则将延迟直方图信息也显示出来

storageStats	查看集合的基本存储信息、如集合大小、条数、平均每条大小等等等等

count				查看集合的总条数

简单演示，默认仅显示集合名称、主机、UTC时间

```shell
db.students.aggregate([{$collStats:{}}])
```

![image-20220105175153181](https://s2.loli.net/2022/01/05/lKDHSNJEwh6V7Y9.png)

查看延迟信息

```shell
db.students.aggregate([
{$collStats:{latencyStats:{}}}
])
```

![image-20220105175401127](https://s2.loli.net/2022/01/05/YQEeZz5c9GIW2ry.png)

查看延迟信息、直方图信息（我也不知道直方图是什么，只知道信息更多了）

```shell
db.students.aggregate([
{$collStats:{latencyStats:{histograms:true}}}
])
```

![image-20220105175527962](https://s2.loli.net/2022/01/05/ftQryq7DCAvIlz3.png)

查看集合存储的信息

```shell
db.students.aggregate([
{$collStats:{storageStats:{}}}
])
```

![image-20220105175722570](https://s2.loli.net/2022/01/05/dAlUkgmGbXacYQD.png)

查看集合总条数

```shell
db.students.aggregate([
{$collStats:{count:{}}}
])
```

![image-20220105175804903](https://s2.loli.net/2022/01/05/wDcECrv3x7e9Ais.png)

当然这几个都可以组合一起使用的

#### $count	* 返回聚合管道此阶段的文档数量计数。

语法：

```shell
{
	$count:""
}
```
简单示例
```shell
# 获取文档数量
db.students.aggregate([{$count:'totalCount'}])
# 查看性别为男的数量
db.students.aggregate([
	{$match:{sex:'男'}},
	{$count:'nan_count'}
])
```

![image-20220105180357766](https://s2.loli.net/2022/01/05/3BykEXK2bcU5Yjm.png)

#### $currentOp	查看当前数据库连接信息

语法：

```shell
{ 
	$currentOp: { 
		allUsers: <boolean>, 
		idleConnections: <boolean>, 
		idleCursors: <boolean>, 
		idleSessions: <boolean>, 
		localOps: <boolean> 
	}
}
```

简单示例

```shell
db.getSiblingDB("admin").aggregate([
	{ $currentOp : { } }
])
```

![image-20220107150241016](https://s2.loli.net/2022/01/07/deNYiMyhzl91WrL.png)

```shell
db.getSiblingDB("admin").aggregate( [
   { $currentOp : { allUsers: true, idleSessions: true } }
] )
```

![image-20220107150708812](https://s2.loli.net/2022/01/07/8VlIJfsDLvikyK2.png)

#### $facet	在同一组输入文档的单个阶段内处理多个聚合管道

v3.4+	可用

语法：

```shell
{ $facet:
   {
      <字段1>: [ pipeline],
      <字段2>: [ pipeline],
      ...
   }
}
```

简单示例，如将 age 分成两组，以30为分界线

```shell
db.students.aggregate([
	{
		$facet:{
			sex_lt30:[{$match:{age:{$lt:30}}}],
			sex_gt30:[{$match:{age:{$gte:30}}}]
		}
	}
])
```

![image-20220107172402532](https://s2.loli.net/2022/01/07/BZyjsfPWrneEdHK.png)

#### $geoNear	* 根据与地理空间点的接近程度返回一个有序的文档流

语法：

```shell
{
	$geoNear: {
        near: {},			# 目标坐标
        distanceField: "xxx.xxx",			# 输出字段，真实距离大小
        maxDistance: 2,		# 距离
        query: { },			# 查询
        includeLocs: "xxx.xxx",	# 输出字段，匹配包含的点
        spherical: true		# 为true用球面距离。为false,2d索引用平面，2dsphere用球面距离
     }
}
```

准备数据

```shell
db.places.insertMany( [
   {
      name: "Central Park",
      location: { type: "Point", coordinates: [ -73, 40 ] },
      category: "Parks"
   },
   {
      name: "Sara D. Roosevelt Park",
      location: { type: "Point", coordinates: [ 10, -80 ] },
      category: "Parks"
   },
   {
      name: "Polo Grounds",
      location: { type: "Point", coordinates: [ 73, 10 ] },
      category: "Stadiums"
   }
] )
# 创建2d索引
db.places.createIndex( { location: "2dsphere" } )
```

简单示例，查询与  [ -73.002, 40.005 ]  距离 1000 米内的点（单位应该是米吧）

```shell
db.places.aggregate([
   {
     $geoNear: {
        near: { type: "Point", coordinates: [ -73.002, 40.005 ] },
        distanceField: "dist.calculated",
        maxDistance: 1000,
        query: { category: "Parks" },
        includeLocs: "dist.location",
        spherical: true
     }
   }
])
```

#### $graphLookup	对集合执行递归搜索

语法：

```shell
{
   $graphLookup: {
      from: <collection>,	# 要搜索的目标集合
      startWith: <expression>,	# 要查找的字段
      connectFromField: <string>,	# 链接的字段，当前记录
      connectToField: <string>,		# 链接的目标字段，下一条记录
      as: <string>,					# 搜索结果的存储区域
      maxDepth: <number>,			# 递归次数
      depthField: <string>,			# 当前搜索结果的个数
      restrictSearchWithMatch: <document>	# 相当于一个简单查找，查找的是 as 结果的数据
   }
}
```

准备数据

```shell
db.employees.insertMany([
{ "_id" : 1, "name" : "Dev" },
{ "_id" : 2, "name" : "Eliot", "reportsTo" : "Dev" },
{ "_id" : 3, "name" : "Ron", "reportsTo" : "Eliot" },
{ "_id" : 4, "name" : "Andrew", "reportsTo" : "Eliot" },
{ "_id" : 5, "name" : "Asya", "reportsTo" : "Ron" },
{ "_id" : 6, "name" : "Dan", "reportsTo" : "Andrew" }
])
```

官方示例，找领导。

如 Dan，他要向 Andrew 汇报，Andrew 再向 Eliot 汇报，Eliot 再向 Dev汇报，所以 Dan字段就会出现3个领导信息，

再如 Dev，他是最高领导，它不需要向其他人汇报，所以 Dev 不会出现任何领导信息

```shell
db.employees.aggregate( [
   {
      $graphLookup: {
         from: "employees",
         startWith: "$reportsTo",
         connectFromField: "reportsTo",
         connectToField: "name",
         as: "reportingHierarchy"
      }
   }
] )
```

![image-20220107184826912](https://s2.loli.net/2022/01/07/xdBrJ5qNCI6oZUz.png)

演示

```shell
db.employees.aggregate( [
   {
       $graphLookup: {
          from: 'employees',
          startWith: '$reportsTo',
          connectFromField: 'reportsTo',
          connectToField: 'name',
          as: 'leaders',
          maxDepth:3,
          depthField: 'num_leader',
          restrictSearchWithMatch: {'name':'Dev'}
       }
    }
] )
```

![image-20220110144437038](https://s2.loli.net/2022/01/10/E8Q34F5qwTGgPcC.png)

#### $group	* 对数据进行分组

```shell
db.students.aggregate([
	{$group:{'_id':'$sex','totalCount':{$sum:1}}}
])
```

![image-20220105181925449](https://s2.loli.net/2022/01/05/xM2zyChi9O6njd8.png)

#### $indexStats	返回有关集合的每个索引的使用情况的统计信息$

```shell
db.students.aggregate([
	{$indexStats:{}}
])
```

![image-20220105182415095](https://s2.loli.net/2022/01/05/W5UTRJNEw2moDAr.png)

#### $limit	* 限制经过管道的文档数量

```shell
db.students.aggregate([{$limit:3}])
# 查找性别为男的，并只取2个
db.students.aggregate([
	{$match:{sex:'男'}},
	{$limit:3}
])
```

![image-20220105182808665](https://s2.loli.net/2022/01/05/s2ndijk4KOH5xRb.png)

#### $listSessions	列出足以传播到`system.sessions`集合的所有会话。

仅对config库有用

```shell
use config
db.system.sessions.aggregate( [  { $listSessions: { allUsers: true } } ] )
```

![image-20220105184214074](https://s2.loli.net/2022/01/05/98RZDitAKNCWgeX.png)

```shell
use config
db.system.sessions.aggregate( [  { $listSessions: { } } ] )
```

![image-20220105184358775](https://s2.loli.net/2022/01/05/R1GTbnBawjhM3oK.png)

```shell
use config
db.aggregate( [ { $listLocalSessions: { users: [ { user: "myAppReader", db: "students" } ] } } ] )
```

#### $lookup	* 对同数据库中的另一个集合执行左外连接

语法：

```shell
{
	$lookup:{
		from:'',	#左外连的表名
		localField:'',	#本表的id
		foreignField:'',	#外表的关联id
		let:{},		#声明变量，对象类型，可选
		pipeline:[]	#一大堆阶段命令
		as:''		# 输出新名称
	}
}
```

如我们要同时查出学生信息及学生住址

```shell
db.students.aggregate([
	{
		$lookup:{
			from:'address',
			localField:'_id',
			foreignField:'student_id',
			as:'student_info'
		}
	}
])
```

![image-20220106101457840](https://s2.loli.net/2022/01/06/WfwBSbrEsxtpmI1.png)

使用 let 做匹配，往往用在两个以上条件匹配时才会用到的

```shell
db.students.aggregate([
	{
		$lookup:{
			from:'address',
			let:{s_id:'$_id'},
			pipeline:[
				{$match:{
					$expr:{
						$and:[
							{$eq:['$student_id','$$s_id']}
						]
					}
				}},
				{$project:{'_id':0}}
			],
			as:'student_info'
		}
	}
])
```

![image-20220106165212635](https://s2.loli.net/2022/01/06/ODduWQHtjiJBhZR.png)

需要注意的点：

1. pipeline 作用域内可以直接读取外表的字段。也可以读取主表的字段，但可能会出现变量作用域混乱的情况，如下图，我们可以看到取到的地址信息都是同一个，这肯定是不正确的

![image-20220106103538866](https://s2.loli.net/2022/01/06/DYGmt4ykzvFxS8K.png)

2. pipeline 内的 $project 只能限制外表的字段，也就是说只能控制外表哪些字段可以显示哪些不可现实。 {$project:{'_id':0}} 意思是不展示地址表中的 \_id 字段，如果要限制主表应该将 $project 与 $lookup 平级，如下：

```shell
db.students.aggregate([
	{
		$lookup:{
			from:'address',
			pipeline:[
				{$match:{
					$expr:{
						$and:[
							{$eq:['$student_id','$_id']}
						]
					}
				}},
				{$project:{'_id':0}}
			],
			as:'student_info'
		}
	},
	{$project:{'score':0,'age':0,'student_info.detail':0}}
])
```

![image-20220106104527718](https://s2.loli.net/2022/01/06/m5CvfXZwSQeKrVu.png)

{$project:{'score':0,'age':0,'student_info.detail':0}} 即 不展示学生主表中的 score、age 字段，不展示 student_info.detail 字段

#### $match	过滤，筛选符合条件的文档，作为下一阶段输入

```shell
db.students.aggregate([
	{$match:{age:{$gte:30}}}
])
```

![image-20220106105302256](https://s2.loli.net/2022/01/06/5JB9cRXtmGSkeA8.png)

#### $merge	将聚合管道的结果文档写入集合，它必须是管道中的最后一个阶段

v4.2+	可以指定输出到某个库某个集合

v4.4+	可以输出到原集合

语法：

```shell
{
	$merge:{
		into:'',	# 表名或 {db:'库名',coll:'表名'}
		on:'',		# 字段名 或 字符串数组	可选，默认全字段，匹配的依据
		let:,		# 设置变量
		whenMatched:'',		# 当匹配时的处理方式，replace 替换、merge 合并，默认、keepExisting 保持不变、fail 失败,pipeline 	可选值
		whenNotMatched:''	# insert 插入，默认、discard 丢弃、fail 失败	可选值
	}
}
```

简单示例

```shell
show collections
db.students.aggregate([
	{$merge:{into:'new_coll'}}
])
show collections
db.new_coll.find()	# 将students表的内容输出到	new_coll表中
db.new_coll.drop()
```

![image-20220106113850039](https://s2.loli.net/2022/01/06/yEqTr5DkLB1XvMz.png)

再来看一下指定字段的。指定 _id 字段 其实和不指定on一样的效果

```shell
show collections
db.students.aggregate([
	{
		$merge:{
			into:'new_coll',
			on:['_id'],
		}
	}
])
show collections
db.new_coll.find()
db.new_coll.drop()
```

![image-20220106114845798](https://s2.loli.net/2022/01/06/T95gqhHLNIZJnrm.png)

指定多字段。

1.要先对这些字段建索引，无关顺序

2.一定要加上 {$project:{_id:0}} _id 排除将否则会报错：

PlanExecutor error during aggregation :: caused by :: $merge failed to update the matching document, did you attempt to modify the _id or the shard key? :: caused by :: Performing an update on the path '_id' would modify the immutable field '_id'

```shell

db.new_coll.createIndex({age:1,name:1},{unique:true})
db.new_coll.insertMany([
	{_id:1, age: 34, name:'tom',  },
	{_id:2, age: 24, name:"jeke",teacher: 'lao wang' },
	{_id:3, age: 36, name:'kite',teacher: 'lao wang',year:'2022'},
])
db.students.find()
db.students.aggregate([
	{$project:{_id:0}},
	{
		$merge:{
			into:'new_coll',
			on:['age','name'],
		}
	}
])
db.new_coll.find()
```

原先我们 new_coll 集合中只有 1、2、3三条记录，students集合中有 1、2、3、4、5、6 六条记录，根据两张表的age、name字段作比较，刚好 students 的 1、2、3 记录能匹配上 new_coll 的 1、2、3 记录，那么程序会将不存在于 new_coll 集合的字段合并到 new_coll 相应记录中。而 4，5，6 记录未能匹配，则程序会将这些记录插入到 new_coll 中，由于这些是没有 \_id 的，所以 mongodb 会自动创建一个 \_id 字段。

![image-20220106150020905](https://s2.loli.net/2022/01/06/kU3nQsKR8X6HcPG.png)

#### $out	* 将聚合管道的结果文档写入集合，它必须是管道中的最后一个阶段

   v4.4+	可以输出到指定数据库的某个集合

语法：

```shell
{
	$out:{
		db:'',	# 数据库名称
		coll:''	# 集合名称
	}
}
# 如果输出到本数据库，也可以这样简写
{
	$out:''	# 集合名称
}
```

简单例子

```shell
show collections
db.students.aggregate([
	{$out:'new_coll'}
])
show collections
db.new_coll.find()
```

![image-20220106154025806](https://s2.loli.net/2022/01/06/37ORcCDKkIwqoUS.png)

#### $planCacheStats	返回集合的计划缓存信息。

v4.2+	可用

```shell
db.students.aggregate([
	{$planCacheStats:{}}
])
# 刚开始执行是没有任何信息的，因为students是一个新集合，我们都没有通过他的索引查询信息，自然不会有什么结果  使劲查id索引也是不行的，必须得建其他字段的索引
# 建两个索引
db.students.createIndex({age:1,name:1})
db.students.createIndex({age:1,sex:1})
# 根据索引查询
db.students.find({age:{$gt:30},name:/i/})
db.students.find({age:{$gt:30},sex:'男'})
#再次执行	planCacheStats 就有结果出来了
db.students.aggregate([
	{$planCacheStats:{}}
])
```

![image-20220106155435178](https://s2.loli.net/2022/01/06/qtjITFJQZ1klwme.png)

#### $project	* 数据投影，主要用于重命名，增加，删除字段

语法：

```shell
{
	$project:{}
}
```

简单示例，如果不对 \_id 进行设置的话，默认出现，如不希望 \_id 出现，应该将值设为0

```shell
db.students.aggregate([
	{$project:{age:1,name:1}}
])
```

![image-20220106163802907](https://s2.loli.net/2022/01/06/CLfIalYrtvh85BF.png)

添加字段 time 、重命名字段  sex_sex

```shell
db.students.aggregate([
	{
		$project:{
			age:1,
			name:1,
			sex_sex:'$sex',
			time:'$$NOW'
		}
	}
])
```

![image-20220106170634162](https://s2.loli.net/2022/01/06/1PS48gEW9JnhxUr.png)

还可以指定 pipeline 做判断。如下我们可以通过计算方法来得出 age、score 这两个字段的平均值，也可以通过判断如果年龄小于 30 ，则不显示 sex 字段

```shell
db.students.aggregate([
	{
		$project:{
			avg_val:{$avg:['$age','$score']},
			age:1,
			sex:{
				$cond:{
					if:{$lt:['$age',30]},
					then:'$$REMOVE',
					else:'$sex'
				}
			}
		}
	}
])
```

![image-20220106175330028](https://s2.loli.net/2022/01/06/t7HsXI4FS9dmWoj.png)

#### $redact	通过基于文档本身中存储的信息来重塑流中的每个文档。

合并[$project]()和[$match]()的功能， $redact 常与 $cond 一起使用，相关变量功能：$$DESCEND 不包括嵌套对象、$$PRUNE	排除该字段、$$KEEP	保留该字段

语法：

```shell
{$redact:{}}
```

数据准备 new_coll

```shell
db.new_coll.drop()
db.students.find()
db.students.aggregate([
	{$out:'new_coll'}
])
db.new_coll.updateMany(
	{_id:{$in:[1,3,6]}},
	{$set:{teacher:{name:'lao wang',age:66}}}
)
db.new_coll.find()
```

![image-20220106181112883](https://s2.loli.net/2022/01/06/CQuX8tSy1FiMN2f.png)

简单示例，含有教师信息的学生记录

```shell
db.new_coll.aggregate([
	{
		$redact:{
			$cond:{
				if:{$eq:['男','$sex']},
                then:'$$DESCEND',
                else:'$$PRUNE'
			}
		}
	}
])

db.new_coll.aggregate([
	{
		$redact:{
			$cond:{
				if:{$eq:['男','$sex']},
                then:'$$KEEP',
                else:'$$PRUNE'
			}
		}
	}
])
```

我们可以看到 $$PRUNE 直接将 sex != '男' 记录排除了，而第一条命令用 $$DESCEND 并没有把 teacher 展示出来，第二条命令在一样的条件下使用 $$KEEP 是可以把 teacher 字段展示出来的

![image-20220106182340836](https://s2.loli.net/2022/01/06/6viDwXgPmutyWrs.png)

#### $replaceRoot	用指定的嵌入文档替换文档

v3.4+	可用

语法：

```shell
{ $replaceRoot: { newRoot: <replacementDocument> } }
```

简单示例，有点像 $project 的感觉

```shell
db.students.aggregate([
	{$replaceRoot: { newRoot: {info:'$age'} } }
])
```

![image-20220107095239396](https://s2.loli.net/2022/01/07/DKldHgNnZi56hJ4.png)

更复杂的，如输出学生信息和成绩

```shell
db.students.aggregate([
	{
		$replaceRoot:{ 
			newRoot:{
				info:{
					$concat:['$name','，性别','$sex']
				},
				score:'$score'
			} 
		}
     }
])
```

![image-20220107100020304](https://s2.loli.net/2022/01/07/BwOP2RZeNJYxKVT.png)

与 $mergeObjects 配合使用，查询 new_coll 集合中的教师信息，若没有则默认补上"无"

```shell
# 准备数据 new_full
db.new_coll.drop()
db.students.find()
db.students.aggregate([
	{$out:'new_coll'}
])
db.new_coll.updateMany(
	{_id:{$in:[1,3,6]}},
	{$set:{teacher:{name:'lao wang',age:66}}}
)
db.new_coll.find()


# 开始执行测试
db.new_coll.aggregate([
	{
		$replaceRoot:{
			newRoot:{
				$mergeObjects:[
					{name:'无',age:'无'},
					'$teacher'
				]
			}
		}
	}
])
```

![image-20220107101048931](https://s2.loli.net/2022/01/07/L1HacQ3hveoYx8r.png)

#### $replaceWith	* 用指定的嵌入文档替换文档

v4.2+	可用， $replaceRoot 能用的 $replaceWith 基本也可以用，只是语法少了 newRoot 属性

语法：

```shell
{ $replaceWith: <replacementDocument> }
```

简单使用

```shell
db.students.aggregate([ 
	{$replaceWith: {info:'$age'}} 
])
```

![image-20220107102314258](https://s2.loli.net/2022/01/07/iA9bGEyvNPo6gsr.png)

更复杂的，如输出学生信息和成绩

```shell
db.students.aggregate([
	{
		$replaceWith:{ 
			info:{
				$concat:['$name','，性别','$sex']
			},
			score:'$score'
		}
     }
])
```

![image-20220107102427199](https://s2.loli.net/2022/01/07/flUVxa2RI9cL8TE.png)

与 $mergeObjects 配合使用，查询 new_coll 集合中的教师信息，若没有则默认补上"无"

```shell
# 准备数据 new_full
db.new_coll.drop()
db.students.find()
db.students.aggregate([
	{$out:'new_coll'}
])
db.new_coll.updateMany(
	{_id:{$in:[1,3,6]}},
	{$set:{teacher:{name:'lao wang',age:66}}}
)
db.new_coll.find()


# 开始执行测试
db.new_coll.aggregate([
	{
		$replaceWith:{
			$mergeObjects:[
            	{name:'无',age:'无'},'$teacher'
            ]
		}
	}
])
```

![image-20220107102737186](https://s2.loli.net/2022/01/07/ubWkZ6oN59M3lc7.png)

#### $sample	* 从输入中随机选择指定数量的文档。

v3.2+	可用

语法：

```shell
{
	$sample:{size:<int>}
}
```

简单示例，随便取出3条记录

```shell
db.students.aggregate([
	{$sample:{size:3}}
])
```

![image-20220107103110513](https://s2.loli.net/2022/01/07/MUybuxjBhI8mZdW.png)

#### $set	* 向文档添加新字段。

v4.2+	可用，与`$project` 类似，`$set`会重新塑造流中的每个文档。`$set`是`$addFields`阶段的别名。

语法：

```shell
{ $set:{'name':expression} }
```

简单示例，查询时加一个 age、score 字段的平均值

```shell
db.students.aggregate([
	{
		$set:{
			avg_score:{$avg:['$age','$score']}
		}
	}
])
```

![image-20220107104030141](https://s2.loli.net/2022/01/07/CeN7rtQlK9mUcLG.png)

处理数组

```shell
# 准备数据 new_full
db.new_coll.drop()
db.new_coll.insertOne(
	{arr:[1,2,3]}
)
db.new_coll.find()


# 开始执行测试
db.new_coll.aggregate([
	{
		$set:{
			arr:{
				$concatArrays:['$arr',[4,5,6]]
			}
		}
	}
])
```

![image-20220107104652594](https://s2.loli.net/2022/01/07/d5rhNTVACZ27XDy.png)

#### $skip	* 待操作集合处理前跳过部分文档

简单示例

```shell
db.students.aggregate([
	{$skip:2}
])
```

![image-20220107104938717](https://s2.loli.net/2022/01/07/wYeytkqr3xZ5RD7.png)

#### $sort	* 按指定的排序键重新排序文档

```shell
db.students.find()
# 正序
db.students.aggregate([{$sort:{age:1}}])
# 倒序
db.students.aggregate([{$sort:{age:-1}}])
```

![image-20220107105142640](https://s2.loli.net/2022/01/07/QdlGovYkAsDCZ8b.png)

#### $sortByCount	根据某字段分组，然后计算每个不同组中的文档计数

v3.4+	可用

简单示例，按照学生成绩分组，并根据数量倒排

```shell
db.students.aggregate([
	{$sortByCount:'$score'}
])
```

![image-20220107105647102](https://s2.loli.net/2022/01/07/qZ36ypoXIuUnS5T.png)

#### $unionWith	* 执行两个集合的并集

v4.4+	可用

```shell
{
	$unionWith:{
		coll:'',
		pipeline:{},	# 不可包含$out、$merge，仅支持处理coll集合
	}
}
```

简单示例

```shell
db.students.aggregate([
	{
		$unionWith:{
			coll:'address',
			pipeline:[{$match:{student_id:{$gt:2}}}]
		}
	}
])
```

![image-20220107141627946](https://s2.loli.net/2022/01/07/OBdni12xgXIKAbj.png)

#### $unset	* 从文档中移除/排除字段

v4.2	可用

```shell
{
	$unset:"" 或 [],	
}
```

简单示例

```shell
db.students.aggregate([
	{$unset:'sex'}
])
db.students.aggregate([
	{$unset:['sex','age','score']}
])
```

![image-20220107142157577](https://s2.loli.net/2022/01/07/WSrm8IpB6LzjfNR.png)

#### $unwind	解析输入文档中的数组字段，为每个元素输出一个文档

v3.2+	可用

语法：

```shell
{
  $unwind:
    {
      path: <field path>,
      includeArrayIndex: <string>,			# 下标值
      preserveNullAndEmptyArrays: <boolean>	# 若为false，且path为空、缺失或空数组，则 $unwind 不会输出文档，默认为false
    }
}
```

简单示例

```shell
# 准备数据 new_full
db.new_coll.drop()
db.new_coll.insertOne(
	{arr:[1,2,3]}
)
db.new_coll.find()

db.new_coll.aggregate([
	{$unwind:{
		path:'$arr'
	}},
])
# 也可以这样写
db.new_coll.aggregate([
	{$unwind:'$arr'},
])
```

![image-20220107143233127](https://s2.loli.net/2022/01/07/s1Lx8p4qbjR2wXE.png)

查看下标

```shell
db.new_coll.aggregate([
	{$unwind:{
		path:'$arr',
		includeArrayIndex:'index'
	}},
])
```

![image-20220107144021785](https://s2.loli.net/2022/01/07/UqWrp3t5d6QTNsa.png)

### Map-Reduce

流程：先筛选一层（query），通过cust_id进行分组（map），获取分组后每一组的数量（reduce），再进行输出（output）

![41](https://s2.loli.net/2022/01/10/nHWisKaLSh2M1yp.png)

简单示例

```shell
show collections
db.students.mapReduce(
	function(){emit(this.sex, this);},
	function(key_sex,value_student){return value_student},
	{
		query:{age:{$gte:30}},
		out:'student_group'
	}
)
show collections
db.student_group.find()
```

![image-20220110110200634](https://s2.loli.net/2022/01/10/zi2bcSUqordy84l.png)

emit一定是要两个参数，如果你想输出整个对象直接指定this即可，如果你只想输出一个属性，如name，应该这样写：`emit(this.sex, this.name) `，如果你像输出特定（两个以上）的属性，如name、age，我们可以这样写：`emit(this.sex,{name:this.name,age:this.age})`，千万不要这样写：`emit(this.sex,{name,age})`

这个out是覆盖写入的

```shell
db.students.mapReduce(
	function(){emit(this.sex,{name:this.name,age:this.age})},
	function(key_sex,value_student){return value_student},
	{
		query:{age:{$gte:30}},
		out:'student_group'
	}
)
```

![image-20220110112400968](https://s2.loli.net/2022/01/10/AOK3ktPohNJRTwc.png)

#### 使用aggregate来替换MapReduce

```shell
db.students.aggregate([
	{$match:{age:{$gte:30}}},
	{$group:{'_id':'$sex','value':{$push:{name:'$name',age:'$age'}}}},
	{$out:'student_group'}
])
```

![image-20220110121839221](https://s2.loli.net/2022/01/10/YR3hMtVncKEgG4l.png)

### 单用聚合操作

#### estimatedDocumentCount

v4.0.3+	可用，计算集合总数

```shell
db.students.estimatedDocumentCount({})
```

![image-20220110113216581](https://s2.loli.net/2022/01/10/PEXleHUFYSVuWvj.png)

对于搜索无效

![image-20220110113411498](https://s2.loli.net/2022/01/10/N7lJEupAq4yQg2O.png)

#### count

计算集合总数，可搜索、可过滤、可提取、可设置读关注、可设置超时时间

语法：

```shell
{
	query:{}		# 查询条件
},
{
	limit:int,		# 提取n条
	skip:int,		# 跳过n条
	hint:'' or {},	# 指定索引
	maxTimes:int,	# 超时时间、毫秒
	readConcern:'',	# 读关注，默认local
	collation:{}
}
```

简单示例

```shell
db.students.count()
db.students.count({sex:'男'})
db.students.count({sex:'男'},{limit:1})
db.students.count({sex:'男'},{skip:1})
db.students.count({_id:{$lt:5}},{hint:'_id_'})
db.students.count({_id:{$lt:5}},{hint:{_id:1}})
```

![image-20220110114705766](https://s2.loli.net/2022/01/10/sx8ACqzZ9HvN4tr.png)

#### distinct

按照字段筛选重复项

语法：

```shell
(
	fidld:'',	# 字段名称
	query:{},	# 筛选条件
	collation:{}
)
```

![image-20220110115456133](https://s2.loli.net/2022/01/10/fworXmBN6dqtc9O.png)

### 其他

本来是不打算记录的，因为文档上该有的都有，例子也很鲜明通俗易懂，但看着看着总觉得还得自个抄一下，才能更深刻一点。aggregate 是个很实用得东西，对复杂查询、查询速度这两个操作比直接find效率要高很多，我们要学的不是语法，而是要学会将各个阶段得命令结合起来，更快查询到我们想要的东西。

含 * 的可能是平常比较常见、用得比较多命令吧。（该叫它命令呢？还是阶段？）

下一篇找时间整理一下mongodb得常见函数。