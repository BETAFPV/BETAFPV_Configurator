
const os = require('os')
const path = require('path')

var jsonFile = require('jsonfile')
var jsonfileName = 'LiteRadio.json'

const firmware_flasher_LiteRadio ={
    localFirmwareLoaded: false,
    selectedBoard: undefined,
    boardNeedsVerification: false,
    intel_hex: undefined, // standard intel hex in string format
    parsed_hex: undefined, // parsed raw hex in array format
    unifiedTarget: {}, // the Unified Target configuration to be spliced into the configuration
    isConfigLocal: false, // Set to true if the user loads one locally
    developmentFirmwareLoaded: false, // Is the firmware to be flashed from the development branch?
    firmware_version:{},
    target_board:0,
   
};

firmware_flasher_LiteRadio.FLASH_MESSAGE_TYPES = {
    NEUTRAL : 'NEUTRAL',
    VALID   : 'VALID',
    INVALID : 'INVALID',
    ACTION  : 'ACTION',
};

const { Console } = require('console');
const { CONNREFUSED } = require('dns');
const fs = require('fs');


let port = null;
let binFile = null;
let binFilePath=null;
let packLen = 0;

let strFileName = null;
let lastSize=0;
let binSize=null;
let packNum=1;
let ack = null;
let starting=null;
var loadJsonFileFromGithubSuccessful = true;
var loadFirmwareFromGithubSuccessful = true;
firmware_flasher_LiteRadio.flashingMessage = function(message, type) {
    let self = this;

    let progressLabel_e = $('span.progressLabel');
    switch (type) {
        case self.FLASH_MESSAGE_TYPES.VALID:
            progressLabel_e.removeClass('invalid actionRequired')
                           .addClass('valid');
            break;
        case self.FLASH_MESSAGE_TYPES.INVALID:
            progressLabel_e.removeClass('valid actionRequired')
                           .addClass('invalid');
            break;
        case self.FLASH_MESSAGE_TYPES.ACTION:
            progressLabel_e.removeClass('valid invalid')
                           .addClass('actionRequired');
            break;
        case self.FLASH_MESSAGE_TYPES.NEUTRAL:
        default:
            progressLabel_e.removeClass('valid invalid actionRequired');
            break;
    }
    if (message !== null) {
        progressLabel_e.html(message);
    }

    return self;
};

firmware_flasher_LiteRadio.enableFlashing = function (enabled) {
    if (enabled) {
        $('a.flash_firmware').removeClass('disabled');
    } else {
        $('a.flash_firmware').addClass('disabled');
    }
};

firmware_flasher_LiteRadio.flashProgress = function(value) {
    $('.progress').val(value);

    return this;
};

function isExistOption2(id,value) {  
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

function addOptionValue2(id,value,text) {  
    if(!isExistOption2(id,value)){$('#'+id).append("<option value="+value+">"+text+"</option>");}      
} 


function readJsonFile(fileName){
    jsonFile.readFile(fileName, function(err, jsonData) {
        if (err) throw err;
        if(jsonData.status!==404){
            $('#boardTarget').empty();
            addOptionValue2('boardTarget',1,"LiteRadio_2_SE");
            addOptionValue2('boardTarget',2,"LiteRadio_2_SE_V2_SX1280");
            addOptionValue2('boardTarget',3,"LiteRadio_2_SE_V2_CC2500");
            addOptionValue2('boardTarget',4,"LiteRadio_3_SX1280");
            addOptionValue2('boardTarget',5,"LiteRadio_3_CC2500");
            $('#boardVersion').empty();
            for(let i=0;i<jsonData.LiteRadio_2_SE.length;i++){
                addOptionValue2('boardVersion',i,jsonData.LiteRadio_2_SE[0].version);
            }
            firmware_flasher_LiteRadio.firmware_version = jsonData;
        
            console.log("----------------------------------"); 
        }else{

        }
        
        // }
    });
}

function loadRemoteJsonFile(){
//     var xhr = new XMLHttpRequest();
//     xhr.responseType = 'arraybuffer';
//     xhr.onload = function(e) {
//         var array = new Uint8Array(xhr.response);
//         var file_path = path.join(__dirname, "./LiteRadio.json");

//         fs.writeFile(file_path, array, "utf8",(err)=>{
//             if(err){
//                 alert(i18n.getMessage("write_file_failed"));
//             }else {
//                 readJsonFile(file_path);
//             }
//         })
//     };
//     //1.优先访问github上的固件
//     setTimeout(() => {
//         xhr.open('GET', "https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v2.0.0/LiteRadio.json", true);
//         xhr.send(null);    
//         console.log("get literadio.json from github");
//     }, 1000);
 
   
//    xhr.onreadystatechange = function(){
//        if(xhr.readyState==2){
//        }else if(xhr.readyState==3){
//        }

//         if (xhr.readyState == 4){
//             if(xhr.status == 200){//ok
//                 //从github上加载固件成功
//                 // alert("Request firmware successful: "+xhr.status);
//                 console.log("get json file successful");
//                 loadJsonFileFromGithubSuccessful = true;
//             }
//             // else if(xhr.status == 400){
//             //     alert("Bad Request : "+xhr.status);
//             // }else if(xhr.status == 401){
//             //     alert("Request was Unauthonzed: "+xhr.status);
//             // }else if(xhr.status == 403){
//             //     alert("Request was Forbidden: "+xhr.status);
//             // }else if(xhr.status == 404){
//             //     alert("Request was Not Found: "+xhr.status);
//             // }else if(xhr.status == 500){
//             //     alert(" Internal Server Error: "+xhr.status);
//             // }else if(xhr.status == 503){
//             //     alert("Service Unavailable : "+xhr.status);
//             // }      
//             else{
//                 //2.github无法访问切换到gittee上访问
//                 if(loadJsonFileFromGithubSuccessful == true){
//                     loadJsonFileFromGithubSuccessful = false;
//                     console.log("can't load json file from github");
//                 }else{
//                     console.log("can't load json file from gitee");
//                 }
//             } 
//         }
//     };

//     //3.超时无法连接github则从gitee上加载
//     setTimeout(() => {
//         if(loadJsonFileFromGithubSuccessful == false){
//             xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955204/download/LiteRadio.json", true);
//             xhr.send(null);
//             console.log("get json file from gitee");
//         }    
//     }, 5000);

//     xhr.timeout = 3000; 
//     xhr.ontimeout = function(){
//         loadJsonFileFromGithubSuccessful = false;
//         console.log("get json file time out");
//     }
};

function CRC16_Check(puData)
{
    var len = puData.length;

    if (len > 0) {
        var crc = 0x0000;

        for (var i = 0; i < 1024; i++) {
            crc = (crc ^ ((puData[3+i])<<8 & 0xff00 ));
            
            for (var j = 0; j < 8; j++) {
                if(crc & 0x8000)
                    crc = (crc<<1)^0x1021;    //CRC-ITU
                else
                    crc = crc<<1;
            }
            crc &=0xffff;
        }

        var hi = (crc>>8)&0xFF;  //高位置
        var lo = (crc & 0xFF);         //低位置

        puData[1027] = hi;
        puData[1028] = lo;
    }
}


function CRC16_Name(puData)
{
    var len = puData.length;

    if (len > 0) {
        var crc = 0x0000;

        for (var i = 0; i < 128; i++) {
            crc = (crc ^ ((puData[3+i])<<8 & 0xff00 ));
            
            for (var j = 0; j < 8; j++) {
                if(crc & 0x8000)
                    crc = (crc<<1)^0x1021;    //CRC-ITU
                else
                    crc = crc<<1;
            }
            crc &=0xffff;
        }

        var hi = (crc>>8)&0xFF;  //高位置
        var lo = (crc & 0xFF);         //低位置

        puData[131] = hi;
        puData[132] = lo;
    }
}
firmware_flasher_LiteRadio.connect_init = function(){
    $('div.connect_controls a.connect').click(function () {
        if (GUI.connect_lock != true) { 
            const thisElement = $(this);
            const clicks = thisElement.data('clicks');
            
            const toggleStatus = function() {
                thisElement.data("clicks", !clicks);
            };

            GUI.configuration_loaded = false;

            const selected_baud = parseInt($('div#port-picker #baud').val());

            //let COM = ($('div#port-picker #port option:selected').text());

            port = new serialport(getCurrentCdcPath(), {
                baudRate: parseInt(selected_baud),
                dataBits: 8,
                parity: 'none',
                stopBits: 1
            });
            
            //open事件监听
            port.on('open', () =>{

                console.log('serialport open success LiteRadio');
                $('div#connectbutton div.connect_state').text(i18n.getMessage('disconnect'));
                //timerRev = setInterval(wrapEvent,250);

                GUI.connect_lock = true;
                $('div#connectbutton a.connect').addClass('active');
            });

            //close事件监听
            port.on('close', () =>{
                GUI.connect_lock = false;
                console.log('serialport close success')
                $('div.connect_controls div.connect_state').text(i18n.getMessage('connect'));
            });

            //data事件监听
            port.on('data', data => {
                if(starting ==1)
                {
                    if(data[0] == 67)
                    {
                        var bufName = new Buffer(133);

                        bufName[0] = 0x01;
                        bufName[1] = 0x00;
                        bufName[2] = 0xFF;
                        bufName[3] = 0x42;
                        bufName[4] = 0x6f;
                        bufName[5] = 0x6f;
                        bufName[6] = 0x74;
                        bufName[7] = 0x6c;
                        bufName[8] = 0x6f;
                        bufName[9] = 0x61;
                        bufName[10] = 0x64;
                        bufName[11] = 0x65;
                        bufName[12] = 0x72;
                        bufName[13] = 0x5f;
                        bufName[14] = 0x46;
                        bufName[15] = 0x2e;
                        bufName[16] = 0x62;
                        bufName[17] = 0x69;
                        bufName[18] = 0x6e;
                        bufName[19] = 0x00;
                        
                        
                        
                        var str = binSize.toString();
                        var sizeLen = str.length;

                        for(var i=0;i<sizeLen;i++)
                        {
                            var value = str.charCodeAt(i).toString(10);
                            bufName[20+i] = value;
                        }

                        CRC16_Name(bufName);

                        console.log(bufName);
                        
                        port.write(bufName, (err) =>{
                            if (err) return console.log('write Error: ', err.message);
                        });

                        starting =2;

                        firmware_flasher_LiteRadio.flashingMessage("Erasing ...","NEUTRAL");
                    }
                }
                else{
                    if(starting ==2)
                    {
                        if(data[0] == 6)
                        {        
                            var bufData = new Buffer(1029);

                            fs.open(binFilePath, 'r', function(err, fd){
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("File opened successfully! LiteRadio");
                        
                                lastSize = binSize - (packNum-1)*1024;
                                console.log("lastSize:",lastSize);
                        
                                if(lastSize>0)
                                {
                                    bufData[0] = 0x02;
                                    bufData[1] = packNum;
                                    bufData[2] = ~packNum;
                    
                                    console.log("lastSize:",lastSize);

                                    fs.read(fd, bufData, 3, 1024, (packNum-1)*1024, function(err, bytes){
                                        if (err){
                                            console.log(err);
                                            }
                                            console.log(bytes + " bytes read");
                                            
                                            CRC16_Check(bufData);

                                            // Print only read bytes to avoid junk.
                                            if(bytes > 0){
                                            port.write(bufData, (err) =>{
                                                if (err) return console.log('write Error: ', err.message);
                                            });
                                            packNum ++;
                                        }
                                    });  

                                    if(lastSize<1024)
                                    {
                                        starting = 3;
                                    }
                                }  
                                    
                            });

                            firmware_flasher_LiteRadio.flashingMessage("Flashing ...","NEUTRAL");
                            firmware_flasher_LiteRadio.flashProgress(packNum/packLen*100);
                        }
                    }
                    else if(starting ==4)
                    {
                        console.log(data);
                        if(data[0] == 21)
                        {
                            var buf = new Buffer(133);

                            buf[0] = 0x01;
                            buf[1] = 0x00;
                            buf[2] = 0xff;
                            port.write(buf, (err) =>{
                                if (err) return console.log('write Error: ', err.message);
                            });
                            
                            console.log("EOT3 LiteRadio");
                            
                            firmware_flasher_LiteRadio.flashingMessage("Programming: SUCCESSFUL","VALID");
                            port.close();
                            GUI.connect_lock = false;
                            $('div#connectbutton a.connect').removeClass('active');
                            $('div#connectbutton div.connect_state').text(i18n.getMessage('connect'));

                            lastSize=0;
                            binSize=null;
                            packNum=1;
                            starting=null;

                        }
                    }
                    else if(starting ==3)
                    {
                        
                        if(data[0] == 6)
                        {
                            var buf = new Buffer(1);
                            buf[0] = 0x04;

                            port.write(buf, (err) =>{
                                if (err) return console.log('write Error: ', err.message);
                            });
                            starting = 4;
                            firmware_flasher_LiteRadio.flashingMessage("Verifying ...","NEUTRAL");
                            
                            
                        }         
                    }
                }
            });

            //error事件监听
            port.on('error',function(err){
                // port.close();
                $('div#connectbutton div.connect_state').text(i18n.getMessage('connect'));
                console.log('Error: ',err.message);
            });
        }
        else
        {
            port.close();
            
            GUI.connect_lock = false;
            $('div#connectbutton a.connect').removeClass('active');
        }
    });
}



firmware_flasher_LiteRadio.initialize = function (callback) {
    const self = this;
    self.enableFlashing(false);

    

    $('#content').load("./src/html/firmware_flasher_LiteRadio.html", function () {
        i18n.localizePage();
        $('a.load_file').click(function () {
            
            const { dialog } = require('electron').remote;
            dialog.showOpenDialog({
                title: "openFile",
                defaultPath: "",
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'target files', extensions: ['bin'] },
                ]
            }).then(result => {
                binFilePath = result.filePaths[0];
                strFileName = binFilePath.substring(binFilePath.lastIndexOf("\\")+1); 
                   
                fs.readFile(result.filePaths[0], (err, binFile) => {
                    if (err) {
                        alert(err)
                    } else {
                        
                        binSize = binFile.length;

                        packLen = Math.round(binSize / 1024);
                        if(packLen>10){
                            self.enableFlashing(true);
                            firmware_flasher_LiteRadio.flashingMessage("Load Firmware Sucessfuly! Firmware Size: ( "+ binFile.length +"bytes )",self.FLASH_MESSAGE_TYPES.NEUTRAL);
                        }else{
                            self.enableFlashing(false);
                            firmware_flasher_LiteRadio.flashingMessage("Load Firmware Failure!");
                        }
                    }
                });
    
            }).catch(err => {
                console.log(err)
            })

        });

        

        $('select[id="boardTarget"]').change(function () {
            firmware_flasher_LiteRadio.target_board = parseInt($(this).val(), 10);
            switch(firmware_flasher_LiteRadio.target_board){
                case 0:
                    break;
                case 1:
                    $('#boardVersion').empty();
                    for(let i=0;i<firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE.length;i++){
                        addOptionValue2('boardVersion',i,firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE[i].version);
                    }
                    break;
                case 2:
                    $('#boardVersion').empty();
                    for(let i=0;i<firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE_V2_SX1280.length;i++){
                        addOptionValue2('boardVersion',i,firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE_V2_SX1280[i].version);
                    }
                    break;
                case 3:
                    $('#boardVersion').empty();
                    for(let i=0;i<firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE_V2_CC2500.length;i++){
                        addOptionValue2('boardVersion',i,firmware_flasher_LiteRadio.firmware_version.LiteRadio_2_SE_V2_CC2500[i].version);
                    }
                    break;
                case 4:
                    $('#boardVersion').empty();
                    for(let i=0;i<firmware_flasher_LiteRadio.firmware_version.LiteRadio_3_SX1280.length;i++){
                        addOptionValue2('boardVersion',i,firmware_flasher_LiteRadio.firmware_version.LiteRadio_3_SX1280[i].version);
                    }
                    break;
                case 5:
                    $('#boardVersion').empty();
                    for(let i=0;i<firmware_flasher_LiteRadio.firmware_version.LiteRadio_3_CC2500.length;i++){
                        addOptionValue2('boardVersion',i,firmware_flasher_LiteRadio.firmware_version.LiteRadio_3_CC2500[i].version);
                    }
                    break;
                default:
                    $('#boardVersion').empty();
                    break;
            }
        });
        $('a.flash_firmware').click(function () {
            if (!$(this).hasClass('disabled')) {

                var buf = Buffer(8);
                buf[0] = 0x75;
                buf[1] = 0x70;
                buf[2] = 0x64;
                buf[3] = 0x61;
                buf[4] = 0x74;
                buf[5] = 0x65;
                buf[6] = 0x0d;
                buf[7] = 0x0a;

                port.write(buf, (err) =>{
                    if (err) return console.log('write Error: ', err.message);
                });

                // $("a.load_file").addClass('disabled');

                firmware_flasher_LiteRadio.flashProgress(0);
                self.enableFlashing(false);
                starting = 1;
            }
        });
        
        $('a.load_remote_file').click(function () {
            if (!$(this).hasClass('disabled')) {

                let targetBoardSelected = ($('#boardTarget option:selected').text());
                let targetVersionSelected = ($('#boardVersion option:selected').text());

                var str = targetBoardSelected + "_" + targetVersionSelected + ".bin";
                 
                // var urlValue = "https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v1/" + str;
                var urlValue = "https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v2.0.0/" + str;

                var xhr = new XMLHttpRequest();
                xhr.open('GET', urlValue, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function(e) {
                    var array = new Uint8Array(xhr.response);

                    fs.writeFile(path.join(__dirname, str), array, "utf8",(err)=>{
                        if(err){
                            alert(i18n.getMessage("write_file_failed"));
                            
                        }else {
                            binFilePath = path.join(__dirname, str);
                            fs.readFile(binFilePath, (err, binFile) => {
                                if (err) {
                                    
                                } else {
                                    binSize = binFile.length;
                                    packLen = Math.round(binSize / 1024);
                                    if(packLen>10){
                                        self.enableFlashing(true);
                                        firmware_flasher_LiteRadio.flashingMessage("Load Firmware Sucessfuly! Firmware Size: ( "+ binFile.length +"bytes )",self.FLASH_MESSAGE_TYPES.NEUTRAL);
                                    }else{
                                        self.enableFlashing(false);
                                        firmware_flasher_LiteRadio.flashingMessage("Load Firmware Failure!");
                                    }
                                    
                                }
                            });

                        }
                    })
                };
                xhr.onreadystatechange = function(){
                    if(xhr.readyState==2){
                    }else if(xhr.readyState==3){
                    }
             
                     if (xhr.readyState == 4){
                         if(xhr.status == 200){//ok
                            loadFirmwareFromGithubSuccessful = true;
                         }
                         else{
                             if(loadFirmwareFromGithubSuccessful == true){
                                loadFirmwareFromGithubSuccessful = false;
                                console.log("can't load firmware from github");
                             }else{
                                console.log("can't load firmware from gitee");
                             }
                             
                         } 
                     }
                 };
                xhr.send();
                setTimeout(() => {
                    if(loadFirmwareFromGithubSuccessful == false){
                        let firmware_name = targetBoardSelected + "_" + targetVersionSelected+ ".bin";
                        switch(firmware_name){
                            case "LiteRadio_2_SE_1.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/881713/download/LiteRadio_2_SE_1.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_SX1280_1.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/881708/download/LiteRadio_2_SE_V2_SX1280_1.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_SX1280_1.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/882149/download/LiteRadio_2_SE_V2_SX1280_1.0.1.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_SX1280_1.0.2.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933691/download/LiteRadio_2_SE_V2_SX1280_1.0.2.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_SX1280_2.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955209/download/LiteRadio_2_SE_V2_SX1280_2.0.0.bin", true);
                                xhr.send(null);
                                break; 
                            case "LiteRadio_2_SE_V2_SX1280_2.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955205/download/LiteRadio_2_SE_V2_SX1280_2.0.1.bin", true);
                                xhr.send(null);
                                break; 

                            case "LiteRadio_3_SX1280_1.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/881711/download/LiteRadio_3_SX1280_1.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_SX1280_1.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/882150/download/LiteRadio_3_SX1280_1.0.1.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_SX1280_1.0.2.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933685/download/LiteRadio_3_SX1280_1.0.2.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_SX1280_2.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955211/download/LiteRadio_3_SX1280_2.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_SX1280_2.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955206/download/LiteRadio_3_SX1280_2.0.1.bin", true);
                                xhr.send(null);
                                break;

                            case "LiteRadio_2_SE_V2_CC2500_1.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/881707/download/LiteRadio_2_SE_V2_CC2500_1.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_CC2500_1.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933688/download/LiteRadio_2_SE_V2_CC2500_1.0.1.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_CC2500_1.0.2.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933689/download/LiteRadio_2_SE_V2_CC2500_1.0.2.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_CC2500_2.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955210/download/LiteRadio_2_SE_V2_CC2500_2.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_2_SE_V2_CC2500_2.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955208/download/LiteRadio_2_SE_V2_CC2500_2.0.1.bin", true);
                                xhr.send(null);
                                break;


                            case "LiteRadio_3_CC2500_1.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/881712/download/LiteRadio_3_CC2500_1.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_CC2500_1.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933682/download/LiteRadio_3_CC2500_1.0.1.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_CC2500_1.0.2.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/933681/download/LiteRadio_3_CC2500_1.0.2.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_CC2500_2.0.0.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955212/download/LiteRadio_3_CC2500_2.0.0.bin", true);
                                xhr.send(null);
                                break;
                            case "LiteRadio_3_CC2500_2.0.1.bin":
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/955207/download/LiteRadio_3_CC2500_2.0.1.bin", true);
                                xhr.send(null);
                                break;


                            default:
                                xhr.open('GET', "https://gitee.com/huang_wen_tao123/lite-radio_-elrs_-release/attach_files/856701/download/null.bin", true);
                                xhr.send(null);
                                break;    
                        }
                       
                    }
                }, 2000);


                xhr.timeout = 1800; 
                xhr.ontimeout = function(){
                    console.log("get firmware time out");
                    loadFirmwareFromGithubSuccessful = false;
                }
                    }
                });

        loadRemoteJsonFile();
        callback();
    });

};

