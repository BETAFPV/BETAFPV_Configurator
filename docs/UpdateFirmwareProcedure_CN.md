## 如何加载飞控固件

打开BETAFPV Configurator地面站, 可通过以下两种方式加载固件：
  1. 从网络加载固件.   
在“固件烧写工具”左上角选择栏中选择飞控型号以及固件版本号，接着点击右下角的“从网络加载固件”，地面站将自动从服务器远程加载固件至你的电脑上. 
  2. 从本地电脑加载固件.   
点击右下角的“从本地加载固件”按钮, 在对话框中浏览电脑文件夹，找到飞控对应的bin文件并打开。

## 固件更新步骤
1. 飞控断电。
2. 按住飞控底部的按键。
3. 上电（通过电池或者USB上电都可以），如果操作正确，飞控底部LED灯白色常亮，表示已经处于固件烧写状态。
4. 松开飞控底部按键，将飞控通过USB数据线连接电脑。
5. 飞控将会被识别为COM口，在右上角选择其对应的COM口和波特率（默认使用115200），再点击“连接”按钮，按钮变为红色且显示“更新固件”则表示连接成功。
6. 点击从网络加载固件（或者从本地电脑加载固件）。上位机能够自动识别加载的固件类型（飞控固件、OSD固件或者传感器固件），并且点亮右下角对应的“烧写xxx”按钮，点击该按钮开始烧写。
7. 等待烧写进度条提示烧写完成，飞控将可以自动重启。



## 连接飞控后，地面站无法识别到COM口解决方法

1. 将飞控连接至电脑，打开电脑设备管理器，找到设备'MMF103Virtual COM Port'。

2. 右键点击'MMF103Virtual COM Port' 选择 '更新驱动程序'.
 ![updateDriver1](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver1.png)

3. 点击 '浏览我的电脑以查找驱动程序'-->'让我从计算机上的可用程序列表中选取'。
![updateDriver2](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver2.png)
![updateDriver3](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver3.png)

4. 选择 'STMicroelectronics Virtual COM Port' 或者 'USB Serial Device'其中一个,然后点击'下一页'。
![updateDriver4](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver4.png)

5. 完成以上步骤后，在设备管理器中的“端口（COM和LPT）”栏出现一个COMx口，说明驱动更新完成。

![USBSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/USBSerialPort.png)
![stmVCP](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/stmVCP.png)
![CorrectSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/CorrectSerialPort.png)




STM32 VCP驱动下载地址 --> http://www.st.com/web/en/catalog/tools/PF257938
