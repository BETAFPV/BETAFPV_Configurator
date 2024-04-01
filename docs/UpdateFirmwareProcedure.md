## How to install BETAFPV firmware on your FC:

Using BETAFPV Configurator, select the Firmware Flasher tab and select what firmware to flash in one of two different ways, online or local firmware.
  1. Load online firmware.   
Select Target and Version in the upper left corner. Press "Load Firmwar {Online]", lower right part of the screen. 
  2. Load local firmware.   
 Press the "Load firmware [Local]" button, you can now browse to the folder you have the local firmware file. Select the correct firmware bin-file matching your Flight Controller. 

## How to update the firmware 
1. Power off.
2. Hold the button on the FC board.
3. Power on the FC board(via battery or USB),LED will be solid white if done correctly.
4. Release the button now.Connect the FC to the computer via USB date cable.
5. Select the correct COM port and click 'Connect'button on the top right of this page.
6. Select the correct firmware and version at the top of this page and click the button "Load Firmwar {Online]" or  "Load firmware [Local]",press "Flash firmware".When flashing successfully, the FC wil re-start automatically.

 All this assumes you have the correct drivers etc setup correctly, read further on for details.


## If you are having trouble connecting to your flight controller

1. Open 'Device Manager' on your PC,you can see there's a new device named 'MMF103Virtual COM Port' here.

2. Right click the 'MMF103Virtual COM Port' and select 'Update driver'.
 ![updateDriver1](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver1.png)

3. search the avaliable drivers by click 'Brower my computer for drivers'-->'Let me pick from a list of avaliable drivers on my computer'
![updateDriver2](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver2.png)
![updateDriver3](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver3.png)

4. Update it to either 'STMicroelectronics Virtual COM Port' or 'USB Serial Device',click 'Next'.
![updateDriver4](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/updateDriver4.png)

5. After the above steps there's a new 'COMx' device on the Ports of 'Device Manger',you can connect your flight controller normally now.

![USBSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/USBSerialPort.png)
![stmVCP](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/stmVCP.png)
![CorrectSerialPort](https://github.com/hexaforce/BETAFPV_Configurator/blob/main/docs/image/updateVCP/CorrectSerialPort.png)




The STM32 VCP driver can be downloaded here --> http://www.st.com/web/en/catalog/tools/PF257938
