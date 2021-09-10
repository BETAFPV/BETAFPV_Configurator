const serialport = require('serialport')
var HID=require('node-hid')
var cmd_type = {
    CHANNELS_INFO_ID:0x01,
    Lite_CONFIGER_INFO_ID:0x05,
    INTERNAL_CONFIGER_INFO_ID:0x06,
    EXTERNAL_CONFIGER_INFO_ID:0x07,
    REQUEST_INFO_ID:0x11,
    REQUESET_SAVE_ID:0x12
};

var VENDOR_ID = 1155;
var PRODUCT_ID = 22352;
let channels = new Array(8);
let hidDevice = null;

HidConfig = {
    channel_data :[],//经过offset scale reverse运算后的实际数据
    channel_data_raw :[],//经过offset scale reverse运算之前的原始数据

    /********************（保存从遥控器发送过来的配置）****************************/
    //通道数据来源
    ch1_input_source:0,
    ch2_input_source:1,
    ch3_input_source:2,
    ch4_input_source:3,
    ch5_input_source:4,
    ch6_input_source:5,
    ch7_input_source:6,
    ch8_input_source:7,


     //通道缩放比例（0-100对应0%-100%）
     ch1_scale:100,
     ch2_scale:100,
     ch3_scale:100,
     ch4_scale:100,
 
     //通道偏移补偿（-100~100，传输协议为无符号类型（映射为0-200），所以接收到的数据要-100再使用，发送时需要+100再发送）
     ch1_offset:0,
     ch2_offset:0,
     ch3_offset:0,
     ch4_offset:0,
 
     //通道值反转
     ch1_reverse:0,
     ch2_reverse:0,
     ch3_reverse:0,
     ch4_reverse:0,

     //美国手、日本手模式
     rocker_mode:0,


    /********************（添加_display后缀，用于记录上位机手动调整后实时显示的值，未发送至遥控器与其同步）****************************/
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
 
     //通道偏移补偿
     ch1_offset_display:0,
     ch2_offset_display:0,
     ch3_offset_display:0,
     ch4_offset_display:0,
 
     //通道值反转
     ch1_reverse_display:0,
     ch2_reverse_display:0,
     ch3_reverse_display:0,
     ch4_reverse_display:0,


    trainerPort:0,

    irSystemProtocol:0,
    irSystemPower:0,
    irPktRate:0,
    irTLMRadio:0,

    erSystemProtocol:0,
    erSystemPower:0,

    exELRSSystemPower:0,
    exELRSPktRate:0,
    exELRSTLMRadio:0,

    version:0,
    protocol:0,
};


/*通道反向运算*/
function Gimbalreverse(gimbalValCurr){
    return 1023 - (gimbalValCurr-1023);
}

/*通道比例缩放*/
function Gimbalscale(gimbalValCurr,scale){
    return 1023 - parseInt((gimbalValCurr-1023)*scale/100);
}

/*根据遥控器发送过来值，计算出经过比例缩放之前原始数据*/
function gimbal_current_to_raw(gimbalValCurr,scale,offset,reverse){
    if(reverse){
        return 1024-((gimbalValCurr-1024)/(scale/100)-offset*5);
    }else{
        return 1024+((gimbalValCurr-1024)/(scale/100)-offset*5);
    }
}

/*根据原始数据，计算出当前遥控器经过比例缩放后发送过来的值*/
function gimbal_raw_to_current(gimbalValRaw,scale,offset,reverse){
    if(reverse){
        return 1023-(gimbalValRaw-1023+offset*5)*(scale/100);
    }else{
        return 1023+(gimbalValRaw-1023+offset*5)*(scale/100);
    }
}

function limit_value(input,min,max){
    if(input<min)
    input = min;
    else if(input>max)
    input = max;
    return parseInt(input).toFixed(0);
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

async function listSerialPorts() {
    await serialport.list().then((ports, err) => {

        for (let i = 0; i < ports.length; i++) {
            addOptionValue('port',i,ports[i].path);
        }
    })
}

setTimeout(function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
  }, 2000);

setTimeout(function loadLanguage() {
    i18next.changeLanguage(i18n.Storage_language);
}, 200);
window.onload=function(){

    $('div.open_firmware_flasher a.flash').click(function () {
        if (GUI.connect_hid != true) {
            console.log('connect hid');

            hidDevice = new HID.HID(VENDOR_ID,PRODUCT_ID);

            if(hidDevice)
            {
                GUI.connect_hid = true;

                $('#tabs ul.mode-disconnected').hide();

                $('#tabs ul.mode-connected').show();

                $('#tabs ul.mode-connected li a:first').click();

                $('div#flashbutton a.flash').addClass('active');


                hidDevice.on('data', function(data) {
               
                    if(data[0] == cmd_type.CHANNELS_INFO_ID)//命令类型为通道配置信息
                    {
                        var checkSum=0;
                        var checkSum2=0;

                        for(i=0;i<7;i++)
                        {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
    
                        if(checkSum == checkSum2)
                        {
                            switch(data[1])//判断是哪个通道
                            {
                                case 0:
                                    HidConfig.ch1_input_source = data[2];
                                    HidConfig.ch1_reverse = data[3];
                                    HidConfig.ch1_scale = data[4];
                                    HidConfig.ch1_offset = data[5]-100;

                                    HidConfig.ch1_input_source_display = data[2];
                                    HidConfig.ch1_reverse_display = data[3];
                                    HidConfig.ch1_scale_display = data[4];
                                    HidConfig.ch1_offset_display = data[5]-100;
                                    break;

                                case 1:
                                    HidConfig.ch2_input_source = data[2];
                                    HidConfig.ch2_reverse = data[3];
                                    HidConfig.ch2_scale = data[4];
                                    HidConfig.ch2_offset = data[5]-100;

                                    HidConfig.ch2_input_source_display = data[2];
                                    HidConfig.ch2_reverse_display = data[3];
                                    HidConfig.ch2_scale_display = data[4];
                                    HidConfig.ch2_offset_display = data[5]-100;
                                    break;

                                case 2:
                                    HidConfig.ch3_input_source = data[2];
                                    HidConfig.ch3_reverse = data[3];
                                    HidConfig.ch3_scale = data[4];
                                    HidConfig.ch3_offset = data[5]-100;

                                    HidConfig.ch3_input_source_display = data[2];
                                    HidConfig.ch3_reverse_display = data[3];
                                    HidConfig.ch3_scale_display = data[4];
                                    HidConfig.ch3_offset_display = data[5]-100;
                                    break;

                                case 3:
                                    HidConfig.ch4_input_source = data[2];
                                    HidConfig.ch4_reverse = data[3];
                                    HidConfig.ch4_scale = data[4];
                                    HidConfig.ch4_offset = data[5]-100;

                                    HidConfig.ch4_input_source_display = data[2];
                                    HidConfig.ch4_reverse_display = data[3];
                                    HidConfig.ch4_scale_display = data[4];
                                    HidConfig.ch4_offset_display = data[5]-100;
                                    break;

                                case 4:
                                    HidConfig.ch5_input_source = data[2];
                                    HidConfig.ch5_input_source_display = data[2];
                                    break;

                                case 5:
                                    HidConfig.ch6_input_source = data[2];
                                    HidConfig.ch6_input_source_display = data[2];
                                    break;

                                case 6:
                                    HidConfig.ch7_input_source = data[2];
                                    HidConfig.ch7_input_source_display = data[2];
                                    break;

                                case 7:
                                    HidConfig.ch8_input_source = data[2];
                                    HidConfig.ch8_input_source_display = data[2];
                                    break;
                            }
                            show.refreshUI();
                        }
                        
                    }
                    else if(data[0] == cmd_type.Lite_CONFIGER_INFO_ID)
                    {
                        var checkSum=0;
                        var checkSum2=0;

                        for(i=0;i<7;i++)
                        {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
    
                        if(checkSum == checkSum2)
                        {

                            HidConfig.version = data[1];
                            HidConfig.protocol = data[2];

                            if(data[2]==0)
                            {
                                HidConfig.irSystemProtocol = 1;
                            }
                            else if(data[2]==1)
                            {
                                HidConfig.erSystemProtocol = 1;
                            }
                            else if(data[2]==2)
                            {
                                HidConfig.irSystemProtocol = 0;
                            }
                            HidConfig.rocker_mode = data[3];

                            HidConfig.irSystemPower = data[4];

                            show.refreshUI();
                        }                 
                    }
                    else if(data[0] == cmd_type.INTERNAL_CONFIGER_INFO_ID)
                    {
                        var checkSum=0;
                        var checkSum2=0;

                        for(i=0;i<7;i++)
                        {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
    
                        if(checkSum == checkSum2)
                        {

                            HidConfig.irSystemPower = data[2]; 
                            HidConfig.irPktRate = data[3];
                            HidConfig.irTLMRadio = data[4];

                            show.refreshUI();
                        }                
                    }
                    else if(data[0] == cmd_type.EXTERNAL_CONFIGER_INFO_ID)
                    {
                        var checkSum=0;
                        var checkSum2=0;

                        for(i=0;i<7;i++)
                        {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
    
                        if(checkSum == checkSum2)
                        {

                            HidConfig.exELRSSystemPower = data[2]; 
                            HidConfig.exELRSPktRate = data[3];
                            HidConfig.exELRSTLMRadio = data[4];

                            show.refreshUI();
                        }
                    }
                    else
                    {
                        
                        // HidConfig.channel_data[0] = (data[1]<<8 | data[0]);
                        // HidConfig.channel_data[1] = (data[3]<<8 | data[2]);
                        // HidConfig.channel_data[2] = (data[5]<<8 | data[4]);
                        // HidConfig.channel_data[3] = (data[7]<<8 | data[6]);
                        HidConfig.channel_data[4] = (data[9]<<8 | data[8]);
                        HidConfig.channel_data[5] = (data[11]<<8 | data[10]);
                        HidConfig.channel_data[6] = (data[13]<<8 | data[12]);
                        HidConfig.channel_data[7] = (data[15]<<8 | data[14]);

                        HidConfig.channel_data_raw[0] = gimbal_current_to_raw((data[1]<<8 | data[0]),HidConfig.ch1_scale,HidConfig.ch1_offset,HidConfig.ch1_reverse);
                        HidConfig.channel_data_raw[1] = gimbal_current_to_raw((data[3]<<8 | data[2]),HidConfig.ch2_scale,HidConfig.ch2_offset,HidConfig.ch1_reverse);
                        HidConfig.channel_data_raw[2] = gimbal_current_to_raw((data[5]<<8 | data[4]),HidConfig.ch3_scale,HidConfig.ch3_offset,HidConfig.ch1_reverse);
                        HidConfig.channel_data_raw[3] = gimbal_current_to_raw((data[7]<<8 | data[6]),HidConfig.ch4_scale,HidConfig.ch4_offset,HidConfig.ch1_reverse);
                        
                        HidConfig.channel_data[0] = limit_value(gimbal_raw_to_current(HidConfig.channel_data_raw[0],HidConfig.ch1_scale_display,HidConfig.ch1_offset_display,HidConfig.ch1_reverse_display),0,2047);
                        HidConfig.channel_data[1] = limit_value(gimbal_raw_to_current(HidConfig.channel_data_raw[1],HidConfig.ch2_scale_display,HidConfig.ch2_offset_display,HidConfig.ch2_reverse_display),0,2047);
                        HidConfig.channel_data[2] = limit_value(gimbal_raw_to_current(HidConfig.channel_data_raw[2],HidConfig.ch3_scale_display,HidConfig.ch3_offset_display,HidConfig.ch3_reverse_display),0,2047);
                        HidConfig.channel_data[3] = limit_value(gimbal_raw_to_current(HidConfig.channel_data_raw[3],HidConfig.ch4_scale_display,HidConfig.ch4_offset_display,HidConfig.ch4_reverse_display),0,2047);
                    }               
                } );

                hidDevice.on("error", function(err) {
                    hidDevice.close();
                    GUI.connect_hid = false;
                    alert("HID Device Disconnected!");

                    $('#tabs ul.mode-connected').hide();

                    $('#tabs ul.mode-disconnected').show();
        
                    $('#tabs ul.mode-disconnected li a:first').click();
        
                    $('div#flashbutton a.flash').removeClass('active');
                });
            }
            else
            {
                alert("Not Found HID Device!");
            }
             
        }
        else
        {
            hidDevice.close();
            GUI.connect_hid = false;
            console.log('close hid');

            $('#tabs ul.mode-connected').hide();

            $('#tabs ul.mode-disconnected').show();

            $('#tabs ul.mode-disconnected li a:first').click();

            $('div#flashbutton a.flash').removeClass('active');
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
                if ($('div#flashbutton a.flash_state').hasClass('active') && $('div#flashbutton a.flash').hasClass('active')) {
                    $('div#flashbutton a.flash_state').removeClass('active');
                    $('div#flashbutton a.flash').removeClass('active');
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
                

                if($('div#flashbutton a.flash').hasClass('disabled'))
                {
                    $('div#flashbutton a.flash').removeClass('disabled');
                }
                
                function content_ready() {
                    GUI.tab_switch_in_progress = false;
                }
           
                switch (tab) {
                    case 'landing':
                        landing.initialize(content_ready);
                        break;
                    case 'firmware_flasher_LiteRadio':
                        $('div#connectbutton a.connect').removeClass('disabled');
                        $('div#flashbutton a.flash').addClass('disabled');
                        firmware_flasher_LiteRadio.initialize(content_ready);
                        break;
                    case 'show':
                        show.initialize(content_ready);
                        break;   
                    case 'calibrate':
                        calibrate.initialize(content_ready);
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