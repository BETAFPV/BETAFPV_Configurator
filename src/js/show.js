const show = {};

show.initialize = function (callback) {

    $('#content').load("./src/html/show.html", function () {

        const bar_names = [
            "Roll [A]",
            "Pitch [E]",
            "Yaw [R]",
            "Throttle [T]",
            "AUX 1",
            "AUX 2",
            "AUX 3",
            "AUX 4"
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
        
        const inputRoll = $('select[name="roll_input"]');
        inputRoll.change(function () {
            HidConfig.rollInputUpdate = parseInt($(this).val(), 10);
        });

        const inputPitch = $('select[name="pitch_input"]');
        inputPitch.change(function () {
            HidConfig.pitchInputUpdate = parseInt($(this).val(), 10);
        });

        const inputYaw = $('select[name="yaw_input"]');
        inputYaw.change(function () {
            HidConfig.yawInputUpdate = parseInt($(this).val(), 10);
        });
      
        const inputThro = $('select[name="throttle_input"]');
        inputThro.change(function () {
            HidConfig.throInputUpdate = parseInt($(this).val(), 10);
        });

        const inputaux1 = $('select[name="aux1_input"]');
        inputaux1.change(function () {
            HidConfig.aux1InputUpdate = parseInt($(this).val(), 10);
        });

        const inputaux2 = $('select[name="aux2_input"]');
        inputaux2.change(function () {
            HidConfig.aux2InputUpdate = parseInt($(this).val(), 10);
        });

        const inputaux3 = $('select[name="aux3_input"]');
        inputaux3.change(function () {
            HidConfig.aux3InputUpdate = parseInt($(this).val(), 10);
        });

        const inputaux4 = $('select[name="aux4_input"]');
        inputaux4.change(function () {
            HidConfig.aux4InputUpdate = parseInt($(this).val(), 10);
        });

        const inputRollreverse=$('input[id="roll_check"]');
        inputRollreverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.rollReverse = 1;
            }
            else
            {
                HidConfig.rollReverse = 0;
            }
            
        });

        const inputPitchreverse=$('input[id="pitch_check"]');
        inputPitchreverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.pitchReverse = 1;
            }
            else
            {
                HidConfig.pitchReverse = 0;
            }
        });

        const inputYawreverse=$('input[id="yaw_check"]');
        inputYawreverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.yawReverse = 1;
            }
            else
            {
                HidConfig.yawReverse = 0;
            }
        });

        const inputThroreverse=$('input[id="throttle_check"]');
        inputThroreverse.change(function () {
            var flag = $(this).is(':checked');
            if(flag)
            {
                HidConfig.throReverse = 1;
            }
            else
            {
                HidConfig.throReverse = 0;
            }
        });

        const inputRollweight=$('input[name="roll_weight"]');
        inputRollweight.change(function () {
            HidConfig.rollWeight = parseInt($(this).val(), 10);
        });

        const inputPitchweight=$('input[name="pitch_weight"]');
        inputPitchweight.change(function () {
            HidConfig.pitchWeight = parseInt($(this).val(), 10);
        });

        const inputYawweight=$('input[name="yaw_weight"]');
        inputYawweight.change(function () {
            HidConfig.yawWeight = parseInt($(this).val(), 10);
        });

        const inputThroweight=$('input[name="throttle_weight"]');
        inputThroweight.change(function () {
            HidConfig.throWeight = parseInt($(this).val(), 10);
        });

        const inputRolloffset=$('input[name="roll_offset"]');
        inputRolloffset.change(function () {
            HidConfig.rollOffset = parseInt($(this).val(), 10);
        });

        const inputPitchoffset=$('input[name="pitch_offset"]');
        inputPitchoffset.change(function () {
            HidConfig.pitchOffset = parseInt($(this).val(), 10);
        });

        const inputYawoffset=$('input[name="yaw_offset"]');
        inputYawoffset.change(function () {
            HidConfig.yawOffset = parseInt($(this).val(), 10);
        });

        const inputThrooffset=$('input[name="throttle_offset"]');
        inputThrooffset.change(function () {
            HidConfig.throOffset = parseInt($(this).val(), 10);
        });

        const inputmode = $('select[name="radiomode"]');
        inputmode.change(function () {
            HidConfig.mode = parseInt($(this).val(), 10);
        });

        const inputtrainerport = $('select[name="trainer_port"]');
        inputtrainerport.change(function () {
            HidConfig.trainerPort = parseInt($(this).val(), 10);
        });

        const inputinternalradiosystem = $('select[name="internalradiosystem"]');
        inputinternalradiosystem.change(function () {
            HidConfig.irSystemProtocol = parseInt($(this).val(), 10);
        });

        const inputinpower = $('select[name="inpower"]');
        inputinpower.change(function () {
            HidConfig.irSystemPower = parseInt($(this).val(), 10);
        });

        const inputinpktRate = $('select[name="inpktRate"]');
        inputinpktRate.change(function () {
            HidConfig.irPktRate = parseInt($(this).val(), 10);
        });

        const inputinTLMRadio = $('select[name="inTLMRadio"]');
        inputinTLMRadio.change(function () {
            HidConfig.irTLMRadio = parseInt($(this).val(), 10);
        });

        const inputexternalradiosystem = $('select[name="externalradiosystem"]');
        inputexternalradiosystem.change(function () {
            HidConfig.erSystemProtocol = parseInt($(this).val(), 10);
        });

        const inputexpower = $('select[name="expower"]');
        inputexpower.change(function () {
            HidConfig.erSystemPower = parseInt($(this).val(), 10);
        });

        const inputexELRSpower = $('select[name="exELRSpower"]');
        inputexELRSpower.change(function () {
            HidConfig.exELRSSystemPower = parseInt($(this).val(), 10);
        });

        const inputexELRSpktRate = $('select[name="exELRSpktRate"]');
        inputexELRSpktRate.change(function () {
            HidConfig.exELRSPktRate = parseInt($(this).val(), 10);
        });

        const inputexELRSTLMRadio = $('select[name="exELRSTLMRadio"]');
        inputexELRSTLMRadio.change(function () {
            HidConfig.exELRSTLMRadio = parseInt($(this).val(), 10);
        });

        function content_ready() {
            GUI.tab_switch_in_progress = false;
        }
        
        $('a.refresh').click(function () {
            //inputRoll.val(0);
            var bufName = new Buffer(64);

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

        });


        rxRefreshRate.change(); 
        
        callback();
    });
};


show.cleanup = function (callback) {
    if (callback) callback();
};
