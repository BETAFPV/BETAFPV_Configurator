const show = {
    inputRoll:null,
    inputPitch:null,
    inputYaw:null,
    inputThro:null,
    inputaux1:null,
    inputaux2:null,
    inputaux3:null,
    inputaux4:null,
    inputRollreverse:null,
    inputPitchreverse:null,
    inputYawreverse:null,
    inputThroreverse:null,
    inputRollweight:null,
    inputPitchweight:null,
    inputYawweight:null,
    inputThroweight:null,
    inputRolloffset:null,
    inputPitchoffset:null,
    inputYawoffset:null,
    inputThrooffset:null,
    inputmode:null,
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
    show.inputRoll.val(HidConfig.rollInputUpdate);
    show.inputPitch.val(HidConfig.pitchInputUpdate);
    show.inputYaw.val(HidConfig.yawInputUpdate);
    show.inputThro.val(HidConfig.throInputUpdate);
    show.inputaux1.val(HidConfig.aux1InputUpdate);
    show.inputaux2.val(HidConfig.aux2InputUpdate);
    show.inputaux3.val(HidConfig.aux3InputUpdate);
    show.inputaux4.val(HidConfig.aux4InputUpdate);

    show.inputRollreverse.attr("checked",false);
    show.inputPitchreverse.checked = HidConfig.pitchReverse;
    show.inputYawreverse.checked =   HidConfig.yawReverse;
    show.inputThroreverse.checked =  HidConfig.throReverse;

    show.inputRollweight.val(HidConfig.rollWeight);
    show.inputPitchweight.val(HidConfig.pitchWeight);
    show.inputYawweight.val(HidConfig.yawWeight);
    show.inputThroweight.val(HidConfig.throWeight);
    show.inputRolloffset.val(HidConfig.rollOffset);
    show.inputPitchoffset.val(HidConfig.pitchOffset);
    show.inputYawoffset.val(HidConfig.yawOffset);
    show.inputThrooffset.val(HidConfig.throOffset);
    show.inputmode.val(HidConfig.mode);
    show.inputtrainerport.val(HidConfig.trainerPort);
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
        
        show.inputRoll = $('select[name="roll_input"]');
        show.inputRoll.change(function () {
            HidConfig.rollInputUpdate = parseInt($(this).val(), 10);
        });

        show.inputPitch = $('select[name="pitch_input"]');
        show.inputPitch.change(function () {
            HidConfig.pitchInputUpdate = parseInt($(this).val(), 10);
        });

        show.inputYaw = $('select[name="yaw_input"]');
        show.inputYaw.change(function () {
            HidConfig.yawInputUpdate = parseInt($(this).val(), 10);
        });
      
        show.inputThro = $('select[name="throttle_input"]');
        show.inputThro.change(function () {
            HidConfig.throInputUpdate = parseInt($(this).val(), 10);
        });

        show.inputaux1 = $('select[name="aux1_input"]');
        show.inputaux1.change(function () {
            HidConfig.aux1InputUpdate = parseInt($(this).val(), 10);
        });

        show.inputaux2 = $('select[name="aux2_input"]');
        show.inputaux2.change(function () {
            HidConfig.aux2InputUpdate = parseInt($(this).val(), 10);
        });

        show.inputaux3 = $('select[name="aux3_input"]');
        show.inputaux3.change(function () {
            HidConfig.aux3InputUpdate = parseInt($(this).val(), 10);
        });

        show.inputaux4 = $('select[name="aux4_input"]');
        show.inputaux4.change(function () {
            HidConfig.aux4InputUpdate = parseInt($(this).val(), 10);
        });

        show.inputRollreverse=$('input[name="roll_check"]');
        show.inputRollreverse.change(function () {
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

        show.inputPitchreverse=$('input[name="pitch_check"]');
        show.inputPitchreverse.change(function () {
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

        show.inputYawreverse=$('input[name="yaw_check"]');
        show.inputYawreverse.change(function () {
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

        show.inputThroreverse=$('input[name="throttle_check"]');
        show.inputThroreverse.change(function () {
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

        show.inputRollweight=$('input[name="roll_weight"]');
        show.inputRollweight.change(function () {
            HidConfig.rollWeight = parseInt($(this).val(), 10);
        });

        show.inputPitchweight=$('input[name="pitch_weight"]');
        show.inputPitchweight.change(function () {
            HidConfig.pitchWeight = parseInt($(this).val(), 10);
        });

        show.inputYawweight=$('input[name="yaw_weight"]');
        show.inputYawweight.change(function () {
            HidConfig.yawWeight = parseInt($(this).val(), 10);
        });

        show.inputThroweight=$('input[name="throttle_weight"]');
        show.inputThroweight.change(function () {
            HidConfig.throWeight = parseInt($(this).val(), 10);
        });

        show.inputRolloffset=$('input[name="roll_offset"]');
        show.inputRolloffset.change(function () {
            HidConfig.rollOffset = parseInt($(this).val(), 10);
        });

        show.inputPitchoffset=$('input[name="pitch_offset"]');
        show.inputPitchoffset.change(function () {
            HidConfig.pitchOffset = parseInt($(this).val(), 10);
        });

        show.inputYawoffset=$('input[name="yaw_offset"]');
        show.inputYawoffset.change(function () {
            HidConfig.yawOffset = parseInt($(this).val(), 10);
        });

        show.inputThrooffset=$('input[name="throttle_offset"]');
        show.inputThrooffset.change(function () {
            HidConfig.throOffset = parseInt($(this).val(), 10);
        });

        show.inputmode = $('select[name="radiomode"]');
        show.inputmode.change(function () {
            HidConfig.mode = parseInt($(this).val(), 10);
        });

        show.inputtrainerport = $('select[name="trainer_port"]');
        show.inputtrainerport.change(function () {
            HidConfig.trainerPort = parseInt($(this).val(), 10);
        });

        show.inputinternalradiosystem = $('select[name="internalradiosystem"]');
        show.inputinternalradiosystem.change(function () {
            HidConfig.irSystemProtocol = parseInt($(this).val(), 10);
        });

        show.inputinpower = $('select[name="inpower"]');
        show.inputinpower.change(function () {
            HidConfig.irSystemPower = parseInt($(this).val(), 10);
        });

        show.inputinpktRate = $('select[name="inpktRate"]');
        show.inputinpktRate.change(function () {
            HidConfig.irPktRate = parseInt($(this).val(), 10);
        });

        show.inputinTLMRadio = $('select[name="inTLMRadio"]');
        show.inputinTLMRadio.change(function () {
            HidConfig.irTLMRadio = parseInt($(this).val(), 10);
        });

        show.inputexternalradiosystem = $('select[name="externalradiosystem"]');
        show.inputexternalradiosystem.change(function () {
            HidConfig.erSystemProtocol = parseInt($(this).val(), 10);
        });

        show.inputexpower = $('select[name="expower"]');
        show.inputexpower.change(function () {
            HidConfig.erSystemPower = parseInt($(this).val(), 10);
        });

        show.inputexELRSpower = $('select[name="exELRSpower"]');
        show.inputexELRSpower.change(function () {
            HidConfig.exELRSSystemPower = parseInt($(this).val(), 10);
        });

        show.inputexELRSpktRate = $('select[name="exELRSpktRate"]');
        show.inputexELRSpktRate.change(function () {
            HidConfig.exELRSPktRate = parseInt($(this).val(), 10);
        });

        show.inputexELRSTLMRadio = $('select[name="exELRSTLMRadio"]');
        show.inputexELRSTLMRadio.change(function () {
            HidConfig.exELRSTLMRadio = parseInt($(this).val(), 10);
        });

  
        $('a.refresh').click(function () {
            var bufName = new Buffer.alloc(64);

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
