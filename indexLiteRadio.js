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
var hidDevice = null;

HidConfig = {

    /**************HidConfig中定义的变量保存当前界面组件的数值*******************/

    //遥控器硬件版本
    hardware_version:0,
    //当前使用的协议
    current_protocol:0,
    //支持的功率
    support_power:0,
    
    //美国手、日本手模式
    rocker_mode:0,

    //Trainer 口开关
    trainer_port:0,

    channel_data :[],//经过offset scale reverse运算后的实际数据
    channel_data_raw :[],//经过offset scale reverse运算之前的原始数据


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


    //外置射频模块供电开关
    External_radio_module_power_switch:null,    

     //内部射频模块配置信息
    internal_radio_protocol:0,
    internal_radio_power:0,
    internal_radio_pkt_rate:0,
    internal_radio_tlm:0,

    //外置射频模块配置信息
    external_radio_protocol:0,//协议选择
    external_radio_power_switch:0,//外置高频头供电开关
    
    //外置elrs射频模块参数
    external_radio_power_elrs:0,
    external_radio_pkt_rate_elrs:0,
    external_radio_tlm_elrs:0,


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
           
            let ch_receive_step = 0;//这个标志目的是为了确保只发送一次请求命令
            hidDevice = new HID.HID(VENDOR_ID,PRODUCT_ID);

            if(hidDevice)
            {
                GUI.connect_hid = true;
                $('div.open_firmware_flasher div.connect_hid').text(i18n.getMessage('disConnect_HID'));
                $('#tabs ul.mode-disconnected').hide();

                $('#tabs ul.mode-connected').show();

                $('#tabs ul.mode-connected li a:first').click();

                $('div#flashbutton a.flash').addClass('active');


                hidDevice.on('data', function(data) {//解析遥控器发送过来的信息
               
                    let rquestBuffer = new Buffer.alloc(64);
                    if(data[0] == cmd_type.CHANNELS_INFO_ID)//通道配置信息
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
                                    console.log("receive ch1 config info");

                                    HidConfig.ch1_input_source_display = data[2];
                                    HidConfig.ch1_reverse_display = data[3];
                                    HidConfig.ch1_scale_display = data[4];
                                    HidConfig.ch1_offset_display = data[5]-100;

                                    //请求通道2配置
                                    if(ch_receive_step==0){
                                        ch_receive_step=1;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x02;
                                        console.log();
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 1:
                                    console.log("receive ch2 config info");

                                    HidConfig.ch2_input_source_display = data[2];
                                    HidConfig.ch2_reverse_display = data[3];
                                    HidConfig.ch2_scale_display = data[4];
                                    HidConfig.ch2_offset_display = data[5]-100;
                                    
                                    //请求通道3配置
                                    if(ch_receive_step==1){
                                        ch_receive_step=2;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x03;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 2:
                                    console.log("receive ch3 config info");

                                    HidConfig.ch3_input_source_display = data[2];
                                    HidConfig.ch3_reverse_display = data[3];
                                    HidConfig.ch3_scale_display = data[4];
                                    HidConfig.ch3_offset_display = data[5]-100;

                                    //请求通道4配置
                                    if(ch_receive_step==2){
                                        ch_receive_step=3;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x04;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 3:
                                    console.log("receive ch4 config info");

                                    HidConfig.ch4_input_source_display = data[2];
                                    HidConfig.ch4_reverse_display = data[3];
                                    HidConfig.ch4_scale_display = data[4];
                                    HidConfig.ch4_offset_display = data[5]-100;
                                    
                                    //请求通道5配置
                                    if(ch_receive_step==3){
                                        ch_receive_step=4;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x05;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 4:
                                    console.log("receive ch5 config info");
                                    HidConfig.ch5_input_source_display = data[2];
                                    
                                    //请求通道6配置
                                    if(ch_receive_step==4){
                                        ch_receive_step=5;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x06;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 5:
                                    console.log("receive ch6 config info");
                                    HidConfig.ch6_input_source_display = data[2];
                                    
                                    //请求通道7配置
                                    if(ch_receive_step==5){
                                        ch_receive_step=6;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x07;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 6:
                                    console.log("receive ch7 config info");
                                    HidConfig.ch7_input_source_display = data[2];
                                    
                                    //请求通道8配置
                                    if(ch_receive_step==6){
                                        ch_receive_step=7;
                                        rquestBuffer[0] = 0x00;
                                        rquestBuffer[1] = 0x11;
                                        rquestBuffer[2] = 0x01;
                                        rquestBuffer[3] = 0x08;
                                        hidDevice.write(rquestBuffer);
                                    }
                                    break;

                                case 7:
                                    console.log("receive ch8 config info");
                                    HidConfig.ch8_input_source_display = data[2];
                                    
                                    //全部通道配置信息获取完毕，发送停止命令
                                    
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x11;
                                    rquestBuffer[2] = 0x00;
                                    rquestBuffer[3] = 0x01;
                                    hidDevice.write(rquestBuffer);
                                    ch_receive_step = 0;
                                    break;
                            }
                            show.refreshUI();
                        }
                        
                    }
                    else if(data[0] == cmd_type.Lite_CONFIGER_INFO_ID)//遥控器配置信息（硬件版本、支持协议、左右手油门、功率）
                    {
                        console.log("receive hardware info");
                        var checkSum=0;
                        var checkSum2=0;
                        for(i=0;i<7;i++)
                        {
                            checkSum +=data[2*i] & 0x00ff;
                        }                   
                        checkSum2 = data[15]<<8 | data[14] ;
    
                        if(checkSum == checkSum2)//校验通过
                        {
                            HidConfig.hardware_version = data[1];
                            HidConfig.current_protocol = data[2];
                            HidConfig.rocker_mode = data[3];
                            HidConfig.support_power =data[4];
                            //遥控器硬件信息获取完毕后，需要在这里根据硬件信息修改对应组件的可选元素
                            document.getElementById("rocker_mode").disabled = false;
                            show.rocker_mode.val(HidConfig.rocker_mode);
                            if(HidConfig.hardware_version==0){//硬件型号为：cc2500
                                $("#internal_radio_protocol_elrs_2").css({display: 'none'});
                                $("#internal_radio_protocol_Frsky_F8").css({display: 'block'});
                                $("#internal_radio_protocol_Frsky_F16_FCC").css({display: 'block'});
                                $("#internal_radio_protocol_Frsky_F16_LBT").css({display: 'block'});
                                
                            }else if(HidConfig.hardware_version==1){//硬件型号为：sx1280
                                if(HidConfig.current_protocol==0){//当前协议为：内置elrs协议
                                    $("#internal_radio_protocol_elrs_2").css({display: 'block'});
                                    $("#internal_radio_protocol_Frsky_F8").css({display: 'none'});
                                    $("#internal_radio_protocol_Frsky_F16_FCC").css({display: 'none'});
                                    $("#internal_radio_protocol_Frsky_F16_LBT").css({display: 'none'});
                                    document.getElementById("internal_radio_protocol").disabled = false;
                                    show.internal_radio_protocol.value = 0;
                                    HidConfig.internal_radio_protocol = 0;
                                    //请求内置elrs射频模块参数
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x11;
                                    rquestBuffer[2] = 0x02;
                                    rquestBuffer[3] = 0x01;
                                    hidDevice.write(rquestBuffer);

                                }else if(HidConfig.current_protocol==1){//当前协议为：外置crsf射频模块
                                    console.log("current protocol:external crsf");
                                    document.getElementById("external_radio_protocol").disabled = false;
                                    HidConfig.external_radio_protocol = 1;
                                    show.external_radio_protocol.val(HidConfig.current_protocol);

                                    //开启外部ExpressLRS
                                    rquestBuffer[0] = 0x00;
                                    rquestBuffer[1] = 0x07;
                                    rquestBuffer[2] = 0x01;
                                    rquestBuffer[3] = 0x00;
                                    hidDevice.write(rquestBuffer);

                                    document.getElementById("External_radio_module_power_switch").checked = true;

                                    
                                    rquestBuffer[0] = 0x00;//获取外置射频模块配置信息
                                    rquestBuffer[1] = 0x11;
                                    rquestBuffer[2] = 0x02;
                                    rquestBuffer[3] = 0x02;
                                    hidDevice.write(rquestBuffer);

                                }
                            }else if(HidConfig.hardware_version==2){//硬件型号为：sx1276

                            }
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
                            console.log("receive Internal radio config");

                            //功率档位只支持：25 50 100mw档位
                            $("#ExpressLRS_power_10mw").css({display: 'none'});
                            $("#ExpressLRS_power_25mw").css({display: 'block'});
                            $("#ExpressLRS_power_50mw").css({display: 'block'});
                            $("#ExpressLRS_power_100mw").css({display: 'block'});
                            $("#ExpressLRS_power_250mw").css({display: 'none'});
                            $("#ExpressLRS_power_500mw").css({display: 'none'});
                            $("#ExpressLRS_power_1000mw").css({display: 'none'});

                            //显示当前内置ELRS的配置信息
                            HidConfig.internal_radio_protocol = 0;
                            HidConfig.ExpressLRS_power_option_value = data[2];
                            HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                            HidConfig.ExpressLRS_tlm_option_value = data[4];

                            show.internal_radio_protocol.val(HidConfig.internal_radio_protocol);
                            show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value+1);
                            show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                            show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);

                            HidConfig.Internal_radio_module_switch = true;
                            HidConfig.External_radio_module_switch = false;
                            document.getElementById('internal_radio_module_switch').checked = true;
                            document.getElementById('external_radio_module_switch').checked = false;
                            //外部射频模块供电开关失能
                            document.getElementById("External_radio_module_power_switch").disabled = true; 

                            //ExpressLRS系统可设置
                            document.getElementById("ExpressLRS_power_option_box").disabled = false;
                            document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                            document.getElementById("ExpressLRS_tlm_option_box").disabled = false;



                             //接着请求遥控器通道配置信息
                            rquestBuffer[0] = 0x00;
                            rquestBuffer[1] = 0x11;
                            rquestBuffer[2] = 0x01;
                            rquestBuffer[3] = 0x01;
                            hidDevice.write(rquestBuffer);
                            ch_receive_step = 0;
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
                            console.log("receive External radio config");
                            HidConfig.Internal_radio_module_switch = false;
                            HidConfig.External_radio_module_switch = true;
                            document.getElementById('internal_radio_module_switch').checked = false;
                            document.getElementById('external_radio_module_switch').checked = true;
                            //支持功率档位：10 25 50 100 250 500mw
                            $("#ExpressLRS_power_10mw").css({display: 'block'});
                            $("#ExpressLRS_power_25mw").css({display: 'block'});
                            $("#ExpressLRS_power_50mw").css({display: 'block'});
                            $("#ExpressLRS_power_100mw").css({display: 'block'});
                            $("#ExpressLRS_power_250mw").css({display: 'block'});
                            $("#ExpressLRS_power_500mw").css({display: 'block'});
                            $("#ExpressLRS_power_1000mw").css({display: 'none'});

                            HidConfig.external_radio_protocol = 0;
                            show.external_radio_protocol.val(HidConfig.external_radio_protocol);
                            HidConfig.ExpressLRS_power_option_value = data[2];
                            HidConfig.ExpressLRS_pkt_rate_option_value = data[3];
                            HidConfig.ExpressLRS_tlm_option_value = data[4];
                            console.log("data[2]"+data[2]);
                            console.log("data[3]"+data[3]);
                            console.log("data[4]"+data[4]);

                            show.ExpressLRS_power_option_box.val(HidConfig.ExpressLRS_power_option_value);
                            show.ExpressLRS_pkt_rate_option_box.val(HidConfig.ExpressLRS_pkt_rate_option_value);
                            show.ExpressLRS_tlm_option_box.val(HidConfig.ExpressLRS_tlm_option_value);
                                                    

                            //外部射频模块供电开关使能
                            document.getElementById("External_radio_module_power_switch").disabled = false; 

                            //ExpressLRS系统可设置
                            document.getElementById("ExpressLRS_power_option_box").disabled = false;
                            document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = false;
                            document.getElementById("ExpressLRS_tlm_option_box").disabled = false;


                            if(data[5] == 0x02){//需要根据外部射频模块硬件型号设置组件可选包率
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段915MHz ISM
                                console.log("external radio work on 915MHz ISM");

                            }else if(data[5] == 0x03){
                                //外部射频模块可选包率：
                                //200hz 100hz 50hz 25hz
                                //工作频段868MHz ISM
                                console.log("external radio work on 868MHz ISM");

                            }else if(data[5] == 0x06){
                                //外部射频模块可选包率：
                                //500hz 250hz 150hz 50hz
                                //工作频段2.4GHz ISM
                                console.log("external radio work on 2.4GHz ISM");
                            }

                            //请求遥控器通道配置信息
                            rquestBuffer[0] = 0x00;
                            rquestBuffer[1] = 0x11;
                            rquestBuffer[2] = 0x01;
                            rquestBuffer[3] = 0x01;
                            hidDevice.write(rquestBuffer);
                            ch_receive_step = 0;
                        }else{
                            console.log("checksum error");
                        }
                    }
                    else
                    {
                        HidConfig.channel_data[0] = (data[1]<<8 | data[0]);
                        HidConfig.channel_data[1] = (data[3]<<8 | data[2]);
                        HidConfig.channel_data[2] = (data[5]<<8 | data[4]);
                        HidConfig.channel_data[3] = (data[7]<<8 | data[6]);
                        HidConfig.channel_data[4] = (data[9]<<8 | data[8]);
                        HidConfig.channel_data[5] = (data[11]<<8 | data[10]);
                        HidConfig.channel_data[6] = (data[13]<<8 | data[12]);
                        HidConfig.channel_data[7] = (data[15]<<8 | data[14]);
                    }               
                } );

                hidDevice.on("error", function(err) {
                    hidDevice.close();
                    GUI.connect_hid = false;
                    $('div.open_firmware_flasher div.connect_hid').text(i18n.getMessage('Connect_HID'));
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
            $('div.open_firmware_flasher div.connect_hid').text(i18n.getMessage('Connect_HID'));
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
                if ($('div#flashbutton a.connect_hid').hasClass('active') && $('div#flashbutton a.flash').hasClass('active')) {
                    $('div#flashbutton a.connect_hid').removeClass('active');
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
                    default:
                        console.log(`Tab not found: ${tab}`);
                }
            }
        }
    });
    i18n.init();
    $('#tabs ul.mode-disconnected li a:first').click();
}