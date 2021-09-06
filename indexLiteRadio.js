const serialport = require('serialport')
var HID=require('node-hid')

var VENDOR_ID = 1155;
var PRODUCT_ID = 22352;
let channels = new Array(8);
let hidDevice = null;

 const HidConfig = {
    channel_data :[],
    rollInputUpdate:0,
    pitchInputUpdate:1,
    yawInputUpdate:2,
    throInputUpdate:3,

    aux1InputUpdate:0,
    aux2InputUpdate:1,
    aux3InputUpdate:2,
    aux4InputUpdate:3,

    rollReverse:0,
    pitchReverse:0,
    yawReverse:0,
    throReverse:0,

    rollOffset:0,
    pitchOffset:0,
    yawOffset:0,
    throOffset:0,

    rollWeight:0,
    pitchWeight:0,
    yawWeight:0,
    throWeight:0,

    mode:0,
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

        for (let i = 0; i < ports.length; i++) {
            addOptionValue('port',i,ports[i].path);
        }
    })
}

setTimeout(function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
  }, 2000);


window.onload=function(){

    $('div.open_firmware_flasher a.flash').click(function () {
        if (GUI.connect_hid != true) {
            console.log('connect hid');
            GUI.connect_hid = true;

            $('#tabs ul.mode-disconnected').hide();

            $('#tabs ul.mode-connected').show();

            $('#tabs ul.mode-connected li a:first').click();

            $('div#flashbutton a.flash').addClass('active');

            console.log('click',HID.devices());

            hidDevice = new HID.HID(VENDOR_ID,PRODUCT_ID);

            hidDevice.on('data', function(data) {
               
                HidConfig.channel_data[0]= (data[HidConfig.rollInputUpdate*2+1]<<8 | data[HidConfig.rollInputUpdate*2]);
                HidConfig.channel_data[1]= (data[HidConfig.pitchInputUpdate*2+1]<<8 | data[HidConfig.pitchInputUpdate*2]);
                HidConfig.channel_data[2]= (data[HidConfig.yawInputUpdate*2+1]<<8 | data[HidConfig.yawInputUpdate*2]);
                HidConfig.channel_data[3]= (data[HidConfig.throInputUpdate*2+1]<<8 | data[HidConfig.throInputUpdate*2]);

                HidConfig.channel_data[4]= (data[HidConfig.aux1InputUpdate*2+9]<<8 | data[HidConfig.aux1InputUpdate*2+8]);
                HidConfig.channel_data[5]= (data[HidConfig.aux2InputUpdate*2+9]<<8 | data[HidConfig.aux2InputUpdate*2+8]);
                HidConfig.channel_data[6]= (data[HidConfig.aux3InputUpdate*2+9]<<8 | data[HidConfig.aux3InputUpdate*2+8]);
                HidConfig.channel_data[7]= (data[HidConfig.aux4InputUpdate*2+9]<<8 | data[HidConfig.aux4InputUpdate*2+8]);
            } )
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
                    case 'help':
                        help.initialize(content_ready);
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
    
    $('#tabs ul.mode-disconnected li a:first').click();
}