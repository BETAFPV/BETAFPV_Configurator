const show = {
    
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

    //日本手、美国手模式
    rocker_mode:null,



    // inputmode:null,
    inputtrainerport:null,
    inputinternalradiosystem:null,
    inputinpower:null,
    inputinpktRate:null,
    inputinTLMRadio:null,
    inputexternalradiosystem:null,
    inputexpower:null,
    inputexELRSpower:null,
    inputexELRSpktRate:null,
    inputexELRSTLMRadio:null,
};


show.refreshUI = function()
{
    show.ch1_data_source.val(HidConfig.ch1_input_source);
    show.ch2_data_source.val(HidConfig.ch2_input_source);
    show.ch3_data_source.val(HidConfig.ch3_input_source);
    show.ch4_data_source.val(HidConfig.ch4_input_source);
    show.ch5_data_source.val(HidConfig.ch5_input_source);
    show.ch6_data_source.val(HidConfig.ch6_input_source);
    show.ch7_data_source.val(HidConfig.ch7_input_source);
    show.ch8_data_source.val(HidConfig.ch8_input_source);


    document.getElementById('ch1_check').checked = HidConfig.ch1_reverse;
    document.getElementById('ch2_check').checked = HidConfig.ch2_reverse;
    document.getElementById('ch3_check').checked =HidConfig.ch3_reverse;
    document.getElementById('ch4_check').checked = HidConfig.ch4_reverse;
    
    show.ch1_scale.val(HidConfig.ch1_scale);
    show.ch2_scale.val(HidConfig.ch2_scale);
    show.ch3_scale.val(HidConfig.ch3_scale);
    show.ch4_scale.val(HidConfig.ch4_scale);

    show.ch1_offset.val(HidConfig.ch1_offset);
    show.ch2_offset.val(HidConfig.ch2_offset);
    show.ch3_offset.val(HidConfig.ch3_offset);
    show.ch4_offset.val(HidConfig.ch4_offset);

    show.rocker_mode.val(HidConfig.rocker_mode);
    show.inputtrainerport.val(HidConfig.trainerPort);

    if(HidConfig.irSystemProtocol)
    {
        document.getElementById("internalradiosystem").disabled=false;
        document.getElementById("inpower").disabled=false;
        document.getElementById("inpktRate").disabled=false;
        document.getElementById("inTLMRadio").disabled=false;
    }
    else{
        document.getElementById("internalradiosystem").disabled=true;
        document.getElementById("inpower").disabled=true;
        document.getElementById("inpktRate").disabled=true;
        document.getElementById("inTLMRadio").disabled=true;

        document.getElementById("externalradiosystem").disabled=false;
        document.getElementById("expower").disabled=false;
    }


    show.inputinternalradiosystem.val(HidConfig.irSystemProtocol);
    show.inputinpower.val(HidConfig.irSystemPower);
    show.inputinpktRate.val(HidConfig.irPktRate);
    show.inputinTLMRadio.val(HidConfig.irTLMRadio);
    show.inputexternalradiosystem.val(HidConfig.erSystemProtocol);
    show.inputexpower.val(HidConfig.erSystemPower);
    show.inputexELRSpower.val(HidConfig.exELRSSystemPower);
    show.inputexELRSpktRate.val(HidConfig.exELRSPktRate);
    show.inputexELRSTLMRadio.val(HidConfig.exELRSTLMRadio);
};


show.initialize = function (callback) {

    $('#content').load("./src/html/show.html", function () {

        sync_config();
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

        function update_ui() {
            // update bars with latest data
            for (let i = 0; i < 8; i++) {
                
                meterFillArray[i].css('width', (HidConfig.channel_data[i] - meterScale.min) / (meterScale.max - meterScale.min)*100+'%');
                meterLabelArray[i].text(HidConfig.channel_data[i]);
            }
            //console.log(HidConfig.channel_data[0],HidConfig.channel_data[1],HidConfig.channel_data[2],HidConfig.channel_data[3]);
        }
        let plotUpdateRate;
        const rxRefreshRate = $('select[name="tx_refresh_rate"]');

        rxRefreshRate.change(function () {
            plotUpdateRate = parseInt($(this).val(), 1);

            GUI.interval_remove('receiver_pull');
            GUI.interval_add('receiver_pull', update_ui, plotUpdateRate, true);
        });
        
        show.ch1_data_source = $('select[name="ch1_data_source"]');
        show.ch1_data_source.change(function () {
            HidConfig.ch1_input_source = parseInt($(this).val(), 10);
        });

        show.ch2_data_source = $('select[name="ch2_data_source"]');
        show.ch2_data_source.change(function () {
            HidConfig.ch2_input_source = parseInt($(this).val(), 10);
        });

        show.ch3_data_source = $('select[name="ch3_data_source"]');
        show.ch3_data_source.change(function () {
            HidConfig.ch3_input_source = parseInt($(this).val(), 10);
        });
      
        show.ch4_data_source = $('select[name="ch4_data_source"]');
        show.ch4_data_source.change(function () {
            HidConfig.ch3_input_source = parseInt($(this).val(), 10);
        });

        show.ch5_data_source = $('select[name="ch5_data_source"]');
        show.ch5_data_source.change(function () {
            HidConfig.ch5_input_source = parseInt($(this).val(), 10);
        });

        show.ch6_data_source = $('select[name="ch6_data_source"]');
        show.ch6_data_source.change(function () {
            HidConfig.ch6_input_source = parseInt($(this).val(), 10);
        });

        show.ch7_data_source = $('select[name="ch7_data_source"]');
        show.ch7_data_source.change(function () {
            HidConfig.ch7_input_source = parseInt($(this).val(), 10);
        });

        show.ch8_data_source = $('select[name="ch8_data_source"]');
        show.ch8_data_source.change(function () {
            HidConfig.ch8_input_source = parseInt($(this).val(), 10);
        });

        show.ch1_reverse=$('input[id="ch1_check"]');
        show.ch1_reverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.ch1_reverse = 1;
            }
            else
            {
                HidConfig.ch1_reverse = 0;
            }
            
        });

        show.ch2_reverse=$('input[id="ch2_check"]');
        show.ch2_reverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.ch2_reverse = 1;
            }
            else
            {
                HidConfig.ch2_reverse = 0;
            }
        });

        show.ch3_reverse=$('input[id="ch3_check"]');
        show.ch3_reverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.ch3_reverse = 1;
            }
            else
            {
                HidConfig.ch3_reverse = 0;
            }
        });

        show.ch4_reverse=$('input[id="ch4_check"]');
        show.ch4_reverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.ch4_reverse = 1;
            }
            else
            {
                HidConfig.ch_reverse = 0;
            }
        });

        show.ch1_scale=$('input[name="ch1_scale"]');
        show.ch1_scale.change(function () {
            HidConfig.ch1_scale = parseInt($(this).val(), 10);
        });

        show.ch2_scale=$('input[name="ch2_scale"]');
        show.ch2_scale.change(function () {
            HidConfig.ch2_scale = parseInt($(this).val(), 10);
        });

        show.ch3_scale=$('input[name="ch3_scale"]');
        show.ch3_scale.change(function () {
            HidConfig.ch3_scale = parseInt($(this).val(), 10);
        });

        show.ch4_scale=$('input[name="ch4_scale"]');
        show.ch4_scale.change(function () {
            HidConfig.ch4_scale = parseInt($(this).val(), 10);
        });

        show.ch1_offset=$('input[name="ch1_offset"]');
        show.ch1_offset.change(function () {
            HidConfig.ch1_offset = parseInt($(this).val(), 10);
        });

        show.ch2_offset=$('input[name="ch2_offset"]');
        show.ch2_offset.change(function () {
            HidConfig.ch2_offset = parseInt($(this).val(), 10);
        });

        show.ch3_offset=$('input[name="ch3_offset"]');
        show.ch3_offset.change(function () {
            HidConfig.ch3_offset = parseInt($(this).val(), 10);
        });

        show.ch4_offset=$('input[name="ch4_offset"]');
        show.ch4_offset.change(function () {
            HidConfig.ch4_offset = parseInt($(this).val(), 10);
        });

        show.rocker_mode = $('select[name="radiomode"]');
        show.rocker_mode.change(function () {
            HidConfig.rocker_mode = parseInt($(this).val(), 10);
        });

        show.inputtrainerport = $('select[name="trainer_port"]');
        show.inputtrainerport.change(function () {
            HidConfig.trainerPort = parseInt($(this).val(), 10);
        });

        show.inputinternalradiosystem = $('select[id="internalradiosystem"]');
        show.inputinternalradiosystem.change(function () {
            HidConfig.irSystemProtocol = parseInt($(this).val(), 10);

            if(HidConfig.irSystemProtocol==0)
            {
                document.getElementById("externalradiosystem").disabled=false;
                document.getElementById("expower").disabled=false;
            }
            else
            {
                document.getElementById("externalradiosystem").disabled=true;
                document.getElementById("expower").disabled=true;

                document.getElementById("exELRSpower").disabled=true;
                document.getElementById("exELRSpktRate").disabled=true;
                document.getElementById("exELRSTLMRadio").disabled=true;
            }
        });

        show.inputinpower = $('select[id="inpower"]');
        show.inputinpower.change(function () {
            HidConfig.irSystemPower = parseInt($(this).val(), 10);
        });

        show.inputinpktRate = $('select[id="inpktRate"]');
        show.inputinpktRate.change(function () {
            HidConfig.irPktRate = parseInt($(this).val(), 10);
        });

        show.inputinTLMRadio = $('select[id="inTLMRadio"]');
        show.inputinTLMRadio.change(function () {
            HidConfig.irTLMRadio = parseInt($(this).val(), 10);
        });

        show.inputexternalradiosystem = $('select[id="externalradiosystem"]');
        show.inputexternalradiosystem.change(function () {
            HidConfig.erSystemProtocol = parseInt($(this).val(), 10);

            console.log(HidConfig.erSystemProtocol);

            if(HidConfig.erSystemProtocol)
            {
                document.getElementById("internalradiosystem").disabled=true;
                document.getElementById("inpower").disabled=true;
                document.getElementById("inpktRate").disabled=true;
                document.getElementById("inTLMRadio").disabled=true;
            }
            else{
                document.getElementById("internalradiosystem").disabled=false;
                document.getElementById("inpower").disabled=false;
                document.getElementById("inpktRate").disabled=false;
                document.getElementById("inTLMRadio").disabled=false;
            }
        });

        show.inputexpower = $('select[id="expower"]');
        show.inputexpower.change(function () {
            HidConfig.erSystemPower = parseInt($(this).val(), 10);

            if(HidConfig.erSystemPower)
            {
                document.getElementById("exELRSpower").disabled=false;
                document.getElementById("exELRSpktRate").disabled=false;
                document.getElementById("exELRSTLMRadio").disabled=false;
            }
            else
            {
                document.getElementById("exELRSpower").disabled=true;
                document.getElementById("exELRSpktRate").disabled=true;
                document.getElementById("exELRSTLMRadio").disabled=true;
            }
        });

        show.inputexELRSpower = $('select[id="exELRSpower"]');
        show.inputexELRSpower.change(function () {
            HidConfig.exELRSSystemPower = parseInt($(this).val(), 10);
        });

        show.inputexELRSpktRate = $('select[id="exELRSpktRate"]');
        show.inputexELRSpktRate.change(function () {
            HidConfig.exELRSPktRate = parseInt($(this).val(), 10);
        });

        show.inputexELRSTLMRadio = $('select[id="exELRSTLMRadio"]');
        show.inputexELRSTLMRadio.change(function () {
            HidConfig.exELRSTLMRadio = parseInt($(this).val(), 10);
        });

  
        $('a.refresh').click(function () {
            sync_config();


        });

        $('a.save').click(function () {
            var bufName = new Buffer.alloc(64);

            //发送 遥控通道参数
            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x00;
            bufName[3] = HidConfig.ch1_input_source;
            bufName[4] = HidConfig.ch1_reverse;
            bufName[5] = HidConfig.ch1_scale
            bufName[6] = HidConfig.ch1_offset
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x01;
            bufName[3] = HidConfig.ch2_input_source;
            bufName[4] = HidConfig.ch2_reverse;
            bufName[5] = HidConfig.ch2_scale
            bufName[6] = HidConfig.ch2_offset
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x02;
            bufName[3] = HidConfig.ch3_input_source;
            bufName[4] = HidConfig.ch3_reverse;
            bufName[5] = HidConfig.ch3_scale
            bufName[6] = HidConfig.ch3_offset
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x03;
            bufName[3] = HidConfig.ch4_input_source;
            bufName[4] = HidConfig.ch4_reverse;
            bufName[5] = HidConfig.ch4_scale
            bufName[6] = HidConfig.ch4_offset
            hidDevice.write(bufName);

            //通道 5-8
            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x04;
            bufName[3] = HidConfig.ch5_input_source;
            bufName[4] = 0x00;
            bufName[5] = 0x64;
            bufName[6] = 0x64;
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x05;
            bufName[3] = HidConfig.ch6_input_source;
            bufName[4] = 0x00;
            bufName[5] = 0x64;
            bufName[6] = 0x64;
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x06;
            bufName[3] = HidConfig.ch7_input_source;
            bufName[4] = 0x00;
            bufName[5] = 0x64;
            bufName[6] = 0x64;
            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x01;
            bufName[2] = 0x07;
            bufName[3] = HidConfig.ch8_input_source;
            bufName[4] = 0x00;
            bufName[5] = 0x64;
            bufName[6] = 0x64;
            hidDevice.write(bufName);

            //发送 内部遥控协议参数
            bufName[0] = 0x0;
            bufName[1] = 0x06;
            bufName[2] = 0x02;
            bufName[3] = HidConfig.irSystemPower;
            bufName[4] = HidConfig.irPktRate;
            bufName[5] = HidConfig.irTLMRadio;

            hidDevice.write(bufName);


            //保存
            bufName[0] = 0x0;
            bufName[1] = 0x05;

            if(HidConfig.irSystemProtocol)
            {
                bufName[2] = 0x00;
                bufName[3] = HidConfig.rocker_mode;
                bufName[4] = 0x02;
                hidDevice.write(bufName);
            }
            else if( HidConfig.erSystemProtocol)
            {
                bufName[2] = 0x01;
                bufName[3] = HidConfig.rocker_mode;
                bufName[4] = 0x02;
                hidDevice.write(bufName);
            }
            else
            {
                alert("Please Select Correct Protocol!");
                bufName[2] = 0x00;
            }
            
        });


        rxRefreshRate.change(); 

        //请求遥控器参数，使上位机显示的配置与其同步
        function sync_config(){
            let bufName = new Buffer.alloc(64);
            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x02;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x02;
            bufName[3] = 0x01;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x01;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x02;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x03;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x04;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x05;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x06;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x07;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x01;
            bufName[3] = 0x08;

            hidDevice.write(bufName);

            bufName[0] = 0x0;
            bufName[1] = 0x11;
            bufName[2] = 0x00;
            bufName[3] = 0x01;

            hidDevice.write(bufName);
        }
        
        callback();
    });
};


show.cleanup = function (callback) {
    if (callback) callback();
};
