[TOC]

### 说明

仅为个人整理及理解，大多数都是参照官方文档，记录只是为了加深印象而已，有些数学函数未作测试，有些做了测试也还是没能理解这个函数有什么用...

未做测试的函数（大多为数学三角函数、方差函数）：accumulator、acos、acosh、asin、asinh、atan、atan2、atanh、cos、cosh、covariancePop 、covarianceSamp、degreesToRadians、degreesRank、derivative、expMovingAvg、function、sin、sinh、stdDevSamp、tan、tanh

参考：[Aggregation Pipeline Operators — MongoDB Manual](https://www.mongodb.com/docs/manual/reference/operator/aggregation/)

点击查看按照[分类整理](https://logerlink.github.io/page/2022/aggregation_operator_group.html)的

### 数据准备

```shell
use test
data = [
  { _id: 1, name: 'tom', sex: '男', score:{yw:100,sx:50}, age: 34,update_at:1533657600000,create_at:1520481600000,favorites: [ "chocolate", "cake"]},
  { _id: 2, name: 'jeke', sex: '男', score:{yw:90,sx:60}, age: 24,update_at:1533657600000,create_at:1520478000000,favorites: [ "chocolate", "apples" ]},
  { _id: 3, name: 'kite', sex: '女', score:{yw:40,sx:70}, age: 36,update_at:1533657600000,create_at:1520514000000,favorites: [ "chocolate","butter", "apples" ]},
  { _id: 4, name: 'herry', sex: '男', score:{yw:90,sx:77}, age: 56,update_at:1533657600000,create_at:1520366400000,favorites: [ "cake", "butter"]},
  { _id: 5, name: 'marry', sex: '女', score:{yw:70,sx:55}, age: 18,update_at:1533657600000,create_at:1520474400000,favorites: ["cake","apples" ]},
  { _id: 6, name: 'john', sex: '男', score:{yw:100,sx:93}, age: 31 ,update_at:1533657600000,create_at:1520391600000,favorites: [ "butter"]}
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

注意时间戳这里存的是以毫秒为单位的，让我们查看其中一条数据

![image-20220425144130556](https://s2.loli.net/2022/04/25/FHcJlhtrBNQ3KI5.png)

### 聚合函数

#### abs—求绝对值

如求学生的数学成绩与60之间的绝对值

```shell
db.students.aggregate([{
—$project: {
		abs_age: {
			$abs: {
				$subtract:['$score.sx',60]
			}
		}
	}
}])
```

![image-20220422114803321](https://s2.loli.net/2022/04/22/J9wWSirYjNQzM1P.png)

#### add—数字或日期相加

求学生的数学成绩与语文成绩总和，并将创建时间添加一天

添加时间时默认单位时毫秒，一天间隔 86400000 毫秒

```shell
db.students.aggregate([{
	$project: {
		abs_age: {
			$add:['$score.sx','$score.yw']
		},
		create_at:1,
		create_at_now:{
			$add:['$create_at',86400000]
		}
	}
}])
```

![image-20220425144222638](https://s2.loli.net/2022/04/25/2mzQ7FEgpHaxYLo.png)

#### addToSet—返回唯一值数组

**仅支持在 $bucket、$bucketAuto、$group、$setWindowField这四个管道中使用**

我们这里把Set理解成不重复的数组就很好理解了

如根据sex字段进行分组，并输出对应的年龄和语文成绩

```shell
db.students.aggregate([{
	$group: {
		_id:'$sex',
		all_age:{$addToSet:'$age'},
		all_sx:{$addToSet:'$score.yw'}
	}
}])
```

![image-20220422114848946](https://s2.loli.net/2022/04/22/l2td5DcemsYAVK8.png)

#### allElementsTrue—判断所有元素是否全为True

```shell
True：true、1、[]、str
False：false、0、null、undefined
```

官方例子

```shell
# 数据准备
db.survey.insertMany([
   { "_id" : 1, "responses" : [ true ] },
   { "_id" : 2, "responses" : [ true, false ] },
   { "_id" : 3, "responses" : [ ] },
   { "_id" : 4, "responses" : [ 1, true, "seven" ] },
   { "_id" : 5, "responses" : [ 0 ] },
   { "_id" : 6, "responses" : [ [ ] ] },
   { "_id" : 7, "responses" : [ [ 0 ] ] },
   { "_id" : 8, "responses" : [ [ false ] ] },
   { "_id" : 9, "responses" : [ null ] },
   { "_id" : 10, "responses" : [ undefined ] }
])
# 查询输出
db.survey.aggregate(
   [
     { $project: { responses: 1, isAllTrue: { $allElementsTrue: [ "$responses" ] }, _id: 0 } }
   ]
)
```

![image-20220422112054058](https://s2.loli.net/2022/04/22/A5asLOWq8QXvCen.png)

#### and—bool运算且

简单例子

```shell
True：true、1、[]、str
False：false、0、null、undefined

{ $and: [ 1, "green" ] }					true
{ $and: [ ] }								true
{ $and: [ [ null ], [ false ], [ 0 ] ] }	true
{ $and: [ null, true ] }					false
{ $and: [ 0, true ] }						false
```

查找语文、数学成绩都超过60（及格）的学生

```shell
db.students.aggregate([{
	$match: {
		$and:[
			{'score.yw':{$gte:60}},
			{'score.sx':{$gte:60}},
		]
	}
}])
```

![image-20220425144304553](https://s2.loli.net/2022/04/25/BzHOjI2u47iescx.png)

#### anyElementTrue—判断所有元素是否有一个为True

```shell
True：true、1、[]、str
False：false、0、null、undefined
```

官方例子

```shell
db.survey.aggregate(
   [
     { $project: { responses: 1, isAnyTrue: { $anyElementTrue: [ "$responses" ] }, _id: 0 } }
   ]
)
```

![image-20220422113008412](https://s2.loli.net/2022/04/22/1isSXZkmNlcPHWg.png)

#### arrayElemAt—获取数组的指定下标值

下标-1即倒数第一个，-2即倒数第二个，依次往下

```shell
db.students.aggregate([{
	$project: {
		first:{$arrayElemAt:['$favorites',0]},
		last:{$arrayElemAt:['$favorites',-1]},
		index2:{$arrayElemAt:['$favorites',2]},
		'index-2':{$arrayElemAt:['$favorites',-2]},
	}
}])
```

![image-20220422115454679](https://s2.loli.net/2022/04/22/x5Qz4PTKDhCkmlZ.png)

#### arrayToObject—将数组转换成对象

```shell
db.students.aggregate([{
	$project: {
		new_arr:{$arrayToObject:'$favorites'}
	}
}])
```

#### avg—求平均值

**仅支持在$addFields、$bucket、$bucketAuto、$group、$match、$project、$replaceRoot、$replaceWith、$set、$setWindowField这几个管道中使用**

查看学生平均成绩

```shell
db.students.aggregate([{
	$project: {
		age_avg:{
			$avg:['$score.sx','$score.yw']
		}
	}
}])
```

![image-20220422134351421](https://s2.loli.net/2022/04/22/gR45PxVv71Xc3l6.png)

#### binarySize—查看字符串或二进制数据的内容大小（以字节为单位）

版本要求：v4.4+

官方例子

```shell
db.students.aggregate([
{
	$project:{
		bs_str:{
			$binarySize:'abcdEFG'
		},
		bs_str2:{
			$binarySize:'Hello World!'
		},
		bs_str3:{
			$binarySize:'!！！!'
		},
		bs_str4:{
			$binarySize:'cafétéria'
		},
		bs_str5:{
			$binarySize:"€λG"
		},
		bs_str6:{
			$binarySize:'你好'
		},
		bs_bytes:{
			$binarySize:new BinData(0, "MyIRAFVEd2aImaq7zN3u/w==")
		},
	}
},
{$limit:1}
])
```

空格占1字节、中文符号占1字节、é占2字节、€占3字节λ占2字节、汉字占3字节

![image-20220507101814022](https://s2.loli.net/2022/05/07/blCu43ST9RhPiGO.png)

#### bsonSize—查看文档大小

版本要求：v4.4+

$$ROOT表示当前文档根目录，即整个文档

```shell
db.students.aggregate([
{
	$project:{
		bs:{
			$bsonSize:'$$ROOT'
		}
	}
}
])
```

![image-20220507102108338](https://s2.loli.net/2022/05/07/EUwfybCXn6iJYBL.png)

#### ceil—向上取整

```shell
db.students.aggregate([{
	$project: {
		age_divide:{$divide:['$age',10]},
		age_ceil:{
			$ceil:{
                $divide:['$age',10]
            }
		}
	},
}])
```

![image-20220422141318302](https://s2.loli.net/2022/04/22/IWG64ysKSJbEaLH.png)

#### cmp—比较两个数并返回

**如a、b，若a大于b则返回1，a小于b则返回-1，a等于b则返回0**

```shell
db.students.aggregate([{
	$project: {
		yw:'$score.yw',
		sx:'$score.sx',
		score_cmp:{
			$cmp:['$score.yw','$score.sx']
		}
	},
}])
```

![image-20220422141651836](https://s2.loli.net/2022/04/22/3Q61qIlbnfOxWoR.png)

#### concat—链接字符串并返回结果

仅支持字符串链接，若为其他类型请先转成字符串

```shell
db.students.aggregate([{
	$project: {
		score_cmp:{
			$concat:[
                '$name',
                '成绩——语文：',
                {$toString:'$score.yw'},
                '，数学：'
                ,{$toString:'$score.sx'}
            ]
		}
	},
}])
```

![image-20220422142144081](https://s2.loli.net/2022/04/22/na63e1H7RpuUqYK.png)

#### concatArrays—链接数组并返回结果

为每个学生添加 ['pear','bear'] 

```shell
db.students.aggregate([{
	$project: {
		score_cmp:{
			$concatArrays:[
                '$favorites',
                ['pear','bear']
            ]
		}
	},
}])
```

![image-20220422142409784](https://s2.loli.net/2022/04/22/kQRNF7jx4gu8zJl.png)

#### cond—条件判断，if else

语法：`{ $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case> } }`

简写：`{ $cond: [ <boolean-expression>, <true-case>, <false-case> ] }`

```shell
db.students.aggregate([{
	$project: {
		evaluate:{
			$cond:{
				if:{$gte:['$score.sx',60]},
				then:'及格',
				else:'不及格'
			}
		}
	},
}])

# 或者
db.students.aggregate([{
	$project: {
		evaluate:{
			$cond:[
				{$gte:['$score.sx',60]},
				'及格',
				'不及格'
			]
		}
	},
}])
```

![image-20220422143038387](https://s2.loli.net/2022/04/22/GSsfJovE4wtr7YO.png)

#### convert—转换类型

to类型：double、string、objectId、bool、date、int、long、decimal  严格区分大小写

```sh
db.students.aggregate([{
	$project: {
		toInt:{
			$convert:{input:'333',to:'int'}
		},
		toDecimal:{
			$convert:{input:'3.33',to:'decimal'}
		},
		toObjectId:{
			$convert:{input:'625fdc38036ba2d828afdae0',to:'objectId'}
		},
		toBool:{
			$convert:{input:'0',to:'bool'}
		},
		toDate:{
			$convert:{input:'2022-02-22',to:'date'}
		},
		OnError:{
			$convert:{input:'3.33',to:'int',onError:'转换出错,指定转换类型错误'}
		},
		OnNull:{
			$convert:{input:null,to:'date',onNull:'输入值为null'}
		}
	}
}])
```

![image-20220422145341102](https://s2.loli.net/2022/04/22/rkhlVdeFq1LsYUR.png)

#### count—获取文档总数

版本要求：5.0+

**仅支持在 $bucket、$bucketAuto、$group、$setWindowField这四个管道中使用**

如分组后获取总数

```shell
db.students.aggregate([{
	$group:{
		_id:'$sex',
		count:{$count:{}}
	}
}])
```

![image-20220425142123729](https://s2.loli.net/2022/04/25/xih8ZMgszIXL9Ct.png)

#### dateAdd—添加时间

版本要求：5.0+

更多请参考：[$dateAdd (aggregation) — MongoDB Manual](https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateAdd/)

startDate：初始时间，可以是时间类型、时间戳类型、ObjectId，但不能直接转换long类型

unit单位：year、quarter、week、month、day、hour、minute、second、millisecond

amount：正数为加，负数为减（dateSubtract效果）

timezone 一直测试不出来...，运行结果不达预期（bug?）

```shell
db.students.aggregate([{
	$project:{
		create_at:1,
		create_at_date:{
			$toDate:'$create_at'
		},
		time_now:{
			$dateAdd:{
                 startDate: {$toDate:'$create_at'},
                 unit: "month",
                 amount: 1
              }
		}
	}
}])
```

![image-20220425152043126](https://s2.loli.net/2022/04/25/H2YyB4pQS6PfIDg.png)

#### dateDiff—比较两个时间的差

版本要求：5.0+

```shell
{
   $dateDiff: {
      startDate: 时间1,
      endDate: 时间2,
      unit: 比较的单位year、quarter、week、month、day、hour、minute、second、millisecond,
      timezone: 时区、可选参数,
      startOfWeek: 一周的开始、默认是星期天、可选参数
   }
}
```

如比较创建时间和最新更新时间，看看两者之间隔了多少月或多少周

```shell
db.students.aggregate([{
	$project:{
		diff_month:{
			$dateDiff:{
                 startDate: {$toDate:'$create_at'},
                 endDate: {$toDate:'$update_at'},
                 unit: "month"
              }
		},
		diff_month:{
			$dateDiff:{
                 startDate: {$toDate:'$update_at'},
                 endDate: {$toDate:'$create_at'},
                 unit: "month"
              }
		},
		diff_week_sunday:{
			$dateDiff:{
                 startDate: ISODate('2018-08-08'),
                 endDate: ISODate('2020-08-08'),
                 unit: "week"
              }
		},
		diff_week_friday:{
			$dateDiff:{
                 startDate: ISODate('2018-08-08'),
                 endDate: ISODate('2020-08-08'),
                 unit: "week",
                 startOfWeek:'friday'
              }
		}
	}
}])
```

![image-20220425155152309](https://s2.loli.net/2022/04/25/5ngarRHs4iJt29x.png)

#### dateFromParts—根据指定时间参数转换为时间类型

```shell
{
    $dateFromParts : {
        'year': <year> 必填, 'month': <month> 1-12, 'day': <day> 1-31,
        'hour': <hour> 0-23, 'minute': <minute> 0-59, 'second': <second> 0-59,
        'millisecond': <ms> 0-999, 'timezone': <tzExpression>
    }
}
或者
{
    $dateFromParts : {
        'isoWeekYear': <year> 必填, 'isoWeek': <week> 0-55, 'isoDayOfWeek': <day> 1-7,
        'hour': <hour>, 'minute': <minute>, 'second': <second>,
        'millisecond': <ms>, 'timezone': <tzExpression>
    }
}
```

year和month是固定出现的，isoWeekYear、isoWeek、isoDayOfWeek也是固定出现的不能混起来使用

```shell
db.students.aggregate([
{
	$project:{
		time_year:{
			$dateFromParts:{'year':2018,'month':8,'day':8}
		},
		time_isoYear:{
			$dateFromParts:{'isoWeekYear':2018,'isoWeek':8,'isoDayOfWeek':1}
		}
	}
},
{$limit:1}
])
```

![image-20220425160858859](https://s2.loli.net/2022/04/25/SykvNqaVe5Y1OD6.png)

#### dateFromString—从字符串转换成事件类型

```shell
{ 
    $dateFromString: {
         dateString: 时间字符串,
         format: dateString 的格式、可选,
         timezone: 时区、可选,
         onError: 转换失败处理、可选,
         onNull: 转换空值处理、可选
    } 
}

#	2018-08-08T08:08:08.888
#	%Y-%m-%dT%H-%M-%S.%L
#	%Y：year	%m：month	%d：day	%H：hour	%M：minute	%S：second	%L：milliSecond
#	%G：ISOYear	%u：DayofWeek	%V：WeekOfYear	%z：时区间隔	%Z：失去间隔	%%：%符号
#	mongodb又自己搞了一套format，就不能统一一下吗
```

```shell
db.students.aggregate([
{
	$project:{
		time1:{
			$dateFromString:{dateString:'2018-08-08T08:08:08.888'}
		},
		time2:{
			$dateFromString:{dateString:"2021/8/18"}
		},
		time_error:{
			$dateFromString:{
				dateString:"06-15-2018",
				onError:'转换失败'
			}
		},
		time_format:{
			$dateFromString:{
				dateString:"06-15-2018",
				format:'%m-%d-%Y'
			}
		},
		time_numm:{
			$dateFromString:{
				dateString:null,
				onNull:'空值'
			}
		}
	}
},
{$limit:1}
])
```

![image-20220426101453736](https://s2.loli.net/2022/04/26/ftk6oIDs52CT7BW.png)

#### dateSubtract—递减时间

版本要求：5.0+

startDate：初始时间，可以是时间类型、时间戳类型、ObjectId，但不能直接转换long类型

unit单位：year、quarter、week、month、day、hour、minute、second、millisecond

amount：正数为减，负数为加（dateAdd效果）

```shell
db.students.aggregate([{
	$project:{
		create_at:1,
		create_at_date:{
			$toDate:'$create_at'
		},
		time_next_month:{
			$dateSubtract:{
                 startDate: {$toDate:'$create_at'},
                 unit: "month",
                 amount: -1
              }
		},
		time_last_month:{
			$dateSubtract:{
                 startDate: {$toDate:'$create_at'},
                 unit: "month",
                 amount: 1
              }
		},
	}
}])
```

![image-20220426102118428](https://s2.loli.net/2022/04/26/CrFHhBXIPwUstgy.png)

#### dateToParts—将时间解析成各个时间组成部分

将一个时间类型的值返回year、month、day、hour、minute、second、millisecond，若指定了iso8601为true，则会返回isoWeekYear、isoWeek、 isoDayOfWeek、hour、minute、second、millisecond。

```shell
db.students.aggregate([
{
	$project:{
		date_parts:{
			$dateToParts:{
				date:{$toDate:'$create_at'}
			}
		},
		date_iso_parts:{
			$dateToParts:{
				date:{$toDate:'$create_at'},
				iso8601:true
			}
		},
		date_zone_parts:{
			$dateToParts:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
},
{$limit:1}
])
```

![image-20220426103009642](https://s2.loli.net/2022/04/26/2Q3Bf7IpX59GMmt.png)

####  dateToString—日期转字符串

```shell
{ 
	$dateToString: {
    	date: 要转换的时间,
	    format: 转换格式、可选,
    	timezone: 时区、可选,
	    onNull: 为null时处理、可选
	} 
}
#	2018-08-08T08:08:08.888
#	%Y-%m-%dT%H-%M-%S.%L
#	%Y：year	%m：month	%d：day	%H：hour	%M：minute	%S：second	%L：milliSecond
#	%G：ISOYear	%u：DayofWeek	%V：WeekOfYear	%z：时区间隔	%Z：失去间隔	%%：%符号
```

```shell
db.students.aggregate([
{
	$project:{
		date_str:{
			$dateToString:{
				date:{$toDate:'$create_at'}
			}
		},
		date_format_str:{
			$dateToString:{
				date:{$toDate:'$create_at'},
				format:'%d-%m-%Y'
			}
		},
		date_zone_str:{
			$dateToString:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
		date_null_str:{
			$dateToString:{
				date:null,
				onNull:'为空值'
			}
		}
	}
},
{$limit:1}
])
```

![image-20220426111037621](https://s2.loli.net/2022/04/26/gdXD3An64zWCTmF.png)

#### dateTrunc—截断日期

版本要求：v5.0+ 参考：[$dateTrunc (aggregation) — MongoDB Manual](https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateTrunc/)

unit可指定：

year——当年的1月1日，无时间

quarter——当年当季的第一月1日，无时间

week——当年当周的第一天，无时间

month——当年当月1日，无时间

day——当年当月当日，无时间

hour——当年当月当日当时，无分秒

minute——当年当月当日当时分，无秒

second——当年当月当日当时分秒，无毫秒

binSize 一直没试成功，运行结果和自己预期的结果大相径庭，但又不知道怎么回事（bug?）

```shell
db.students.aggregate([
{
	$project:{date_now:new Date("2020-05-18T14:10:30.888Z")}
},
{
	$project:{
		trunc_s:{
			$dateTrunc:{date:'$date_now',unit:'second'}
		},
		trunc_s2:{
			$dateTrunc:{date:'$date_now',unit:'second',	binSize:30}
		},
		trunc_s3:{
			$dateTrunc:{date:'$date_now',unit:'second',	binSize:60}
		}
	}
},{$limit:1}
])
```

![image-20220507104832368](https://s2.loli.net/2022/05/07/ryVBeG81KNOQnED.png)

```shell
db.students.aggregate([
{
	$project:{date_now:new Date("2020-05-18T14:10:30.888Z")}
},
{
	$project:{
		trunc_m:{
			$dateTrunc:{date:'$date_now',unit:'minute'}
		},
		trunc_m2:{
			$dateTrunc:{date:'$date_now',unit:'minute',	binSize:10}
		},
		trunc_m3:{
			$dateTrunc:{date:'$date_now',unit:'minute',	binSize:60}
		},
		trunc_h:{
			$dateTrunc:{date:'$date_now',unit:'hour'}
		},
		trunc_h2:{
			$dateTrunc:{date:'$date_now',unit:'hour',	binSize:14}
		},
		trunc_h3:{
			$dateTrunc:{date:'$date_now',unit:'hour',	binSize:24}
		}
	}
},{$limit:1}
])
```

![image-20220507105608460](https://s2.loli.net/2022/05/07/YqodykuSr3ilUW5.png)

```shell
db.students.aggregate([
{
	$project:{date_now:new Date("2020-05-18T14:10:30.888Z")}
},
{
	$project:{
		trunc_d:{
			$dateTrunc:{date:'$date_now',unit:'quarter'}
		},
		trunc_d2:{
			$dateTrunc:{date:'$date_now',unit:'quarter',binSize:2}
		},
		trunc_m:{
			$dateTrunc:{date:'$date_now',unit:'week'}
		},
		trunc_m2:{
			$dateTrunc:{date:'$date_now',unit:'week',binSize:10}
		},
		trunc_y:{
			$dateTrunc:{date:'$date_now',unit:'year'}
		},
		trunc_y2:{
			$dateTrunc:{date:'$date_now',unit:'year',binSize:10}
		}
	}
},{$limit:1}
])
```

![image-20220507105837307](https://s2.loli.net/2022/05/07/rP6S4OqpizHRN3x.png)

```shell
db.students.aggregate([
{
	$project:{date_now:new Date("2020-05-18T14:10:30.888Z")}
},
{
	$project:{
		trunc_q:{
			$dateTrunc:{date:'$date_now',unit:'day'}
		},
		trunc_q2:{
			$dateTrunc:{date:'$date_now',unit:'day',binSize:18}
		},
		trunc_q3:{
			$dateTrunc:{date:'$date_now',unit:'day',binSize:31}
		},
		trunc_w:{
			$dateTrunc:{date:'$date_now',unit:'month'}
		},
		trunc_w2:{
			$dateTrunc:{date:'$date_now',unit:'month',binSize:5}
		},
		trunc_w3:{
			$dateTrunc:{date:'$date_now',unit:'month',binSize:12}
		}
	}
},{$limit:1}
])
```

![image-20220507110105984](https://s2.loli.net/2022/05/07/xL5Bc2vXgkTjsKi.png)

#### dayOfMonth—查询一月之中的第几天、0-31

```shell
db.students.aggregate([
{
	$project:{
		day:{
			$dayOfMonth:{
				date:{$toDate:'$create_at'}
			}
		},
		day_timezone:{
			$dayOfMonth:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426115916152](https://s2.loli.net/2022/04/26/bUcCLlSGkpMrxs6.png)

#### dayOfWeek—查询一周之中的第几天，1-7

```shell
db.students.aggregate([
{
	$project:{
		day_week:{
			$dayOfWeek:{
				date:{$toDate:'$create_at'}
			}
		},
		day_week_timezone:{
			$dayOfWeek:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426120037563](https://s2.loli.net/2022/04/26/nFVaZOdxKD8uwPs.png)

#### dayOfYear—查询一年之中的第几天，0-365

```shell
db.students.aggregate([
{
	$project:{
		day_Year:{
			$dayOfYear:{
				date:{$toDate:'$create_at'}
			}
		},
		day_Year_timezone:{
			$dayOfYear:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426134608590](https://s2.loli.net/2022/04/26/lMoeJ4KxiNLYdU9.png)

#### divide—两数相除

前者除以后者，如学生的年龄除以10

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_10:{
			$divide:['$age',10]
		},
	}
}
])
```

![image-20220426140912986](https://s2.loli.net/2022/04/26/ugXyH62CMESrp3V.png)

#### documentNumber—返回文档在 $setWindowFields 阶段分区中的位置（称为文档编号）

版本要求：5.0+

仅支持在setWindowFields阶段中使用，不知道有什么用...

```shell
db.students.aggregate([
{
	$project:{sex:1,age:1}
},
{
	$setWindowFields:{
		partitionBy:'$sex',
		sortBy:{age:-1},
		output:{
			result:{
				$documentNumber: {}
			}
		}
	}
}
])
```

![image-20220507111955463](https://s2.loli.net/2022/05/07/8IdpNAiQvbVK7jm.png)

#### eq—判断两值相等

相等返回True，否则返回false

```shell
db.students.aggregate([
{
	$project:{
		age:'$age',
		age_is_18:{
			$eq:['$age',18]
		},
		eq_result:{
			$eq:['18',18]
		},
		eq_result2:{
			$eq:[null,null]
		},
	}
}
])
```

![image-20220426141104883](https://s2.loli.net/2022/04/26/n1HTdkr9y2CcXSu.png)

#### exp—提高欧拉数(即*e*) 到指定的 index 

不知道有什么用

```shell
db.students.aggregate([
{
	$project:{
		exp0:{
			$exp:0
		},
		exp2:{
			$exp:2
		},
		exp10:{
			$exp:10
		},
	}
}
,{$limit:1}
])
```

![image-20220426141513904](https://s2.loli.net/2022/04/26/pCzhqeJTbEsNKrf.png)

#### filter—过滤数组

基础语法

```shell
{ 
	$filter: { 
		input: 数组, 
		as: 数组里每个元素, 
		cond: 过滤条件 
	} 
}
```

查询学生爱好中包含"apples"选项

```shell
db.students.aggregate([
{
	$project:{
		favorites:1,
		target_filter:{
			$filter:{
				input:'$favorites',
				as:'item',
				cond:{
					$eq:['$$item','apples']
				}
			}
		}
	}
}
])
```

![image-20220426142229394](https://s2.loli.net/2022/04/26/FwPTmtf1jEYWDbi.png)

#### first—获取第一个元素，常用于数组

版本要求：5.0+，与last取最后元素相对应

仅支持在bucket、bucketAuto、group、setWindowFields阶段中使用

如男生女生各取一名学生信息

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		info:{$first:'$$ROOT'}
	}
}
])
```

![image-20220426142638810](https://s2.loli.net/2022/04/26/n5xVOuhFlzNj6oX.png)

#### floor—向下取整

与ceil向上取整相对应

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		avg_age:{$avg:'$age'}
	}
},
{
	$project:{
		age_avg:'$avg_age',
		age_ceil:{$ceil:'$avg_age'},
		age_floor:{$floor:'$avg_age'},
	}
}
])
```

![image-20220426143710139](https://s2.loli.net/2022/04/26/ZLoKxIEOF9lwWeP.png)

#### getField—获取某个字段的值

版本要求：5.0+，常用于处理含有`.`、`$`的字段

```shell
{
  $getField: {
    field: <String>,
    input: <Object>、默认$$CURRENT、可选
  }
}
```

官方例子

```shell
# 插入数据
db.inventory.insertMany( [
   { "_id" : 1,"price.usd": 45.99,"quantity": { "$small": 25}},
   { "_id" : 2,"price.usd": 499.99,"quantity": { "$small": 35}}
] )
# 删除数据
db.inventory.drop()
```

查询价格超过50的，并输出小号的数量

```shell
db.inventory.aggregate([
{
	$match:{
		$expr:{
			$gt:[
                {$getField:{field:'price.usd',input:'$$CURRENT'}},
                50
            ]
		}
	}
},
{
	$project:{
		all_info:'$$ROOT',
		small_size:{
			$getField:{
				field:{$literal:"$small"},
				input:'$quantity'
			}
		}
	}
}
])
```

![image-20220426150121176](https://s2.loli.net/2022/04/26/bxMoFtVQmWd1YBk.png)

#### gt、gte—判断数值大于、大于等于某个值

与lt、lte小于、小于等于相对应

```shell
db.students.aggregate([
{
	$match:{$expr:{
		$gt:['$age',18]
	}},
},{$project:{name:1}}
])

db.students.aggregate([
{
	$match:{$expr:{
		$gte:['$age',18]
	}}
},{$project:{name:1}}
])

###############################
#等同于
db.students.aggregate([
{
	$match:{
		age:{$gt:18}
	}
},{$project:{name:1}}
])
```

![image-20220426150757901](https://s2.loli.net/2022/04/26/PZIqEBlrt7i4x1O.png)

#### hour—获取时间中的小时值

```shell
db.students.aggregate([
{	
	$project:{
		date:{$toDate:'$create_at'}
	}
},
{
	$project:{
		date:'$date',
		date_hour:{
			$hour:'$date'
		},
		date_hour_timezone:{
			$hour:{
				date:'$date',
				timezone:'+0800'
			}
		}
	}
}
])
```

![image-20220426162151987](https://s2.loli.net/2022/04/26/7zuBimhqjJxFkaO.png)

#### ifNull—先判断空值再取值

版本要求：5.0+

如我们要取一个值，若Info字段不为null则取Info，否则取name字段，若name字段为null，则取favorites，我们可以这样写

```shell
db.students.aggregate([
{
	$project:{
		stu_info:{
			$ifNull:["$info","$name","$age"]
		}
	}
}
])
```

![image-20220426164410569](https://s2.loli.net/2022/04/26/IlYRoNT3wnrMSUZ.png)

#### in—判断数组是否包含某个元素

如查找喜欢吃“apples”的同学

```shell
db.students.aggregate([
{
	$match:{
		$expr:{
			$in:[
				"apples",
				"$favorites"
			]
		}
	}
},
{
	$project:{
		name:1,
		favorites:1
	}
}
])
```

![image-20220426164918078](https://s2.loli.net/2022/04/26/z4wsxJWOpVFaEuc.png)

#### indexOfArray—查询数组中指定元素

查询数组中指定元素，若包含指定元素则返回第一次出现的索引，若不包含则返回-1

基础语法

```shell
{ 
	$indexOfArray: [ 
	<array expression> 数组, 
	<search expression> 指定元素, 
	<start>	开始查找的位置下标、默认0、可选, 
	<end> 结束查找的位置下标、默认结尾、可选] 
}
```

如查找favorites数组中apples出现的位置

```shell
db.students.aggregate([
{
	$project:{
		favorites:1,
		fav_index:{
			$indexOfArray:['$favorites',"apples"]
		},
		fav_index_start:{
			$indexOfArray:['$favorites',"apples",2]
		},
		fav_index_end:{
			$indexOfArray:['$favorites',"apples",0,2]
		}
	}
}
])

# fav_index_start 从第三个开始查找（不查找前三个）
# fav_index_end 从第1个开始查找，第三个停止查找（只查找前三个）
```

![image-20220426170124641](https://s2.loli.net/2022/04/26/u3KMrtQyBlWUEZ8.png)

#### indexOfBytes—查询字符串中指定字符串的索引位置

查询字符串中第一次出现的UTF-8字符并返回索引，若不包含则返回-1

基础语法

```shell
{ 
	$indexOfBytes: [ 
	<string expression> 字符串, 
	<substring expression> 指定字符串, 
	<start>	开始查找的位置下标、默认0、可选, 
	<end> 结束查找的位置下标、默认结尾、可选] 
}
```

如查找学生名字带有a字符串的学生

```shell
db.students.aggregate([
{
	$project:{
		name:1,
		name_index:{
			$indexOfBytes:['$name',"a"]
		},
		name_index_start:{
			$indexOfBytes:['$name',"a",2]
		},
		name_index_end:{
			$indexOfBytes:['$name',"a",0,2]
		}
	}
}
])

# name_index_start 从第三个开始查找（不查找前三个）
# name_index_end 从第1个开始查找，第三个停止查找（只查找前三个）
```

![image-20220426171022667](https://s2.loli.net/2022/04/26/i7ovD4xJghQWf3V.png)

#### indexOfCP—查询字符串中指定字符串的索引位置

查询字符串中第一次出现的字符串并返回索引，若不包含则返回-1，不明白indexOfCP和indexOfBytes有什么区别

基础语法

```shell
{ 
	$indexOfCP: [ 
	<string expression> 字符串, 
	<substring expression> 指定字符串, 
	<start>	开始查找的位置下标、默认0、可选, 
	<end> 结束查找的位置下标、默认结尾、可选] 
}
```

如查找学生名字带有a字符串的学生

```shell
db.students.aggregate([
{
	$project:{
		name:1,
		name_index:{
			$indexOfCP:['$name',"a"]
		},
		name_index_start:{
			$indexOfCP:['$name',"a",2]
		},
		name_index_end:{
			$indexOfCP:['$name',"a",0,2]
		}
	}
}
])

# name_index_start 从第三个开始查找（不查找前三个）
# name_index_end 从第1个开始查找，第三个停止查找（只查找前三个）
```

![image-20220426173611939](https://s2.loli.net/2022/04/26/BjXNdiZtrMlbhcf.png)

#### isArray—判断是否为数组类型

固定语法：$isArray:[ 值 ]	注意值外面是用中括号包起来的

```shell
db.students.aggregate([
{
	$project:{
		isArray:{
			$isArray:[
				[1,2,3]
			]
		},
		isArray2:{
			$isArray:[
				[[1],2,"3"]
			]
		},
		isArray3:{
			$isArray:[
				1
			]
		},
	}
}
,{$limit:1}
])
```

![image-20220426175635277](https://s2.loli.net/2022/04/26/89zpIsZcuCHLvXd.png)

#### isNumber—判断是否为数值类型

若类型为Integer、Decimal、Double、Long都属于数值类型，都返回true，其余都返回false

```shell
db.students.aggregate([
{
	$project:{
		isNumber:{
			$isNumber:1
		},
		isNumber2:{
			$isNumber:NumberDecimal('1.2')
		},
		isNumber3:{
			$isNumber:NumberLong('120000000000000000')
		},
		isNumber4:{
			$isNumber:true
		},
		isNumber5:{
			$isNumber:'111'
		},
	}
}
,{$limit:1}
])
```

![image-20220426180644984](https://s2.loli.net/2022/04/26/hdmel5ujrYM6F37.png)

#### isoDayOfWeek—ISO 查询一周之中的第几天，1-7

```shell
db.students.aggregate([
{
	$project:{
		date:{$toDate:'$create_at'},
		day:{
			$isoDayOfWeek:{
				date:{$toDate:'$create_at'}
			}
		},
		day_timezone:{
			$isoDayOfWeek:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426181216026](https://s2.loli.net/2022/04/26/3rDbp6eOnighVAE.png)

#### isoWeek—ISO 查询一年之中的第几周，1-53

```shell
db.students.aggregate([
{
	$project:{
		date:{$toDate:'$create_at'},
		day:{
			$isoWeek:{
				date:{$toDate:'$create_at'}
			}
		},
		day_timezone:{
			$isoWeek:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426181312685](https://s2.loli.net/2022/04/26/tJN7CZDzb6WUnEg.png)

#### isoWeekYear—ISO 查询年份

```shell
db.students.aggregate([
{
	$project:{
		date:{$toDate:'$create_at'},
		day:{
			$isoWeekYear:{
				date:{$toDate:'$create_at'}
			}
		},
		day_timezone:{
			$isoWeekYear:{
				date:{$toDate:'$create_at'},
				timezone:'+0800'
			}
		},
	}
}
])
```

![image-20220426181356048](https://s2.loli.net/2022/04/26/WiluzL6GEIsCHZc.png)

#### last—取最后一个文档

版本要求：5.0+，与first取最后元素相对应

仅支持bucket、bucketAuto、group、setWindowFields阶段中使用

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		info:{$last:'$$ROOT'}
	}
}
])
```

![image-20220426181808296](https://s2.loli.net/2022/04/26/lrIZDH9StpiWqf2.png)

#### last（Array）—取数组中最后一个元素

固定语法：$last:[ 值 ]	注意值外面是用中括号包起来的

```shell
db.students.aggregate([
{
	$project:{
		last_item:{
			$last:[
				[1,2,3,4]
			]
		},
		last_favorite:{
			$last:'$favorites'
		}
	}
}
])
```

![image-20220426182255970](https://s2.loli.net/2022/04/26/jIM4Qly7eNmSX2b.png)

#### let—声明变量操作变量

基础语法

```shell
{
  $let:
     {
       vars: { <var1>: <expression>, ... 声明变量},
       in: <expression> 操作变量
     }
}
```

如获取语文、数学成绩总和然后判断总分评级，超过150则为优秀，否则为良好

```shell
db.students.aggregate([
{
	$project:{
		
		ping_yu:{
			$let:{
				vars:{
					total_score:{
                        $add:['$score.yw','$score.sx']
                    }
				},
				in:{
					$cond:{
						if:{$gt:['$$total_score',150]},
						then:{$concat:['总分：',{$toString:'$$total_score'},',','优秀']},
						else:{$concat:['总分：',{$toString:'$$total_score'},',','良好']},
					}
				}
			}
		}
	}
}
])
```

![image-20220426184614354](https://s2.loli.net/2022/04/26/94rRtCkQTGh2Lz3.png)

#### literal—返回一个不进行解析的值

常用于含有`.`、`$`、`1`的字段，相当于一个转义符，在literal中`.`、`$`、`1`仅仅是个字符串，无特殊意义

官方例子

```shell
# 插入数据
db.inventory.insertMany( [
   { "_id" : 1,"price.usd": 45.99,"quantity": { "$small": 25}},
   { "_id" : 2,"price.usd": 499.99,"quantity": { "$small": 35}}
] )

# 获取$small的尺码，默认输出订单数为1，在价格前面加$美元符号,并判断价格为$45.99的数据
db.inventory.aggregate([
{
	$project:{
		small_size_literal:{
			$getField:{
				field:{$literal:'$small'},
				input:'$quantity'
			}
		},
		order_literal:{
			$literal:1
		},
		price_literal:{
			$concat:[
				{$literal:'$'},
				{
					$toString:{
						$getField:{
                            field:'price.usd',
                            input:'$$CURRENT'
						}
					}
				}
				]
		}
	}
},
{
	$match:{
		$expr:{
			$eq:[
				'$price_literal',
				{$literal:'$45.99'}
			]
		}
	}
}
])

# 删除数据
db.inventory.drop()
```

![image-20220427100159331](https://s2.loli.net/2022/04/27/nqJToZurE38WKVb.png)

#### ln—Log n计算对数

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_ln:{
			$ln:'$age'
		},
		ln_1:{
			$ln:1
		},
		ln_e:{
			$ln:Math.E
		},
		ln_10:{
			$ln:10
		},
		ln_null:{
			$ln:null
		}
	}
},{$limit:1}
])
```

![image-20220427100628606](https://s2.loli.net/2022/04/27/HYStzO1Xvp4qBiy.png)

#### log—log n 计算指定基数的对数

{$log:[数值,基数]}	基数要大于1

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_log:{
			$log:['$age',10]
		},
		log_1:{
			$log:[1,2]
		},
		log_100:{
			$log:[100,10]
		}
	}
},{$limit:1}
])
```

![image-20220427101116319](https://s2.loli.net/2022/04/27/4PThFbMvCeBcl3W.png)

#### log10—计算基数为10的对数

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_log10:{
			$log10:'$age'
		},
		log10_1:{
			$log10:1
		},
		log10_100:{
			$log10:100
		}
	}
},{$limit:1}
])
```

![image-20220427101617820](https://s2.loli.net/2022/04/27/5Davr97zqdHKBZk.png)

#### lt、lte—判断数值小于、小于等于某个值

查询年龄小于50且数学成绩小于等于60的学生

```shell
db.students.aggregate([
{
	$match:{
		$expr:{
			$and:[
				{$lt:['$age',50]},
				{$lte:['$score.sx',60]}
			]
		}
	}
}
])
```

#### ltrim—去除左边的指定字符串、默认空格

基础语法，与rtrim相对应

```shell
{ 
	$ltrim: { 
		input: <string> 字符串,  
		chars: <string> 去除的指定字符、默认空字符串、可选 
	} 
}
```

```shell
db.students.aggregate([
{
	$project:{
		ltrim_str:{
			$ltrim:{input:'Hello World'}
		},
		ltrim_str_He:{
			$ltrim:{input:'He  llo World',chars:'He'}
		},
		ltrim_str_space:{
			$ltrim:{input:'\t \r\n Hello World'}
		},
	}
},{$limit:1}
])
```

![image-20220427102905062](https://s2.loli.net/2022/04/27/OpRZA9hPDgMz1CK.png)

#### map—遍历操作每个元素，并返回修改后的结果

基础语法，通常操作数组

```shell
{ 
	$map: { 
		input: <expression> 数据源, 
		as: <string> 每个元素, 
		in: <expression> 操作元素 
	} 
}
```

如在favorites的每一项前加上"我喜欢"

```shell
db.students.aggregate([
{
	$project:{
		favorites:'$favorites',
		favorites_map:{
			$map:{
				input:'$favorites',
				as:'item',
				in:{
					$concat:['我喜欢','$$item']
				}
			}
		}
	}
},{$limit:1}
])
```

![image-20220427104013775](https://s2.loli.net/2022/04/27/95hv7QwmM3ZTqOI.png)

#### max—获取最大值

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		max_age:{
			$max:'$age'
		}
	}
},
{
	$project:{
		max_age:1,
		max_arr:{
			$max:[0,5,7,6,14,2,3]
		}
	}
}
])
```

![image-20220427104932039](https://s2.loli.net/2022/04/27/wQSUzuRInqHx6yg.png)

#### mergeObjects—将多个文档合并为一个文档

**仅支持bucket、bucketAuto、group、replaceRoot阶段中使用**

若文档中有相同元素则以最后一个文档为主，不同元素会合并为一个对象

合并相同元素——根据性别分组后合并成绩

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		score_all:{
			$push:'$score'
		},
		score_merge:{
			$mergeObjects:'$score'
		}
	}
}
])
```

![image-20220427110608657](https://s2.loli.net/2022/04/27/AY9fWVdTpG2PCz3.png)

合并不同元素——将合并后的成绩加个日期

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		score_merge:{
			$mergeObjects:'$score'
		}
	}
},
{
	$replaceRoot:{
		newRoot:{
			$mergeObjects:["$score_merge",{'date':'2022-02-02'}]
		}
	}
}
])
```

![image-20220427110744733](https://s2.loli.net/2022/04/27/vakN7qjpOH2WMKF.png)

#### meta—查看文档与索引的匹配分数

可设置：

textScore，必须与$text全文索引一起使用，否则会报错，v4.4以下版本会返回null，不会报错

indexKey，如果使用非文本索引，则返回文档的索引键，版本要求v4.4+

没看出来有什么用...

```shell
#创建俩索引
db.students.createIndex({name:'text'})
db.students.createIndex({age:1})
```

![image-20220507112848491](https://s2.loli.net/2022/05/07/ReGnms7f2gwODxA.png)

```shell
db.students.aggregate([
{
	$match:{$text:{$search:'tom'}}
},
{
	$project:{
		score:{
			$meta:'textScore'
		}
	}
}
])
```

![image-20220507113725252](https://s2.loli.net/2022/05/07/alnmqWgJpdsyjYN.png)

```shell
db.students.aggregate([
{
	$match:{
		age:{$gt:18}
	}
},
{
	$project:{
		indexKey:{
			$meta:'indexKey'
		}
	}
}
])
```

![image-20220507113907564](https://s2.loli.net/2022/05/07/FrwRpa3hs2IDzWg.png)

#### min—获取最小值

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		min_age:{
			$min:'$age'
		}
	}
},
{
	$project:{
		min_age:1,
		min_arr:{
			$min:[0,5,7,6,14,2,3]
		}
	}
}
])
```

![image-20220427111101621](https://s2.loli.net/2022/04/27/m12hZB6pC9iJyLR.png)

#### millisecond—获取某个时间的毫秒值，0-999

```shell
db.students.aggregate([
{
	$project:{
		date_milli:{
			$millisecond:ISODate('2018-08-08T08:08:08.888')
		},
		date_milli_timezone:{
			$millisecond:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427112332722](https://s2.loli.net/2022/04/27/ADoONdv1hH5sC6F.png)

#### minute—获取某个时间的分钟值，0-59

```shell
db.students.aggregate([
{
	$project:{
		date_minute:{
			$minute:ISODate('2018-08-08T08:08:08.888')
		},
		date_minute_timezone:{
			$minute:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427112445513](https://s2.loli.net/2022/04/27/TUoxLVJqztSPRIh.png)

#### mod—两个数取余

注意：不能对0取余

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		mod_age:{
			$mod:['$age','$age']
		},
		mod_age_10:{
			$mod:['$age',10]
		},
		mod_0:{
			$mod:[0,'$age']
		},
		mod_1:{
			$mod:[1,'$age']
		},
	}
},{$limit:1}
])
```

![image-20220427112756822](https://s2.loli.net/2022/04/27/rgfxuToOe4lEiSn.png)

#### month—获取某个时间的月份值，1-12

```shell
db.students.aggregate([
{
	$project:{
		date_month:{
			$month:ISODate('2018-08-08T08:08:08.888')
		},
		date_month_timezone:{
			$month:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427112915863](https://s2.loli.net/2022/04/27/RUyZzQcuFWb3Ae7.png)

#### multiply—两数相乘

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_10:{
			$multiply:['$age',10]
		},
		age2:{
			$multiply:['$age',2]
		}
	}
},{$limit:1}
])
```

![image-20220427113125687](https://s2.loli.net/2022/04/27/ClxMKokdVy7DI98.png)

#### ne—比较两数不相等

不相等则返回true，否则返回false，not equal的缩写

如查找数学成绩不等于60的学生

```shell
db.students.aggregate([
{
	$match:{
		$expr:{
			$ne:['$score.sx',60]
		}
	}
},
{
	$project:{
		name:1,
		sx_score:'$score.sx'
	}
}
])
```

![image-20220427113419226](https://s2.loli.net/2022/04/27/QwetbfT1Fxg8cs9.png)

#### not—非、不

如查找数学成绩不及格的学生，非大于等于那就是小于的意思

```shell
db.students.aggregate([
{
	$match:{
		$expr:{
			$not:[
				{$gte:['$score.sx',60]}
			]
		}
	}
},
{
	$project:{
		name:1,
		sx_score:'$score.sx'
	}
}
])
```

![image-20220427113738735](https://s2.loli.net/2022/04/27/cI2BheOybPSV8jo.png)

#### objectToArray—对象转成数组

```shell
db.students.aggregate([
{
	$project:{
		score:1,
		score_arr:{
			$objectToArray:'$score'
		}
	}
},
{$limit:1}
])
```

![image-20220427135629724](https://s2.loli.net/2022/05/07/GZUA2SJEdRQkBjp.png)

#### or—或运算

True：true、1、[]、str
False：false、0、null、undefined

```shell
db.students.aggregate([
{
	$match:{
		$expr:{
			$or:[
				{$gte:['$score.sx',60]},
				{$eq:['$sex','男']},
			]
		}
	}
},
{
	$project:{
		name:1,
		sex:1,
		sx_score:'$score.sx'
	}
}
])
```

![image-20220427140039090](https://s2.loli.net/2022/05/07/lnQWgxAop1vrXTB.png)

#### pow—幂运算

```shell
db.students.aggregate([
{
	$project:{
		pow_0:{
			$pow:[5,0]
		},
		pow_2:{
			$pow:[5,2]
		},
		'pow_-2':{
			$pow:[5,-2]
		}
	}
},{$limit:1}
])
```

![image-20220427140354015](https://s2.loli.net/2022/04/27/BeYTtUywG6slPqx.png)

#### push—往数组中添加元素

**仅支持bucket、bucketAuto、group、setWindowFields阶段中使用**

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		name_arr:{
			$push:'$name'
		}
	}
}
])
```

![image-20220427140828402](https://s2.loli.net/2022/04/27/UQlVrYqfO8W2Fuh.png)

#### rand—获取随机数，返回0-1之前的浮点数

```shell
db.students.aggregate([
{
	$project:{
		rand:{
			$rand:{}
		},
		rand_0_5:{
			$ceil:{
				$multiply:[{$rand:{}},5]
			}
		}
	}
},{$limit:1}
])
```

![image-20220427142145402](https://s2.loli.net/2022/04/27/YT8bVezpt3ao1LO.png)

#### range—获取一批有序数组

基础语法，遵循左闭右开原则

```shell
{ $range: [ 
	<start> 开始, 
	<end> 结束, 
	<non-zero step> 步长、默认1、可选] }
```

```shell
db.students.aggregate([
{
	$project:{
		range1:{
			$range:[0,5]
		},
		range10:{
			$range:[10,20,2]
		},
	}
},{$limit:1}
])
```

![image-20220427142902794](https://s2.loli.net/2022/04/27/3KeRGDz1Sq5ohgn.png)

#### reduce—遍历数组组成一个值

基础语法

```shell
{
    $reduce: {
        input: <array>	数据源,
        initialValue: <expression>	初始变量,
        in: <expression> 操作变量,$$value=上次的和，$$this=本次的元素
    }
}
```

计算从1到10的总积，

```shell
db.students.aggregate([
{
	$project:{
		sum_multiply:{
			$reduce:{
				input:{$range:[1,10]},
				initialValue:1,
				in:{
					$multiply:['$$this','$$value']
				}
			}
		}
	}
},{$limit:1}
])
```

![image-20220427143920854](https://s2.loli.net/2022/04/27/TW7IDtS3XYmwpyK.png)

#### regexFind—正则查找

版本要求：4.2+

基础语法

```shell
{ 
	$regexFind: { 
		input: <expression> 数据源, 
		regex: <expression> 正则表达式, 
		options: <expression> 选项、可选、i忽略大小写、m锚点或换行符优化、x忽略空白字符、s允许.匹配所有包括空白字符
	}
}
# m配置说明：添加m配置换行后也有可能命中开始或结束锚点，若数据源没有换行符或者正则表达式中没有锚点，那么此时指定m是无意义的
# 匹配成功返回
# { "match" : <string>, "idx" : <num>, "captures" : <array of strings> }
# 否则返回Null
```

`i`、`m`选项匹配

```shell
db.students.aggregate([
{
	$project:{
		regex_result:{
			$regexFind:{
				input:'Hello World!!!',	regex:/he/
			}
		},
		regex_result_i:{
			$regexFind:{
				input:'Hello World!!!',regex:/he/,options:'i'
			}
		},
		regex_result_no_m:{
			$regexFind:{
				input:'Hello \nWorld!',	regex:/^World/
			}
		},
		regex_result_m:{
			$regexFind:{
				input:'Hello \nWorld!!!',regex:/^World/,options:'m'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427154938940](https://s2.loli.net/2022/04/27/OPivCWeJQRGH67Y.png)

`x`、`m`选项匹配

```shell
db.students.aggregate([
{
	$project:{
		regex_result_no_x:{
			$regexFind:{
				input:'Hello     World!!!',regex:/He .*/
			}
		},
		regex_result_x:{
			$regexFind:{
				input:'Hello     World!!!',regex:/He             .*/,options:'x'
			}
		},
		regex_result_no_s:{
			$regexFind:{
				input:'Hello  \nWorld!!!',regex:/Hello.*ld/
			}
		},
		regex_result_s:{
			$regexFind:{
				input:'Hello  \nWorld!!!',regex:/Hello.*ld/,options:'s'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427155030618](https://s2.loli.net/2022/04/27/Vf5e1oPDsmjNQ3i.png)

#### regexFindAll—正则查找符合条件的所有项

版本要求：4.2+

和regexFind的用法一样，只是regexFindAll会找出所有匹配的项

```shell
db.students.aggregate([
{
	$project:{
		regex_result:{
			$regexFind:{
				input:'Hello World!!!',	regex:/o/
			}
		},
		regex_result_all:{
			$regexFindAll:{
				input:'Hello World!!!',	regex:/o/
			}
		}
	}
},{$limit:1}
])
```

![image-20220427155923299](https://s2.loli.net/2022/04/27/fpUA87PyesFutLH.png)

#### regexMatch—判断是否匹配

版本要求：4.2+，和regexFind的用法一样，只是regexMatch匹配成功会返回true，否则返回false

```shell
db.students.aggregate([
{
	$project:{
		regex_result:{
			$regexMatch:{
				input:'Hello World!!!',	regex:/he/
			}
		},
		regex_result_i:{
			$regexMatch:{
				input:'Hello World!!!',regex:/he/,options:'i'
			}
		},
	}
},{$limit:1}
])
```

![image-20220427160309763](https://s2.loli.net/2022/04/27/aHTYnLtjoSNFQcM.png)

#### replaceOne—替换第一次匹配的字符串

版本要求：4.4+

基础语法

```shell
{ 
	$replaceOne: { 
		input: <expression> 数据源, 
		find: <expression> 查找的字符串, 
		replacement: <expression> 替换的字符串 
	}
}
```

如将学生姓名中的第一个a替换成AAAAA

```shell
db.students.aggregate([
{
	$project:{
		name:1,
		name_replace:{
			$replaceOne:{
				input:'$name',
				find:'a',
				replacement:'AAAAA'
			}
		}
	}
}
])
```

![image-20220427161210818](https://s2.loli.net/2022/04/27/twkpDKn2MA8UcCB.png)

#### replaceAll—替换所有匹配的字符串

版本要求：4.4+，和replaceOne用法一致

如将学生姓名中的e全部替换成EEEEE

```shell
db.students.aggregate([
{
	$project:{
		name:1,
		name_replace:{
			$replaceAll:{
				input:'$name',
				find:'e',
				replacement:'EEEEE'
			}
		}
	}
}
])
```

![image-20220427161610737](https://s2.loli.net/2022/04/27/Zhenms4Qtba7Pxr.png)

#### reverseArray—将数组前后颠倒

```shell
db.students.aggregate([
{
	$project:{
		arr_ver:{
			$reverseArray:[
				[1,2,3,4]
			]
		},
		arr_ver_null:{
			$reverseArray:[
				[1,null]
			]
		},
		arr_ver_arr:{
			$reverseArray:[
				[
					[1,2,3],
					[4,5,6]
				]
			]
		},
		
	}
},{$limit:1}
])
```

![image-20220427162056668](https://s2.loli.net/2022/04/27/SmbZ7feCn6RXzxO.png)

#### round—四舍五入

基础语法

```shell
{ 
	$round : [ 
		<number> 数据源, 
		<place> 保留几位小数点、-20至100之间、可选默认0
	] 
}
```

```shell
db.students.aggregate([
{
	$project:{
		round:{
			$round:[1.568475]
		},
		round_2:{
			$round:[1.568475,2]
		},
		'round_-2':{
			$round:[1.568475,-2]
		}
		
	}
},{$limit:1}
])
```

![image-20220427162444605](https://s2.loli.net/2022/04/27/vobQ57F84kHSscT.png)

#### rtrim—去除右边的指定字符串、默认空格

基础语法，与ltrim去除左边相对应

```shell
{ 
	$rtrim: { 
		input: <string> 字符串,  
		chars: <string> 去除的指定字符、默认空字符串、可选 
	} 
}
```

```shell
db.students.aggregate([
{
	$project:{
		rtrim_str:{
			$rtrim:{input:'Hello World'}
		},
		rtrim_str_He:{
			$rtrim:{input:'Hello World',chars:'ld'}
		},
		rtrim_str_space:{
			$rtrim:{input:'Hello World\t \r\n '}
		},
	}
},{$limit:1}
])
```

![image-20220427163730192](https://s2.loli.net/2022/04/27/ynPb2R5NtDTfhE4.png)

#### sampleRate—按照几率随机采样文档

版本要求：4.4.2+

```shell
db.students.aggregate([
{
	$match:{
		$sampleRate:0.3
	}
}
])
```

![image-20220427164125802](https://s2.loli.net/2022/04/27/Ucni8HmshRdkIAa.png)

#### second—获取某个时间的秒值，0-59

```shell
db.students.aggregate([
{
	$project:{
		date_second:{
			$second:ISODate('2018-08-08T08:08:08.888')
		},
		date_second_timezone:{
			$second:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		}
	}
},{$limit:1}
])
```

![image-20220427164236059](https://s2.loli.net/2022/04/27/x5tNykADSRaIiO8.png)

#### setDifference—比较两个数组，寻找相较于第一个数组的差集

```shell
{ 
	$setDifference: [ 
		<expression1>, 
		<expression2> 
		]
}
# 若1中有，而2中没有，则将该结果返回
```

```shell
db.students.aggregate([
{
	$project:{
		arr_dif:{
			$setDifference:[
				[1,2,3,4],
				[5,6,7,8]
			]
		},
		arr_dif_1:{
			$setDifference:[
				[3,4,null,[8]],
				[7,8,3]
			]
		},
	}
},{$limit:1}
])
```

![image-20220427165047256](https://s2.loli.net/2022/04/27/COJ1dDu65V8rNQh.png)

#### setEquals—比较多个数组是否含有相同元素

若多个数组均含有相同元素则返回false，否则返回true，无关顺序

```shell
db.students.aggregate([
{
	$project:{
		arr_equals:{
			$setEquals:[
				[1,2,3,4],
				[5,6,7,8]
			]
		},
		arr_equals_1:{
			$setEquals:[
				[null,0,null,'1'],
				[null,'1',0,null],
			]
		},
	}
},{$limit:1}
])
```

![image-20220427165914932](https://s2.loli.net/2022/04/27/YOc2rfWPQq5bSkw.png)

#### setField—添加、修改、移除字段

基础语法

```shell
{
  $setField: {
    field: <String> 字段名称,
    input: <Object> 对象,$$this表明当前对象
    value: <Expression> 值，若值为$$REMOVE,则表示删除该字段
  }
}
```

#### setIntersection—比较多个数组，并将交集结果返回

```shell
db.students.aggregate([
{
	$project:{
		arr_intersection:{
			$setIntersection:[
				[1,2,3,4],
				[5,6,7,8]
			]
		},
		arr_intersection_1:{
			$setIntersection:[
				[null,0,null,'1',3,5,8,9],
				[null,null,3,7,9,1]
			]
		},
		arr_intersection_2:{
			$setIntersection:[
				[3,5,8,9],
				[3,7],
				[3,8,9]
			]
		},
	}
},{$limit:1}
])
```

![image-20220427170919490](https://s2.loli.net/2022/04/27/kbMpzmfq3CZwHxP.png)

#### setIsSubset—比较两个数组判断子集

 若第一个数组是第二个数组的子集，则将结果为true，否则为false

```shell
db.students.aggregate([
{
	$project:{
		arr_subset:{
			$setIsSubset:[
				[1,2,3,4],
				[5,6,7,8]
			]
		},
		arr_subset_1:{
			$setIsSubset:[
				[null,0],
				[null,null,3,7,]
			]
		},
		arr_subset_2:{
			$setIsSubset:[
				[3,8,9],
				[3,8,9]
			]
		},
	}
},{$limit:1}
])
```

![image-20220427180646240](https://s2.loli.net/2022/04/27/gqd5wylBtWnR8iN.png)

#### setUnion—比较多个数组，并将并集结果返回

```shell
db.students.aggregate([
{
	$project:{
		arr_union:{
			$setUnion:[
				[1,2,3,4],
				[5,6,7,8]
			]
		},
		arr_union_1:{
			$setUnion:[
				[null,0],
				[null,null,3,7,]
			]
		},
		arr_union_2:{
			$setUnion:[
				[3,8,9],
				[3,8,9]
			]
		},
	}
},{$limit:1}
])
```

![image-20220427181229939](https://s2.loli.net/2022/04/27/iEyTplOY2cj5mCZ.png)

#### size—获取数组大小

```shell
db.students.aggregate([
{
	$project:{
		favorites:1,
		favorites_size:{
			$size:'$favorites'
		}
	}
}
])
```

![image-20220427182027405](https://s2.loli.net/2022/04/27/3UOXPon68whc7fS.png)

#### slice—切割数组

基础语法

```shell
#从第0位开始获取，获取n个
{ $slice: [ <array>, <n> ] }

#从第position位开始获取，获取n个
{ $slice: [ <array>,<position>, <n> ] }
```

```shell
db.students.aggregate([
{
	$project:{
		favorites:1,
		favorites_size:{
			$slice:['$favorites',2]
		},
		slice_5:{
			$slice:[
				[1,2,3,4,5,6,7,8,9],
				5
			]
		},
		slice_5_3:{
			$slice:[
				[1,2,3,4,5,6,7,8,9],
				5,
				3
			]
		}
	}
},{$limit:1}
])
```

![image-20220427182446948](https://s2.loli.net/2022/04/27/1dERGZInoMq6ewA.png)

#### split—按照某字符切割字符串

```shell
db.students.aggregate([
{
	$project:{
		split:{
			$split:[
				'Hello World!',
				' '
			]
		},
		split2:{
			$split:[
				'Hello World!',
				'o'
			]
		},
	}
},{$limit:1}
])
```

![image-20220427182750163](https://s2.loli.net/2022/04/27/AcbxCenV36yErBa.png)

#### sqrt—计算正数的平方根

```shell
db.students.aggregate([
{
	$project:{
		sqrt_result_25:{
			$sqrt:25
		},
		sqrt_result_100:{
			$sqrt:100
		},
		sqrt_result_88:{
			$sqrt:88
		},
	}
},{$limit:1}
])
```

![image-20220427183012339](https://s2.loli.net/2022/04/27/AQtglycZr3OC7I4.png)

#### strcasecmp—对比字符串大小，不区分大小写

A与B进行比较，若A大于B则返回1，相等则返回0，小于则返回-1

```shell
db.students.aggregate([
{
	$project:{
		strcasecmp_result_equal:{
			$strcasecmp:['abc','ABC']
		},
		strcasecmp_result_great:{
			$strcasecmp:['ABCD','abc']
		},
		strcasecmp_result_less:{
			$strcasecmp:['abc','ABCD']
		},
	}
},{$limit:1}
])
```

![image-20220427183420815](https://s2.loli.net/2022/04/27/2EkHtQodIpUqGnR.png)

#### strLenBytes—获取UTF8编码的字节数

```shell
db.students.aggregate([
{
	$project:{
		len_bytes_en:{
			$strLenBytes:'Hello'
		},
		len_bytes_en_space:{
			$strLenBytes:'Hello World!'
		},
		len_bytes_cn:{
			$strLenBytes:'你好哇！'
		},
		len_bytes_jp:{
			$strLenBytes:'爱してる'
		},
		len_bytes_not:{
			$strLenBytes:'cafétéria'
		}
	}
},{$limit:1}
])
```

![image-20220428154445371](https://s2.loli.net/2022/04/28/9Cg7FY4VTPdKwzy.png)

#### strLenCP—返回UTF-8的数量

```shell
db.students.aggregate([
{
	$project:{
		len_bytes_en:{
			$strLenCP:'Hello'
		},
		len_bytes_en_space:{
			$strLenCP:'Hello World!'
		},
		len_bytes_cn:{
			$strLenCP:'你好哇！'
		},
		len_bytes_jp:{
			$strLenCP:'爱してる'
		},
		len_bytes_not:{
			$strLenCP:'cafétéria'
		}
	}
},{$limit:1}
])
```

![image-20220428154631884](https://s2.loli.net/2022/04/28/3Fmpew5X8YgIPL9.png)

#### substr、substrBytes—截取字符串

mongo3.4+后，两个都是一个意思substr是substrBytes的别名，仅仅演示substr

```shell
db.students.aggregate([
{
	$project:{
		name:1,
		name_sub:{
			$substr:['$name',0,3]
		}
	}
}
])
```

![image-20220428155138449](https://s2.loli.net/2022/04/28/jLfZBK1YMaTSmVI.png)

#### substrCP—截取字符串

官方例子

不理解

```shell
db.students.aggregate([
{
	$project:{
		sub_str:{
			$substrCP:['abcdEFG',0,2]
		},
		sub_str2:{
			$substrCP:['Hello World!',5,5]
		},
		sub_str3:{
			$substrCP:['!！！!',2,2]
		},
		sub_str4:{
			$substrCP:['cafétéria',4,2]
		},
		sub_str5:{
			$substrCP:["€λG",2,3]
		},
		sub_str6:{
			$substrCP:['你好',1,1]
		}
	}
},{$limit:1}
])
```
![image-20220507141836301](https://s2.loli.net/2022/05/07/8rIci2dt461jakB.png)


#### subtract—两数相减返回差值

如查看学生年龄离30岁还有多远

```shell
db.students.aggregate([
{
	$project:{
		age:1,
		age_substract:{
			$subtract:['$age',30]
		}
	}
}
])
```

![image-20220428155554379](https://s2.loli.net/2022/04/28/Q6f5hSkKbzXjTCY.png)

#### sum—获取总数

**仅支持addFields、bucket、bucketAuto、group、match、project、replaceRoot、replaceWith、set、setWindowFields阶段中使用**

如按照学生性别分组，分别计算出数学、语文的总成绩

```shell
db.students.aggregate([
{
	$group:{
		_id:'$sex',
		sx:{
			$sum:'$score.sx'
		},
		yw:{
			$sum:'$score.yw'
		}
	}
}
])
```

![image-20220428155941870](https://s2.loli.net/2022/04/28/cWCGJMzZQHoyXl5.png)

#### switch—switch case条件语句

判断数学成绩，给出相应评级

```shell
db.students.aggregate([
{
	$project:{
		score:'$score.sx',
		pingyu:{
			$switch:{
				branches:[
					{case:{$gte:['$score.sx',90]},then:'优秀'},
					{case:{$gte:['$score.sx',80]},then:'良好'},
					{case:{$gte:['$score.sx',60]},then:'及格'},
					{case:{$lt:['$score.sx',60]},then:'不及格'},
				],
				default:'无成绩'
			}
		}
	}
}
])
```

![image-20220428160652174](https://s2.loli.net/2022/04/28/lfKChz9j6yY8Pp2.png)

#### toBool—转布尔类型

Double、Decimal、Integer、Long类型若值不为0则返回true，否则返回false

ObjectId、String、Date都会返回true，注意字符串的false也会转成true，有点不理解...

```shell
db.students.aggregate([
{
	$project:{
		decimal:{$toBool:NumberDecimal('2.2')},
		integer:{$toBool:NumberInt('22')},
		long:{$toBool:NumberLong('22')},
		decimal_0:{$toBool:NumberDecimal('0')},
		integer_0:{$toBool:NumberInt('0')},
		long_0:{$toBool:NumberLong('0')},
		objectId:{$toBool:ObjectId('619d9039ec36b0e8cbfb401c')},
		string:{$toBool:'2.2'},
		string_true:{$toBool:'true'},
		string_false:{$toBool:'false'},
		date:{$toBool:ISODate('2020-08-08')},
	}
},{$limit:1}
])
```

![image-20220428162217041](https://s2.loli.net/2022/05/07/XpuyRreJf42vBAV.png)

#### toDate—转时间类型

支持时间戳（毫秒）、字符串、ObjectId转成时间类型

```shell
db.students.aggregate([
{
	$project:{
		decimal:{$toDate:15330000000.60},
		integer:{$toDate:1533600000000},
		long:{$toDate:1533657600000},
		objectId:{$toDate:ObjectId('619d9039ec36b0e8cbfb401c')},
		string:{$toDate:'2018-08-08T08:08:08.888Z'},
		string_1:{$toDate:'2018-08-08'},
		string_2:{$toDate:'2018-08-08T08:08:08'}
	}
},{$limit:1}
])
```

![image-20220428165037112](https://s2.loli.net/2022/04/28/I8ZNz5utF6k4EoL.png)

#### toDecimal—转换Decimal数值类型

false会返回0，true会返回1，Double、Integer、Long、String均会返回Decimal类型的数值

注意：Sting一定要是数值，不支持objectId类型，Date会返回Decimal类型的时间戳值（ms）

```shell
db.students.aggregate([
{
	$project:{
		decimal:{$toDecimal:2.2},
		integer:{$toDecimal:153},
		long:{$toDecimal:1533657600000000000000},
		string:{$toDecimal:'08.88'},
		string_1:{$toDecimal:'2018'},
		bool_false:{$toDecimal:false},
		bool_true:{$toDecimal:true},
		date:{$toDecimal:ISODate('2018-08-08T08:08:08.888Z')}
	}
},{$limit:1}
])
```

![image-20220428170332639](https://s2.loli.net/2022/04/28/KET3UJ9bouDC8hH.png)

#### toDouble—转换成Double类型

false会返回0，true会返回1，Decimal、Integer、Long、String均会返回Double类型的数值

注意：Sting一定要是数值，不支持objectId类型，Date会返回Double类型的时间戳值（ms）

```shell
db.students.aggregate([
{
	$project:{
		decimal:{$toDouble:2.2},
		integer:{$toDouble:153},
		long:{$toDouble:1533657600000000000000},
		string:{$toDouble:'08.88'},
		string_1:{$toDouble:'2018'},
		bool_false:{$toDouble:false},
		bool_true:{$toDouble:true},
		date:{$toDouble:ISODate('2018-08-08T08:08:08.888Z')}
	}
},{$limit:1}
])
```

![image-20220428170545051](https://s2.loli.net/2022/04/28/GibafFdRhgmD1Vk.png)

#### toInt—转换成Integer类型

false会返回0，true会返回1，Decimal、Integer、Long、String均会返回Int类型的数值

注意：Sting一定要是数值、不能包含小数点且不能超过Int的精度范围，不支持objectId、Date类型，Decimal、Double会截断小数点只返回整数、Long类型的值不能超过Int的精度

```shell
db.students.aggregate([
{
	$project:{
		double:2.2,
		decimal:{$toInt:NumberDecimal('2.2')},
		integer:{$toInt:153},
		long:{$toInt:NumberLong('1533657600')},
		string:{$toInt:'08'},
		string_1:{$toInt:'2018'},
		bool_false:{$toInt:false},
		bool_true:{$toInt:true}
	}
},{$limit:1}
])
```

![image-20220428171321506](https://s2.loli.net/2022/04/28/BHO2PJEVt9j1M5C.png)

#### toLong—转换成Long类型

false会返回0，true会返回1，Decimal、Integer、Double、String均会返回Long类型的数值

注意：Sting一定要是数值、不能包含小数点且不能超过Long的精度范围，不支持objectId，Decimal、Double会截断小数点只返回整数，Date会返回Long类型的时间戳值（ms）

```shell
db.students.aggregate([
{
	$project:{
		double:2.2,
		decimal:{$toLong:NumberDecimal('2.2')},
		integer:{$toLong:153},
		string:{$toLong:'08'},
		string_1:{$toLong:'2018000000000'},
		bool_false:{$toLong:false},
		bool_true:{$toLong:true},
		date:{$toDouble:ISODate('2018-08-08T08:08:08.888Z')}
	}
},{$limit:1}
])
```

![image-20220428172937191](https://s2.loli.net/2022/04/28/s4EPBlmwI8ufHtW.png)

#### toObjectId—转换成ObjectId类型

仅支持String类型，且要可转成ObjectId类型

```shell
db.students.aggregate([
{
	$project:{
		string:{$toObjectId:'619d9039ec36b0e8cbfb401c'}
	}
},{$limit:1}
])
```

![image-20220428173206557](https://s2.loli.net/2022/04/28/dfpIayPihSAjB4k.png)

#### toString—转换成String类型

支持所有类型

```shell
db.students.aggregate([
{
	$project:{
		double:{$toString:2.2},
		decimal:{$toString:NumberDecimal('2.2')},
		integer:{$toString:22},
		long:{$toString:NumberLong('22')},
		objectId:{$toString:ObjectId('619d9039ec36b0e8cbfb401c')},
		string:{$toString:'Hello World'},
		date:{$toString:ISODate('2018-08-08T08:08:08.888Z')}
	}
},{$limit:1}
])
```

![image-20220428173454370](https://s2.loli.net/2022/04/28/X8wHYGqCs2TaDmz.png)

#### toLower—将字符串转为小写字母

如将学生名字转为小写

```shell
db.students.aggregate([
{
	$project:{
		name:'$name',
		name_lower:{
			$toLower:'$name'
		},
		name_cn:{
			$toLower:'你好'
		}
	}
}
])
```

![image-20220428173738422](https://s2.loli.net/2022/04/28/ZNh3pKQl8mTrvek.png)

#### toUpper—将字符串转为大写字母

```shell
db.students.aggregate([
{
	$project:{
		name:'$name',
		name_lower:{
			$toUpper:'$name'
		},
		name_cn:{
			$toUpper:'你好'
		}
	}
}
])
```

![image-20220428173910515](https://s2.loli.net/2022/04/28/wcanK8VEbIPF543.png)

#### trim—去除左右两边的指定字符串、默认空格

```shell
{ 
	$trim: { 
		input: <string> 字符串,  
		chars: <string> 去除的指定字符、默认空字符串、可选 
	} 
}
```

```shell
db.students.aggregate([
{
	$project:{
		rtrim_str:{
			$rtrim:{input:'Hello World'}
		},
		rtrim_str_ld:{
			$trim:{input:'Hello      Hello World HeHhHe',chars:'He'}
		},
		rtrim_str_space:{
			$trim:{input:'  \r\n   Hello World\t \r\n '}
		},
	}
},{$limit:1}
])
```

![image-20220428195036785](https://s2.loli.net/2022/04/28/5VMOLo1fZm3Sigz.png)

#### trunc—截取小数点，保留几位小数，默认不保留

```shell
db.students.aggregate([
{
	$project:{
		trunc:{
			$trunc:[1.5555]
		},
		trunc_2:{
			$trunc:[3.33333,2]
		},
		trunc_3:{
			$trunc:[-6.666666,3]
		},
	}
},{$limit:1}
])
```

![image-20220428195352318](https://s2.loli.net/2022/04/28/KbWtFGR1P5dw6ye.png)

#### type—查看类型

```shell
db.students.aggregate([
{
	$project:{
		t_double:{$type:2.2},
		t_decimal:{$type:NumberDecimal('2.2')},
		t_integer:{$type:22},
		t_long:{$type:NumberLong('22')},
		t_objectId:{$type:ObjectId('619d9039ec36b0e8cbfb401c')},
		t_string:{$type:'Hello World'},
		t_date:{$type:ISODate('2018-08-08T08:08:08.888Z')},
		t_bool:{$type:true},
		t_null:{$type:null},
		t_undefined:{$type:undefined},
		t_regex:{$type:/aaa/},
	}
},{$limit:1}
])
```

![image-20220428200611740](https://s2.loli.net/2022/04/28/7OK4pnCE8SD3dqI.png)

#### unsetField—删除查询文档结果中的字段

通常用于含有`$`、`.`的字段，常与replaceWith一起使用

官方例子

```shell
# 准备数据
db.inventory.insertMany( [
   { _id: 1, item: "sweatshirt", qty: 300, "price.usd": 45.99 },
   { _id: 2, item: "winter coat", qty: 200, "price.usd": 499.99 },
   { _id: 3, item: "sun dress", qty: 250, "price.usd": 199.99 },
   { _id: 4, item: "leather boots", qty: 300, "price.usd": 249.99 },
   { _id: 5, item: "bow tie", qty: 180, "price.usd": 9.99 }
 ] )
 
 # 查询数据
db.inventory.aggregate( [
 { $replaceWith: {
        $unsetField: {
           field: "price.usd",
           input: "$$ROOT"
   } } }
 ] )
 
 # 删除inventory
 db.inventory.drop()
```

#### week—获取某个时间的周值，0-53

周从星期日开始，第 1 周从一年中的第一个星期日开始。一年中第一个星期日之前的日子在第 0 周

支持Timestamp、Date、ObjeciID

```shell
db.students.aggregate([
{
	$project:{
		date_week_date:{
			$week:ISODate('2018-08-08T08:08:08.888')
		},
		date_week_date_timezone:{
			$week:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		},
		date_week_id:{
			$week:ObjectId('626b4907965f099c1c7d901f')
		},
		date_week_TimeStamp:{
			$week:Timestamp(1651075200,0)
		},
	}
},{$limit:1}
])
```

![image-20220429101416411](https://s2.loli.net/2022/05/07/mgNjQOZBCY5zauk.png)

#### year—获取某个时间的年份值，0-9999

```shell
db.students.aggregate([
{
	$project:{
		date_second:{
			$year:ISODate('2018-08-08T08:08:08.888')
		},
		date_second_timezone:{
			$year:{
				date:ISODate('2018-08-08T08:08:08.888'),
				timezone:'+0800'
			}
		}
	}
},{$limit:1}
])
```

#### zip—转置数组

基础语法

```shell
{
    $zip: {
        inputs: [ <array expression1>,  ... ],
        useLongestLength: <boolean>	使用inputs中最长的数组长度、不够则补null、可选,
        defaults:  <array expression>	补位、长度要与inputs的长度一致、可选、指定时useLongestLength要为true
    }
}
```

```shell
db.students.aggregate([
{
	$project:{
		zip:{
			$zip:{
				inputs:[['a','b','c'],[1,2,3]]
			}
		},
		zip_long:{
			$zip:{
				inputs:[['a','b','c'],[1]],
				useLongestLength:true
			}
		},
		zip_long_default:{
			$zip:{
				inputs:[['a','b','c'],[1]],
				useLongestLength:true,
				defaults:[2,3]
			}
		}
	}
},{$limit:1}
])
```

![image-20220504165002694](https://s2.loli.net/2022/05/04/mhJ9ISXugWPtv4Z.png)

