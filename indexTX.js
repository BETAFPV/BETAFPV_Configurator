const serialport = require('serialport')
var lastPortCount = 0;


var liteRadioUnitType = {
    UNKNOW:0x00,
    LiteRadio_2_SE:0x01,
    LiteRadio_2_SE_V2_SX1280:0x02,
    LiteRadio_2_SE_V2_CC2500:0x03,
    LiteRadio_3_SX1280:0x04,
    LiteRadio_3_CC2500:0x05,
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
};

var ConnectStatus = {
    connected:0x00,     //已连接
    connecting:0x01,    //连接中
    disConnecting:0x02, //断开连接中
    disConnect:0x03,    //未连接
}

let channels = new Array(8);
var vcpDevice = null;
var ch_receive_step  = 0;

VCPConfig = {

    /**************HidConfig中定义的变量保存当前界面组件的数值*******************/
    //当前HID的连接状态
    Connect_State:ConnectStatus.disConnect,

    //要开启开关机状态
    LiteRadio_power:true,
    
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

    //美国手、日本手模式
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

    //通道缩放比例（0-100对应0%-100%）
    ch1_scale_display:100,
    ch2_scale_display:100,
    ch3_scale_display:100,
    ch4_scale_display:100,
    ch5_scale_display:100,
    ch6_scale_display:100,
    ch7_scale_display:100,
    ch8_scale_display:100,

    //通道偏移补偿
    ch1_offset_display:0,
    ch2_offset_display:0,
    ch3_offset_display:0,
    ch4_offset_display:0,
    ch5_offset_display:0,
    ch6_offset_display:0,
    ch7_offset_display:0,
    ch8_offset_display:0,

    //通道值反转
    ch1_reverse_display:0,
    ch2_reverse_display:0,
    ch3_reverse_display:0,
    ch4_reverse_display:0,
    ch5_reverse_display:0,
    ch6_reverse_display:0,
    ch7_reverse_display:0,
    ch8_reverse_display:0,

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

};


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

async function listSerialPorts() {
    await serialport.list().then((ports, err) => {
        if(ports.length!==lastPortCount){
            $('#port option').each(function(){ 
                $(this).remove(); 
            } );
        }

        for (let i = 0; i < ports.length; i++) {
            addOptionValue('port',i,ports[i].path);
        }
        lastPortCount = ports.length;
    })
}

setTimeout(function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
  }, 2000);

setTimeout(function loadLanguage() {
    i18next.changeLanguage(i18n.Storage_language);
    if(i18n.Storage_language == 'en'){
    document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/flogo_RGB_HEX-1024.svg";
    }else if(i18n.Storage_language == "zh_CN"){
    document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/wechat_icon.png";
    }
}, 200);

mavlinkSend = function(writedata){
    port.write(writedata, function (err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
    });
  } 


window.onload=function(){

    function mavlink_msg_heartbeat(){
        let msg = new  mavlink10.messages.heartbeat(3,11);
        let buffer = msg.pack(msg);
        mavlinkSend(buffer);
     }

    $('div.connect_controls a.connect').click(function () {
        if (GUI.connect_lock != true) { 
            const thisElement = $(this);
            const clicks = thisElement.data('clicks');
            
            const toggleStatus = function() {
                thisElement.data("clicks", !clicks);
            };

            GUI.configuration_loaded = false;

            const selected_baud = parseInt($('div#port-picker #baud').val());

            let COM = ($('div#port-picker #port option:selected').text());

            console.log(COM);
            console.log(selected_baud);

            port = new serialport(COM, {
                baudRate: parseInt(selected_baud),
                dataBits: 8,
                parity: 'none',
                stopBits: 1
            });
            
            //open事件监听
            port.on('open', () =>{
                console.log('serialport open success LiteRadio');
                $('div#connectbutton a.connect').addClass('active');  
                $('div#connectbutton div.connect_state').text(i18n.getMessage('disconnect'));

                GUI.connect_lock = true;

                if(isFlasherTab ==0)
                {
                    $('#tabs ul.mode-disconnected').hide();
                    $('#tabs ul.mode-connected').show();
                    $('#tabs ul.mode-connected li a:first').click();
                    GUI.interval_add('mavlink_heartbeat', mavlink_msg_heartbeat, 1000, true);
                }     
            });

            //close事件监听
            port.on('close', () =>{
                GUI.connect_lock = false;
                console.log('serialport close success')
                GUI.interval_remove('mavlink_heartbeat');
                $('div.connect_controls div.connect_state').text(i18n.getMessage('connect'));

                if(isFlasherTab ==0)
                {
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    $('div#connectbutton a.connect').removeClass('active');
                }
            });

            //data事件监听
            port.on('data', data => {
                if(isFlasherTab)
                {
                    firmware_flasher_LiteRadio.parseData(data);
                }
                else
                {
                    mavlinkParser.parseBuffer(data);
                }
            });

            //error事件监听
            port.on('error',function(err){
                $('div#connectbutton div.connect_state').text(i18n.getMessage('connect'));
                console.log('Error: ',err.message);

                if(isFlasherTab ==0)
                {
                    $('#tabs ul.mode-connected').hide();
                    $('#tabs ul.mode-disconnected').show();
                    $('#tabs ul.mode-disconnected li a:first').click();
                    GUI.connect_lock = false;
                    GUI.interval_remove('mavlink_heartbeat');
                    $('div#connectbutton a.connect').removeClass('active');
                }
            });
        }
        else
        {
            port.close();
            $('#tabs ul.mode-connected').hide();
            $('#tabs ul.mode-disconnected').show();
            $('#tabs ul.mode-disconnected li a:first').click();
            GUI.connect_lock = false;
            GUI.interval_remove('mavlink_heartbeat');
            $('div#connectbutton a.connect').removeClass('active');
            $('div.connect_controls div.connect_state').text(i18n.getMessage('connect'));
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
            isFlasherTab = 0;   

            tab_switch_cleanup();

            function tab_switch_cleanup () {
                // disable previously active tab highlight
                $('li', ui_tabs).removeClass('active');

                // Highlight selected tab
                $(self).parent().addClass('active');

                // detach listeners and remove element data
                const content = $('#content');
                content.empty();

                // display loading screen
                $('#cache .data-loading').clone().appendTo(content);
     
                function content_ready() {
                    GUI.tab_switch_in_progress = false;
                }
           
                switch (tab) {
                    case 'landing':
                        landing.initialize(content_ready);
                        break;
                    case 'firmware_flasher_LiteRadio':
                        firmware_flasher_LiteRadio.initialize(content_ready);
                        isFlasherTab = 1;   
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

    i18n.init();
    $('#tabs ul.mode-disconnected li a:first').click();
}