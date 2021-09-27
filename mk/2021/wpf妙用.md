[toc]

#### 前言

整理了一下Wpf常见例子，以作备用，Demo项目地址：[logerlink/WpfCommonDemo: Wpf常见例子，自定义弹出框、文本框、全局异常捕获、避免软件多开、converter过滤器 (github.com)](https://github.com/logerlink/WpfCommonDemo)

#### 自定义弹出框

思路：新建一个页面作为弹框，需要弹框的时候，计算当前窗口的真实宽高以及左上角的坐标位置，将宽高和位置信息设置给弹框页面达到覆盖本窗口的效果.

![loading展示22](https://i.loli.net/2021/09/25/8wpPFdigQ3ELbSM.gif)

#### wpf自定义头部，标题栏，Closing事件

使用场景：当我们需要自定义标题栏的颜色或者添加自定义的内容时

隐藏窗体自带的标题栏：WindowStyle="None" AllowsTransparency="True"

已知问题：

1. 窗口最大化时无法通过拖拽标题栏实现窗口最小化操作
2. 必须要设置 ResizeMode="CanResizeWithGrip"   才能改变窗口大小   而且只能在右下角触发（右下角会有一个图标）
3. 默认窗体没有边框也没有边框阴影

若我们要关闭主窗口时需要先判断子窗口是否存在，若存在先关闭子窗口，这一系列操作可以在主窗口的Closing事件中处理.

```csharp
        /// <summary>
        /// 关闭前事件
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            var hasOtherWindow = CheckHasOtherWindow();
            if (hasOtherWindow)
            {
                MessageBox.Show("请先关闭其他窗口！");
                e.Cancel = true;
            }
        }
        /// <summary>
        /// 判断是否有其他窗口
        /// </summary>
        /// <returns></returns>
        private bool CheckHasOtherWindow()
        {
            var hasOtherWindow = false;
            foreach (Window item in Application.Current.Windows)
            {
                if (item.ToString() == "Wpf.Demo.CustomBar")     //通过窗口标题来判断子窗口是否存在
                {
                    hasOtherWindow = true;
                    break;
                }
            }
            return hasOtherWindow;
        }
```

![自定义标题栏](https://i.loli.net/2021/09/25/RoPKyuM53jnwYFQ.gif)

xaml:

```xaml
<Window x:Class="Wpf.Demo.CustomBar"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:Wpf.Demo"
        mc:Ignorable="d"
        Height="450" Width="800"
        ResizeMode="CanResizeWithGrip"
        WindowStyle="None"
        AllowsTransparency="True"
        WindowStartupLocation="CenterOwner"
        >
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="BorderThickness" Value="0"></Setter>
            <Setter Property="Foreground" Value="#fff"></Setter>
            <Setter Property="Background" Value="Transparent"></Setter>
            <Style.Triggers>
                <!--鼠标悬浮再按钮上时，按钮的背景色改变-->
                <Trigger Property="IsMouseOver" Value="True">
                    <Setter Property="Foreground" Value="#333"></Setter>
                </Trigger>
                <Trigger Property="IsPressed" Value="True">
                    <Setter Property="Foreground" Value="#636363"></Setter>
                </Trigger>
            </Style.Triggers>
        </Style>
        <Style x:Key="btn_close_style" BasedOn="{StaticResource {x:Type Button}}"  TargetType="Button" >
            <Style.Triggers>
                <Trigger Property="IsMouseOver" Value="True">
                    <!--无法设置background，fontsize  目前只能设置Foreground，FontWeight-->
                    <Setter Property="Foreground" Value="Red"></Setter>
                </Trigger>
            </Style.Triggers>
        </Style>
    </Window.Resources>
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"></RowDefinition>
            <RowDefinition Height="*"></RowDefinition>
            <RowDefinition Height="Auto"></RowDefinition>
        </Grid.RowDefinitions>
        <Grid Grid.Row="0" Height="30" MouseMove="TitleBar_MouseMove" MouseDown="TitleBar_MouseDown" Background="#41b1e1" DockPanel.Dock="Top">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"></ColumnDefinition>
                <ColumnDefinition Width="Auto"></ColumnDefinition>
            </Grid.ColumnDefinitions>
            <TextBlock Grid.Column="0" Name="Tb_Title" Margin="1,0,0,0"  Padding="5,3,2,3" Text="自定义标题" 
                   HorizontalAlignment="Left" VerticalAlignment="Center" FontSize="14" Foreground="White"/>
            <StackPanel Grid.Column="1" Orientation="Horizontal" HorizontalAlignment="Right">
                <Button x:Name="btn_Switch" Content="〒" FontSize="18" Click="MI_SwitchAccount_Click" Width="30" Height="26" ToolTip="切换账号"/>
                <Button x:Name="btn_min"  Content="─" FontSize="18" Click="btn_min_Click" Width="30" Height="26"/>
                <Button x:Name="btn_max"  Content="▢" FontSize="18"  Click="btn_max_Click" Width="30" Height="26"/>
                <Button x:Name="btn_close" Style="{StaticResource btn_close_style}" Content="✕" FontSize="18"  Click="btn_close_Click" Width="30" Height="26"/>
            </StackPanel>
        </Grid>
        <Grid Grid.Row="1">
            <Border BorderBrush="Red" BorderThickness="1">
                <Label>主体内容</Label>
            </Border>
        </Grid>
        <StatusBar Grid.Row="2" Background="#41b1e1">
            <StatusBarItem>
                <StackPanel Orientation="Horizontal">
                    <TextBlock Text="自定义底部状态栏" VerticalAlignment="Center" Foreground="White" FontSize="12"></TextBlock>
                </StackPanel>
            </StatusBarItem>
            <StatusBarItem HorizontalAlignment="Right">
                <TextBlock Text="提示信息！" VerticalAlignment="Center" HorizontalAlignment="Right" Name="sb_Message" Margin="0 0 20 0" Foreground="NavajoWhite" FontSize="13"></TextBlock>
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>

```

xaml.cs

```csharp
using System;
using System.Windows;
using System.Windows.Input;

namespace Wpf.Demo
{
    /// <summary>
    /// CustomBar.xaml 的交互逻辑
    /// </summary>
    public partial class CustomBar : Window
    {
        public CustomBar()
        {
            InitializeComponent();
            this.Title = Tb_Title.Text;
        }

        #region 标题栏事件
        /*
         已知问题：
            1.窗口最大化时无法通过拖拽标题栏实现窗口最小化操作
            2. 必须要设置 ResizeMode="CanResizeWithGrip"   才能改变窗口大小   而且只能在右下角触发（右下角会有一个图标）
         */
        /// <summary>
        /// 窗口移动事件
        /// </summary>
        private void TitleBar_MouseMove(object sender, MouseEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                this.DragMove();
            }
        }
        int i = 0;
        /// <summary>
        /// 标题栏双击事件
        /// </summary>        
        private void TitleBar_MouseDown(object sender, MouseButtonEventArgs e)
        {
            i += 1;
            System.Windows.Threading.DispatcherTimer timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = new TimeSpan(0, 0, 0, 0, 300);
            timer.Tick += (s, e1) => { timer.IsEnabled = false; i = 0; };
            timer.IsEnabled = true;
            if (i % 2 == 0)
            {
                timer.IsEnabled = false;
                i = 0;
                this.WindowState = this.WindowState == WindowState.Maximized ?
                              WindowState.Normal : WindowState.Maximized;
            }
        }
        /// <summary>
        /// 窗口最小化
        /// </summary>
        private void btn_min_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized; //设置窗口最小化
        }

        /// <summary>
        /// 窗口最大化与还原
        /// </summary>
        private void btn_max_Click(object sender, RoutedEventArgs e)
        {
            if (this.WindowState == WindowState.Maximized)
            {
                this.WindowState = WindowState.Normal; //设置窗口还原
            }
            else
            {
                this.WindowState = WindowState.Maximized; //设置窗口最大化
            }
        }

        /// <summary>
        /// 窗口关闭
        /// </summary>        
        private void btn_close_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("确定关闭程序？","提示",MessageBoxButton.OKCancel);
            if (result == MessageBoxResult.OK)
            {
                this.Close();
            }

        }
        private void MI_SwitchAccount_Click(object sender, RoutedEventArgs e)
        {
            //第三个按钮
        }

        #endregion 标题栏事件

    }
}

```

#### wpf自定义图标 ，如何使用svg

```xaml
                <Grid Grid.Row="2" Margin="0 20 0 20">
                    <Grid.Resources>
                        <ResourceDictionary>
                            <DrawingImage x:Key="DrawingImage.SwitchUser">
                                <DrawingImage.Drawing>
                                    <DrawingGroup ClipGeometry="M0,0 V1024 H1024 V0 H0 Z">
                                        <GeometryDrawing Brush="#FFFFFFFF" Geometry="M759 335c0-137-111-248-248-248S263 198 263 335c0 82.8 40.6 156.2 103 201.2-0.4 0.2-0.7 0.3-0.9 0.4-44.7 18.9-84.8 46-119.3 80.6-34.5 34.5-61.5 74.7-80.4 119.5C146.9 780.5 137 827 136 874.8c-0.1 4.5 3.5 8.2 8 8.2h59.9c4.3 0 7.9-3.5 8-7.8 2-77.2 32.9-149.5 87.6-204.3C356 614.2 431 583 511 583c137 0 248-111 248-248zM511 507c-95 0-172-77-172-172s77-172 172-172 172 77 172 172-77 172-172 172zM616 728h264c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H703.5l47.2-60.1c1.1-1.4 1.7-3.2 1.7-4.9 0-4.4-3.6-8-8-8h-72.6c-4.9 0-9.5 2.3-12.6 6.1l-68.5 87.1c-4.4 5.6-6.8 12.6-6.8 19.8 0.1 17.7 14.4 32 32.1 32zM856 792H592c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h176.5l-47.2 60.1c-1.1 1.4-1.7 3.2-1.7 4.9 0 4.4 3.6 8 8 8h72.6c4.9 0 9.5-2.3 12.6-6.1l68.5-87.1c4.4-5.6 6.8-12.6 6.8-19.8-0.1-17.7-14.4-32-32.1-32z"/>
                                    </DrawingGroup>
                                </DrawingImage.Drawing>
                            </DrawingImage>
                        </ResourceDictionary>
                    </Grid.Resources>
                    <StackPanel Orientation="Horizontal" Height="30" >
                        <Label>图标svg</Label>
                        <Button Width="30" Height="30" Background="#aaa" BorderThickness="0">
                            <Button.Content>
                                <Grid>
                                    <Image Source="{StaticResource DrawingImage.SwitchUser}" Width="20" Height="20"></Image>
                                </Grid>
                            </Button.Content>
                        </Button>
                    </StackPanel>
                </Grid>
```

#### wpf如何设置style？单个设置，样式继承、全局设置，外部style，样式触发事件

![StyleDemo](https://i.loli.net/2021/09/25/pO5WfLEeN7JXF8c.gif)

##### 单个设置

内联样式，仅该元素使用的样式

```xaml
        <Grid Grid.Column="0">
            <Label>内联样式</Label>
            <Button Content="内联样式">
                <Button.Style>
                    <Style TargetType="Button">
                        <Setter Property="Width" Value="50"></Setter>
                        <Setter Property="Height" Value="30"></Setter>
                        <Setter Property="Background" Value="LightGoldenrodYellow"></Setter>
                        <Style.Triggers>
                            <Trigger Property="IsMouseOver" Value="True">
                                <Setter Property="Foreground" Value="Red"></Setter>
                            </Trigger>
                        </Style.Triggers>
                    </Style>
                </Button.Style>
            </Button>
        </Grid>
```

##### 全局设置、指定设置

该区域的某元素（Button）都使用的样式，注意不要设置key值

BasedOn：表示继承 ,可继承于wpf默认样式 BasedOn="{StaticResource {x:Type Button}}" ,也可继承于其他样式：BasedOn="{StaticResource btn_four_style}"

Key：设置key值之后如果需要用这个样式，需要再相应元素上指定，如：Style="{StaticResource btn_four_style}"

```xaml
<Grid Grid.Column="1">
            <Grid.Resources>
                <Style TargetType="Button">
                    <Setter Property="Width" Value="50"></Setter>
                    <Setter Property="Height" Value="30"></Setter>
                    <Setter Property="Background" Value="AliceBlue"></Setter>
                    <Style.Triggers>
                        <Trigger Property="IsMouseOver" Value="True">
                            <!--无法设置background，fontsize  目前只能设置Foreground，FontWeight-->
                            <!--设置Background不起作用  正确方式请查看下面的Button触发样式-->
                            <Setter Property="Foreground" Value="Red"></Setter>
                        </Trigger>
                    </Style.Triggers>
                </Style>
                <Style TargetType="Button" x:Key="btn_four_style" BasedOn="{StaticResource {x:Type Button}}">
                    <Setter Property="Foreground" Value="#FFF"></Setter>
                    <Setter Property="Background" Value="Blue"></Setter>
                </Style>
                <Style TargetType="Button" x:Key="btn_five_style" BasedOn="{StaticResource btn_four_style}">
                    <Setter Property="Foreground" Value="Red"></Setter>
                </Style>
            </Grid.Resources>
            <Label>全局样式</Label>
            <StackPanel Margin="0 30 0 0">
                <Button Content="按钮一"></Button>
                <Button Content="按钮二"></Button>
                <Button Content="按钮三"></Button>
                <Button Content="按钮四" Style="{StaticResource btn_four_style}"></Button>
            </StackPanel>
            <Button Content="按钮五" Style="{StaticResource btn_five_style}"></Button>
        </Grid>
```

##### 外部资源样式

App.xaml中指定外部样式资源文件

```xaml
<Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="pack://application:,,,/Wpf.Demo;component/Style/ButtonStyle.xaml"></ResourceDictionary>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Application.Resources>
```

设置Style时，外部资源要用 DynamicResource 绑定，内部用 StaticResource

```xaml
        <Grid Grid.Column="2">
            <Label>外部样式</Label>
            <StackPanel Margin="0,30,0,0">
                <Button Content="按钮一"></Button>
                <Button Content="按钮二"></Button>
                <Button Content="取消" Style="{DynamicResource Button.ReCancel}"></Button>
                <Button Content="提交" Style="{DynamicResource Button.ReSave}"></Button>
            </StackPanel>
        </Grid>
```

#####  Trigger样式触发

当我们想让某元素鼠标悬浮、点击、选中时呈现不同的形态，我们可以使用Trigger来处理

```xaml
<Grid Grid.Column="3">
            <Grid.Resources>
                <Style TargetType="Button">
                    <Setter Property="Width" Value="60"/>
                    <Setter Property="Height" Value="30"/>
                    <Setter Property="Template">
                        <Setter.Value>
                            <ControlTemplate TargetType="Button">
                                <Border Name="PART_Border" CornerRadius="2" Background="{TemplateBinding Background}" BorderThickness="0">
                                    <TextBlock Text="{TemplateBinding Content}" Foreground="#fff" HorizontalAlignment="Center" VerticalAlignment="Center" FontSize="16"></TextBlock>
                                </Border>
                                <ControlTemplate.Triggers>
                                    <Trigger Property="IsMouseOver" Value="True">
                                        <Setter TargetName="PART_Border" Property="Background" Value="Red"></Setter>
                                    </Trigger>
                                    <Trigger Property="IsPressed" Value="True">
                                        <Setter TargetName="PART_Border" Property="Background" Value="Yellow"></Setter>
                                    </Trigger>
                                </ControlTemplate.Triggers>
                            </ControlTemplate>
                        </Setter.Value>
                    </Setter>
                </Style>
                <Style TargetType="Button" x:Key="btn_save_style" BasedOn="{StaticResource {x:Type Button}}">
                    <Setter Property="Template">
                        <Setter.Value>
                            <ControlTemplate TargetType="Button">
                                <Border Name="PART_Border" CornerRadius="2" Background="{TemplateBinding Background}" BorderThickness="0">
                                    <TextBlock Text="{TemplateBinding Content}" Foreground="#fff" HorizontalAlignment="Center" VerticalAlignment="Center" FontSize="16"></TextBlock>
                                </Border>
                                <ControlTemplate.Triggers>
                                    <Trigger Property="IsMouseOver" Value="True">
                                        <Setter TargetName="PART_Border" Property="Background" Value="Blue"></Setter>
                                    </Trigger>
                                    <Trigger Property="IsPressed" Value="True">
                                        <Setter TargetName="PART_Border" Property="Background" Value="pink"></Setter>
                                    </Trigger>
                                </ControlTemplate.Triggers>
                            </ControlTemplate>
                        </Setter.Value>
                    </Setter>
                </Style>
            </Grid.Resources>
            <Label>Trigger样式触发</Label>
            <StackPanel>
                <Button Content="取消" Background="Gray" Margin="0 30 0 10"></Button>
                <Button Content="提交" Background="Green" Style="{StaticResource btn_save_style}"></Button>
            </StackPanel>
        </Grid>
```

#### 常见Textbox

![image-20210925165023257](https://i.loli.net/2021/09/25/OQ3R7K2UXGkvjfn.png)

##### Textbox加水印 （waterMark、placeHolder）

```xaml
<Grid Grid.Row="0">
            <Grid.Resources>
                <Style TargetType="TextBox" x:Key="tb_WaterMark_style">
                    <Setter Property="Foreground" Value="#333"></Setter>
                    <Setter Property="Template">
                        <Setter.Value>
                            <ControlTemplate TargetType="TextBox">
                                <Border BorderThickness="1" BorderBrush="Gray" CornerRadius="2">
                                    <Grid>
                                        <ScrollViewer x:Name="PART_ContentHost" FontSize="{TemplateBinding FontSize}" Width="{TemplateBinding Width}" Height="{TemplateBinding Height}" BorderThickness="0" IsTabStop="False"
                                          HorizontalAlignment="{TemplateBinding HorizontalAlignment}" HorizontalContentAlignment="{TemplateBinding HorizontalContentAlignment}" VerticalContentAlignment="{TemplateBinding VerticalContentAlignment}" VerticalAlignment="{TemplateBinding VerticalAlignment}" Margin="4,0"/>
                                        <TextBlock x:Name="Part_WaterMark" Text="{TemplateBinding Tag}" VerticalAlignment="Center" FontSize="16" Foreground="#aaa" Padding="5 0 0 0" Visibility="Hidden" ></TextBlock>
                                    </Grid>
                                </Border>
                                <ControlTemplate.Triggers>
                                    <!--无文字则显示水印-->
                                    <Trigger Property="Text" Value="">
                                        <Setter TargetName="Part_WaterMark" Property="Visibility" Value="Visible"></Setter>
                                    </Trigger>
                                </ControlTemplate.Triggers>
                            </ControlTemplate>
                        </Setter.Value>
                    </Setter>
                </Style>
            </Grid.Resources>
            <Label>水印</Label>
            <TextBox Width="150" Height="30" Text="" Style="{StaticResource tb_WaterMark_style}" Tag="请输用户名" HorizontalContentAlignment="Left" VerticalContentAlignment="Center"></TextBox>
        </Grid>
```

##### 滚动条、自动换行

```xaml
        <Border BorderThickness="0 0 0 1" BorderBrush="Blue" Grid.Row="1">
            <Grid>
                <Label>滚动条</Label>
                <StackPanel Orientation="Horizontal" Margin="100 0 0 0">
                    <Label>横向滚动条</Label>
                    <TextBox Width="150" Height="35" HorizontalScrollBarVisibility="Auto" Text="111111111111111111111111111111111111111111111111111122222222222222555555555555555555555555555555555555555555555"></TextBox>
                    <Label>纵向滚动条、自动换行</Label>
                    <TextBox Width="150" Height="80" VerticalScrollBarVisibility="Auto" TextWrapping="Wrap" Text="1111111111111111111111111111111111111111111111111111111111111222222222222225555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555"></TextBox>
                </StackPanel>
            </Grid>
        </Border>
```

##### 文本框内加按钮如：清空按钮

xaml

```xaml
<Grid Grid.Row="2" Margin="0 50 0 0">
            <Grid.Resources>
                <Style TargetType="TextBox" x:Key="tb_Username_Style">
                    <Setter Property="Template">
                        <Setter.Value>
                            <ControlTemplate TargetType="TextBox">
                                <Grid>
                                    <Border x:Name="PART_Border" BorderBrush="{TemplateBinding BorderBrush}" BorderThickness="{TemplateBinding BorderThickness}" Background="{TemplateBinding Background}"
                                    SnapsToDevicePixels="true">
                                        <Grid>
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*"></ColumnDefinition>
                                                <ColumnDefinition Width="35"></ColumnDefinition>
                                            </Grid.ColumnDefinitions>
                                            <Grid Grid.Column="0">
                                                <ScrollViewer x:Name="PART_ContentHost" FontSize="{TemplateBinding FontSize}" Width="{TemplateBinding Width}" Height="{TemplateBinding Height}" BorderThickness="0" IsTabStop="False"
                                          HorizontalAlignment="{TemplateBinding HorizontalAlignment}" HorizontalContentAlignment="{TemplateBinding HorizontalContentAlignment}" VerticalContentAlignment="{TemplateBinding VerticalContentAlignment}" VerticalAlignment="{TemplateBinding VerticalAlignment}" Margin="4,0"/>
                                            </Grid>
                                            <Grid Grid.Column="1">
                                                <Button Width="30" Height="30" BorderThickness="0" Background="#fff" Content="✕" FontSize="18" Click="Btn_Clear2_Click"></Button>
                                            </Grid>
                                        </Grid>
                                    </Border>
                                </Grid>
                            </ControlTemplate>
                        </Setter.Value>
                    </Setter>
                </Style>
            </Grid.Resources>
            <Label>文本框包按钮</Label>
            <StackPanel Orientation="Horizontal" Margin="100 0 0 0">
                <Label>margin定位</Label>
                <StackPanel Orientation="Horizontal">
                    <TextBox Width="150" Height="35" VerticalContentAlignment="Center" Text="" Name="Tb_Username"></TextBox>
                    <Button Width="30" Height="30" BorderThickness="0" Background="#fff" Margin="-35 0 0 0" Content="✕" FontSize="18" Click="Btn_Clear_Click"></Button>
                </StackPanel>
                <Label>Grid 栅格实现</Label>
                <TextBox Width="150" Height="35" VerticalContentAlignment="Center" Text="" Name="Tb_Username2" Style="{StaticResource tb_Username_Style}" BorderThickness="1" BorderBrush="Gray"></TextBox>
            </StackPanel>
        </Grid>
```

xaml.cs

```csharp
		#region 清空文本框
        /// <summary>
        /// 清空文本框
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_Clear_Click(object sender, RoutedEventArgs e)
        {
            Tb_Username.Text = "";
        }

        /// <summary>
        /// 清空文本框
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_Clear2_Click(object sender, RoutedEventArgs e)
        {
            Tb_Username2.Text = "";
        }
        #endregion
```

##### 实现密码框

xaml

```xaml
<Border BorderThickness="0 0 0 1" BorderBrush="red" Grid.Row="3">
            <Grid>
                <Grid.Resources>
                    <Style TargetType="{x:Type ToggleButton}" x:Key="tg_password_style">
                        <Setter Property="Template">
                            <Setter.Value>
                                <ControlTemplate TargetType="ToggleButton">
                                    <TextBlock x:Name="PART_EyeText" FontSize="20" Margin="0,0,10,0" Text="■" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    <ControlTemplate.Triggers>
                                        <Trigger  Property="IsChecked" Value="True">
                                            <Setter TargetName="PART_EyeText" Property="Text" Value="□"/>
                                        </Trigger>
                                        <Trigger Property="IsChecked" Value="False">
                                            <Setter TargetName="PART_EyeText" Property="Text" Value="■"/>
                                        </Trigger>
                                    </ControlTemplate.Triggers>
                                </ControlTemplate>
                            </Setter.Value>
                        </Setter>
                    </Style>
                </Grid.Resources>
                <Label>密码框的实现</Label>
                <StackPanel Orientation="Horizontal" Margin="100 0 0 0">
                    <PasswordBox Password="123456789" Width="250" Height="35" VerticalContentAlignment="Center" Name="pw_password"></PasswordBox>
                    <TextBox Text="123456789" Width="250" Height="35" VerticalContentAlignment="Center" Visibility="Collapsed" Name="tb_password"></TextBox>
                    <ToggleButton x:Name="PART_Eye" Style="{StaticResource tg_password_style}" Click="PART_Eye_Click" Height="22" Margin="-26 -5 0 0"/>
                </StackPanel>
            </Grid>
        </Border>
```

xaml.cs

```csharp
		#region  明文和密码切换
        /// <summary>
        /// 明文和密码切换
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PART_Eye_Click(object sender, RoutedEventArgs e)
        {
            var tg = sender as ToggleButton;
            if (tg == null) return;
            if (tg?.IsChecked == true)
            {
                tb_password.Text = pw_password.Password;
                tb_password.Visibility = Visibility.Visible;
                pw_password.Visibility = Visibility.Collapsed;
            }
            else
            {
                pw_password.Password = tb_password.Text;
                pw_password.Visibility = Visibility.Visible;
                tb_password.Visibility = Visibility.Collapsed;
            }
        }
        #endregion
```

##### 鼠标聚焦自动全选文本 

参考：[ WPF TextBox 获得焦点后，文本框中的文字全选中_weixin_34293911的博客-CSDN博客](https://blog.csdn.net/weixin_34293911/article/details/85654408?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-0&spm=1001.2101.3001.4242)

xaml

```xaml
<Grid Grid.Row="4">
            <Label>聚焦选中文本</Label>
            <TextBox Text="点击我选中全部文本" FontSize="16" Width="250" Height="35" Name="tb_focus" VerticalContentAlignment="Center" GotFocus="tb_focus_GotFocus" PreviewMouseDown="tb_focus_PreviewMouseDown" LostFocus="tb_focus_LostFocus"></TextBox>
        </Grid>
```

xaml.cs

```csharp
		#region 文本选中事件
        /// <summary>
        /// 文本框获取焦点
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tb_focus_GotFocus(object sender, RoutedEventArgs e)
        {
            tb_focus.SelectAll();   //全选
            //tb_focus文本框  取消 点击前 事件
            tb_focus.PreviewMouseDown -= new MouseButtonEventHandler(tb_focus_PreviewMouseDown);
        }
        /// <summary>
        /// 文本框被点击前
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tb_focus_PreviewMouseDown(object sender, MouseButtonEventArgs e)
        {
            tb_focus.Focus();   //触发 tb_focus_GotFocus
            e.Handled = true;   //不继续往下
        }
        /// <summary>
        /// 文本框失去焦点
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tb_focus_LostFocus(object sender, RoutedEventArgs e)
        {
            //tb_focus文本框  添加 点击前 事件
            tb_focus.PreviewMouseDown += new MouseButtonEventHandler(tb_focus_PreviewMouseDown);
        }
        #endregion
```

#### Popup跟随窗体移动

已知问题：Popup 一直置顶，预解决方案：窗体失去焦点时，把 Popup 的 IsOpen 属性改为 False ，不过比较麻烦且鸡肋。网上有扩展可以实现，不过还没试，参考：[让WPF的Popup不总置顶的解决方案 - Leaco - 博客园 (cnblogs.com)](https://www.cnblogs.com/Leaco/p/3164394.html)

![Popup](https://i.loli.net/2021/09/25/Lm8oI93zWOFNg1G.gif)

xaml

```xaml
<Window x:Class="Wpf.Demo.Form.PopupDemo"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:Wpf.Demo.Form"
        mc:Ignorable="d"
        Title="Popup" Height="450" Width="800" WindowStartupLocation="CenterOwner" SizeChanged="Window_SizeChanged" LocationChanged="Window_SizeChanged">
    <Grid>
        <Grid>
            <StackPanel Orientation="Horizontal" Height="30" >
                <Label>Popup展示    点击然后更改窗体大小或位置</Label>
                <Button Content="打开Popup" Name="Btn_ShowPup" Click="Btn_ShowPup_Click" ></Button>
                <Button Content="打开PopupAuto" Name="Btn_ShowPupAuto" Click="Btn_ShowPupAuto_Click" Margin="20 0 20 0"></Button>
                <Button Content="关闭所有Popup" Name="Btn_ClosePup" Click="Btn_ClosePup_Click"></Button>
            </StackPanel>
            <Popup IsOpen="False" StaysOpen="True" Width="250" Height="100" Name="Pup_Message" PlacementTarget="{Binding ElementName=Btn_ShowPup}">
                <Border BorderThickness="1" BorderBrush="#333" Background="#fff">
                    <Label>这是PopUp1弹框 不会随着窗口移动</Label>
                </Border>
            </Popup>
            <Popup IsOpen="False" StaysOpen="True" Width="250" Height="100" Name="Pup_Message_Auto" PlacementTarget="{Binding ElementName=Btn_ShowPupAuto}">
                <Border BorderThickness="1" BorderBrush="#333" Background="#fff">
                    <Label>这是PopUp2弹框 跟随窗口移动</Label>
                </Border>
            </Popup>
        </Grid>
    </Grid>
</Window>

```

xaml.cs

```csharp
		#region Popup操作
        /// <summary>
        /// 打开Pup_Message 信息窗口
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_ShowPup_Click(object sender, RoutedEventArgs e)
        {
            Pup_Message.IsOpen = true;
        }
        private void Btn_ShowPupAuto_Click(object sender, RoutedEventArgs e)
        {
            Pup_Message_Auto.IsOpen = true;
        }
        /// <summary>
        /// 关闭Pup_Message 、Pup_Message_Auto
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_ClosePup_Click(object sender, RoutedEventArgs e)
        {
            if (Pup_Message.IsOpen) Pup_Message.IsOpen = false;
            if (Pup_Message_Auto.IsOpen) Pup_Message_Auto.IsOpen = false;
        }

        /// <summary>
        /// 窗口大小变更事件  窗口位置移动事件
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Window_SizeChanged(object sender, EventArgs e)
        {
            if (!Pup_Message_Auto.IsOpen) return;
            var mi = typeof(Popup).GetMethod("UpdatePosition", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            mi.Invoke(Pup_Message_Auto, null);
        }



        #endregion
```

#### 全局捕获异常

减少未处理的异常导致软件闪退的情况，并作日志记录

![全局异常](https://i.loli.net/2021/09/25/EdfypekJG6iQPnL.gif)

App.xaml.cs   重写 OnStartup 方法

```csharp
		protected override void OnStartup(StartupEventArgs e)
        {
            #region 全局异常捕捉
            //全局异常捕捉  捕捉到未处理的子线程异常，可关闭程序或点击确认直接忽略。异常原因：
            TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;//Task异常 

            //UI线程未捕获异常处理事件（UI主线程）
            this.DispatcherUnhandledException += App_DispatcherUnhandledException;

            //非UI线程未捕获异常处理事件(例如自己创建的一个子线程)
            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
            #endregion
        }

        #region 异常捕捉事件
        /// <summary>
        /// 全局异常捕捉  捕捉到未处理的子线程异常
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void TaskScheduler_UnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
        {
            try
            {
                var exception = e.Exception as Exception;
                if (exception != null)
                {
                    MessageBox.Show($"【UI线程子线程异常】 {exception}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("【UI线程子线程异常】记录异常的时候" + ex.Message);
            }
            finally
            {
                e.SetObserved();
            }
        }

        /// <summary>
        /// UI线程未捕获异常处理事件（UI主线程）
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void App_DispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            try
            {
                MessageBox.Show("【UI线程主线程异常】" + e?.Exception?.ToString() ?? "");
            }
            catch (Exception ex)
            {
                MessageBox.Show("【UI线程主线程异常】记录异常的时候" + ex?.ToString() ?? "");
            }
            finally
            {
                e.Handled = true;
            }
        }

        /// <summary>
        /// 非UI线程未捕获异常处理事件(例如自己创建的一个子线程)  只能做个异常记录  程序还是会崩溃
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            try
            {
                var exception = e.ExceptionObject as Exception;
                if (exception != null)
                {
                    MessageBox.Show("【非UI线程子线程异常】" + exception.ToString());
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("【非UI线程子线程异常】记录异常的时候" + ex?.ToString());
            }
            finally
            {
                //ignore
                
            }
        }
        #endregion
```

以下是测试异常代码

xaml：

```xaml
    <Grid>
        <StackPanel Orientation="Horizontal" Height="30" Margin="0 20 0 20">
            <Label>全局异常捕捉测试</Label>
            <Button Content="触发UI线程异常" Name="Btn_UIEx" Click="Btn_UIEx_Click" ></Button>
            <Button Content="触发UI子线程异常" Name="Btn_ThreadEx" Click="Btn_ThreadEx_Click" Margin="20 0 20 0"></Button>
            <Button Content="触发非UI线程异常" Name="Btn_NotUIEx" Click="Btn_NotUIEx_Click"></Button>
            <Label>非UI线程异常最后还是会闪退</Label>
        </StackPanel>
    </Grid>
```

xaml.cs

```csharp
		#region 异常演示
        /// <summary>
        /// UI主线程异常
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_UIEx_Click(object sender, RoutedEventArgs e)
        {
            string str = null;
            str.ToString();     //报错  空指针异常
        }
        /// <summary>
        /// 非UI线程异常
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_NotUIEx_Click(object sender, RoutedEventArgs e)
        {
            var t1 = new Thread(() => {
                string str = null;
                str.ToString();     //报错  空指针异常
            });
            t1.Start();
            Thread.Sleep(2000);     //保证t1执行完成
        }
        /// <summary>
        /// UI子线程异常
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_ThreadEx_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(() => {
                string str = null;
                str.ToString();     //报错  空指针异常
            });
        }
        #endregion
```

#### 避免软件多开

App.xaml.cs   重写 OnStartup 方法

```csharp
        private static System.Threading.Mutex mutex;
        protected override void OnStartup(StartupEventArgs e)
        {
            #region 避免多开
            mutex = new System.Threading.Mutex(true, "OnlyOne");
            if (mutex.WaitOne(0, false))
            {
                base.OnStartup(e);
            }
            else
            {
                MessageBox.Show("无法重复打开软件");
                this.Shutdown();
                //无法重启
            }
            #endregion
        }
```

测试：打开两次软件看看能不能成功打开

#### 查找父、子元素

xaml

```xaml
    <Grid>
        <StackPanel Orientation="Horizontal" Height="30" Name="SP_Find">
            <Label>查找父子元素演示</Label>
            <Button Content="查找父元素" Name="Btn_FindParent" Click="Btn_FindParent_Click" Margin="20 0 20 0"></Button>
            <Button Content="查找子元素" Name="Btn_FindChild" Click="Btn_FindChild_Click" ></Button>
        </StackPanel>
    </Grid>
```

xaml.cs

```csharp
		#region 查找父子元素
        /// <summary>
        /// 查找父元素 通过当前按钮获取StackPanel
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FindParent_Click(object sender, RoutedEventArgs e)
        {
            var btn = sender as Button;
            if (btn == null) return;
            var parentEL = FindVisualParent<StackPanel>(btn);
            MessageBox.Show("找到元素名为" + parentEL?.Name);
        }

        /// <summary>
        /// 查找子元素  通过StackPanel获取
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FindChild_Click(object sender, RoutedEventArgs e)
        {
            var btnName = (sender as Button)?.Name;
            if (btnName == null) return;
            var childEL = FindVisualChild<Button>(SP_Find);
            MessageBox.Show("找到元素名为" + childEL?.Name);
            var childEL2 = FindVisualChild<Button>(SP_Find, "Btn_FindChild");
            MessageBox.Show("找到元素名为" + childEL2?.Name);
        }

        /// <summary>
        /// 查找父元素
        /// </summary>
        /// <typeparam name="T">要查找的父元素</typeparam>
        /// <param name="childVisual">当前元素</param>
        /// <returns></returns>
        public T FindVisualParent<T>(DependencyObject childVisual)
            where T : DependencyObject
        {
            if (childVisual == null) return null;
            try
            {
                while (childVisual != null)
                {
                    childVisual = VisualTreeHelper.GetParent(childVisual);
                    if (childVisual is T visual) return visual;
                }
            }
            catch (System.Exception)
            {
            }
            return null;
        }


        /// <summary>
        /// 查找子元素 默认查找第一个符合的元素
        /// </summary>
        /// <typeparam name="T">要查找的子元素</typeparam>
        /// <param name="parentVisual">当前元素</param>
        /// <returns></returns>
        public T FindVisualChild<T>(DependencyObject parentVisual)
            where T : DependencyObject
        {
            if (parentVisual == null) return null;
            for (var i = 0; i < VisualTreeHelper.GetChildrenCount(parentVisual); i++)
            {
                var child = VisualTreeHelper.GetChild(parentVisual, i);
                if (child is T dependencyObject)
                {
                    return dependencyObject;
                }

                var childOfChild = FindVisualChild<T>(child);
                if (childOfChild != null) return childOfChild;
            }
            return null;
        }

        /// <summary>
        /// 查找子元素  根据Name来查找元素
        /// </summary>
        /// <typeparam name="T">要查找的子元素</typeparam>
        /// <param name="parentVisual">当前元素</param>
        /// <param name="controlName">元素名称</param>
        /// <returns></returns>
        public T FindVisualChild<T>(DependencyObject parentVisual, string controlName)
            where T : DependencyObject
        {
            if (parentVisual == null) return null;
            for (var i = 0; i < VisualTreeHelper.GetChildrenCount(parentVisual); i++)
            {
                var child = VisualTreeHelper.GetChild(parentVisual, i);
                if (child is T childVisual && child is Control control && control.Name == controlName)
                {
                    return childVisual;
                }

                var childOfChild = FindVisualChild<T>(child, controlName);
                if (childOfChild != null) return childOfChild;
            }
            return null;
        }
        #endregion
```

#### 打开资源文件

更多请参考：[C# Process.Start()方法详解 调用其他exe 程序_大佛爷的博客-CSDN博客](https://blog.csdn.net/qq_36074218/article/details/115525905)

```csharp
        #region 打开本地资源文件
        /// <summary>
        /// 打开文件夹
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_OpenDir_Click(object sender, RoutedEventArgs e)
        {
            var path = AppDomain.CurrentDomain.BaseDirectory;
            System.Diagnostics.Process.Start("explorer.exe", path);
        }
        /// <summary>
        /// 打开test.txt  
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_OpenTxt_Click(object sender, RoutedEventArgs e)
        {
            var path = AppDomain.CurrentDomain.BaseDirectory + "test.txt";
            System.Diagnostics.Process.Start("explorer.exe", path);
        }
        #endregion
```

#### 获取各网站的 favicon、获取 bitmapFrame

xaml

```xaml
    <Grid>
        <StackPanel Orientation="Horizontal" Height="30">
            <Label>favicon演示</Label>
            <Button Content="获取百度的favicon" Name="Btn_FavRequest" Click="Btn_FavRequest_Click" ></Button>
            <Image Width="16" Height="16" Grid.Column="0" Visibility="Hidden" Name="Img_Baidu"/>
            <Button Content="使用本地的favicon" Name="Btn_FavFile" Click="Btn_FavFile_Click" Margin="20 0 20 0"></Button>
            <Image Width="16" Height="16" Grid.Column="0" Visibility="Hidden" Name="Img_File"/>
            <Button Content="清空Favicon" Name="Btn_FavClear" Click="Btn_FavClear_Click" ></Button>
            <Button Content="保存Favicon并打开" Name="Btn_FavSave" Click="Btn_FavSave_Click" Margin="20 0 20 0"></Button>
        </StackPanel>
    </Grid>
```

xaml.cs

```csharp
		#region Favicon演示
        /// <summary>
        /// 使用百度的Favicon
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FavRequest_Click(object sender, RoutedEventArgs e)
        {
            Img_Baidu.Visibility = Visibility.Visible;
            var favPath = "http://www.baidu.com/favicon.ico";
            Img_Baidu.Source = GetBitmapFrame(favPath);
        }
        /// <summary>
        /// 使用本地的Favicon
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FavFile_Click(object sender, RoutedEventArgs e)
        {
            Img_File.Visibility = Visibility.Visible;
            var path = AppDomain.CurrentDomain.BaseDirectory + "favicon.ico";
            Img_File.Source = GetBitmapFrame(path);
        }

        /// <summary>
        /// 根据地址获取图片资源  可以是本地资源文件、http网络资源文件
        /// </summary>
        /// <returns></returns>
        public static ImageSource GetBitmapFrame(string httpUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(httpUrl)) return null;
                return new BitmapImage(new Uri(httpUrl, UriKind.RelativeOrAbsolute));
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// 清空Favicon
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FavClear_Click(object sender, RoutedEventArgs e)
        {
            Img_Baidu.Visibility = Visibility.Hidden;
            Img_File.Visibility = Visibility.Hidden;
            Img_Baidu.Source = null;
            Img_File.Source = null;
        }
        /// <summary>
        /// 保存Favicon到本地并打开
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Btn_FavSave_Click(object sender, RoutedEventArgs e)
        {
            var favPath = "http://www.baidu.com/favicon.ico";
            var fullPath = AppDomain.CurrentDomain.BaseDirectory + Guid.NewGuid() + ".ico";
            SavePhotoFromUrl(fullPath, favPath);
            System.Diagnostics.Process.Start("explorer.exe", fullPath);
        }
        /// <summary>
        /// 从图片地址下载图片到本地磁盘
        /// </summary>
        /// <param name="ToLocalPath">图片本地磁盘地址</param>
        /// <param name="Url">图片网址</param>
        /// <returns></returns>
        public static void SavePhotoFromUrl(string fullName, string url)
        {
            WebResponse response = null;
            Stream stream = null;
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                response = request.GetResponse();
                stream = response.GetResponseStream();
                using (Bitmap image = new Bitmap(stream))
                {
                    image.Save(fullName);
                }
            }
            catch (Exception ex)
            {
            }
        }

        #endregion
```

#### Converter过滤器

常用于状态值转换与判断，如数据库存储 [0,1,2] 页面上需要显示 [成功,失败,未知]，或者根据状态值显示不同的颜色：0--blue，1--red，2--black 等等，如果用过vue，可以理解为vue的过滤器

ConverterParameter：传递过滤器的参数，如转换时间时，可以把时间格式（yyyy-MM-dd HH:mm:ss）传入，需要注意的是 ConverterParameter 不是依赖属性  所以不能用 Binding 来绑定值，如果非要处理两个绑定值的话，用 MultiBinding 来处理

下面主要介绍Converter基本使用，converter 携带参数（ConverterParameter），converter 携带多参数（MultiBinding），converter 绑定父元素的属性（绑定父组件的值演示）。

xaml

```xaml
        <!--xmlns:converter="clr-namespace:Wpf.Demo.ConverterHelper"
	引入过滤器-->
		<Grid x:Name="Grid_Converter">
        <Grid.Resources>
            <converter:StateToTextConverter x:Key="StateToTextConverter"></converter:StateToTextConverter>
            <converter:StateToBrushConverter x:Key="StateToBrushConverter"></converter:StateToBrushConverter>
            <converter:StateCountConverter x:Key="StateCountConverter"></converter:StateCountConverter>
            <converter:StateParamToTextConverter x:Key="StateParamToTextConverter"></converter:StateParamToTextConverter>
        </Grid.Resources>
        <StackPanel Orientation="Horizontal" Height="30">
            <Label>Converter演示 点我</Label>
            <Button Content="{Binding State,Converter={StaticResource ResourceKey=StateToTextConverter}}" Foreground="{Binding State,Converter={StaticResource StateToBrushConverter}}"
                        Command="{Binding ChangeStateCommand}"></Button>
            <Label>绑定具体参数演示？点我</Label>
            <Button Content="{Binding State,Converter={StaticResource ResourceKey=StateParamToTextConverter},ConverterParameter=哈哈哈}"
                        Command="{Binding ChangeStateCommand}"></Button>

            <Label>Converter绑定两个参数？点我5次</Label>
            <!--//错误示范  ConverterParameter不是依赖属性  所以不能用Binding 
                <Button Content="{Binding State,Converter={StaticResource ResourceKey=StateToTextConverter}}" Foreground="{Binding State,Converter={StaticResource StateToBrushConverter},ConverterParameter={Binding Count}}"
                        Command="{Binding ChangeStateAndCountCommand}"></Button>-->
            <Button Content="{Binding State,Converter={StaticResource ResourceKey=StateToTextConverter}}" Command="{Binding ChangeStateAndCountCommand}">
                <Button.Foreground>
                    <MultiBinding Converter="{StaticResource StateCountConverter}">
                        <Binding Path="State"></Binding>
                        <Binding Path="Count"></Binding>
                    </MultiBinding>
                </Button.Foreground>
            </Button>
        </StackPanel>
        <StackPanel Orientation="Horizontal" Height="30" Margin="0 100 0 0" DataContext="{Binding CurrentArticle}" >
            <Label>绑定父组件的值演示</Label>
            <Label>作者：</Label>
            <TextBlock Text="{Binding Author}"></TextBlock>
            <Label>标题：</Label>
            <TextBlock Text="{Binding Title}" FontWeight="Bold"></TextBlock>
            <Label>内容：</Label>
            <TextBlock Text="{Binding Content}" Foreground="#555"></TextBlock>
            <Button Command="{Binding ArticleClickCommand}" Margin="20 0">删除文章(无效)</Button>
            <Button Command="{Binding Path=DataContext.ArticleClickCommand,ElementName=SP_Converter}">删除文章(有效)</Button>
        </StackPanel>
    </Grid>
```

xaml.cs  构造函数绑定数据源

```csharp
        public ConverterPage()
        {
            InitializeComponent();
            Grid_Converter.DataContext = new SpConverterVM();
        }
```

SpConverterVM：[WpfCommonDemo/SpConverterVM.cs at main · logerlink/WpfCommonDemo (github.com)](https://github.com/logerlink/WpfCommonDemo/blob/main/ViewModel/SpConverterVM.cs)

StateConverter.cs    过滤器逻辑（核心）

```csharp
    class StateConverter
    {
    }

    /// <summary> 
    /// state转文字  指定传进来的是int类型，回传回去的是string类型
    /// </summary>
    [ValueConversion(typeof(int), typeof(string))]
    public class StateToTextConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            int.TryParse(value?.ToString(),out int intValue);
            return intValue == 1?"完成":"取消";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    /// <summary> 
    /// state转 Brushes
    /// </summary>
    public class StateToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            int.TryParse(value?.ToString(), out int intValue);
            return intValue == 1 ? Brushes.Blue : Brushes.Red;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    /// <summary> 
    /// state转文字  指定传进来的是int类型，回传回去的是string类型
    /// </summary>
    [ValueConversion(typeof(int), typeof(string))]
    public class StateParamToTextConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            var str = parameter?.ToString() ?? "";
            int.TryParse(value?.ToString(), out int intValue);
            return intValue == 1 ? "完成"+ str : "取消";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
    

    /// <summary>
    /// state count 为null "" 返回红色
    /// state == 0 返回红色
    /// state == 1 && count>=5 返回黄色
    /// state == 1 返回蓝色
    /// true 返回 Visible
    /// </summary>
    public class StateCountConverter : IMultiValueConverter
    {
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            try
            {
                if (values == null || values.Length < 2) return Brushes.Red;
                var state = values[0]?.ToString();
                var count = values[1]?.ToString();
                if(string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(count)) return Brushes.Red;
                int.TryParse(state,out int stateInt);
                int.TryParse(count, out int countInt);
                if(stateInt == 0) return Brushes.Red;
                else
                {
                    return countInt >= 5 ? Brushes.Yellow : Brushes.Blue;
                }
            }
            catch (Exception)
            {
                return Brushes.Red;
            }
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
```

#### Page和Frame实现页面切换

首先常见的页面切换可以分为两种：TabControl、(Page+Frame)，由于 TabControl 简单易用，这里就不多介绍了。主要介绍一下Page，主程序也是用(Page+Frame+反射)实现的，我简单举个页面来讲一下吧

Frame元素设置 NavigationUIVisibility="Hidden" ，关闭默认的导航栏

(Page+Frame)切换时，会重置 Page 的内容。（如在page1填了表单，切换到page2，再切回page1，这时候page1的表单已经重置了）如果不希望切换菜单时重置Page，那么我们可以用一个字典把我们的Page暂存一下。

Frame 的 Navigate 方法会重置 Page 内容。

xaml

```xaml
<Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="65"></ColumnDefinition>
            <ColumnDefinition Width="*"></ColumnDefinition>
        </Grid.ColumnDefinitions>
        <ListView Background="#ebebeb" SelectionChanged="LV_Menu_SelectionChanged" Name="LV_Menu" Loaded="LV_Menu_Loaded">
            <ListView.Resources>
                <Style TargetType="ListViewItem">
                    <Setter Property="BorderThickness" Value="0"></Setter>
                    <Setter Property="FontSize" Value="16"></Setter>
                    <Setter Property="Height" Value="30"></Setter>
                    <Style.Triggers>
                        <Trigger Property="IsSelected" Value="True">
                            <Setter Property="Foreground" Value="Red"></Setter>
                            <Setter Property="BorderThickness" Value="0"></Setter>
                        </Trigger>
                    </Style.Triggers>
                </Style>
            </ListView.Resources>
            <ListViewItem IsSelected="True" Name="LVI_Message">
                信息
            </ListViewItem>
            <ListViewItem Name="LVI_Docs">
                文档
            </ListViewItem>
        </ListView>
        <Frame Grid.Column="1" x:Name="Frame_Page" NavigationUIVisibility="Hidden">

        </Frame>
    </Grid>
```

xaml.cs

```csharp
		#region 切换页面
        /// <summary>
        /// 页面存储区
        /// </summary>
        Dictionary<string, Page> PageDic = new Dictionary<string, Page>();
        /// <summary>
        /// 点击菜单切换时
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void LV_Menu_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var selectItem = LV_Menu.SelectedItem as ListViewItem;
            var name = selectItem?.Name?.ToString();
            DrawFrame(name);
        }
        /// <summary>
        /// 加载完成时间 比LV_Menu_SelectionChanged晚
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void LV_Menu_Loaded(object sender, RoutedEventArgs e)
        {
            var selectItem = LV_Menu.SelectedItem as ListViewItem;
            var name = selectItem?.Name?.ToString();
            DrawFrame(name);
        }
        /// <summary>
        /// 渲染Frame
        /// </summary>
        /// <param name="name"></param>
        private void DrawFrame(string name)
        {
            Page pageContent = null;
            switch (name)
            {
                case "LVI_Message":
                    {
                        if (PageDic.ContainsKey(name))
                        {
                            pageContent = PageDic[name];
                        }
                        else
                        {
                            pageContent = new MessagePage();
                            PageDic.Add(name, pageContent);
                        }
                        break;
                    }
                case "LVI_Docs":
                    {
                        pageContent = new DocsPage();
                        break;
                    }
                default:
                    break;
            }
            if (Frame_Page != null) Frame_Page.Content = pageContent;
        }

        #endregion
```

#### Invoke和BeginInvoke

为什么要用 Invoke 和 BeginInvoke ? 当我们在执行程序逻辑时，需要持续更改UI的显示（如更新进度条），这个时候如果直接修改UI，就会造成UI假死的情况，只会显示最后结果.

![Invoke展示](https://i.loli.net/2021/09/25/fIL2WyPmDjGaHnS.gif)

xaml

```xaml
    <Grid>
        <StackPanel Orientation="Horizontal" Height="30">
            <Label>正常演示(UI卡死)</Label>
            <Button Name="Btn_Normal" Click="Btn_Normal_Click" Content="正常执行"></Button>
            <Label>异常演示(报错)</Label>
            <Button Name="Btn_Except" Click="Btn_Except_Click" Content="异常执行"></Button>
            <Label>invoke演示</Label>
            <Button Name="Btn_Invoke" Click="Btn_Invoke_Click" Content="Invoke执行"></Button>
            <Label>beginInvoke演示</Label>
            <Button Name="Btn_BeginInvoke" Click="Btn_BeginInvoke_Click" Content="BeginInvoke执行"></Button>
            
        </StackPanel>
        <StackPanel Margin="0 100 0 0"  Orientation="Horizontal" Height="30">
            <Label>invoke和beginInvoke的区别</Label>
            <Button Name="Btn_InvokeDiff" Click="Btn_InvokeDiff_Click" Content="点击查看"></Button>
            <Label Name="Lb_Invoke"></Label>
        </StackPanel>
    </Grid>
```

xaml.cs

```csharp
#region Invoke和BeginInvoke演示
        private void Btn_Normal_Click(object sender, RoutedEventArgs e)
        {
            for (int i = 0; i < 5; i++)
            {
                Thread.Sleep(1000);
                Lb_Invoke.Content = i;
            }
        }

        private void Btn_Except_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(() => {
                try
                {
                    for (int i = 0; i < 5; i++)
                    {
                        Thread.Sleep(1000);
                        Lb_Invoke.Content = i;
                    }
                }
                catch (Exception ex)
                {
                    //调用线程无法访问此对象，因为另一个线程拥有该对象。
                    MessageBox.Show(ex.Message);
                }
            });
        }
        private void Btn_Invoke_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(() => {
                try
                {
                    // 要用for包Invoke  不能用Invoke包for
                    for (int i = 0; i < 5; i++)
                    {
                        Thread.Sleep(1000);
                        this.Dispatcher.Invoke(() => {
                            Lb_Invoke.Content = i;
                        });
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            });

        }

        private void Btn_BeginInvoke_Click(object sender, RoutedEventArgs e)
        {
            Task.Run(() => {
                try
                {
                    // 要用for包BeginInvoke  不能用BeginInvoke包for
                    for (int i = 0; i < 5; i++)
                    {
                        Thread.Sleep(1000);
                        MessageBox.Show("当前的i值" + i);
                        //BeginInvoke是异步的   调用BeginInvoke是会继续往下执行代码，即先执行i++再到BeginInvoke里面的代码
                        this.Dispatcher.BeginInvoke(new Action(() => {
                            Lb_Invoke.Content = i;
                        }));
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            });
        }

        private void Btn_InvokeDiff_Click(object sender, RoutedEventArgs e)
        {
            Lb_Invoke.Content = "";
            var message = "";
            message += "Invoke执行前——";
            this.Dispatcher.Invoke(() => {
                message += "Invoke执行中——";
            });
            message += "Invoke执行结束——";

            message += "BeginInvoke执行前——";
            this.Dispatcher.BeginInvoke(new Action(() => {
                message += "BeginInvoke执行中——";      //在最后面
                Lb_Invoke.Content = message;
            }));
            message += "BeginInvoke执行结束——";

            //Lb_Invoke.Content = message; 不能放这里  要放在BeginInvoke里面才算完整
        }

        #endregion
```

#### 常见问题

##### 当前上下文中不存在名称"InitializeComponent"

解决方案：xaml和xaml.cs的命名空间不一致，改为一致就可以了

![image-20210908175426784](https://i.loli.net/2021/09/08/GfUZxrwNJHb2cOa.png)

##### Wpf自定义窗体标题栏顶部出现白边

这是因为设置了 WindowStyle="None" 的缘故，去掉白边需要再加上 AllowsTransparency="True" ，至于下文说的 借助 WindowChrome 来处理  ，我大概试了一下，没用，不知道是不是我实现有问题。

[wpf窗口顶端白边问题_已解决_博问_博客园 (cnblogs.com)](https://q.cnblogs.com/q/77246/)