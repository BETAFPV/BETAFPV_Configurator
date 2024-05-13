
## 连接飞控后，地面站无法识别到COM口解决方法

1. 将飞控通过USB连接至电脑，打开电脑设备管理器，找到设备'MMF103Virtual COM Port'。

2. 右键点击'MMF103Virtual COM Port' 选择 '更新驱动程序'.
 ![updateDriver1](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/updateDriver1.png)

3. 点击 '浏览我的电脑以查找驱动程序'-->'让我从计算机上的可用程序列表中选取'。
![updateDriver2](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/updateDriver2.png)
![updateDriver3](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/updateDriver3.png)

4. 选择 'STMicroelectronics Virtual COM Port' 或者 'USB Serial Device'其中一个,然后点击'下一页'。
![updateDriver4](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/updateDriver4.png)

5. 完成以上步骤后，在设备管理器中的“端口（COM和LPT）”栏出现一个COMx口，说明驱动更新完成。

![USBSerialPort](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/USBSerialPort.png)
![stmVCP](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/stmVCP.png)
![CorrectSerialPort](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateVCP/CorrectSerialPort.png)

STM32 VCP 驱动下载连接 --> http://www.st.com/web/en/catalog/tools/PF257938

## 遥控器固件更新时，连接遥控器地面站无法识别到COM口解决方法
COM口只用于固件更新使用，若只是连接遥控器对其进行配置，只需要在遥控器关机状态下直接点击“连接遥控器”按钮即可。

1. 首先确保遥控器进入bootloader状态（按住setup按钮开机），通过USB将遥控器连接至电脑

2. 打开电脑“设备管理”，可以发现多了一个名为“STM32 Vritual COM Port”的设备。

![STM32VritualCOMPort_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/STM32VritualCOMPort_CN.png)

3. 右键点击“STM32 Vritual COM Port”选择 '更新驱动程序'.

![updateDriverStep1_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/updateDriverStep1_CN.png)

4. 点击 '浏览我的电脑以查找驱动程序'-->'让我从计算机上的可用程序列表中选取'。

![updateDriverStep2_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/updateDriverStep2_CN.png)

![updateDriverStep3_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/updateDriverStep3_CN.png)


5. 选中'USB Serial Device',然后点击'下一页'。

![updateDriverStep4_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/updateDriverStep4_CN.png)

6. 完成以上步骤后，在设备管理器中的“端口（COM和LPT）”栏出现一个COMx口，说明驱动更新完成。

![updateDriverStep5_CN](https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/image/updateToUSBSerialDevice/updateDriverStep5_CN.png)


