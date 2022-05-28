[TOC]

#### 说明

今天周六加班，有一个朋友找我说：我有一个请求，如果超过60s，则返回提示 "后台还在执行中，请留意查看消息箱！"并推送相关消息，若在60s内执行完成，则直接返回结果，不需要消息推送。这个该怎么处理呢？

大家想一下，该怎么实现呢？消息队列？我第一时间也蹦出这个词，他觉得没必要，那有没有更简单轻便的解决方案呢？

#### Task.Delay的妙用

最好使用webapi项目来做测试，本次使用WebApi项目做测试

控制台程序要在程序最后加一行 `Console.ReadKey();`卡住窗口，保证后台线程执行完成，不然看不到消息推送的操作

Nunit单元测试不行，执行完当前方法的测试后，程序就停止了，后台线程自然不会继续往下执行了

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapGet("/taskDelay", () => {
    return TaskDelayTest();
});

app.Run();

string TaskDelayTest()
{
    {
        var taskOk = true;
        var (isOk, message, result) = DelayAction(() =>
        {
            Task.Delay(10 * 1000).Wait();
            var res = 1;
            if (!taskOk)
            {
                //若已超时则推送消息
                Console.WriteLine("消息推送：刚才的xxx操作已执行成功，结果：" + res);
            }
            return res;
        });
        taskOk = isOk;
        Console.WriteLine($"isOk:{isOk},message:{message},result:{result}");    // 输出：1
    }


    {
        var taskOk = true;
        var (isOk, message, result) = DelayAction(() => {
            Task.Delay(10 * 1000).Wait();
            var res = 1;
            if (!taskOk)
            {
                //若已超时则推送消息
                Console.WriteLine("消息推送：刚才的xxx操作已执行成功，结果：" + res);      // 输出：4
            }
            return res;
        }, 3, 2);
        taskOk = isOk;
        Console.WriteLine($"isOk:{isOk},message:{message},result:{result}");    // 输出：2
        return isOk ? "执行成功" : message;                                      // 返回前端：3
    }
    
}
/// <summary>
/// 延迟执行，若超时，则异步执行，若不超时直接返回结果
/// </summary>
/// <typeparam name="T"></typeparam>
/// <param name="func">操作</param>
/// <param name="waitMaxCount">最大等待次数</param>
/// <param name="delayTime">每次等待时间</param>
/// <returns></returns>
(bool isOk, string message, T? result) DelayAction<T>(Func<T> func, int waitMaxCount = 10, int delayTime = 6)
{
    var result = Task.Run(() =>
    {
        if (func != null)
        {
            var res = func.Invoke();
            return res;
        }
        return default;
    });
    int waitTimeAll = 1;
    while (!result.IsCompleted && waitTimeAll <= waitMaxCount)
    {
        Task.Delay(delayTime * 1000).Wait();
        waitTimeAll++;
    }
    if (result.IsCompleted)
    {
        return (true, "执行成功", result.Result);
    }
    else
    {
        return (false, "后台还在执行中，请留意查看消息箱！", default(T));
    }
}

```

![image-20220528170020058](https://s2.loli.net/2022/05/28/6PTAeLwSqdRc4ib.png)