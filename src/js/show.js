const show = {
    
    /**************show定义的变量用于索引界面组件*******************/

    //日本手、美国手模式
    rocker_mode:null,
    //Trainer 口开关
    trainer_port:null,
    
    
    //通道对应数据来源
    ch1_data_source:null,
    ch2_data_source:null,
    ch3_data_source:null,
    ch4_data_source:null,
    ch5_data_source:null,
    ch6_data_source:null,
    ch7_data_source:null,
    ch8_data_source:null,

    //通道缩放比例
    ch1_scale:null,
    ch2_scale:null,
    ch3_scale:null,
    ch4_scale:null,
    ch5_scale:null,
    ch6_scale:null,
    ch7_scale:null,
    ch8_scale:null,

    //通道偏移补偿
    ch1_offset:null,
    ch2_offset:null,
    ch3_offset:null,
    ch4_offset:null,
    ch5_offset:null,
    ch6_offset:null,
    ch7_offset:null,
    ch8_offset:null,

    //通道值反转
    ch1_reverse:null,
    ch2_reverse:null,
    ch3_reverse:null,
    ch4_reverse:null,
    ch5_reverse:null,
    ch6_reverse:null,
    ch7_reverse:null,
    ch8_reverse:null,

    //内外置射频模块开关
    Internal_radio_module_switch:null,
    External_radio_module_switch:null,
    
    
    //ExpressLRS系统参数配置
    ExpressLRS_power_option_box:null,
    ExpressLRS_pkt_rate_option_box:null,
    ExpressLRS_tlm_option_box:null,


    //外置射频模块供电开关
    External_radio_module_power_switch:null,
    
    //内部射频模块配置信息
    internal_radio_protocol:null,
   

    //外置射频模块配置信息
    external_radio_protocol:null,//外置高频头协议选择



};


show.refreshUI = function()
{
    show.rocker_mode.val(HidConfig.rocker_mode);
    // show.trainer_port.val(HidConfig.trainerPort);

    show.ch1_data_source.val(HidConfig.ch1_input_source_display);
    show.ch2_data_source.val(HidConfig.ch2_input_source_display);
    show.ch3_data_source.val(HidConfig.ch3_input_source_display);
    show.ch4_data_source.val(HidConfig.ch4_input_source_display);
    show.ch5_data_source.val(HidConfig.ch5_input_source_display);
    show.ch6_data_source.val(HidConfig.ch6_input_source_display);
    show.ch7_data_source.val(HidConfig.ch7_input_source_display);
    show.ch8_data_source.val(HidConfig.ch8_input_source_display);


    document.getElementById('ch1_check').checked = HidConfig.ch1_reverse_display;
    document.getElementById('ch2_check').checked = HidConfig.ch2_reverse_display;
    document.getElementById('ch3_check').checked = HidConfig.ch3_reverse_display;
    document.getElementById('ch4_check').checked = HidConfig.ch4_reverse_display;
    document.getElementById('ch5_check').checked = HidConfig.ch5_reverse_display;
    document.getElementById('ch6_check').checked = HidConfig.ch6_reverse_display;
    document.getElementById('ch7_check').checked = HidConfig.ch7_reverse_display;
    document.getElementById('ch8_check').checked = HidConfig.ch8_reverse_display;
    
    show.ch1_scale.val(HidConfig.ch1_scale_display);
    show.ch2_scale.val(HidConfig.ch2_scale_display);
    show.ch3_scale.val(HidConfig.ch3_scale_display);
    show.ch4_scale.val(HidConfig.ch4_scale_display);
    show.ch5_scale.val(HidConfig.ch5_scale_display);
    show.ch6_scale.val(HidConfig.ch6_scale_display);
    show.ch7_scale.val(HidConfig.ch7_scale_display);
    show.ch8_scale.val(HidConfig.ch8_scale_display);

    show.ch1_offset.val(HidConfig.ch1_offset_display);
    show.ch2_offset.val(HidConfig.ch2_offset_display);
    show.ch3_offset.val(HidConfig.ch3_offset_display);
    show.ch4_offset.val(HidConfig.ch4_offset_display);
    show.ch5_offset.val(HidConfig.ch5_offset_display);
    show.ch6_offset.val(HidConfig.ch6_offset_display);
    show.ch7_offset.val(HidConfig.ch7_offset_display);
    show.ch8_offset.val(HidConfig.ch8_offset_display);

};


show.initialize = function (callback) {
    let configBuff = new Buffer.alloc(64);
    $('#content').load("./src/html/show.html", function () {

        
        i18n.localizePage();
        const bar_names = [
            "CH1",
            "CH2",
            "CH3",
            "CH4",
            "CH5",
            "CH6",
            "CH7",
            "CH8"
        ];
        const numBars = 8;
        const barContainer = $('.tab-show .bars');
    
        for (let i = 0; i < numBars; i++) {
            let name;
            if (i < bar_names.length) {
                name = bar_names[i];
            } 
    
            barContainer.append('\
                <ul>\
                    <li class="name">' + name + '</li>\
                    <li class="meter">\
                        <div class="meter-bar">\
                            <div class="label"></div>\
                            <div class="fill' + '' + '">\
                                <div class="label"></div>\
                            </div>\
                        </div>\
                    </li>\
                </ul>\
            ');
        }
    
        const meterScale = {
            'min': -100,
            'max': 100
        };
    
        const meterFillArray = [];
        const meterLabelArray = [];
        $('.meter .fill', barContainer).each(function () {
            meterFillArray.push($(this));
        });
    
        
        $('.meter', barContainer).each(function () {
            meterLabelArray.push($('.label' , this));
        });

        // correct inner label margin on window resize (i don't know how we could do this in css)
        tabresize = function () {
            const containerWidth = $('.meter:first', barContainer).width(),
                labelWidth = $('.meter .label:first', barContainer).width(),
                margin = (containerWidth / 2) - (labelWidth / 2);

            for (let i = 0; i < meterLabelArray.length; i++) {
                meterLabelArray[i].css('margin-left', margin);
            }
        };
        GUI.interval_remove('receiver_pull');
        GUI.interval_add('receiver_pull', update_ui, 50, true);
    
        show.rocker_mode = $('select[name="radiomode"]');
        show.trainer_port = $('input[name="trainer_port"]');

        show.Internal_radio_module_switch = $('input[id="internal_radio_module_switch"]');
        show.External_radio_module_switch = $('input[id="external_radio_module_switch"]');

        show.External_radio_module_power_switch = $('input[id="External_radio_module_power_switch"]');

        show.ExpressLRS_power_option_box = $('select[id="ExpressLRS_power_option_box"]');
        show.ExpressLRS_pkt_rate_option_box = $('select[id="ExpressLRS_pkt_rate_option_box"]');
        show.ExpressLRS_tlm_option_box = $('select[id="ExpressLRS_tlm_option_box"]');

        show.ch1_data_source = $('select[name="ch1_data_source"]');
        show.ch2_data_source = $('select[name="ch2_data_source"]');
        show.ch3_data_source = $('select[name="ch3_data_source"]');
        show.ch4_data_source = $('select[name="ch4_data_source"]');
        show.ch5_data_source = $('select[name="ch5_data_source"]');
        show.ch6_data_source = $('select[name="ch6_data_source"]');
        show.ch7_data_source = $('select[name="ch7_data_source"]');
        show.ch8_data_source = $('select[name="ch8_data_source"]');

        show.ch1_scale=$('input[name="ch1_scale"]');
        show.ch2_scale=$('input[name="ch2_scale"]');
        show.ch3_scale=$('input[name="ch3_scale"]');
        show.ch4_scale=$('input[name="ch4_scale"]');
        show.ch5_scale=$('input[name="ch5_scale"]');
        show.ch6_scale=$('input[name="ch6_scale"]');
        show.ch7_scale=$('input[name="ch7_scale"]');
        show.ch8_scale=$('input[name="ch8_scale"]');

        show.ch1_offset=$('input[name="ch1_offset"]');
        show.ch2_offset=$('input[name="ch2_offset"]');
        show.ch3_offset=$('input[name="ch3_offset"]');
        show.ch4_offset=$('input[name="ch4_offset"]');
        show.ch5_offset=$('input[name="ch5_offset"]');
        show.ch6_offset=$('input[name="ch6_offset"]');
        show.ch7_offset=$('input[name="ch7_offset"]');
        show.ch8_offset=$('input[name="ch8_offset"]');

        show.ch1_reverse=$('input[id="ch1_check"]');
        show.ch2_reverse=$('input[id="ch2_check"]');
        show.ch3_reverse=$('input[id="ch3_check"]');
        show.ch4_reverse=$('input[id="ch4_check"]');
        show.ch5_reverse=$('input[id="ch5_check"]');
        show.ch6_reverse=$('input[id="ch6_check"]');
        show.ch7_reverse=$('input[id="ch7_check"]');
        show.ch8_reverse=$('input[id="ch8_check"]');


        show.internal_radio_protocol = $('select[id="internal_radio_protocol"]');
        show.external_radio_protocol = $('select[id="external_radio_protocol"]');
        $(window).on('resize', tabresize).resize(); // trigger so labels get correctly aligned on creation

        const COLOR_ACCENT = 'var(--accent)';
        const COLOR_SWITCHERY_SECOND = 'var(--switcherysecond)';


        $('.toggle').each(function(index, elem) {
            const switchery = new Switchery(elem, {
                color: COLOR_ACCENT,
                secondaryColor: COLOR_SWITCHERY_SECOND,
            });
            $(elem).on("change", function () {
                switchery.setPosition();
            });
            $(elem).removeClass('toggle');
        });

        function update_ui() {
            // update bars with latest data
            for (let i = 0; i < 8; i++) {
                
                meterFillArray[i].css('width', (HidConfig.channel_data_dispaly[i] - meterScale.min) / (meterScale.max - meterScale.min)*100+'%');
                meterLabelArray[i].text(HidConfig.channel_data_dispaly[i]);
            }
        }

        
        
        show.Internal_radio_module_switch.change(function () {
            if( HidConfig.External_radio_module_switch){//开启内置模块前先检查外置模块是否已开启
                const dialogConfirmCloseInternalRadio = $('.dialogCloseInternalRadio')[0];
                dialogConfirmCloseInternalRadio.showModal();
                $('.dialogCloseInternalRadio-confirmbtn').click(function() {
                    dialogConfirmCloseInternalRadio.close();
                });
                document.getElementById('internal_radio_module_switch').checked = false;
            }else{
                HidConfig.Internal_radio_module_switch = $(this).is(':checked')?1:0;
                if(HidConfig.Internal_radio_module_switch){
                    document.getElementById('internal_radio_protocol').disabled = false;
                }else{
                    document.getElementById('internal_radio_protocol').disabled = true;
                    // document.getElementById('ExpressLRS_power_option_box').disabled = true;
                    // document.getElementById('ExpressLRS_pkt_rate_option_box').disabled = true;
                    // document.getElementById('ExpressLRS_tlm_option_box').disabled = true;
                }
            }
            
        });
        show.External_radio_module_switch.change(function () {
            if( HidConfig.Internal_radio_module_switch){//开启外置模块前先检查内置模块是否已开启
                const dialogConfirmCloseExternalRadio = $('.dialogCloseExternalRadio')[0];
                dialogConfirmCloseExternalRadio.showModal();
                $('.dialogCloseExternalRadio-confirmbtn').click(function() {
                    dialogConfirmCloseExternalRadio.close();
                });
                document.getElementById('external_radio_module_switch').checked = false;
            }else{
                HidConfig.External_radio_module_switch = $(this).is(':checked')?1:0;
                if(HidConfig.External_radio_module_switch){
                    document.getElementById('external_radio_protocol').disabled = false;
                }else{
                    document.getElementById('external_radio_protocol').disabled = true;
                    document.getElementById('External_radio_module_power_switch').disabled = true;
                    // document.getElementById('ExpressLRS_power_option_box').disabled = true;
                    // document.getElementById('ExpressLRS_pkt_rate_option_box').disabled = true;
                    // document.getElementById('ExpressLRS_tlm_option_box').disabled = true;

                }
            }
        });

        show.External_radio_module_power_switch.change(function () {
            HidConfig.External_radio_module_power_switch = $(this).is(':checked')?1:0;
            if(HidConfig.External_radio_module_power_switch){
                console.log("elrs power on");
                let  buffer= new Buffer.alloc(64);//开始外置射频模块电源
                buffer[0] = 0x00;
                buffer[1] = 0x07;
                buffer[2] = 0x01;
                hidDevice.write(buffer);

                buffer[0] = 0x00;//获取外置ExpressLRS模块配置信息
                buffer[1] = 0x11;
                buffer[2] = 0x02;
                buffer[3] = 0x02;
                hidDevice.write(buffer);

            }else{
                console.log("elrs power off");
                let  buffer= new Buffer.alloc(64);
                buffer[0] = 0x00; 
                buffer[1] = 0x07;
                buffer[2] = 0x00;
                hidDevice.write(buffer);
                document.getElementById("ExpressLRS_power_option_box").disabled = true;
                document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = true;
                document.getElementById("ExpressLRS_tlm_option_box").disabled = true;
            }
        });
        show.ExpressLRS_power_option_box.change(function () {
            HidConfig.ExpressLRS_power_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(HidConfig.Internal_radio_module_switch){
                if(HidConfig.internal_radio_protocol==0){
                    send_internal_radio_config();
                    console.log("set internal ELRS power config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(HidConfig.External_radio_module_switch){
                if(HidConfig.external_radio_protocol == 0){
                    send_external_exrs_radio_config();
                    console.log("set external ELRS power config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        show.ExpressLRS_pkt_rate_option_box.change(function () {
            HidConfig.ExpressLRS_pkt_rate_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(HidConfig.Internal_radio_module_switch){
                if(HidConfig.internal_radio_protocol==0){
                    send_internal_radio_config();
                    console.log("set internal ELRS pkt rate config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(HidConfig.External_radio_module_switch){
                if(HidConfig.external_radio_protocol == 0){
                    send_external_exrs_radio_config();
                    console.log("set external ELRS pkt rate config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        show.ExpressLRS_tlm_option_box.change(function () {
            HidConfig.ExpressLRS_tlm_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(HidConfig.Internal_radio_module_switch){
                if(HidConfig.internal_radio_protocol==0){
                    send_internal_radio_config();
                    console.log("set internal ELRS tml config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(HidConfig.External_radio_module_switch){
                if(HidConfig.external_radio_protocol == 0){
                    send_external_exrs_radio_config();
                    console.log("set external ELRS tml config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        
        
        show.ch1_data_source.change(function () {
            HidConfig.ch1_input_source_display = parseInt($(this).val(), 10);
            send_ch1_config();
        });
        show.ch2_data_source.change(function () {
            HidConfig.ch2_input_source_display = parseInt($(this).val(), 10);
            send_ch2_config();
        });
        show.ch3_data_source.change(function () {
            HidConfig.ch3_input_source_display = parseInt($(this).val(), 10);
            send_ch3_config();
        });
        show.ch4_data_source.change(function () {
            HidConfig.ch4_input_source_display = parseInt($(this).val(), 10);
            send_ch4_config();
        });
        show.ch5_data_source.change(function () {
            HidConfig.ch5_input_source_display = parseInt($(this).val(), 10);
            send_ch5_config();
        });
        show.ch6_data_source.change(function () {
            HidConfig.ch6_input_source_display = parseInt($(this).val(), 10);
            send_ch6_config();
        });
        show.ch7_data_source.change(function () {
            HidConfig.ch7_input_source_display = parseInt($(this).val(), 10);
            send_ch7_config();
        });
        show.ch8_data_source.change(function () {
            HidConfig.ch8_input_source_display = parseInt($(this).val(), 10);
            send_ch8_config();
        });
        show.ch1_reverse.change(function () {
            HidConfig.ch1_reverse_display = $(this).is(':checked')?1:0;
            send_ch1_config();
        });
        show.ch2_reverse.change(function () {
            HidConfig.ch2_reverse_display = $(this).is(':checked')?1:0;
            send_ch2_config();
        });
        show.ch3_reverse.change(function () {
            HidConfig.ch3_reverse_display = $(this).is(':checked')?1:0;
            send_ch3_config();
        });
        show.ch4_reverse.change(function () {
            HidConfig.ch4_reverse_display = $(this).is(':checked')?1:0;
            send_ch4_config();
        }); 
        show.ch5_reverse.change(function () {
            HidConfig.ch5_reverse_display = $(this).is(':checked')?1:0;
            send_ch5_config();
        });
        show.ch6_reverse.change(function () {
            HidConfig.ch6_reverse_display = $(this).is(':checked')?1:0;
            send_ch6_config();
        });
        show.ch7_reverse.change(function () {
            HidConfig.ch7_reverse_display = $(this).is(':checked')?1:0;
            send_ch7_config();
        });
        show.ch8_reverse.change(function () {
            HidConfig.ch8_reverse_display = $(this).is(':checked')?1:0;
            send_ch8_config();
        }); 
        show.ch1_scale.change(function () {
            HidConfig.ch1_scale_display = parseInt($(this).val(), 10);
            send_ch1_config();
        });
        show.ch2_scale.change(function () {
            HidConfig.ch2_scale_display = parseInt($(this).val(), 10);
            send_ch2_config();
        });
        show.ch3_scale.change(function () {
            HidConfig.ch3_scale_display = parseInt($(this).val(), 10);
            send_ch3_config();
        });
        show.ch4_scale.change(function () {
            HidConfig.ch4_scale_display = parseInt($(this).val(), 10);
            send_ch4_config();
        });
        show.ch5_scale.change(function () {
            HidConfig.ch5_scale_display = parseInt($(this).val(), 10);
            send_ch5_config();
        });  
        show.ch6_scale.change(function () {
            HidConfig.ch6_scale_display = parseInt($(this).val(), 10);
            send_ch6_config();
        });  
        show.ch7_scale.change(function () {
            HidConfig.ch7_scale_display = parseInt($(this).val(), 10);
            send_ch7_config();
        });  
        show.ch8_scale.change(function () {
            HidConfig.ch8_scale_display = parseInt($(this).val(), 10);
            send_ch8_config();
        });       
        show.ch1_offset.change(function () {
            HidConfig.ch1_offset_display = parseInt($(this).val(), 10);
            send_ch1_config();
        });
        show.ch2_offset.change(function () {
            HidConfig.ch2_offset_display = parseInt($(this).val(), 10);
            send_ch2_config();
        });
        show.ch3_offset.change(function () {
            HidConfig.ch3_offset_display = parseInt($(this).val(), 10);
            send_ch3_config();
        });
        show.ch4_offset.change(function () {
            HidConfig.ch4_offset_display = parseInt($(this).val(), 10);
            send_ch4_config();
        });
        show.ch5_offset.change(function () {
            HidConfig.ch5_offset_display = parseInt($(this).val(), 10);
            send_ch5_config();
        });
        show.ch6_offset.change(function () {
            HidConfig.ch6_offset_display = parseInt($(this).val(), 10);
            send_ch6_config();
        });
        show.ch7_offset.change(function () {
            HidConfig.ch7_offset_display = parseInt($(this).val(), 10);
            send_ch7_config();
        });
        show.ch8_offset.change(function () {
            HidConfig.ch8_offset_display = parseInt($(this).val(), 10);
            send_ch8_config();
        });
        show.rocker_mode.change(function () {
            HidConfig.rocker_mode = parseInt($(this).val(), 10);
        });
        show.trainer_port.change(function () {
            HidConfig.trainer_port = parseInt($(this).val(), 10)
        });

        show.internal_radio_protocol.change(function () {
            HidConfig.internal_radio_protocol = parseInt($(this).val(), 10);
        });
        show.external_radio_protocol.change(function () {
            HidConfig.external_radio_protocol = parseInt($(this).val(), 10);
        });




        function send_ch1_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x00;
            configBuff[3] = HidConfig.ch1_input_source_display;
            configBuff[4] = HidConfig.ch1_reverse_display;
            configBuff[5] = HidConfig.ch1_scale_display;
            configBuff[6] = HidConfig.ch1_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch2_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x01;
            configBuff[3] = HidConfig.ch2_input_source_display;
            configBuff[4] = HidConfig.ch2_reverse_display;
            configBuff[5] = HidConfig.ch2_scale_display;
            configBuff[6] = HidConfig.ch2_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch3_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x02;
            configBuff[3] = HidConfig.ch3_input_source_display;
            configBuff[4] = HidConfig.ch3_reverse_display;
            configBuff[5] = HidConfig.ch3_scale_display;
            configBuff[6] = HidConfig.ch3_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch4_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x03;
            configBuff[3] = HidConfig.ch4_input_source_display;
            configBuff[4] = HidConfig.ch4_reverse_display;
            configBuff[5] = HidConfig.ch4_scale_display;
            configBuff[6] = HidConfig.ch4_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch5_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x04;
            configBuff[3] = HidConfig.ch5_input_source_display;
            configBuff[4] = HidConfig.ch5_reverse_display;
            configBuff[5] = HidConfig.ch5_scale_display;
            configBuff[6] = HidConfig.ch5_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch6_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x05;
            configBuff[3] = HidConfig.ch6_input_source_display;
            configBuff[4] = HidConfig.ch6_reverse_display;
            configBuff[5] = HidConfig.ch6_scale_display;
            configBuff[6] = HidConfig.ch6_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch7_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x06;
            configBuff[3] = HidConfig.ch7_input_source_display;
            configBuff[4] = HidConfig.ch7_reverse_display;
            configBuff[5] = HidConfig.ch7_scale_display;
            configBuff[6] = HidConfig.ch7_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch8_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x07;
            configBuff[3] = HidConfig.ch8_input_source_display;
            configBuff[4] = HidConfig.ch8_reverse_display;
            configBuff[5] = HidConfig.ch8_scale_display;
            configBuff[6] = HidConfig.ch8_offset_display+100;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }

        function send_internal_radio_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x06;
            configBuff[2] = 0x02;
            configBuff[3] = HidConfig.ExpressLRS_power_option_value-1;
            configBuff[4] = HidConfig.ExpressLRS_pkt_rate_option_value;
            configBuff[5] = HidConfig.ExpressLRS_tlm_option_value;
            configBuff[6] = 0;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_external_exrs_radio_config(){
            let  buffer= new Buffer.alloc(64);
            buffer[0] = 0x0
            buffer[1] = 0x07;
            buffer[2] = 0x02;
            buffer[3] = HidConfig.ExpressLRS_power_option_value;
            buffer[4] = HidConfig.ExpressLRS_pkt_rate_option_value;
            buffer[5] = HidConfig.ExpressLRS_tlm_option_value;
            buffer[6] = HidConfig.ExpressLRS_RF_freq_value;//RF Freq
            hidDevice.write(buffer);
        }

        $('a.binding').click(function () {   
        let bufBind= new Buffer.alloc(64);
        bufBind[0] = 0x00;
        bufBind[1] = 0x07;
        bufBind[2] = 0x02;
        bufBind[3] = HidConfig.ExpressLRS_power_option_value;
        bufBind[4] = HidConfig.ExpressLRS_pkt_rate_option_value;
        bufBind[5] = HidConfig.ExpressLRS_tlm_option_value;
        bufBind[6] = 0x06;
        bufBind[7] = 0x01;
        bufBind[8] = 0x00;
        hidDevice.write(bufBind);
            console.log("ExpressLRS enter to binding");
        });
       
        $('a.wifi_update').click(function () {   
            // let  bufwifiUpdate= new Buffer.alloc(64);
            // bufwifiUpdate[0] = 0x00;
            // bufwifiUpdate[1] = 0x07;
            // bufwifiUpdate[2] = 0x02;
            // bufwifiUpdate[3] = HidConfig.ExpressLRS_power_option_value;
            // bufwifiUpdate[4] = HidConfig.ExpressLRS_pkt_rate_option_value;
            // bufwifiUpdate[5] = HidConfig.ExpressLRS_tlm_option_value;
            // bufwifiUpdate[6] = 0x06;
            // bufwifiUpdate[7] = 0x00;
            // bufwifiUpdate[8] = 0x01;
            // hidDevice.write(bufwifiUpdate);
            // console.log("ExpressLRS enter to wifi update");
            dialogConfirmReset.showModal();
        });

        $('a.resetSettings').click(function () {
            dialogConfirmReset.showModal();
        });

        $('.dialogConfirmReset-cancelbtn').click(function() {
            dialogConfirmReset.close();
        });

        $('.dialogConfirmReset-confirmbtn').click(function() {
            dialogConfirmReset.close();
            MSP.send_message(MSPCodes.MSP_RESET_CONF, false, false, function () {
                GUI.log(i18n.getMessage('initialSetupSettingsRestored'));

                GUI.tab_switch_cleanup(function () {
                    TABS.setup.initialize();
                });
            });
        });
        
        $('a.factory_reset').click(function () {   
            factory_reset();
            console.log("factory reset");
        });
        
        $('a.refresh').click(function () {
            sync_config();
            console.log("refresh click");
        });
        $('a.save').click(function () {
            console.log("save click");
            var bufName = new Buffer.alloc(64);
            if(HidConfig.Internal_radio_module_switch){
                bufName[0] = 0x00;
                bufName[1] = 0x05;
                bufName[2] = 0x00;
                bufName[3] = HidConfig.rocker_mode;
                bufName[4] = 0x02;
                hidDevice.write(bufName);
            }else if(HidConfig.External_radio_module_switch){
                bufName[0] = 0x00;
                bufName[1] = 0x05;
                bufName[2] = 0x01;
                bufName[3] = HidConfig.rocker_mode;
                bufName[4] = 0x02;
                hidDevice.write(bufName);
            }else
            {
                alert("save failed!  you need to select at least one protocol");
            }
            
        });

        function factory_reset(){

            HidConfig.ch1_input_source_display = 2;
            HidConfig.ch2_input_source_display = 0;
            HidConfig.ch3_input_source_display = 1;
            HidConfig.ch4_input_source_display = 3;
            HidConfig.ch5_input_source_display = 4;
            HidConfig.ch6_input_source_display = 5;
            HidConfig.ch7_input_source_display = 6;
            HidConfig.ch8_input_source_display = 7;

            HidConfig.ch1_reverse_display = 0;
            HidConfig.ch2_reverse_display = 0;
            HidConfig.ch3_reverse_display = 0;
            HidConfig.ch4_reverse_display = 0;
            HidConfig.ch5_reverse_display = 0;
            HidConfig.ch6_reverse_display = 0;
            HidConfig.ch7_reverse_display = 0;
            HidConfig.ch8_reverse_display = 0;

            HidConfig.ch1_scale_display = 100;
            HidConfig.ch2_scale_display = 100;
            HidConfig.ch3_scale_display = 100;
            HidConfig.ch4_scale_display = 100;
            HidConfig.ch5_scale_display = 100;
            HidConfig.ch6_scale_display = 100;
            HidConfig.ch7_scale_display = 100;
            HidConfig.ch8_scale_display = 100;

            HidConfig.ch1_offset_display = 0;
            HidConfig.ch2_offset_display = 0;
            HidConfig.ch3_offset_display = 0;
            HidConfig.ch4_offset_display = 0;
            HidConfig.ch5_offset_display = 0;
            HidConfig.ch6_offset_display = 0;
            HidConfig.ch7_offset_display = 0;
            HidConfig.ch8_offset_display = 0;

            send_ch1_config();
            send_ch2_config();
            send_ch3_config();
            send_ch4_config();
            send_ch5_config();
            send_ch6_config();
            send_ch7_config();
            send_ch8_config();
            
            show.refreshUI();

            alert(i18n.getMessage('RadioSetupfactoryResetAlert'));
  
            
        }

        //请求遥控器参数，使上位机显示的配置与其同步
        function sync_config(){
             //请求遥控器信息（硬件版本、支持协议、左右手油门、功率）
            let bufName = new Buffer.alloc(64);
            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x02;
            bufName[3] = 0x00;
            bufName[4] = 0x00;
            bufName[5] = 0x00;
            console.log(bufName);
            hidDevice.write(bufName);
            console.log("get sync config from radio");
        }
        sync_config();
        
        callback();
    });
};


show.cleanup = function (callback) {
    if (callback) callback();
};
