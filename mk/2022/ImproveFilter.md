[TOC]

### 说明

本文介绍 FirstOrDefault、Where 基本用法，并介绍一下 **for 循环中如何更高效的筛选另一个集合的数据**，重点在后半部分

提前剧透，总的来说就是避免在for循环中使用 FirstOrDefault 或者 Where 去筛选B集合的数据，应该在 for 循环外部，对B集合进行分组筛选并装入字典 Dictionary 中，后续在 for 循环中使用相应的 Key 从字典中取值即可

### FirstOrDefault基本用法

取集合中第一个符合条件的元素，若未指定条件则默认取第一个元素

若集合长度为零即没有数据或未找到一个符合条件的元素，则返回 Default(T) 即相应类型的默认值

```c#
        public void FirstOrdefaultTest()
        {
            var list = new List<string>() { "a", "b", "c", "d", "e", "f", "g", "good", "boy" };
            var listFirst = list.FirstOrDefault();  // a
            var listFirst2 = list.FirstOrDefault(x => x.StartsWith('b'));   // b
            var listFirst3 = list.FirstOrDefault(x => x.Length >= 3);       // good
            var listFirst4 = list.FirstOrDefault(x => x.Length >= 5);       //null 因为 default(string) == null
            //var listFirst5 = list.First(x => x.Length >= 5);              //未找到直接报错
            Console.WriteLine($"listFirst={listFirst}，listFirst2={listFirst2}，listFirst3={listFirst3}，listFirst4={listFirst4 ?? "null"}");

            
            var listEmpty = new List<int>();
            var listEmptyFirst = listEmpty.FirstOrDefault();    // 0 因为 default(int) == 0
            //var listEmptyFirst2 = listEmpty.First();          //未找到直接报错
            Console.WriteLine($"listEmptyFirst={listEmptyFirst}");

            Console.WriteLine($"string默认值：{default(string) ?? "null"}，Int默认值：{default(int)}，对象默认值：{default(object) ?? "null"}");
        }
```

执行结果如下：

![image-20220511143755258](https://s2.loli.net/2022/05/11/ZBKYMgkqLhCiJ24.png)

### Where基本用法

取集合中所有符合条件的元素

若集合长度为零即没有数据或未找到一个符合条件的元素，则返回空集合

```c#
        public void WhereTest()
        {
            var list = new List<string>() { "a", "b", "c", "d", "e", "f", "g", "good", "boy" };
            var listWhere = list.Where(x => x.StartsWith('b')).ToList();   	// ["b", "boy"]
            var listWhere2 = list.Where(x => x.Length >= 3).ToList();       // ["good", "boy"]
            var listWhere3 = list.Where(x => x.Length >= 5).ToList();       // []
            Console.WriteLine($"listWhere={listWhere.Count}，listWhere2={listWhere2.Count}，listWhere3={listWhere3.Count}");

            
            var listEmpty = new List<int>();
            var listEmptyWhere = listEmpty.Where(x=>true);    // []
            Console.WriteLine($"listEmptyWhere={listEmptyWhere}");
        }
```

### 优化案例

#### 数据准备

新建 Student、Score 类

```c#
    public class Student
    {
        public long Id { get; set; }
        public string Info { get; set; }
    }

    public class Score
    {
        public long StudentId { get; set; }
        public string Major { get; set; }
        public decimal MajorValue { get; set; }
    }
```

初始化Student、Score数据，并保存至桌面txt中

```c#
        public void InitData() {
            var ids = Enumerable.Range(100000,10000);	//初始化1w条学生数据
            var major = new List<string>() { "Chinese", "Math", "English", "Physics", "History"};
            var students = ids.Select(x=>new Student() { Id = x });
            var scores = ids.SelectMany(x => major, (id, major) => new Score() { StudentId = id,Major = major,MajorValue = (decimal)Math.Round(new Random().NextDouble() * 100,1) });
            var studentStr = JsonConvert.SerializeObject(students);
            var scoreStr = JsonConvert.SerializeObject(scores);
            var desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory) +"\\";
            File.WriteAllText(desktop + "student.txt", studentStr);
            File.WriteAllText(desktop + "score.txt", scoreStr);
        }
```

#### FirstOrDefault 匹配查询单个数据

如将学生的信息显示为指定语文成绩

```c#
        public void UpdateInfo()
        {
            var desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory) + "\\";
            var studentStr =File.ReadAllText(desktop + "student.txt");
            var scoreStr = File.ReadAllText(desktop + "score.txt");

            var students = JsonConvert.DeserializeObject<List<Student>>(studentStr);
            var scores = JsonConvert.DeserializeObject<List<Score>>(scoreStr);
            Console.WriteLine($"本次处理学生数据：{students.Count}，成绩数据：{scores.Count}");
            var stopwatch = new Stopwatch();

            #region 优化前
            stopwatch.Restart();
            //将学生信息改成语文成绩
            students.ForEach(x => x.Info = "语文：" + (scores.FirstOrDefault(y => y.StudentId == x.Id && y.Major == "Chinese")?.MajorValue ?? -1));
            stopwatch.Stop();
            Console.WriteLine($"优化前耗时：{stopwatch.ElapsedMilliseconds}ms");
            #endregion

            #region 优化后
            stopwatch.Restart();
            var scoreDic = scores.Where(x => x.Major == "Chinese").GroupBy(x => x.StudentId).ToDictionary(x => x.Key, x => x.FirstOrDefault()?.MajorValue ?? -1);
            //将学生信息改成语文成绩
            students.ForEach(x => x.Info = "语文：" + (scoreDic.ContainsKey(x.Id) ? scoreDic[x.Id] : -1));
            stopwatch.Stop();
            Console.WriteLine($"优化后耗时：{stopwatch.ElapsedMilliseconds}ms");
            #endregion

        }
```

1.先执行优化前的代码，处理 1w 条数据

![image-20220511162318337](https://s2.loli.net/2022/05/11/fvAIXYreyCG3VhF.png)

2.先执行优化后的代码，处理 1w 条数据

![image-20220511162358000](https://s2.loli.net/2022/05/11/h6kQzGltK9p5LTq.png)

3.先执行优化前的代码，处理 5w 条数据

![image-20220511162923737](https://s2.loli.net/2022/05/11/wgTGaYCtrilWRZx.png)

4.先执行优化后的代码，处理 5w 条数据

![image-20220511163325034](https://s2.loli.net/2022/05/11/9GmQbsH5q1YXwVE.png)

执行了四次，我们可以看到这种方式对 FirstOrDefault 优化提升的效果是非常明显的，**数据越多越受用**

#### Where匹配查询数据

如将学生的信息显示为指定各科成绩，并显示总数

```c#
        public void UpdateFullInfo()
        {
            var desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory) + "\\";
            var studentStr = File.ReadAllText(desktop + "student.txt");
            var scoreStr = File.ReadAllText(desktop + "score.txt");

            var students = JsonConvert.DeserializeObject<List<Student>>(studentStr);
            var scores = JsonConvert.DeserializeObject<List<Score>>(scoreStr);
            Console.WriteLine($"本次处理学生数据：{students.Count}，成绩数据：{scores.Count}");
            var stopwatch = new Stopwatch();

            #region 优化前
            stopwatch.Restart();
            //将学生信息改成语文成绩
            students.ForEach(x => {
                var scoresTemp = scores.Where(y => y.StudentId == x.Id);
                var infos = scoresTemp.Select(y => $"{y.Major}：{y.MajorValue}");
                x.Info = string.Join("，", infos) + $"，总分：{scoresTemp.Sum(y => y.MajorValue)}";
            });
            stopwatch.Stop();
            Console.WriteLine($"优化前耗时：{stopwatch.ElapsedMilliseconds}ms");
            #endregion

            #region 优化后
            stopwatch.Restart();
            var scoreDic = scores.GroupBy(x => x.StudentId).ToDictionary(x => x.Key, x => x.ToList());
            //将学生信息改成语文成绩
            students.ForEach(x => {
                if (scoreDic.ContainsKey(x.Id)) x.Info = string.Join("，", scoreDic[x.Id].Select(y => $"{y.Major}：{y.MajorValue}")) + $"，总分：{scoreDic[x.Id].Sum(y => y.MajorValue)}";
                else x.Info = "缺考";
            });
            stopwatch.Stop();
            Console.WriteLine($"优化后耗时：{stopwatch.ElapsedMilliseconds}ms");
            #endregion
        }
```

1.先执行优化前的代码，处理 1w 条数据

![image-20220511170614272](https://s2.loli.net/2022/05/11/TdRpjM1iWIfEhwD.png)

2.先执行优化后的代码，处理 1w 条数据

![image-20220511170529343](https://s2.loli.net/2022/05/11/OfUQ8Sz5G6jTMv1.png)

3.先执行优化前的代码，处理 5w 条数据

![image-20220511165406706](https://s2.loli.net/2022/05/11/WX56DY8gSQR9fhO.png)

4.先执行优化后的代码，处理 5w 条数据

![image-20220511170335906](https://s2.loli.net/2022/05/11/NsYRlfMdH7vIn8a.png)

执行了四次，我们可以看到这种方式对 Where 优化提升的效果同样是非常明显的，**数据越多越受用**

#### 多字段分组（题外话）

如按照学生性别、年龄进行分组

```c#
            var students = new List<Student>();
            students.GroupBy(x => new { x.Age, Sex = x.Sex ?? 0 }).ToDictionary(x => x.Key, x => x.ToList());
```

