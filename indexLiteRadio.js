const serialport = require('serialport')
var HID=require('node-hid')

var VENDOR_ID = 1155;
var PRODUCT_ID = 22352;
let channels = new Array(8);
let hidDevice = null;
const HidConfig = {
    channel_data :[],
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
                console.log(data);
                
                HidConfig.channel_data[0]= (data[1]<<8 | data[0]);
                HidConfig.channel_data[1]= (data[3]<<8 | data[2]);
                HidConfig.channel_data[2]= (data[5]<<8 | data[4]);
                HidConfig.channel_data[3]= (data[7]<<8 | data[6]);
                HidConfig.channel_data[4]= (data[9]<<8 | data[8]);
                HidConfig.channel_data[5]= (data[11]<<8 | data[10]);
                HidConfig.channel_data[6]= (data[13]<<8 | data[12]);
                HidConfig.channel_data[7]= (data[15]<<8 | data[14]);
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