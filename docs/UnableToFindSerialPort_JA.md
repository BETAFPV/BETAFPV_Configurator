## If you are having trouble connecting to your flight controller
1. Connect the FC to the computer via USB data cable.

2. Open 'Device Manager' on your PC,you can see there's a new device named 'MMF103Virtual COM Port' here.

3. Right click the 'MMF103Virtual COM Port' and select 'Update driver'.
 ![updateDriver1](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver1.png)

4. search the avaliable drivers by click 'Brower my computer for drivers'-->'Let me pick from a list of avaliable drivers on my computer'
![updateDriver2](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver2.png)
![updateDriver3](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver3.png)

5. Update it to either 'STMicroelectronics Virtual COM Port' or 'USB Serial Device',click 'Next'.
![updateDriver4](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver4.png)

6. After the above steps there's a new 'COMx' device on the Ports of 'Device Manger',you can connect your flight controller normally now.

![USBSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/USBSerialPort.png)
![stmVCP](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/stmVCP.png)
![CorrectSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/CorrectSerialPort.png)



## If you are having trouble connecting to your liteRadio for Updating the firmware
The serial port is only used when updating firmware. If you just want to configure the liteRadio,just need to click the 'Connect RC' directly.

1. Connect the liteRadio to the computer via USB data cable in bootloader state（hold on setup button then power on）.

2. Open 'Device Manager' on your PC,you can see there's a new device named 'STM32 Vritual COM Port' here.

![STM32VritualCOMPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/STM32VritualCOMPort.png)

3. Right click the 'MMF103Virtual COM Port' and select 'Update driver'.

![updateDriverStep1](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/updateDriverStep1.png)


4. search the avaliable drivers by click 'Brower my computer for drivers'-->'Let me pick from a list of avaliable drivers on my computer'

![updateDriverStep2](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/updateDriverStep2.png)
![updateDriverStep3](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/updateDriverStep3.png)

5. Update it to either 'STMicroelectronics Virtual COM Port' or 'USB Serial Device',click 'Next'.


![updateDriverStep4](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/updateDriverStep4.png)

6. After the above steps there's a new 'COMx' device on the Ports of 'Device Manger',you can connect your flight controller normally now.

![updateDriverStep5](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateToUSBSerialDevice/updateDriverStep5.png)


The STM32 VCP driver can be downloaded here --> http://www.st.com/web/en/catalog/tools/PF257938
