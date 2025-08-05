const serialport = require('serialport');
const semver = require('semver');
var liteRadio_configurator_version ="v2.0";
var {shell} = require('electron');
var HID = require('node-hid');
var lastUsbCount = 0;
var Command_ID = {
    CHANNELS_INFO_ID:0x01,
    Lite_CONFIGER_INFO_ID:0x05,
    INTERNAL_CONFIGER_INFO_ID:0x06,
    EXTERNAL_CONFIGER_INFO_ID:0x07,
    EXTRA_CUSTOM_CONFIG_ID:0x08,
    DEVICE_INFO_ID:0x5A,
    REQUEST_INFO_ID:0x11,
    REQUESET_SAVE_ID:0x12
};
var CommandType = {
    requestCommond : 0x00,
    requestChannelConfig:0x01,
    requestRadioConfig:0x02,
    requestDeviceInfo:0x03,
    request_extra_config:0x04
}
var liteRadioUnitType = {
    UNKNOW:0x00,
    LiteRadio_2_SE:0x01,
    LiteRadio_2_SE_V2_SX1280:0x02,
    LiteRadio_2_SE_V2_CC2500:0x03,
    LiteRadio_3_SX1280:0x04,
    LiteRadio_3_CC2500:0x05,
    LiteRadio_1_CC2500:0x06,
    LiteRadio_4_SE_SX1280:0x07,
}
var internalRadioType = {
    UNKNOW:0x00,
    CC2500:0x01,
    SX1280:0x02,
}
var Channel = {
    CHANNEL1:0x00,
    CHANNEL2:0x01,
    CHANNEL3:0x02,
    CHANNEL4:0x03,
    CHANNEL5:0x04,
    CHANNEL6:0x05,
    CHANNEL7:0x06,
    CHANNEL8:0x07,
    CHANNEL9:0x08,
    CHANNEL10:0x09,
};
var HidConnectStatus = {
    connected:0x00,     //已连接
    connecting:0x01,    //连接中
    disConnecting:0x02, //断开连接中
    disConnect:0x03,    //未连接
}
var RFmodule = {
    CC2500:0x00,
    SX1280:0x01,
    SX1276:0x02,
}
var rcUsbProtocol = {
    UNKNOW_USB_PROTOCOL:0x00,
    HID_USB_PROTOCOL:0x01,
    CDC_USB_PROTOCOL:0x02,
}
var literadioScreenIndex = {
    LITERADIO_SCREEN_WELCOME:0x00,
    LITERADIO_SCREEN_FLASH:0x01,
}
var hidDevice = null;
var ch_receive_step  = 0;
var requestTimeout = 0;
HidConfig = {
    /**************HidConfig中定义的变量保存当前界面组件的数值*******************/

    //当前HID的连接状态
    HID_Connect_State:HidConnectStatus.disConnect,

    //要开启开关机状态
    LiteRadio_power:false,
    
    //当前使用的协议
    current_protocol:0,
    //支持的功率
    support_power:0,
    
    //遥控器型号
    lite_radio_device:0,

    //内置射频模块型号
    internal_radio:0,

    //硬件左右手油门杆位置
    throttle_rocker_position:0,

    //用于判断遥控器发送过来的硬件信息是出厂预存进flash的（等于0xa55a）
    Hardware_info_storage_mark:0,

    //硬件版本号
    hardware_major_version:0,
    hardware_minor_version:0,
    hardware_pitch_version:0,

    //固件版本号
    firmware_major_version:0,
    firmware_minor_version:0,
    firmware_pitch_version:0,

    //固件版本号
    lite_Radio_version:'0.0.0',

    //0美国手、1日本手模式
    rocker_mode:0,

    //Trainer 口开关
    trainer_port:0,

    channel_data :[],//HID发送过来的原始数据
    channel_data_dispaly :[],//映射为-100~100用于显示

    //通道数据来源
    ch1_input_source_display:0,
    ch2_input_source_display:1,
    ch3_input_source_display:2,
    ch4_input_source_display:3,
    ch5_input_source_display:4,
    ch6_input_source_display:5,
    ch7_input_source_display:6,
    ch8_input_source_display:7,
    ch9_input_source_display:8,
    ch10_input_source_display:9,

    //通道缩放比例（0-100对应0%-100%）
    ch1_scale_display:100,
    ch2_scale_display:100,
    ch3_scale_display:100,
    ch4_scale_display:100,
    ch5_scale_display:100,
    ch6_scale_display:100,
    ch7_scale_display:100,
    ch8_scale_display:100,
    ch9_scale_display:100,
    ch10_scale_display:100,

    //通道偏移补偿
    ch1_offset_display:0,
    ch2_offset_display:0,
    ch3_offset_display:0,
    ch4_offset_display:0,
    ch5_offset_display:0,
    ch6_offset_display:0,
    ch7_offset_display:0,
    ch8_offset_display:0,
    ch9_offset_display:0,
    ch10_offset_display:0,

    //通道值反转
    ch1_reverse_display:0,
    ch2_reverse_display:0,
    ch3_reverse_display:0,
    ch4_reverse_display:0,
    ch5_reverse_display:0,
    ch6_reverse_display:0,
    ch7_reverse_display:0,
    ch8_reverse_display:0,
    ch9_reverse_display:0,
    ch10_reverse_display:0,

    //内外置射频模块开关
    Internal_radio_module_switch:0,
    External_radio_module_switch:0,

    //ExpressLRS系统参数配置
    ExpressLRS_power_option_value:null,
    ExpressLRS_pkt_rate_option_value:null,
    ExpressLRS_tlm_option_value:null,
    ExpressLRS_RF_freq_value:null,

    //外置射频模块供电开关
    External_radio_module_power_switch:null,    

     //内部射频模块配置信息
    internal_radio_protocol:0,

    //外置射频模块配置信息
    external_radio_protocol:0,//协议选择

    //用于首次连接HID设备时，判断是否有接收到遥控器HID数据，若只识别到HID设备但无数据接收则判断为连接失败
    Have_Receive_HID_Data:false,

    bind_phrase_switch:false,
    bind_phrase_input:0,
    uid_bytes:0,

    firmware_comparison:0,

    //蜂鸣器和死区
    BuzzerSwitch:0,
    JoystickDeadZonePercent:0,
    switchLockMode_SE:0,          //SE锁定模式，仅LR4 SE可见
    switchLockMode_SF:0,          //SF锁定模式，仅LR4 SE可见

    //USB协议
    usedUSBProtocol:0,  //0,HID设备    1,VCOM（虚拟串口）设备
};

/*固件版本检查*/
// HidConfig.compareFirmwareVersion = function(){
//     if(HidConfig.internal_radio == RFmodule.SX1280 
//     && getLiteRadioUnitType() < liteRadioUnitType.LiteRadio_4_SE_SX1280){//若为 SX1280 1.0.0版本固件：提示客户更新固件以使用新功能bind phrase
//         if(semver.eq(HidConfig.lite_Radio_version, '1.0.0')){
//             const dialogVersionNotMatched = $('.dialogVersionNotMatched')[0];
//             let labeText = i18n.getMessage("upgrade_the_firmware_of_liteRadio");
//             $('label[id="VersionNotMatchedDialogLabel"]').text(labeText);
//             dialogVersionNotMatched.showModal();
//             $('.VersionNotMatched-confirmbtn').click(function() {
//                 dialogVersionNotMatched.close();
//             });
//         }
//     }
// }

//获取当前使用的USB协议
function getUsedUSBProtocol() {
    return HidConfig.usedUSBProtocol;
}

//获取当前遥控器型号（序列号）
function getLiteRadioUnitType() {
    return HidConfig.lite_radio_device;
}

//VCOM发送数据
function usbVcomSendData(buf) {
    port.write(buf);
}

//HID发送数据，带错误检测和处理
function usbHidSendData(buf) {
    if(hidDevice.write !== undefined){
        hidDevice.write(buf);
    }else{
        HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
        $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
        const dialogHIDisDisconnect = $('.dialogHIDisDisconnect')[0];
        dialogHIDisDisconnect.showModal();
        $('.HIDisDisconnect-confirmbtn').click(function() {
            dialogHIDisDisconnect.close();
        });
        $('#tabs ul.mode-connected').hide();
        $('#tabs ul.mode-disconnected').show();
        $('#tabs ul.mode-disconnected li a:first').click();
        $('div#hidbutton a.connect').removeClass('active');
    }
}


//USB选择对应的协议发送打包好的数据给遥控器
function usbSendData(data) {
    if(HidConfig.usedUSBProtocol) {
        usbVcomSendData(data);
    }else{
        let hidBuffer= new Buffer.alloc(64);
        if(data[0] != 0x00) {   //和串口不同，hid的数据要在第一个字节写个0x00，后面内容都一样。
            //修正数据并扩展为64字节
            hidBuffer[0] = 0x00;
            for(let i=1; i<8; i++) {
                hidBuffer[i] = data[i-1];
            }
            usbHidSendData(hidBuffer);
        }else{
            for(let i=0; i<8; i++) {
                hidBuffer[i] = data[i];
            }
            usbHidSendData(hidBuffer);
        }
    }
    //console.log("Send data to RC:", data);
}

//检查特定USB设备是否存在
function checkUsbConnected() {
    let usbPathText = ($('div#port-picker #port option:selected').text());  //获取当前下拉框选中的串口号文本内容
    if(usbPathText.indexOf('HID') != -1){
        return rcUsbProtocol.HID_USB_PROTOCOL;
    }
    if(usbPathText.indexOf('COM') != -1){
        return rcUsbProtocol.CDC_USB_PROTOCOL;
    }
    return rcUsbProtocol.UNKNOW_USB_PROTOCOL;
}

//让LR4 SE关闭高频头电源
function HIDNotice_LiteRadio4SE_DisableRF(){
    let sendBuffer = new Buffer.alloc(8);
    sendBuffer[0] = Command_ID.REQUEST_INFO_ID;
    sendBuffer[1] = 0x00;
    sendBuffer[2] = 0x04;
    usbSendData(sendBuffer);
    console.log("Send disable RF:",sendBuffer);
}
//让LR4 SE打开高频头电源
function HIDNotice_LiteRadio4SE_EnableRF(){
    let sendBuffer = new Buffer.alloc(8);
    sendBuffer[0] = Command_ID.REQUEST_INFO_ID;
    sendBuffer[1] = 0x00;
    sendBuffer[2] = 0x03;
    usbSendData(sendBuffer);
    console.log("Send enable RF:",sendBuffer);
}
//让遥控器停止发送配置信息
function HIDStopSendingConfig(){
    let sendBuffer = new Buffer.alloc(8);
    sendBuffer[0] = Command_ID.REQUEST_INFO_ID;
    sendBuffer[1] = 0x00;
    sendBuffer[2] = 0x01;
    usbSendData(sendBuffer);
    console.log("Send stop sending RF:",sendBuffer);
}
function HIDRequestChannelConfig(channel_num){
    let sendBuffer = new Buffer.alloc(8);
    sendBuffer[0] = Command_ID.REQUEST_INFO_ID;
    sendBuffer[1] = CommandType.requestChannelConfig;
    sendBuffer[2] = channel_num;
    usbSendData(sendBuffer);
    console.log("Send request ch:",sendBuffer);
}
function HIDRequestExtraCustomConfig(){
    let sendBuffer = new Buffer.alloc(8);
    sendBuffer[0] = Command_ID.REQUEST_INFO_ID;
    sendBuffer[1] = CommandType.request_extra_config;
    usbSendData(sendBuffer);
    console.log("Send extra custom:",sendBuffer);
}

function channel_data_map(input,Omin,Omax,Nmin,Nmax){
   return ((Nmax-Nmin)/(Omax-Omin)*(input-Omin)+Nmin).toFixed(0);
}

function isExistOption(id,value) {  
    var isExist = false;  
    var count = $('#'+id).find('option').length;  

      for(var i=0;i<count;i++)     
      {     
         if($('#'+id).get(0).options[i].value == value)     
        {     
            isExist = true;     
            break;     
        }     
    }     
    return isExist;  
} 

function addOptionValue(id,value,text) {  
    if(!isExistOption(id,value)){$('#'+id).append("<option value="+value+">"+text+"</option>");}      
} 

var listHidDev = NaN;
var listCdcDev = NaN;
var rcCurrentScreen = literadioScreenIndex.LITERADIO_SCREEN_WELCOME;
async function listUsbDevice() {
    await serialport.list().then((ports, err) => {
        if(rcCurrentScreen == literadioScreenIndex.LITERADIO_SCREEN_WELCOME){
            listHidDev = HID.devices();
            listCdcDev = ports;
            let numOfHidAndCdc = listCdcDev.length + listHidDev.length;

            // Detect changes in the number of HID devices and CDC devices
            if(numOfHidAndCdc !== lastUsbCount){
                // Remove all option
                $('#port option').each(function(){ 
                    $(this).remove(); 
                });
            }
            lastUsbCount = numOfHidAndCdc;

            let optionLength = 0;
            let decVID = 0;
            let decPID = 0;

            // Find HID RC
            for (let i = 0; i < listHidDev.length; i++) {
                decVID = parseInt(listHidDev[i].vendorId, 10);
                decPID = parseInt(listHidDev[i].productId, 10);
                if(decVID == 1155 && decPID == 22352) {
                    addOptionValue('port', optionLength, "HID Handset "+i);     //格式化遥控器设备的显示
                    optionLength++;
                }
            }

            // Find CDC RC
            for (let i = 0; i < listCdcDev.length; i++) {
                decVID = parseInt(listCdcDev[i].vendorId, 16);
                decPID = parseInt(listCdcDev[i].productId, 16);
                if(decVID == 1155 && listCdcDev[i].serialNumber.indexOf('0x800') == -1) {
                    if(decPID == 22315 || decPID == 22336 || decPID == 22352) {
                        addOptionValue('port', optionLength, "COM Handset "+i); //格式化遥控器设备的显示
                        optionLength++;
                    }
                }
            }
        }else if(rcCurrentScreen == literadioScreenIndex.LITERADIO_SCREEN_FLASH){
            listHidDev = NaN;
            listCdcDev = ports;
            let numOfCdc = listCdcDev.length;

            // Detect changes in the number of CDC devices
            if(numOfCdc !== lastUsbCount){
                // Remove all option
                $('#port option').each(function(){ 
                    $(this).remove(); 
                });
            }
            lastUsbCount = numOfCdc;

            let optionLength = 0;
            let decVID = 0;
            let decPID = 0;

            // Find CDC RC
            for (let i = 0; i < listCdcDev.length; i++) {
                decVID = parseInt(listCdcDev[i].vendorId, 16);
                decPID = parseInt(listCdcDev[i].productId, 16);
                if(decVID == 1155 && listCdcDev[i].serialNumber.indexOf('0x800') == -1) {
                    if(decPID == 22315 || decPID == 22336 || decPID == 22352) {
                        addOptionValue('port', optionLength, "COM Handset "+i); //格式化遥控器设备的显示
                        optionLength++;
                    }
                }
            }
        }
    })
}

//获取当前HID路径
function getCurrentHidPath(){
    let path = NaN;
    let text = ($('div#port-picker #port option:selected').text());
    let id = text.replace(/[^\d]/g, "");   //提取HID设备数组下标
    if(text.indexOf("HID") != -1){
        path = listHidDev[id].path;
    }
    return path;
}

//获取当前CDC路径
function getCurrentCdcPath(){
    let path = NaN;
    let text = ($('div#port-picker #port option:selected').text());
    let id = text.replace(/[^\d]/g, "");   //提取HID设备数组下标
    if(text.indexOf("COM") != -1){
        path = listCdcDev[id].path;
    }
    return path;
}


let isUsbDetectEnable = true;
setTimeout(function listPorts() {
    // 在执行serialport.list()函数的时候，如果中途拔掉USB电缆，有概率导致能够正确读取到path，但VID和PID=undefined。这种情况下serialport.list()无法继续正常工作，
    // 但此时点击切换为飞控配置程序按钮切换到飞控配置界面，serialport.list()恢复正常工作。推测试因为执行serialport.list()的过程中拔掉USB导致了一些错误的状态，切换
    // 飞控界面则是复位了这些状态，所以才恢复正常工作。目前还没搞清楚如何不切换页面的前提下进行串口的复位。

    // 原本的程序是每隔500ms就会执行一次serialport.list()来刷新usb下拉框选项，但是遥控器因为有保存并重启这个功能，这相当于拔出了USB电缆。也就是说需要确保在执行
    // serialport.list()的时候避免点击保存并重启。根据这个原理，设计了一个开关变量控制这两个互斥的逻辑：
    // usbConnected     true        false
    // detectEnabled    false       true
    if(isUsbDetectEnable){
        listUsbDevice();
    }
    setTimeout(listPorts, 500);
}, 500);

window.onload = function() {
    let Unable_to_find_serial_port = document.getElementById("Unable_to_find_serial_port");
    Unable_to_find_serial_port.onclick = function(e){
        e.preventDefault();
        if(i18n.selectedLanguage == 'zh_CN'){
            shell.openExternal("https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/UnableToFindSerialPort_CN.md");
        }else{
            shell.openExternal("https://github.com/BETAFPV/BETAFPV_Configurator/blob/master/docs/UnableToFindSerialPort_EN.md");
        }
    }

    $('label[id="liteRadio_configurator_version"]').text(liteRadio_configurator_version);
    $('div.open_hid_device a.connect').click(function () {
        //判断当前需要使用HID还是VCOM进行通信
        if(checkUsbConnected() == rcUsbProtocol.CDC_USB_PROTOCOL) {//如果存在VCOM设备
            HidConfig.usedUSBProtocol = 1;  //更新当前使用的协议
            //VCOM执行函数逻辑
            if(HidConfig.HID_Connect_State == HidConnectStatus.disConnect){
                HidConfig.Have_Receive_HID_Data = false;    
                HidConfig.HID_Connect_State = HidConnectStatus.connecting;
                $('div.open_hid_device div.connect_hid').text(i18n.getMessage('HID_Connecting'));
                
                const selected_baud = parseInt($('div#port-picker #baud').val());

                port = new serialport(getCurrentCdcPath(), {
                    baudRate: parseInt(selected_baud),
                    dataBits: 8,
                    parity: 'none',
                    stopBits: 1
                });

                setTimeout(() => {
                    if(HidConfig.Have_Receive_HID_Data){//先判断遥控器有数据发送过来
                        HidConfig.LiteRadio_power = false;
                        $('div#hidbutton a.connect').addClass('active');
                        $('#tabs ul.mode-disconnected').hide();
                        $('#tabs ul.mode-connected').show();
                        $('#tabs ul.mode-connected li a:first').click();
                        $('div#hidbutton a.connect').addClass('active');
                    }else{//没有接收到数据说明遥控器处于开机状态，提示客户将遥控器关机
                        HidConfig.LiteRadio_power = true;
                        HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                        port.close();
                        $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                        $('#tabs ul.mode-connected').hide();
                        $('#tabs ul.mode-disconnected').show();
                        $('#tabs ul.mode-disconnected li a:first').click();
                        $('div#hidbutton a.connect').removeClass('active');
                        const dialogConfirmHIDPowerOff = $('.dialogConfirmHIDPowerOff')[0];
                        dialogConfirmHIDPowerOff.showModal();
                        $('.HIDPowerOffDialog-confirmbtn').click(function() {
                            dialogConfirmHIDPowerOff.close();
                        });
                    }
                }, 1500);

                //open事件监听
                port.on('open', () =>{
                    console.log("Disable usb detect");
                    isUsbDetectEnable = false;
                });
                //data事件监听，解析遥控器发送过来的信息
                port.on('data', function(data) {
                    let rquestBuffer = new Buffer.alloc(8);
                    HidConfig.Have_Receive_HID_Data = true;
                    if(data[0] == Command_ID.CHANNELS_INFO_ID && HidConfig.LiteRadio_power == false){//通道配置信息
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){
                            switch(data[1]){//判断是哪个通道
                                case Channel.CHANNEL1:
                                    console.log("receive ch1 config:",data);
                                    HidConfig.ch1_input_source_display = data[2];
                                    HidConfig.ch1_reverse_display = data[3];
                                    HidConfig.ch1_scale_display = data[4];
                                    HidConfig.ch1_offset_display = data[5]-100;
                                    //请求通道2配置
                                    if(ch_receive_step==0){
                                        ch_receive_step=1;
                                        HIDRequestChannelConfig(2);
                                    }
                                    break;

                                case Channel.CHANNEL2:
                                    console.log("receive ch2 config:",data);
                                    HidConfig.ch2_input_source_display = data[2];
                                    HidConfig.ch2_reverse_display = data[3];
                                    HidConfig.ch2_scale_display = data[4];
                                    HidConfig.ch2_offset_display = data[5]-100;
                                    //请求通道3配置
                                    if(ch_receive_step==1){
                                        ch_receive_step=2;
                                        HIDRequestChannelConfig(3);
                                    }
                                    break;

                                case Channel.CHANNEL3:
                                    console.log("receive ch3 config:",data);
                                    HidConfig.ch3_input_source_display = data[2];
                                    HidConfig.ch3_reverse_display = data[3];
                                    HidConfig.ch3_scale_display = data[4];
                                    HidConfig.ch3_offset_display = data[5]-100;

                                    //请求通道4配置
                                    if(ch_receive_step==2){
                                        ch_receive_step=3;
                                        HIDRequestChannelConfig(4);
                                    }
                                    break;

                                case Channel.CHANNEL4:
                                    console.log("receive ch4 config:",data);
                                    HidConfig.ch4_input_source_display = data[2];
                                    HidConfig.ch4_reverse_display = data[3];
                                    HidConfig.ch4_scale_display = data[4];
                                    HidConfig.ch4_offset_display = data[5]-100;
                                    
                                    //请求通道5配置
                                    if(ch_receive_step==3){
                                        ch_receive_step=4;
                                        HIDRequestChannelConfig(5);
                                    }
                                    break;

                                case Channel.CHANNEL5:
                                    console.log("receive ch5 config:",data);
                                    HidConfig.ch5_input_source_display = data[2];
                                    HidConfig.ch5_reverse_display = data[3];
                                    HidConfig.ch5_scale_display = data[4];
                                    HidConfig.ch5_offset_display = data[5]-100;
                                    
                                    //请求通道6配置
                                    if(ch_receive_step==4){
                                        ch_receive_step=5;
                                        HIDRequestChannelConfig(6);
                                    }
                                    break;

                                case Channel.CHANNEL6:
                                    console.log("receive ch6 config:",data);
                                    HidConfig.ch6_input_source_display = data[2];
                                    HidConfig.ch6_reverse_display = data[3];
                                    HidConfig.ch6_scale_display = data[4];
                                    HidConfig.ch6_offset_display = data[5]-100;
                                    
                                    //请求通道7配置
                                    if(ch_receive_step==5){
                                        ch_receive_step=6;
                                        HIDRequestChannelConfig(7);
                                    }
                                    break;

                                case Channel.CHANNEL7:
                                    console.log("receive ch7 config:",data);
                                    HidConfig.ch7_input_source_display = data[2];
                                    HidConfig.ch7_reverse_display = data[3];
                                    HidConfig.ch7_scale_display = data[4];
                                    HidConfig.ch7_offset_display = data[5]-100;
                                    
                                    //请求通道8配置
                                    if(ch_receive_step==6){
                                        ch_receive_step=7;
                                        HIDRequestChannelConfig(8);
                                    }
                                    break;

                                case Channel.CHANNEL8:
                                    console.log("receive ch8 config:",data);
                                    HidConfig.ch8_input_source_display = data[2];
                                    HidConfig.ch8_reverse_display = data[3];
                                    HidConfig.ch8_scale_display = data[4];
                                    HidConfig.ch8_offset_display = data[5]-100;

                                    if(getLiteRadioUnitType() >= liteRadioUnitType.LiteRadio_4_SE_SX1280){//LR4之后的遥控器要继续请求2个通道
                                        if(ch_receive_step==7){
                                            ch_receive_step=8;
                                            HIDRequestChannelConfig(9);
                                        }
                                    }else{
                                        //结束请求的处理
                                        HIDRequestExtraCustomConfig();
                                        setTimeout(() => {
                                            //全部通道配置信息获取完毕，发送停止命令
                                            HIDStopSendingConfig();
                                            HidConfig.HID_Connect_State = HidConnectStatus.connected;
                                            $('div.open_hid_device div.connect_hid').text(i18n.getMessage('disConnect_HID'));
                                            if(ch_receive_step==7){
                                                //HidConfig.compareFirmwareVersion();
                                                ch_receive_step = 0;
                                            }
                                            show.refreshUI();
                                        }, 500);
                                    }
                                    break;
                                
                                case Channel.CHANNEL9:
                                    console.log("receive ch9 config:",data);
                                    HidConfig.ch9_input_source_display = data[2];
                                    HidConfig.ch9_reverse_display = data[3];
                                    HidConfig.ch9_scale_display = data[4];
                                    HidConfig.ch9_offset_display = data[5]-100;
                                    //请求通道10配置
                                    if(ch_receive_step==8){
                                        ch_receive_step=9;
                                        HIDRequestChannelConfig(10);
                                    }
                                    break;
    
                                case Channel.CHANNEL10:
                                    console.log("receive ch10 config:",data);
                                    HidConfig.ch10_input_source_display = data[2];
                                    HidConfig.ch10_reverse_display = data[3];
                                    HidConfig.ch10_scale_display = data[4];
                                    HidConfig.ch10_offset_display = data[5]-100;
                                    HIDRequestExtraCustomConfig();
                                    setTimeout(() => {
                                        //全部通道配置信息获取完毕，发送停止命令
                                        HIDStopSendingConfig();
                                        HidConfig.HID_Connect_State = HidConnectStatus.connected;
                                        $('div.open_hid_device div.connect_hid').text(i18n.getMessage('disConnect_HID'));
                                        if(ch_receive_step==9){
                                            //HidConfig.compareFirmwareVersion();
                                            ch_receive_step = 0;
                                        }
                                        show.refreshUI();
                                    }, 500);
                                    break;
                            }
                        }
                        
                    }else if(data[0] == Command_ID.Lite_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){//遥控器配置信息（硬件版本、支持协议、左右手油门、功率）
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }
                        checkSum2 = data[15]<<8 | data[14] ;
                        if(checkSum == checkSum2){//校验通过
                            console.log("receive lite radio config",data);
                            HidConfig.internal_radio = data[1];
                            HidConfig.current_protocol = data[2];
                            HidConfig.internal_radio_protocol = data[2];
                            console.log("HidConfig.current_protocol:"+HidConfig.current_protocol);
                            HidConfig.rocker_mode = data[4];
                            //HidConfig.support_power =data[4];
                            //遥控器硬件信息获取完毕后，需要在这里根据硬件信息修改对应组件的可选元素
                            show.rocker_mode = $('select[name="radiomode"]');
                            show.rocker_mode.val(HidConfig.rocker_mode);
                            document.getElementById("rocker_mode").disabled = false;   /* 打开rocker_mode 下拉列表 */
                            //LR3 SX1280 解锁内外置射频模块切换功能
                            if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_3_SX1280){
                                document.getElementById('internal_radio_module_switch').disabled = false;
                                document.getElementById('external_radio_module_switch').disabled = false;
                            }
                            if(HidConfig.internal_radio==RFmodule.CC2500){//内置射频模块型号为：cc2500
                                console.log("HidConfig.current_protocol:"+HidConfig.current_protocol);
                                $('#internal_radio_protocol').empty();
                                addOptionValue('internal_radio_protocol',0,"Frsky_D16_FCC");
                                addOptionValue('internal_radio_protocol',1,"Frsky_D16_LBT");
                                addOptionValue('internal_radio_protocol',2,"Frsky_D8");
                                addOptionValue('internal_radio_protocol',3,"FUTABA_SFHSS");
                                if(HidConfig.current_protocol<=3){//CC2500 使用内置射频模块
                                    HidConfig.Internal_radio_module_switch = true;
                                    HidConfig.External_radio_module_switch = false;
                                    document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                                    document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                                    show.internal_radio_protocol.val(HidConfig.current_protocol);
                                    document.getElementById("external_radio_protocol").disabled = true;
                                    document.getElementById("internal_radio_protocol").disabled = false;
                                    //接着请求遥控器通道配置信息
                                    rquestBuffer[0] = 0x11;
                                    rquestBuffer[1] = 0x01;
                                    rquestBuffer[2] = 0x01;
                                    usbSendData(rquestBuffer);
                                    console.log("Send request ch:",rquestBuffer);
                                    ch_receive_step = 0;
                                }else{//cc2500 使用外置射频模块
                                    HidConfig.Internal_radio_module_switch = false;
                                    HidConfig.External_radio_module_switch = true;
                                    document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                                    document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                                    document.getElementById("internal_radio_protocol").disabled = true;
                                    document.getElementById("external_radio_protocol").disabled = false;
                                    show.external_radio_protocol.val(0);
                                    //开启外部ExpressLRS
                                    rquestBuffer[0] = 0x07;
                                    rquestBuffer[1] = 0x01;
                                    rquestBuffer[2] = 0x00;
                                    usbSendData(rquestBuffer);
                                    console.log("Send cmd open external RF:",rquestBuffer);
                                    //document.getElementById("External_radio_module_power_switch").checked = true;
                                    //延时一小段时间等待外部ExpressLRS启动后再取获取配置信息
                                    setTimeout(function loadLanguage() {
                                        //获取外置射频模块配置信息
                                        rquestBuffer[0] = 0x11;
                                        rquestBuffer[1] = 0x02;
                                        rquestBuffer[2] = 0x02;
                                        usbSendData(rquestBuffer);
                                        console.log("Send request external RF config:",rquestBuffer);
                                    },300);
                                }
                            }else if(HidConfig.internal_radio==RFmodule.SX1280){//硬件型号为：sx1280
                                $('#internal_radio_protocol').empty();
                                addOptionValue('internal_radio_protocol',0,"ELRS3 2.4G");//目前通过CDC通信的遥控器都是ELRS3.0
                                // $("#internal_radio_protocol_elrs_2.4G").css({display: 'none'});
                                // $("#internal_radio_protocol_Frsky_F8").css({display: 'none'});
                                // $("#internal_radio_protocol_Frsky_F16_FCC").css({display: 'none'});
                                // $("#internal_radio_protocol_Frsky_F16_LBT").css({display: 'none'});
                                // $("#internal_radio_protocol_elrs3_2.4G").css({display: 'block'});
                                if(HidConfig.current_protocol==0){//当前协议为：内置elrs协议
                                    document.getElementById("internal_radio_protocol").disabled = false;
                                    show.internal_radio_protocol.value = 0;
                                    HidConfig.internal_radio_protocol = 0;
                                    //请求内置elrs射频模块参数
                                    rquestBuffer[0] = 0x11;
                                    rquestBuffer[1] = 0x02;
                                    rquestBuffer[2] = 0x01;
                                    usbSendData(rquestBuffer);
                                    console.log("Send request internal RF:",rquestBuffer);
                                }else if(HidConfig.current_protocol==1){//当前协议为：外置crsf射频模块
                                    console.log("external crsf is runing");
                                    if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_4_SE_SX1280){
                                        document.getElementById("external_radio_protocol").disabled = true;
                                        document.getElementById("internal_radio_protocol").disabled = false;
                                    }else{
                                        document.getElementById("external_radio_protocol").disabled = false;
                                        document.getElementById("internal_radio_protocol").disabled = true;
                                    }
                                    HidConfig.external_radio_protocol = 1;
                                    show.external_radio_protocol.val(HidConfig.current_protocol);
                                    //开启外部ExpressLRS
                                    rquestBuffer[0] = 0x07;
                                    rquestBuffer[1] = 0x01;
                                    rquestBuffer[2] = 0x00;
                                    usbSendData(rquestBuffer);
                                    console.log("Send cmd open external RF:",rquestBuffer);
                                    //document.getElementById("External_radio_module_power_switch").checked = true;
                                    //延时一小段时间等待外部ExpressLRS启动后再取获取配置信息
                                    setTimeout(function loadLanguage() {
                                        //获取外置射频模块配置信息
                                        rquestBuffer[0] = 0x11;
                                        rquestBuffer[1] = 0x02;
                                        rquestBuffer[2] = 0x02;
                                        usbSendData(rquestBuffer);
                                        console.log("Send request external RF config:",rquestBuffer);
                                    },300);
                                }
                            }else if(HidConfig.internal_radio==RFmodule.SX1276){//硬件型号为：sx1276
                            }
                        }                 
                    }else if(data[0] == Command_ID.INTERNAL_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
                        if(checkSum == checkSum2){
                            console.log("receive internal radio config",data);
                            document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupInternel2_4G');
                            //功率档位只支持：25 50 100mw档位
                            $('#ExpressLRS_power_option_box').empty();
                            addOptionValue('ExpressLRS_power_option_box',0,"25mw");
                            addOptionValue('ExpressLRS_power_option_box',1,"50mw");
                            addOptionValue('ExpressLRS_power_option_box',2,"100mw");
                            //显示当前内置ELRS的配置信息
                            HidConfig.internal_radio_protocol = 0;
                            HidConfig.ExpressLRS_power_option_value = data[2];
                            HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                            HidConfig.ExpressLRS_tlm_option_value = data[4];

                            show.internal_radio_protocol.val(HidConfig.internal_radio_protocol);
                            show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value);
                            show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                            show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);

                            HidConfig.Internal_radio_module_switch = true;
                            HidConfig.External_radio_module_switch = false;
                            document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                            document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                            //外部射频模块供电开关失能
                            //document.getElementById("External_radio_module_power_switch").disabled = true; 
                            //内置高频头ExpressLRS系统可设置的选项
                            document.getElementById("ExpressLRS_power_option_box").disabled = false;
                            document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                            document.getElementById("ExpressLRS_tlm_option_box").disabled = false;
                            
                            document.getElementById("externalRadioBinding").style.display="none";
                            document.getElementById("externalRadioWifiUpdate").style.display="none";

                            document.getElementById("content_EspressLRS_bindPhrase").style.display="block";
                            //接着请求遥控器通道配置信息
                            rquestBuffer[0] = 0x11;
                            rquestBuffer[1] = 0x01;
                            rquestBuffer[2] = 0x01;
                            usbSendData(rquestBuffer);
                            console.log("Send request ch config:",rquestBuffer);
                            ch_receive_step = 0;
                        }                
                    }else if(data[0] == Command_ID.EXTERNAL_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){
                            console.log("receive external radio config", data);
                            HidConfig.Internal_radio_module_switch = false;
                            HidConfig.External_radio_module_switch = true;
                            //LR4 SE的高频头本质上也是个外置高频头，所以只是界面显示是内置，但上位机和遥控器之间的通信方式还是用的外置
                            if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_4_SE_SX1280){
                                document.getElementById('internal_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                                document.getElementById('external_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                            }else{
                                document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                                document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                            }
                            if(data[5] == 0x02){//需要根据外部射频模块硬件型号设置组件可选包率
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段915MHz ISM
                                //支持功率档位： 100 250 500mw
                                $('#ExpressLRS_power_option_box').empty();
                                addOptionValue('ExpressLRS_power_option_box',3,"100mw");
                                addOptionValue('ExpressLRS_power_option_box',4,"250mw");
                                addOptionValue('ExpressLRS_power_option_box',5,"500mw");
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"200Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"100Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"50Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"25Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x02;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML = i18n.getMessage('RadioSetupExternel915M');
                            }else if(data[5] == 0x03){
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段868MHz ISM
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"200Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"100Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"50Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"25Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x00;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupExternel868M');
                            }else if(data[5] == 0x06){
                                //外部射频模块可选包率：
                                //500hz 250hz 150hz 50hz
                                //工作频段2.4GHz ISM
                                //支持功率档位：10 25 50 100 250 500mw
                                $('#ExpressLRS_power_option_box').empty();
                                if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_4_SE_SX1280){
                                    //addOptionValue('ExpressLRS_power_option_box',0,"10mw");
                                    addOptionValue('ExpressLRS_power_option_box',1,"25mw");
                                    addOptionValue('ExpressLRS_power_option_box',2,"50mw");
                                    addOptionValue('ExpressLRS_power_option_box',3,"100mw");
                                    //addOptionValue('ExpressLRS_power_option_box',4,"250mw");
                                    //addOptionValue('ExpressLRS_power_option_box',5,"500mw");
                                }else{
                                    addOptionValue('ExpressLRS_power_option_box',0,"10mw");
                                    addOptionValue('ExpressLRS_power_option_box',1,"25mw");
                                    addOptionValue('ExpressLRS_power_option_box',2,"50mw");
                                    addOptionValue('ExpressLRS_power_option_box',3,"100mw");
                                    addOptionValue('ExpressLRS_power_option_box',4,"250mw");
                                    addOptionValue('ExpressLRS_power_option_box',5,"500mw");
                                }
                                $("#ExpressLRS_power_10mw").css({display: 'none'});
                                $("#ExpressLRS_power_25mw").css({display: 'none'});
                                $("#ExpressLRS_power_50mw").css({display: 'none'});
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"500Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"250Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"150Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"50Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x06;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupExternel2_4G');
                            }
                            //检测到ELRS模块存在
                            if(data[5]==0x02||data[5]==0x03||data[5]==0x06){
                                HidConfig.external_radio_protocol = 0;
                                HidConfig.ExpressLRS_power_option_value = data[2];
                                HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                                HidConfig.ExpressLRS_tlm_option_value = data[4];

                                show.external_radio_protocol.val(HidConfig.external_radio_protocol);
                                show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value);
                                show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                                show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);
                                //外部射频模块供电开关使能
                                //document.getElementById("External_radio_module_power_switch").disabled = false; 
                                //外置高频头ExpressLRS系统可设置选项
                                if(getLiteRadioUnitType() != liteRadioUnitType.LiteRadio_3_SX1280){//LR3的ELRS版本还不支持设置外置高频头参数，下列代码是允许更改配置的参数
                                    document.getElementById("ExpressLRS_power_option_box").disabled = false;
                                    document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                                    document.getElementById("ExpressLRS_tlm_option_box").disabled = false;
                                    //document.getElementById("content_EspressLRS_btn").style.display="block";
                                }
                            }else{
                            }
                            //请求遥控器通道配置信息
                            rquestBuffer[0] = 0x11;
                            rquestBuffer[1] = 0x01;
                            rquestBuffer[2] = 0x01;
                            usbSendData(rquestBuffer);
                            console.log("Send request ch config:",rquestBuffer);
                            ch_receive_step = 0;
                        }else{
                        }
                    }else if(data[0] == Command_ID.DEVICE_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){
                            console.log("receive device info id:",data);
                            HidConfig.lite_radio_device = data[2];
                            HidConfig.internal_radio = data[3];
                            HidConfig.throttle_rocker_position = data[4];
                            HidConfig.hardware_major_version = data[5];
                            HidConfig.hardware_minor_version = data[6];
                            HidConfig.hardware_pitch_version = data[7];
                            if(data[8] >= 24){
                                HidConfig.firmware_major_version = data[8]+2000;
                            }else{
                                HidConfig.firmware_major_version = data[8];
                            }
                            HidConfig.firmware_minor_version = data[9];
                            HidConfig.firmware_pitch_version = data[10];
                            HidConfig.Hardware_info_storage_mark = (data[13]<<8|data[12]);
                            if(HidConfig.Hardware_info_storage_mark == 0xa55a){
                                $("#content_literadio_device_info").css({display: 'block'});
                                switch(HidConfig.lite_radio_device){
                                    case liteRadioUnitType.UNKNOW:
                                        document.getElementById("liteRadioInfoDevice").innerHTM = "unknow";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE_V2_SX1280:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE V2 SX1280";
                                        document.getElementById("FactoryReset").style.display = "none";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE_V2_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE V2 CC2500";
                                        break;
                                    case liteRadioUnitType.LiteRadio_3_SX1280:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 3 SX1280";
                                        document.getElementById("FactoryReset").style.display = "none";
                                        break;
                                    case liteRadioUnitType.LiteRadio_3_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 3 CC2500";
                                        break;
                                    case liteRadioUnitType.LiteRadio_1_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 1 CC2500";
                                        break;
                                    case liteRadioUnitType.LiteRadio_4_SE_SX1280:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 4 SE SX1280";
                                        document.getElementById("FactoryReset").style.display = "none";
                                        break;
                                    default:
                                        console.log("The unit type of lite_radio cannot be identified");
                                        break;
                                }
                                switch(HidConfig.internal_radio){
                                    case internalRadioType.UNKNOW:
                                        break;
                                    case internalRadioType.CC2500:
                                        document.getElementById("liteRadioInfoInternalRadio").innerHTML = "CC2500";
                                        break;
                                    case internalRadioType.SX1280:
                                        document.getElementById("liteRadioInfoInternalRadio").innerHTML = "SX1280";
                                        break;
                                    default:
                                        console.log("The type of internal radio cannot be identified");
                                        break;
                                }
                                let board_version = HidConfig.hardware_major_version+'.'+HidConfig.hardware_minor_version+'.'+HidConfig.hardware_pitch_version;
                                let firmware_version;
                                if(HidConfig.firmware_pitch_version < 10 && HidConfig.firmware_major_version >= 24){
                                    firmware_version = HidConfig.firmware_major_version+'.'+HidConfig.firmware_minor_version+'.0'+HidConfig.firmware_pitch_version;
                                }else{
                                    firmware_version = HidConfig.firmware_major_version+'.'+HidConfig.firmware_minor_version+'.'+HidConfig.firmware_pitch_version;
                                }
                                // var board_version = HidConfig.hardware_major_version+'.'+HidConfig.hardware_minor_version+'.'+HidConfig.hardware_pitch_version;
                                // var firmware_version = HidConfig.firmware_major_version+'.'+HidConfig.firmware_minor_version+'.'+HidConfig.firmware_pitch_version;
                                HidConfig.lite_Radio_version = firmware_version;
                                console.log("HidConfig.lite_Radio_version:"+HidConfig.lite_Radio_version);
                                document.getElementById("liteRadioInfoBoardVersion").innerHTML = board_version;
                                document.getElementById("liteRadioInfoFirmwareVersion").innerHTML = firmware_version;
                            }
                        }
                        if(getLiteRadioUnitType() < liteRadioUnitType.LiteRadio_4_SE_SX1280){//LR4 SE以前的遥控器关闭9、10通道的配置
                            //关闭CH9、CH10相关显示
                            document.getElementById("ch9_mixes").style.display="none";
                            document.getElementById("ch10_mixes").style.display="none";
                            document.getElementById("ch9_mixes_bar").style.display="none";
                            document.getElementById("ch10_mixes_bar").style.display="none";
                        }
                    }else if(data[0] == Command_ID.EXTRA_CUSTOM_CONFIG_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
                        if(checkSum == checkSum2){
                            console.log("receive extra custom config:",data);
                            HidConfig.JoystickDeadZonePercent = data[2];
                            show.JoystickDeadZonePercent.val(HidConfig.JoystickDeadZonePercent);
                            HidConfig.BuzzerSwitch = (data[3] == 0x0f)?false:true;
                            document.getElementById("BuzzerSwitch").checked = HidConfig.BuzzerSwitch;
                            $("#extra_custom_config").css({display: 'block'});
                            //开启LR4 SE高频头电源，使其正常工作，这样才能读取高频头功率等配置参数
                            HIDNotice_LiteRadio4SE_EnableRF();
                            console.log("Open RF");
                            //LR4 SE才显示的内容
                            if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_4_SE_SX1280) {
                                if(data[7] == 0x0f){
                                    HidConfig.switchLockMode_SE = (data[4] == 0x0f)?false:true;
                                    document.getElementById("switchLockMode_SE").checked = HidConfig.switchLockMode_SE;
                                    HidConfig.switchLockMode_SF = (data[5] == 0x0f)?false:true;
                                    document.getElementById("switchLockMode_SF").checked = HidConfig.switchLockMode_SF;
                                    $("#extra_custom_config_switch_lock_mode").css({display: 'block'});
                                }else{
                                }
                            }else{
                                $("#JoystickDeadZonePercent_0").css({display: 'none'});
                            }
                        }
                    }else{
                        HidConfig.Have_Receive_HID_Data = true;
                        HidConfig.channel_data[0] = (data[1]<<8 | data[0]);
                        HidConfig.channel_data[1] = (data[3]<<8 | data[2]);
                        HidConfig.channel_data[2] = (data[5]<<8 | data[4]);
                        HidConfig.channel_data[3] = (data[7]<<8 | data[6]);
                        HidConfig.channel_data[4] = (data[9]<<8 | data[8]);
                        HidConfig.channel_data[5] = (data[11]<<8 | data[10]);
                        HidConfig.channel_data[6] = (data[13]<<8 | data[12]);
                        HidConfig.channel_data[7] = (data[15]<<8 | data[14]);
                        HidConfig.channel_data[8] = (data[17]<<8 | data[16]);
                        HidConfig.channel_data[9] = (data[19]<<8 | data[18]);
                        HidConfig.channel_data_dispaly[0] = channel_data_map(HidConfig.channel_data[0],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[1] = channel_data_map(HidConfig.channel_data[1],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[2] = channel_data_map(HidConfig.channel_data[2],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[3] = channel_data_map(HidConfig.channel_data[3],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[4] = channel_data_map(HidConfig.channel_data[4],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[5] = channel_data_map(HidConfig.channel_data[5],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[6] = channel_data_map(HidConfig.channel_data[6],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[7] = channel_data_map(HidConfig.channel_data[7],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[8] = channel_data_map(HidConfig.channel_data[8],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[9] = channel_data_map(HidConfig.channel_data[9],0,2047,-100,100);
                        //console.log(HidConfig.channel_data[0],HidConfig.channel_data[1],HidConfig.channel_data[2],HidConfig.channel_data[3]);
                    }
                });
                port.on('close', () =>{
                    HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                    $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    $('div#hidbutton a.connect').removeClass('active');
                    console.log("Enable usb detect");
                    isUsbDetectEnable = true;
                });
                port.on("error", function(err) {
                    console.log("============================== usb cdc error ==============================");
                    //port.close();//发生错误以后port=null，此时调用close会死机
                    HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                    $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                    const dialogHIDisDisconnect = $('.dialogHIDisDisconnect')[0];
                    //dialogHIDisDisconnect.showModal();
                    $('.HIDisDisconnect-confirmbtn').click(function() {
                        dialogHIDisDisconnect.close();
                    });
                    // alert("HID Device Disconnected!");
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    $('div#hidbutton a.connect').removeClass('active');
                });
            }
            else{
                //关闭LR4 SE高频头电源
                HIDNotice_LiteRadio4SE_DisableRF();
                console.log("Close RF");
                //关闭串口
                port.close();
            }
        }else if(checkUsbConnected() == rcUsbProtocol.HID_USB_PROTOCOL){//如果存在HID设备
            HidConfig.usedUSBProtocol = 0;  //更新当前使用的USB协议
            if(HidConfig.HID_Connect_State == HidConnectStatus.disConnect){
                HidConfig.Have_Receive_HID_Data = false;
                HidConfig.HID_Connect_State = HidConnectStatus.connecting;
                $('div.open_hid_device div.connect_hid').text(i18n.getMessage('HID_Connecting'));

                //hidDevice = new HID.HID(getCurrentHidPath());//mac列出的hid设备无固定下标，但hid设备数组的总数量保持不变导致了下拉框中的内容不会被刷新，所以依赖于hid设备数组下标获取path/pid/vid等参数都变得不可靠。
                hidDevice = new HID.HID(1155, 22352);//mac只能连接固定的vid，pid，缺点是无法同时接入多个hid设备进行识别，不会影响单个hid遥控器的使用

                setTimeout(() => {
                    if(HidConfig.Have_Receive_HID_Data){//先判断遥控器有数据发送过来
                        HidConfig.LiteRadio_power = false;
                        $('div#hidbutton a.connect').addClass('active');
                        $('#tabs ul.mode-disconnected').hide();
                        $('#tabs ul.mode-connected').show();
                        $('#tabs ul.mode-connected li a:first').click();
                        $('div#hidbutton a.connect').addClass('active');
                    }else{//没有接收到数据说明遥控器处于开机状态，提示客户将遥控器关机
                        HidConfig.LiteRadio_power = true;
                        HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                        hidDevice.close();
                        isUsbDetectEnable = false;
                        $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                        $('#tabs ul.mode-connected').hide();
                        $('#tabs ul.mode-disconnected').show();
                        $('#tabs ul.mode-disconnected li a:first').click();
                        $('div#hidbutton a.connect').removeClass('active');
                        const dialogConfirmHIDPowerOff = $('.dialogConfirmHIDPowerOff')[0];
                        dialogConfirmHIDPowerOff.showModal();
                        $('.HIDPowerOffDialog-confirmbtn').click(function() {
                            dialogConfirmHIDPowerOff.close();
                        });
                    }
                }, 1500);

                hidDevice.on('data', function(data) {//解析遥控器发送过来的信息 
                    isUsbDetectEnable = false;
                    let rquestBuffer = new Buffer.alloc(64);
                    if(data[0] == Command_ID.CHANNELS_INFO_ID && HidConfig.LiteRadio_power == false){//通道配置信息
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){
                            switch(data[1]){//判断是哪个通道
                                case Channel.CHANNEL1:
                                    console.log("receive ch1 config hid",data);
                                    HidConfig.ch1_input_source_display = data[2];
                                    HidConfig.ch1_reverse_display = data[3];
                                    HidConfig.ch1_scale_display = data[4];
                                    HidConfig.ch1_offset_display = data[5]-100;
                                    //请求通道2配置
                                    if(ch_receive_step==0){
                                        ch_receive_step=1;
                                        HIDRequestChannelConfig(2);
                                    }
                                    break;

                                case Channel.CHANNEL2:
                                    console.log("receive ch2 config hid",data);
                                    HidConfig.ch2_input_source_display = data[2];
                                    HidConfig.ch2_reverse_display = data[3];
                                    HidConfig.ch2_scale_display = data[4];
                                    HidConfig.ch2_offset_display = data[5]-100;
                                    //请求通道3配置
                                    if(ch_receive_step==1){
                                        ch_receive_step=2;
                                        HIDRequestChannelConfig(3);
                                    }
                                    break;

                                case Channel.CHANNEL3:
                                    console.log("receive ch3 config hid",data);
                                    HidConfig.ch3_input_source_display = data[2];
                                    HidConfig.ch3_reverse_display = data[3];
                                    HidConfig.ch3_scale_display = data[4];
                                    HidConfig.ch3_offset_display = data[5]-100;
                                    //请求通道4配置
                                    if(ch_receive_step==2){
                                        ch_receive_step=3;
                                        HIDRequestChannelConfig(4);
                                    }
                                    break;

                                case Channel.CHANNEL4:
                                    console.log("receive ch4 config hid",data);
                                    HidConfig.ch4_input_source_display = data[2];
                                    HidConfig.ch4_reverse_display = data[3];
                                    HidConfig.ch4_scale_display = data[4];
                                    HidConfig.ch4_offset_display = data[5]-100;
                                    //请求通道5配置
                                    if(ch_receive_step==3){
                                        ch_receive_step=4;
                                        HIDRequestChannelConfig(5);
                                    }
                                    break;

                                case Channel.CHANNEL5:
                                    console.log("receive ch5 config hid",data);
                                    HidConfig.ch5_input_source_display = data[2];
                                    HidConfig.ch5_reverse_display = data[3];
                                    HidConfig.ch5_scale_display = data[4];
                                    HidConfig.ch5_offset_display = data[5]-100;
                                    //请求通道6配置
                                    if(ch_receive_step==4){
                                        ch_receive_step=5;
                                        HIDRequestChannelConfig(6);
                                    }
                                    break;

                                case Channel.CHANNEL6:
                                    console.log("receive ch6 config hid",data);
                                    HidConfig.ch6_input_source_display = data[2];
                                    HidConfig.ch6_reverse_display = data[3];
                                    HidConfig.ch6_scale_display = data[4];
                                    HidConfig.ch6_offset_display = data[5]-100;
                                    //请求通道7配置
                                    if(ch_receive_step==5){
                                        ch_receive_step=6;
                                        HIDRequestChannelConfig(7);
                                    }
                                    break;

                                case Channel.CHANNEL7:
                                    console.log("receive ch7 config hid",data);
                                    HidConfig.ch7_input_source_display = data[2];
                                    HidConfig.ch7_reverse_display = data[3];
                                    HidConfig.ch7_scale_display = data[4];
                                    HidConfig.ch7_offset_display = data[5]-100;
                                    //请求通道8配置
                                    if(ch_receive_step==6){
                                        ch_receive_step=7;
                                        HIDRequestChannelConfig(8);
                                    }
                                    break;

                                case Channel.CHANNEL8:
                                    console.log("receive ch8 config hid",data);
                                    HidConfig.ch8_input_source_display = data[2];
                                    HidConfig.ch8_reverse_display = data[3];
                                    HidConfig.ch8_scale_display = data[4];
                                    HidConfig.ch8_offset_display = data[5]-100;
                                    HIDRequestExtraCustomConfig();
                                    //全部通道配置信息获取完毕，发送停止命令
                                    setTimeout(() => {
                                        HIDStopSendingConfig();
                                        HidConfig.HID_Connect_State = HidConnectStatus.connected;
                                        $('div.open_hid_device div.connect_hid').text(i18n.getMessage('disConnect_HID'));
                                        if(ch_receive_step==7){
                                            //HidConfig.compareFirmwareVersion();
                                            ch_receive_step = 0;
                                        }
                                        show.refreshUI();
                                    }, 500);
                                    break;
                            }
                        }
                    }else if(data[0] == Command_ID.Lite_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){//遥控器配置信息（硬件版本、支持协议、左右手油门、功率）
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){//校验通过
                            console.log("receive lite radio config hid",data);
                            HidConfig.internal_radio = data[1];
                            HidConfig.current_protocol = data[2];
                            HidConfig.internal_radio_protocol = data[2];
                            console.log("HidConfig.current_protocol:"+HidConfig.current_protocol);
                            HidConfig.rocker_mode = data[3];
                            HidConfig.support_power =data[4];
                            //遥控器硬件信息获取完毕后，需要在这里根据硬件信息修改对应组件的可选元素
                            show.rocker_mode = $('select[name="radiomode"]');
                            show.rocker_mode.val(HidConfig.rocker_mode);
                            document.getElementById("rocker_mode").disabled = false;
                            //LR3 CC2500 解锁内外置射频模块切换功能
                            if(getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_3_CC2500 
                            || getLiteRadioUnitType() == liteRadioUnitType.LiteRadio_3_SX1280){
                                document.getElementById('internal_radio_module_switch').disabled = false;
                                document.getElementById('external_radio_module_switch').disabled = false;
                            }
                            if(HidConfig.internal_radio==RFmodule.CC2500){//内置射频模块型号为：cc2500
                                console.log("HidConfig.current_protocol:"+HidConfig.current_protocol);
                                $('#internal_radio_protocol').empty();
                                addOptionValue('internal_radio_protocol',0,"Frsky_D16_FCC");
                                addOptionValue('internal_radio_protocol',1,"Frsky_D16_LBT");
                                addOptionValue('internal_radio_protocol',2,"Frsky_D8");
                                addOptionValue('internal_radio_protocol',3,"FUTABA_SFHSS");
                                if(HidConfig.current_protocol<=3){//CC2500 使用内置射频模块
                                    HidConfig.Internal_radio_module_switch = true;
                                    HidConfig.External_radio_module_switch = false;
                                    document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                                    document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                                    show.internal_radio_protocol.val(HidConfig.current_protocol);
                                    document.getElementById("external_radio_protocol").disabled = true;
                                    document.getElementById("internal_radio_protocol").disabled = false;
                                    //接着请求遥控器通道配置信息
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x11;
                                    rquestBuffer[2] = 0x01;
                                    rquestBuffer[3] = 0x01;
                                    usbSendData(rquestBuffer);
                                    console.log("Send request ch config:",rquestBuffer);
                                    ch_receive_step = 0;
                                }else{//cc2500 使用外置射频模块
                                    HidConfig.Internal_radio_module_switch = false;
                                    HidConfig.External_radio_module_switch = true;
                                    document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                                    document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                                    document.getElementById("internal_radio_protocol").disabled = true;
                                    document.getElementById("external_radio_protocol").disabled = false;
                                    show.external_radio_protocol.val(0);
                                    //开启外部ExpressLRS
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x07;
                                    rquestBuffer[2] = 0x01;
                                    rquestBuffer[3] = 0x00;
                                    usbSendData(rquestBuffer);
                                    console.log("Send cmd open external RF:",rquestBuffer);
                                    //document.getElementById("External_radio_module_power_switch").checked = true;
                                    //延时一小段时间等待外部ExpressLRS启动后再取获取配置信息
                                    setTimeout(function loadLanguage() {
                                        rquestBuffer[0] = 0x00;//获取外置射频模块配置信息
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x02;
                                        rquestBuffer[3] = 0x02;
                                        usbSendData(rquestBuffer);
                                        console.log("Send request external RF config:",rquestBuffer);
                                    },300);
                                }
                            }else if(HidConfig.internal_radio==RFmodule.SX1280){//硬件型号为：sx1280
                                $('#internal_radio_protocol').empty();
                                addOptionValue('internal_radio_protocol',0,"ELRS2 2.4G");
                                // $("#internal_radio_protocol_elrs_2.4G").css({display: 'block'});
                                // $("#internal_radio_protocol_Frsky_F8").css({display: 'none'});
                                // $("#internal_radio_protocol_Frsky_F16_FCC").css({display: 'none'});
                                // $("#internal_radio_protocol_Frsky_F16_LBT").css({display: 'none'});
                                // $("#internal_radio_protocol_elrs3_2.4G").css({display: 'none'});
                                if(HidConfig.current_protocol==0){//当前协议为：内置elrs协议
                                    document.getElementById("internal_radio_protocol").disabled = false;
                                    show.internal_radio_protocol.value = 0;
                                    HidConfig.internal_radio_protocol = 0;
                                    //请求内置elrs射频模块参数
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x11;
                                    rquestBuffer[2] = 0x02;
                                    rquestBuffer[3] = 0x01;
                                    usbSendData(rquestBuffer);
                                    console.log("Send request internal RF config:",rquestBuffer);
                                }else if(HidConfig.current_protocol==1){//当前协议为：外置crsf射频模块
                                    console.log("external crsf is runing");
                                    document.getElementById("external_radio_protocol").disabled = false;
                                    HidConfig.external_radio_protocol = 1;
                                    show.external_radio_protocol.val(HidConfig.current_protocol);
                                    //开启外部ExpressLRS
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x07;
                                    rquestBuffer[2] = 0x01;
                                    rquestBuffer[3] = 0x00;
                                    if(requestTimeout == 0){
                                        requestTimeout = Date.now()+1000;
                                    }else if(requestTimeout < Date.now()){
                                        //接着请求遥控器通道配置信息
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x01;
                                        usbSendData(rquestBuffer);
                                        console.log("Send request ch config:",rquestBuffer);
                                        ch_receive_step = 0;
                                    }else{
                                        usbSendData(rquestBuffer);
                                        console.log("Send cmd open external RF:",rquestBuffer);
                                        //document.getElementById("External_radio_module_power_switch").checked = true;
                                        //延时一小段时间等待外部ExpressLRS启动后再取获取配置信息
                                        setTimeout(function loadLanguage() {
                                            rquestBuffer[0] = 0x00;//获取外置射频模块配置信息
                                            rquestBuffer[1] = 0x11;
                                            rquestBuffer[2] = 0x02;
                                            rquestBuffer[3] = 0x02;
                                            usbSendData(rquestBuffer);
                                            console.log("Send request external RF config:",rquestBuffer);
                                        },300);
                                    }
                                }
                            }else if(HidConfig.internal_radio==RFmodule.SX1276){//硬件型号为：sx1276
                            }
                        }                 
                    }else if(data[0] == Command_ID.INTERNAL_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++) {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
                        if(checkSum == checkSum2){
                            console.log("receive internal radio config hid",data);
                            document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupInternel2_4G');
                            //功率档位只支持：25 50 100mw档位
                            $('#ExpressLRS_power_option_box').empty();
                            addOptionValue('ExpressLRS_power_option_box',0,"25mw");
                            addOptionValue('ExpressLRS_power_option_box',1,"50mw");
                            addOptionValue('ExpressLRS_power_option_box',2,"100mw");
                            //显示当前内置ELRS的配置信息
                            HidConfig.internal_radio_protocol = 0;
                            HidConfig.ExpressLRS_power_option_value = data[2];
                            HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                            HidConfig.ExpressLRS_tlm_option_value = data[4];

                            show.internal_radio_protocol.val(HidConfig.internal_radio_protocol);
                            show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value);
                            show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                            show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);

                            HidConfig.Internal_radio_module_switch = true;
                            HidConfig.External_radio_module_switch = false;
                            document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                            document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                            //外部射频模块供电开关失能
                            //document.getElementById("External_radio_module_power_switch").disabled = true;
                            //内置高频头ExpressLRS系统可设置选项
                            document.getElementById("ExpressLRS_power_option_box").disabled = false;
                            document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                            document.getElementById("ExpressLRS_tlm_option_box").disabled = false;
                            document.getElementById("externalRadioBinding").style.display="none";
                            document.getElementById("externalRadioWifiUpdate").style.display="none";
                            document.getElementById("content_EspressLRS_bindPhrase").style.display="block";
                            //接着请求遥控器通道配置信息
                            rquestBuffer[0] = 0x00;
                            rquestBuffer[1] = 0x11;
                            rquestBuffer[2] = 0x01;
                            rquestBuffer[3] = 0x01;
                            usbSendData(rquestBuffer);
                            console.log("Send request ch config:",rquestBuffer);
                            ch_receive_step = 0;
                        }                
                    }else if(data[0] == Command_ID.EXTERNAL_CONFIGER_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++) {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2){
                            console.log("receive external radio config hid",data);
                            HidConfig.Internal_radio_module_switch = false;
                            HidConfig.External_radio_module_switch = true;
                            document.getElementById('internal_radio_module_switch').checked = HidConfig.Internal_radio_module_switch;
                            document.getElementById('external_radio_module_switch').checked = HidConfig.External_radio_module_switch;
                            if(data[5] == 0x02){//需要根据外部射频模块硬件型号设置组件可选包率
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段915MHz ISM
                                //支持功率档位： 100 250 500mw
                                $('#ExpressLRS_power_option_box').empty();
                                addOptionValue('ExpressLRS_power_option_box',3,"100mw");
                                addOptionValue('ExpressLRS_power_option_box',4,"250mw");
                                addOptionValue('ExpressLRS_power_option_box',5,"500mw");
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"200Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"100Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"50Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"25Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x02;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML = i18n.getMessage('RadioSetupExternel915M');
                            }else if(data[5] == 0x03){
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段868MHz ISM
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"200Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"100Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"50Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"25Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x00;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupExternel868M');
                            }else if(data[5] == 0x06){
                                //外部射频模块可选包率：
                                //500hz 250hz 150hz 50hz
                                //工作频段2.4GHz ISM
                                //支持功率档位：10 25 50 100 250 500mw
                                $('#ExpressLRS_power_option_box').empty();
                                addOptionValue('ExpressLRS_power_option_box',0,"10mw");
                                addOptionValue('ExpressLRS_power_option_box',1,"25mw");
                                addOptionValue('ExpressLRS_power_option_box',2,"50mw");
                                addOptionValue('ExpressLRS_power_option_box',3,"100mw");
                                addOptionValue('ExpressLRS_power_option_box',4,"250mw");
                                addOptionValue('ExpressLRS_power_option_box',5,"500mw");
                                $("#ExpressLRS_power_10mw").css({display: 'none'});
                                $("#ExpressLRS_power_25mw").css({display: 'none'});
                                $("#ExpressLRS_power_50mw").css({display: 'none'});
                                $('#ExpressLRS_pkt_rate_option_box').empty();
                                addOptionValue('ExpressLRS_pkt_rate_option_box',0,"500Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',1,"250Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',2,"150Hz");
                                addOptionValue('ExpressLRS_pkt_rate_option_box',3,"50Hz");
                                HidConfig.ExpressLRS_RF_freq_value = 0x06;
                                document.getElementById("RadioSetupELRSRuningStatus").innerHTML =  i18n.getMessage('RadioSetupExternel2_4G');
                            }
                            //检测到ELRS模块存在
                            if(data[5]==0x02||data[5]==0x03||data[5]==0x06){
                                HidConfig.external_radio_protocol = 0;
                                HidConfig.ExpressLRS_power_option_value = data[2];
                                HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                                HidConfig.ExpressLRS_tlm_option_value = data[4];

                                show.external_radio_protocol.val(HidConfig.external_radio_protocol);
                                show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value);
                                show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                                show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);
                                //外部射频模块供电开关使能
                                //document.getElementById("External_radio_module_power_switch").disabled = false;
                                //外置高频头ExpressLRS系统可设置选项
                                if(getLiteRadioUnitType() != liteRadioUnitType.LiteRadio_3_CC2500){//LR3的Frsky版本还不支持设置外置高频头参数，下列代码是允许更改配置的参数
                                    document.getElementById("ExpressLRS_power_option_box").disabled = false;
                                    document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                                    document.getElementById("ExpressLRS_tlm_option_box").disabled = false;
                                    //document.getElementById("content_EspressLRS_btn").style.display="block";
                                }
                            }else{
                            }
                            //请求遥控器通道配置信息
                            rquestBuffer[0] = 0x00;
                            rquestBuffer[1] = 0x11;
                            rquestBuffer[2] = 0x01;
                            rquestBuffer[3] = 0x01;
                            usbSendData(rquestBuffer);
                            console.log("Send request ch config:",rquestBuffer);
                            ch_receive_step = 0;
                        }else{
                        }
                    }else if(data[0] == Command_ID.DEVICE_INFO_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14];
                        if(checkSum == checkSum2)
                        {
                            //关闭CH9、CH10相关显示，老版本HID的遥控器不支持这两个通道
                            document.getElementById("ch9_mixes").style.display="none";
                            document.getElementById("ch10_mixes").style.display="none";
                            document.getElementById("ch9_mixes_bar").style.display="none";
                            document.getElementById("ch10_mixes_bar").style.display="none";
                            console.log("DEVICE_INFO_ID");
                            console.log(data);
                            HidConfig.lite_radio_device = data[2];
                            HidConfig.internal_radio = data[3];
                            HidConfig.throttle_rocker_position = data[4];
                            HidConfig.hardware_major_version = data[5];
                            HidConfig.hardware_minor_version = data[6];
                            HidConfig.hardware_pitch_version = data[7];
                            if(data[8] >= 24){
                                HidConfig.firmware_major_version = data[8]+2000;
                            }else{
                                HidConfig.firmware_major_version = data[8];
                            }
                            HidConfig.firmware_minor_version = data[9];
                            HidConfig.firmware_pitch_version = data[10];
                            HidConfig.Hardware_info_storage_mark = (data[13]<<8|data[12]);
                            console.log(HidConfig.Hardware_info_storage_mark);
                            console.log(HidConfig.lite_radio_device);
                            if(HidConfig.Hardware_info_storage_mark == 0xa55a){
                                $("#content_literadio_device_info").css({display: 'block'});
                                switch(HidConfig.lite_radio_device){
                                    case liteRadioUnitType.UNKNOW:
                                        document.getElementById("liteRadioInfoDevice").innerHTM = "unknow";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE_V2_SX1280:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE V2 SX1280";
                                        break;
                                    case liteRadioUnitType.LiteRadio_2_SE_V2_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 2 SE V2 CC2500";
                                        break;
                                    case liteRadioUnitType.LiteRadio_3_SX1280:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 3 SX1280";
                                        break;
                                    case liteRadioUnitType.LiteRadio_3_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 3 CC2500";
                                        break;
                                    case liteRadioUnitType.LiteRadio_1_CC2500:
                                        document.getElementById("liteRadioInfoDevice").innerHTML = "LiteRadio 1 CC2500";
                                        break;
                                    default:
                                        console.log("The unit type of lite_radio cannot be identified");
                                        break;
                                }
                                switch(HidConfig.internal_radio){
                                    case internalRadioType.UNKNOW:
                                        break;
                                    case internalRadioType.CC2500:
                                        document.getElementById("liteRadioInfoInternalRadio").innerHTML = "CC2500";
                                        break;
                                    case internalRadioType.SX1280:
                                        document.getElementById("liteRadioInfoInternalRadio").innerHTML = "SX1280";
                                        break;
                                    default:
                                        console.log("The type of internal radio cannot be identified");
                                        break;
                                }
                                let board_version = HidConfig.hardware_major_version+'.'+HidConfig.hardware_minor_version+'.'+HidConfig.hardware_pitch_version;
                                let firmware_version;
                                if(HidConfig.firmware_pitch_version < 10 && HidConfig.firmware_major_version >= 24){
                                    firmware_version = HidConfig.firmware_major_version+'.'+HidConfig.firmware_minor_version+'.0'+HidConfig.firmware_pitch_version;
                                }else{
                                    firmware_version = HidConfig.firmware_major_version+'.'+HidConfig.firmware_minor_version+'.'+HidConfig.firmware_pitch_version;
                                }
                                
                                HidConfig.lite_Radio_version = firmware_version;
                                console.log("HidConfig.lite_Radio_version:"+HidConfig.lite_Radio_version);
                                document.getElementById("liteRadioInfoBoardVersion").innerHTML = board_version;
                                document.getElementById("liteRadioInfoFirmwareVersion").innerHTML = firmware_version;
                            }
                        }
                    }else if(data[0] == Command_ID.EXTRA_CUSTOM_CONFIG_ID && HidConfig.LiteRadio_power == false){
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++){
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
                        if(checkSum == checkSum2){
                            console.log("EXTRA_CUSTOM_CONFIG_ID:");
                            console.log(data);
                            HidConfig.JoystickDeadZonePercent = data[2];
                            HidConfig.BuzzerSwitch = (data[3] == 0x0f)?false:true;
                            document.getElementById("BuzzerSwitch").checked = HidConfig.BuzzerSwitch;
                            show.JoystickDeadZonePercent.val(HidConfig.JoystickDeadZonePercent);
                            $("#extra_custom_config").css({display: 'block'});
                        }
                    }else{
                        HidConfig.Have_Receive_HID_Data = true;
                        HidConfig.channel_data[0] = (data[1]<<8 | data[0]);
                        HidConfig.channel_data[1] = (data[3]<<8 | data[2]);
                        HidConfig.channel_data[2] = (data[5]<<8 | data[4]);
                        HidConfig.channel_data[3] = (data[7]<<8 | data[6]);
                        HidConfig.channel_data[4] = (data[9]<<8 | data[8]);
                        HidConfig.channel_data[5] = (data[11]<<8 | data[10]);
                        HidConfig.channel_data[6] = (data[13]<<8 | data[12]);
                        HidConfig.channel_data[7] = (data[15]<<8 | data[14]);
                        HidConfig.channel_data_dispaly[0] = channel_data_map(HidConfig.channel_data[0],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[1] = channel_data_map(HidConfig.channel_data[1],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[2] = channel_data_map(HidConfig.channel_data[2],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[3] = channel_data_map(HidConfig.channel_data[3],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[4] = channel_data_map(HidConfig.channel_data[4],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[5] = channel_data_map(HidConfig.channel_data[5],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[6] = channel_data_map(HidConfig.channel_data[6],0,2047,-100,100);
                        HidConfig.channel_data_dispaly[7] = channel_data_map(HidConfig.channel_data[7],0,2047,-100,100);
                    }               
                });
                hidDevice.on("error", function(err) {
                    isUsbDetectEnable = true;
                    //hidDevice.close();
                    HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                    $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                    const dialogHIDisDisconnect = $('.dialogHIDisDisconnect')[0];
                    dialogHIDisDisconnect.showModal();
                    $('.HIDisDisconnect-confirmbtn').click(function() {
                        dialogHIDisDisconnect.close();
                    });
                    // alert("HID Device Disconnected!");
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    $('div#hidbutton a.connect').removeClass('active');
                });
            }else if(HidConfig.HID_Connect_State == HidConnectStatus.connecting){
                console.log("HID is connecting......");
            }else if(HidConfig.HID_Connect_State == HidConnectStatus.disConnecting){
                console.log("HID is disConnecting......");
            }else if(HidConfig.HID_Connect_State == HidConnectStatus.connected){
                HidConfig.HID_Connect_State = HidConnectStatus.disConnecting;
                $('div.open_hid_device div.connect_hid').text(i18n.getMessage('HidDisConnecting'));
                HIDStopSendingConfig();
                setTimeout(() => {//每隔100ms再发送一次停止命令，连续发3次确保遥控器完全停止发送
                    HIDStopSendingConfig();
                }, 100);
                setTimeout(() => {
                    HIDStopSendingConfig();
                }, 200);
                setTimeout(() => {
                    HIDStopSendingConfig();
                }, 300);
                setTimeout(() => {
                    hidDevice.close();
                    isUsbDetectEnable = true;
                    HidConfig.HID_Connect_State = HidConnectStatus.disConnect;
                    $('div.open_hid_device div.connect_hid').text(i18n.getMessage('Connect_HID'));
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    $('div#hidbutton a.connect').removeClass('active');
                }, 1000);
            }else{
                if(hidDevice != undefined){
                    hidDevice.close();
                }
                isUsbDetectEnable = true;
            }
        }else if(checkUsbConnected() == rcUsbProtocol.UNKNOW_USB_PROTOCOL){
            //提示用户没接遥控器
            const dialogConfirmJoystickExist = $('.dialogConfirmJoystickExist')[0];
            dialogConfirmJoystickExist.showModal();
            $('.JoystickExistDialog-confirmbtn').click(function() {
                dialogConfirmJoystickExist.close();
            });
        }else{
        }
    });
    
    const ui_tabs = $('#tabs > ul');
    $('a', ui_tabs).click(function () {
        if ($(this).parent().hasClass('active') === false && !GUI.tab_switch_in_progress) { 
            const self = this;
            const tabClass = $(self).parent().prop('class');

            const tabRequiresConnection = $(self).parent().hasClass('mode-connected');

            const tab = tabClass.substring(4);
            const tabName = $(self).text();

            GUI.tab_switch_in_progress = true;

            tab_switch_cleanup();

            function tab_switch_cleanup () {
                if ($('div#hidbutton a.connect_hid').hasClass('active') && $('div#hidbutton a.connect').hasClass('active')) {
                    $('div#hidbutton a.connect_hid').removeClass('active');
                    $('div#hidbutton a.connect').removeClass('active');
                }
                // disable previously active tab highlight
                $('li', ui_tabs).removeClass('active');

                // Highlight selected tab
                $(self).parent().addClass('active');

                // detach listeners and remove element data
                const content = $('#content');
                content.empty();

                // display loading screen
                $('#cache .data-loading').clone().appendTo(content);
                $('div#connectbutton a.connect').addClass('disabled');
                
                if($('div#hidbutton a.connect').hasClass('disabled')){
                    $('div#hidbutton a.connect').removeClass('disabled');
                }
                
                function content_ready() {
                    GUI.tab_switch_in_progress = false;
                }
           
                switch (tab) {
                    case 'landing':
                        document.getElementById("hidbutton").style.display = "block";
                        document.getElementById("connectbutton").style.display = "none";
                        rcCurrentScreen = literadioScreenIndex.LITERADIO_SCREEN_WELCOME;
                        landing.initialize(content_ready);
                        break;
                    case 'firmware_flasher_LiteRadio':
                        $('div#connectbutton a.connect').removeClass('disabled');
                        $('div#hidbutton a.connect').addClass('disabled');
                        firmware_flasher_LiteRadio.initialize(content_ready);
                        document.getElementById("hidbutton").style.display = "none";
                        document.getElementById("connectbutton").style.display = "block";
                        rcCurrentScreen = literadioScreenIndex.LITERADIO_SCREEN_FLASH;
                        break;
                    case 'show':
                        show.initialize(content_ready);
                        break;   
                    default:
                        console.log(`Tab not found: ${tab}`);
                }
            }
        }
    });
    firmware_flasher_LiteRadio.connect_init();
    
    i18n.init();
    $('#tabs ul.mode-disconnected li a:first').click();
    //i18n初始化结束后延时一小会儿加载本地json语言包
    setTimeout(function loadLanguage() {
        i18next.changeLanguage(i18n.Storage_language);
        if(i18n.Storage_language == 'en'){
            document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/flogo_RGB_HEX-1024.svg";
        }else if(i18n.Storage_language == "zh_CN"){
            document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/wechat_icon.png";
        }
    }, 10);
}