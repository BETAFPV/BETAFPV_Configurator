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

show.getElementIndex = function(){
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
}

show.refreshUI = function()
{
    if(VCPConfig.LiteRadio_power== false){
        show.getElementIndex();
        show.rocker_mode.val(VCPConfig.rocker_mode);
        // show.trainer_port.val(VCPConfig.trainerPort);
    
        show.ch1_data_source.val(VCPConfig.ch1_input_source_display);
        show.ch2_data_source.val(VCPConfig.ch2_input_source_display);
        show.ch3_data_source.val(VCPConfig.ch3_input_source_display);
        show.ch4_data_source.val(VCPConfig.ch4_input_source_display);
        show.ch5_data_source.val(VCPConfig.ch5_input_source_display);
        show.ch6_data_source.val(VCPConfig.ch6_input_source_display);
        show.ch7_data_source.val(VCPConfig.ch7_input_source_display);
        show.ch8_data_source.val(VCPConfig.ch8_input_source_display);
    
    
        document.getElementById('ch1_check').checked = VCPConfig.ch1_reverse_display;
        document.getElementById('ch2_check').checked = VCPConfig.ch2_reverse_display;
        document.getElementById('ch3_check').checked = VCPConfig.ch3_reverse_display;
        document.getElementById('ch4_check').checked = VCPConfig.ch4_reverse_display;
        document.getElementById('ch5_check').checked = VCPConfig.ch5_reverse_display;
        document.getElementById('ch6_check').checked = VCPConfig.ch6_reverse_display;
        document.getElementById('ch7_check').checked = VCPConfig.ch7_reverse_display;
        document.getElementById('ch8_check').checked = VCPConfig.ch8_reverse_display;
        
        show.ch1_scale.val(VCPConfig.ch1_scale_display);
        show.ch2_scale.val(VCPConfig.ch2_scale_display);
        show.ch3_scale.val(VCPConfig.ch3_scale_display);
        show.ch4_scale.val(VCPConfig.ch4_scale_display);
        show.ch5_scale.val(VCPConfig.ch5_scale_display);
        show.ch6_scale.val(VCPConfig.ch6_scale_display);
        show.ch7_scale.val(VCPConfig.ch7_scale_display);
        show.ch8_scale.val(VCPConfig.ch8_scale_display);
    
        show.ch1_offset.val(VCPConfig.ch1_offset_display);
        show.ch2_offset.val(VCPConfig.ch2_offset_display);
        show.ch3_offset.val(VCPConfig.ch3_offset_display);
        show.ch4_offset.val(VCPConfig.ch4_offset_display);
        show.ch5_offset.val(VCPConfig.ch5_offset_display);
        show.ch6_offset.val(VCPConfig.ch6_offset_display);
        show.ch7_offset.val(VCPConfig.ch7_offset_display);
        show.ch8_offset.val(VCPConfig.ch8_offset_display);

    }
};


show.initialize = function (callback) {
    let configBuff = new Buffer.alloc(64);
    $('#content').load("./src/html/setupTX.html", function () {

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
        show.getElementIndex();
        
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
                
                meterFillArray[i].css('width', (VCPConfig.channel_data_dispaly[i] - meterScale.min) / (meterScale.max - meterScale.min)*100+'%');
                meterLabelArray[i].text(VCPConfig.channel_data_dispaly[i]);
            }
        }

        
        
        show.Internal_radio_module_switch.change(function () {
            if( VCPConfig.External_radio_module_switch){//开启内置模块前先检查外置模块是否已开启
                const dialogConfirmCloseInternalRadio = $('.dialogCloseInternalRadio')[0];
                dialogConfirmCloseInternalRadio.showModal();
                $('.dialogCloseInternalRadio-confirmbtn').click(function() {
                    dialogConfirmCloseInternalRadio.close();
                });
                document.getElementById('internal_radio_module_switch').checked = false;
            }else{
                VCPConfig.Internal_radio_module_switch = $(this).is(':checked')?1:0;
                if(VCPConfig.Internal_radio_module_switch){
                    document.getElementById('internal_radio_protocol').disabled = false;
                }else{
                    document.getElementById('internal_radio_protocol').disabled = true;
                }
            }          
        });

        show.External_radio_module_switch.change(function () {
            if( VCPConfig.Internal_radio_module_switch){//开启外置模块前先检查内置模块是否已开启
                const dialogConfirmCloseExternalRadio = $('.dialogCloseExternalRadio')[0];
                dialogConfirmCloseExternalRadio.showModal();
                $('.dialogCloseExternalRadio-confirmbtn').click(function() {
                    dialogConfirmCloseExternalRadio.close();
                });
                document.getElementById('external_radio_module_switch').checked = false;
            }else{
                VCPConfig.External_radio_module_switch = $(this).is(':checked')?1:0;
                if(VCPConfig.External_radio_module_switch){
                    document.getElementById('external_radio_protocol').disabled = false;
                }else{
                    document.getElementById('external_radio_protocol').disabled = true;
                    document.getElementById('External_radio_module_power_switch').disabled = true;
                }
            }
        });

        show.External_radio_module_power_switch.change(function () {
            VCPConfig.External_radio_module_power_switch = $(this).is(':checked')?1:0;
            if(VCPConfig.External_radio_module_power_switch){
                console.log("elrs power on");
               
                // TO DO

            }else{
                console.log("elrs power off");
                
                // TO DO

                document.getElementById("ExpressLRS_power_option_box").disabled = true;
                document.getElementById("ExpressLRS_pkt_rate_option_box").disabled = true;
                document.getElementById("ExpressLRS_tlm_option_box").disabled = true;
            }
        });
        show.ExpressLRS_power_option_box.change(function () {
            VCPConfig.ExpressLRS_power_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(VCPConfig.Internal_radio_module_switch){
                if(VCPConfig.internal_radio_protocol==0){

                    // TO DO

                    console.log("set internal ELRS power config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(VCPConfig.External_radio_module_switch){
                if(VCPConfig.external_radio_protocol == 0){

                    // TO DO

                    console.log("set external ELRS power config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        show.ExpressLRS_pkt_rate_option_box.change(function () {
            VCPConfig.ExpressLRS_pkt_rate_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(VCPConfig.Internal_radio_module_switch){
                if(VCPConfig.internal_radio_protocol==0){

                    // TO DO

                    console.log("set internal ELRS pkt rate config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(VCPConfig.External_radio_module_switch){
                if(VCPConfig.external_radio_protocol == 0){

                    // TO DO

                    console.log("set external ELRS pkt rate config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        show.ExpressLRS_tlm_option_box.change(function () {
            VCPConfig.ExpressLRS_tlm_option_value = parseInt($(this).val(), 10);
            //判断当前使用的是内部射频模块还是外部射频模块
            if(VCPConfig.Internal_radio_module_switch){
                if(VCPConfig.internal_radio_protocol==0){

                    // TO DO
                    console.log("set internal ELRS tml config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                }
                
            }else if(VCPConfig.External_radio_module_switch){
                if(VCPConfig.external_radio_protocol == 0){

                    // TO DO
                    console.log("set external ELRS tml config");
                }else{
                    alert("This protocol is not supported on your device,please select other!");
                } 
            }
        });
        
        
        show.ch1_data_source.change(function () {
            VCPConfig.ch1_input_source_display = parseInt($(this).val(), 10);

            // TO DO
        });
        show.ch2_data_source.change(function () {
            VCPConfig.ch2_input_source_display = parseInt($(this).val(), 10);

            // TO DO
        });
        show.ch3_data_source.change(function () {
            VCPConfig.ch3_input_source_display = parseInt($(this).val(), 10);

            // TO DO
        });
        show.ch4_data_source.change(function () {
            VCPConfig.ch4_input_source_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch5_data_source.change(function () {
            VCPConfig.ch5_input_source_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch6_data_source.change(function () {
            VCPConfig.ch6_input_source_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch7_data_source.change(function () {
            VCPConfig.ch7_input_source_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch8_data_source.change(function () {
            VCPConfig.ch8_input_source_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch1_reverse.change(function () {
            VCPConfig.ch1_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch2_reverse.change(function () {
            VCPConfig.ch2_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch3_reverse.change(function () {
            VCPConfig.ch3_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch4_reverse.change(function () {
            VCPConfig.ch4_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        }); 
        show.ch5_reverse.change(function () {
            VCPConfig.ch5_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch6_reverse.change(function () {
            VCPConfig.ch6_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch7_reverse.change(function () {
            VCPConfig.ch7_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        });
        show.ch8_reverse.change(function () {
            VCPConfig.ch8_reverse_display = $(this).is(':checked')?1:0;
            // TO DO
        }); 
        show.ch1_scale.change(function () {
            VCPConfig.ch1_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch2_scale.change(function () {
            VCPConfig.ch2_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch3_scale.change(function () {
            VCPConfig.ch3_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch4_scale.change(function () {
            VCPConfig.ch4_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch5_scale.change(function () {
            VCPConfig.ch5_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });  
        show.ch6_scale.change(function () {
            VCPConfig.ch6_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });  
        show.ch7_scale.change(function () {
            VCPConfig.ch7_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });  
        show.ch8_scale.change(function () {
            VCPConfig.ch8_scale_display = parseInt($(this).val(), 10);
            // TO DO
        });       
        show.ch1_offset.change(function () {
            VCPConfig.ch1_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch2_offset.change(function () {
            VCPConfig.ch2_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch3_offset.change(function () {
            VCPConfig.ch3_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch4_offset.change(function () {
            VCPConfig.ch4_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch5_offset.change(function () {
            VCPConfig.ch5_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch6_offset.change(function () {
            VCPConfig.ch6_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch7_offset.change(function () {
            VCPConfig.ch7_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.ch8_offset.change(function () {
            VCPConfig.ch8_offset_display = parseInt($(this).val(), 10);
            // TO DO
        });
        show.rocker_mode.change(function () {
            VCPConfig.rocker_mode = parseInt($(this).val(), 10);
        });
        show.trainer_port.change(function () {
            VCPConfig.trainer_port = parseInt($(this).val(), 10)
        });

        show.internal_radio_protocol.change(function () {
            VCPConfig.internal_radio_protocol = parseInt($(this).val(), 10);
        });
        show.external_radio_protocol.change(function () {
            VCPConfig.external_radio_protocol = parseInt($(this).val(), 10);
        });


        $('a.binding').click(function () {   

            // TO DO

        });
       
        $('a.wifi_update').click(function () {   
            
            // TO DO

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

            // TO DO

        });

        function factory_reset(){

            VCPConfig.ch1_input_source_display = 2;
            VCPConfig.ch2_input_source_display = 0;
            VCPConfig.ch3_input_source_display = 1;
            VCPConfig.ch4_input_source_display = 3;
            VCPConfig.ch5_input_source_display = 4;
            VCPConfig.ch6_input_source_display = 5;
            VCPConfig.ch7_input_source_display = 6;
            VCPConfig.ch8_input_source_display = 7;

            VCPConfig.ch1_reverse_display = 0;
            VCPConfig.ch2_reverse_display = 0;
            VCPConfig.ch3_reverse_display = 0;
            VCPConfig.ch4_reverse_display = 0;
            VCPConfig.ch5_reverse_display = 0;
            VCPConfig.ch6_reverse_display = 0;
            VCPConfig.ch7_reverse_display = 0;
            VCPConfig.ch8_reverse_display = 0;

            VCPConfig.ch1_scale_display = 100;
            VCPConfig.ch2_scale_display = 100;
            VCPConfig.ch3_scale_display = 100;
            VCPConfig.ch4_scale_display = 100;
            VCPConfig.ch5_scale_display = 100;
            VCPConfig.ch6_scale_display = 100;
            VCPConfig.ch7_scale_display = 100;
            VCPConfig.ch8_scale_display = 100;

            VCPConfig.ch1_offset_display = 0;
            VCPConfig.ch2_offset_display = 0;
            VCPConfig.ch3_offset_display = 0;
            VCPConfig.ch4_offset_display = 0;
            VCPConfig.ch5_offset_display = 0;
            VCPConfig.ch6_offset_display = 0;
            VCPConfig.ch7_offset_display = 0;
            VCPConfig.ch8_offset_display = 0;

            // TO DO

            alert(i18n.getMessage('RadioSetupfactoryResetAlert'));
        }

        //请求遥控器参数，使上位机显示的配置与其同步
        function sync_config(){

            //请求遥控器信息（遥控器类型、内置射频模块类型、硬件油门杆位置、硬件版本号、软件版本号）
            // TO DO

        } 
        callback();

    });
};


show.cleanup = function (callback) {
    if (callback) callback();
};
