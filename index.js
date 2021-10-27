const serialport = require('serialport')

var flightcontrol_configurator_version ='v1.0.1_alpha';
var flightcontrol_configurator_major_version =1;
var flightcontrol_configurator_minor_version =0;
var flightcontrol_configurator_pitch_version =1;
let isFlasherTab=0;
var lastPortCount = 0;


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
        if(ports.length!==lastPortCount){
            $('#port option').each(function(){ 
                $(this).remove(); 
            } );
        }

        for (let i = 0; i < ports.length; i++) {
            addOptionValue('port',i,ports[i].path);
        }
        lastPortCount = ports.length;
    })
}

setTimeout(function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
  }, 500);

setTimeout(function loadLanguage() {
    i18next.changeLanguage(i18n.Storage_language);
    if(i18n.Storage_language == 'en'){
    document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/flogo_RGB_HEX-1024.svg";
    }else if(i18n.Storage_language == "zh_CN"){
    document.getElementById("wechat_facebook_logo_src_switch").src = "./src/images/wechat_icon.png";
    }
    
}, 500);

  mavlinkSend = function(writedata){
    port.write(writedata, function (err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
    });
  } 


window.onload=function(){
    
    $('label[id="flightcontrol_configurator_version"]').text(flightcontrol_configurator_version);
    $('div.connect_controls a.connect').click(function () {
        if (GUI.connect_lock != true) { 
            const thisElement = $(this);
            const clicks = thisElement.data('clicks');
            
            const toggleStatus = function() {
                thisElement.data("clicks", !clicks);
            };

            GUI.configuration_loaded = false;

            const selected_baud = parseInt($('div#port-picker #baud').val());

            let COM = ($('div#port-picker #port option:selected').text());


            port = new serialport(COM, {
                baudRate: parseInt(selected_baud),
                dataBits: 8,
                parity: 'none',
                stopBits: 1
            });
            
            
            //open事件监听
            port.on('open', () =>{
                setup.mavlinkConnected = false;       
                GUI.connect_lock = true;
                $('div#connectbutton a.connect').addClass('active');     
                $('div#connectbutton div.connect_state').text(i18n.getMessage('connecting')).addClass('active');
                if(isFlasherTab ==0)
                {
                    FC.resetState();
                   
                    setTimeout(() => {
                          if(setup.mavlinkConnected==true){
                            $('#tabs ul.mode-disconnected').hide();
                            $('#tabs ul.mode-connected').show();
                            $('#tabs ul.mode-connected li a:first').click();
                            $('div#connectbutton div.connect_state').text(i18n.getMessage('disconnect')).addClass('active');
                          }else{
                            port.close();
                            GUI.connect_lock = true;
                            GUI.interval_remove('mavlink_heartbeat');
                            $('div#connectbutton a.connect').removeClass('active');
                            const options = {
                                type: 'warning',
                                buttons: [ 'ok'],
                                defaultId: 0,
                                title: 'Warn',
                                message: 'Failed to open serial port',
                                detail: 'No configuration received within 3 seconds, communication failed',
                                noLink:true,
                            };
                            dialog.showMessageBoxSync(null, options);    
                          }
                    }, 2000);
                    GUI.interval_add('mavlink_heartbeat', mavlink_msg_heartbeat, 1000, true);
                }                     
            });

            //close事件监听
            port.on('close', () =>{
                console.log("close");
                GUI.connect_lock = false;
                GUI.interval_remove('mavlink_heartbeat');
                GUI.interval_remove('display_Info');
                GUI.interval_remove('setup_data_pull_fast');
                $('#tabs ul.mode-connected').hide();
                $('#tabs ul.mode-disconnected').show();
                $('#tabs ul.mode-disconnected li a:first').click();
                $('div#connectbutton a.connect').removeClass('active');
                $('div#connectbutton div.connect_state').text(i18n.getMessage('connect'));
            });

            //data事件监听
            port.on('data', data => {
                if(isFlasherTab)
                {
                    firmware_flasher.parseData(data);
                }
                else
                {
                    mavlinkParser.parseBuffer(data);
                }
            });

            //error事件监听
            port.on('error',function(err){
                console.log('Error: ',err.message);
                GUI.interval_remove('mavlink_heartbeat');
                GUI.interval_remove('display_Info');
                GUI.interval_remove('setup_data_pull_fast');
                $('div#connectbutton a.connect').removeClass('active');
                $('div#connectbutton div.connect_state').text(i18n.getMessage('connect'));

                $('#tabs ul.mode-disconnected li a:first').click();
                GUI.connect_lock = false;
            });
        }
        else
        {
            port.close();
            
       
        }
    });


    function mavlink_msg_heartbeat(){
       let msg = new  mavlink10.messages.heartbeat(0,1);
       let buffer = msg.pack(msg);
       mavlinkSend(buffer);
    }
    
    const ui_tabs = $('#tabs > ul');
    $('a', ui_tabs).click(function () {
        if ($(this).parent().hasClass('active') === false && !GUI.tab_switch_in_progress) { 
            const self = this;
            const tabClass = $(self).parent().prop('class');

            const tabRequiresConnection = $(self).parent().hasClass('mode-connected');

            const tab = tabClass.substring(4);
            const tabName = $(self).text();

            GUI.tab_switch_in_progress = true;
            isFlasherTab = 0;
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
                // $('div#connectbutton a.connect').addClass('disabled');
                

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
                    case 'firmware_flasher':                     
                        $('div#connectbutton a.connect').removeClass('disabled');
                        $('div#flashbutton a.flash').addClass('disabled');
                        firmware_flasher.initialize(content_ready);
                        isFlasherTab = 1;            
                        break;
                    case 'setup':
                        setup.initialize(content_ready);
                        break; 
                    case 'receiver':
                        receiver.initialize(content_ready);
                        break;
                    case 'motors':
                        motors.initialize(content_ready);
                        break;     
                    case 'pid_tuning':
                        pid_tuning.initialize(content_ready);
                        break; 
                    case 'sensors':
                        sensors.initialize(content_ready);
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