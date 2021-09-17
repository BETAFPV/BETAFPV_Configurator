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

    //通道偏移补偿
    ch1_offset:null,
    ch2_offset:null,
    ch3_offset:null,
    ch4_offset:null,

    //通道值反转
    ch1_reverse:null,
    ch2_reverse:null,
    ch3_reverse:null,
    ch4_reverse:null,

    
    //内部射频模块配置信息
    internal_radio_protocol:null,
    internal_radio_power:null,
    internal_radio_pkt_rate:null,
    internal_radio_tlm:null,

    //外置射频模块配置信息
    external_radio_protocol:null,//外置高频头协议选择
    external_radio_power_switch:null,//高频头供电开关
    
    
    external_radio_power_elrs:null,
    external_radio_pkt_rate_elrs:null,
    external_radio_tlm_elrs:null,

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
    
    show.ch1_scale.val(HidConfig.ch1_scale_display);
    show.ch2_scale.val(HidConfig.ch2_scale_display);
    show.ch3_scale.val(HidConfig.ch3_scale_display);
    show.ch4_scale.val(HidConfig.ch4_scale_display);

    show.ch1_offset.val(HidConfig.ch1_offset_display);
    show.ch2_offset.val(HidConfig.ch2_offset_display);
    show.ch3_offset.val(HidConfig.ch3_offset_display);
    show.ch4_offset.val(HidConfig.ch4_offset_display);

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
            'min': 000,
            'max': 2100
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
                
                meterFillArray[i].css('width', (HidConfig.channel_data[i] - meterScale.min) / (meterScale.max - meterScale.min)*100+'%');
                meterLabelArray[i].text(HidConfig.channel_data[i]);
            }
        }

        GUI.interval_remove('receiver_pull');
        GUI.interval_add('receiver_pull', update_ui, 50, true);
    
        show.rocker_mode = $('select[name="radiomode"]');
        show.Trainer_port = $('input[name="trainer_port"]');

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

        show.ch1_offset=$('input[name="ch1_offset"]');
        show.ch2_offset=$('input[name="ch2_offset"]');
        show.ch3_offset=$('input[name="ch3_offset"]');
        show.ch4_offset=$('input[name="ch4_offset"]');

        show.ch1_reverse=$('input[id="ch1_check"]');
        show.ch2_reverse=$('input[id="ch2_check"]');
        show.ch3_reverse=$('input[id="ch3_check"]');
        show.ch4_reverse=$('input[id="ch4_check"]');

        show.internal_radio_protocol = $('select[id="internal_radio_protocol"]');
        show.internal_radio_power = $('select[id="internal_radio_power"]');
        show.internal_radio_pkt_rate = $('select[id="internal_radio_pkt_rate"]');
        show.internal_radio_tlm = $('select[id="internal_radio_tlm"]');
        
        show.external_radio_protocol = $('select[id="external_radio_protocol"]');
        show.external_radio_power_switch = $('input[id="external_radio_power_switch"]');
        
        show.external_radio_power_elrs = $('select[id="external_radio_power_elrs"]');
        show.external_radio_pkt_rate_elrs = $('select[id="external_radio_pkt_rate_elrs"]');
        show.external_radio_tlm_elrs = $('select[id="external_radio_tlm_elrs"]');
        
        
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
        show.rocker_mode.change(function () {
            HidConfig.rocker_mode = parseInt($(this).val(), 10);
        });
        show.Trainer_port.change(function () {
            HidConfig.Trainer_port = $(this).is(':checked');
        });
        show.internal_radio_protocol.change(function () {
            HidConfig.internal_radio_protocol = parseInt($(this).val(), 10);
            if(HidConfig.internal_radio_protocol==0){//OFF
                document.getElementById("external_radio_protocol").disabled = false;//内置射频模块关闭时，外置射频协议可选
                
                document.getElementById("internal_radio_power").disabled = true;
                document.getElementById("internal_radio_pkt_rate").disabled = true;
                document.getElementById("internal_radio_tlm").disabled = true;

            }else {
                HidConfig.external_radio_protocol = 0;
                show.external_radio_protocol.val(HidConfig.external_radio_protocol);

            }
        });
        show.internal_radio_power.change(function () {
            HidConfig.internal_radio_power = parseInt($(this).val(), 10);
            send_internal_radio_config();
        });
        show.internal_radio_pkt_rate.change(function () {
            HidConfig.internal_radio_pkt_rate = parseInt($(this).val(), 10);
            send_internal_radio_config();
        });
        show.internal_radio_tlm.change(function () {
            HidConfig.internal_radio_tlm = parseInt($(this).val(), 10);
            send_internal_radio_config();
        });
        show.external_radio_protocol.change(function () {
            HidConfig.external_radio_protocol = parseInt($(this).val(), 10);
            if(HidConfig.external_radio_protocol==0){//外置射频协议选择为OFF
                HidConfig.internal_radio_protocol = 0;
                show.internal_radio_protocol.val(HidConfig.internal_radio_protocol);
                document.getElementById("internal_radio_protocol").disabled = false;//可以设置内置射频模块协议

                document.getElementById("external_radio_power_elrs").disabled = true;//无法设置外置射频模块
                document.getElementById("external_radio_pkt_rate_elrs").disabled = true;    
                document.getElementById("external_radio_tlm_elrs").disabled = true; 
                document.getElementById("external_radio_power_switch").disabled = true;      

            }else{//外置射频协议选择为CRSF
                HidConfig.internal_radio_protocol = 0;
                show.internal_radio_protocol.val(HidConfig.internal_radio_protocol);
                document.getElementById("internal_radio_protocol").disabled = true;//无法切换内置射频模块协议
            }
        });
        show.external_radio_power_switch.change(function () {
            HidConfig.external_radio_power_switch = $(this).is(':checked');//外部射频模块电源开关
            
            if(HidConfig.external_radio_power_switch){
                console.log("elrs power on");
                // $("#exELRSpowerID").css({display: 'block'});
                // $("#exELRSpktRateID").css({display: 'block'});
                // $("#exELRSTLMRadioID").css({display: 'block'});
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
                document.getElementById("external_radio_power_elrs").disabled = true;
                document.getElementById("external_radio_pkt_rate_elrs").disabled = true;
                document.getElementById("external_radio_tlm_elrs").disabled = true;

            }
        });
        show.external_radio_power_elrs.change(function () {
            HidConfig.external_radio_power_elrs = parseInt($(this).val(), 10);
            send_external_exrs_radio_config();
            console.log("set elrs power")
        });
        show.external_radio_pkt_rate_elrs.change(function () {
            HidConfig.external_radio_pkt_rate_elrs = parseInt($(this).val(), 10);
            send_external_exrs_radio_config();
            console.log("set elrs pkt rate");
        });
        show.external_radio_tlm_elrs.change(function () {
            HidConfig.external_radio_tlm_elrs = parseInt($(this).val(), 10);
            send_external_exrs_radio_config();
            console.log("set elrs tlm");
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
            configBuff[4] = 0;
            configBuff[5] = 0;
            configBuff[6] = 0;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch6_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x05;
            configBuff[3] = HidConfig.ch6_input_source_display;
            configBuff[4] = 0;
            configBuff[5] = 0;
            configBuff[6] = 0;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch7_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x06;
            configBuff[3] = HidConfig.ch7_input_source_display;
            configBuff[4] = 0;
            configBuff[5] = 0;
            configBuff[6] = 0;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }
        function send_ch8_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x01;
            configBuff[2] = 0x07;
            configBuff[3] = HidConfig.ch8_input_source_display;
            configBuff[4] = 0;
            configBuff[5] = 0;
            configBuff[6] = 0;
            configBuff[7] = 0;
            configBuff[8] = 0;
            hidDevice.write(configBuff);
        }

        function send_internal_radio_config(){
            configBuff[0] = 0x00;
            configBuff[1] = 0x06;
            configBuff[2] = 0x02;
            configBuff[3] = HidConfig.internal_radio_power;
            configBuff[4] = HidConfig.internal_radio_pkt_rate;
            configBuff[5] = HidConfig.internal_radio_tlm;
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
            buffer[3] = HidConfig.external_radio_power_elrs;
            buffer[4] = HidConfig.external_radio_pkt_rate_elrs;
            buffer[5] = HidConfig.external_radio_tlm_elrs;
            buffer[6] = 0x00;//RF Freq
            hidDevice.write(buffer);
        }

        $('a.binding').click(function () {   
            console.log("ExpressLRS enter to binding");
        });
        $('a.wifi_update').click(function () {   
            console.log("ExpressLRS enter to wifi update");
        });
        
        $('a.factory_reset').click(function () {   
            console.log("factory reset");
        });
        
        $('a.refresh').click(function () {
            sync_config();
            console.log("refresh click");
        });
        $('a.save').click(function () {
            console.log("save click");
            var bufName = new Buffer.alloc(64);
            if(HidConfig.internal_radio_protocol){
                bufName[0] = 0x00;
                bufName[1] = 0x05;
                bufName[2] = 0x00;
                bufName[3] = HidConfig.rocker_mode;
                bufName[4] = 0x02;
                hidDevice.write(bufName);
            }else if(HidConfig.external_radio_protocol){
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
