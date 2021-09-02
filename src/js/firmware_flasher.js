const os = require('os')
const path = require('path')

var jsonFile = require('jsonfile')

var jsonfileName = 'board.json'


const firmware_flasher ={
    localFirmwareLoaded: false,
    selectedBoard: undefined,
    boardNeedsVerification: false,
    intel_hex: undefined, // standard intel hex in string format
    parsed_hex: undefined, // parsed raw hex in array format
    unifiedTarget: {}, // the Unified Target configuration to be spliced into the configuration
    isConfigLocal: false, // Set to true if the user loads one locally
    developmentFirmwareLoaded: false, // Is the firmware to be flashed from the development branch?
};

firmware_flasher.FLASH_MESSAGE_TYPES = {
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
let packNum=0;
let ack = null;
let starting=null;

firmware_flasher.flashingMessage = function(message, type) {
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

firmware_flasher.enableFlashing = function (enabled) {
    if (enabled) {
        $('a.flash_firmware').removeClass('disabled');
    } else {
        $('a.flash_firmware').addClass('disabled');
    }
};

firmware_flasher.flashProgress = function(value) {
    $('.progress').val(value);

    return this;
};

function CRC16_Check(puData)
{
    var len = puData.length;

    if (len > 0) {
        var crc = 0x0000;

        for (var i = 0; i < 1023; i++) {
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

firmware_flasher.parseData = function(data)
{
    if(data[0] == 67)
    {
        if(starting ==1)
        {
            var bufData = new Uint8Array(1029);
            packNumb =0;

            fs.open(binFilePath, 'r', function(err, fd){
                if (err) {
                    return console.error(err);
                }

                lastSize = binSize - 1024;

                if(lastSize>0)
                {
                    bufData[0] = 0x02;
                    bufData[1] = 0;
                    bufData[2] = 255;

                    fs.read(fd, bufData, 3, 1024, 0, function(err, bytes){
                        if (err){
                            console.log(err);
                            }
                                                   
                            CRC16_Check(bufData);

                            if(bytes > 0){
                            port.write(bufData, (err) =>{
                                if (err) return console.log('write Error: ', err.message);
                            });
                            packNum ++;
                        }
                    });  

                    starting = 2;
                } 
            }); 
        }
    }
    else if(data[0] == 6)
    {
        if(starting ==2)
        {
            var bufData = new Buffer(1029);

            fs.open(binFilePath, 'r', function(err, fd){
                if (err) {
                    return console.error(err);
                }

                lastSize = binSize - packNum*1024;

                if(lastSize>0)
                {
                    bufData[0] = 0x02;
                    bufData[1] = packNum;
                    bufData[2] = ~packNum;

                    fs.read(fd, bufData, 3, 1024, packNum*1024, function(err, bytes){
                        if (err){
                            console.log(err);
                            }                      
                            CRC16_Check(bufData);
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

            firmware_flasher.flashingMessage("Flashing ...",firmware_flasher.FLASH_MESSAGE_TYPES.NEUTRAL);
            firmware_flasher.flashProgress(packNum/packLen*100);
        }
        else if(starting ==3)
        {
            var buf = new Buffer(1);
            buf[0] = 0x04;

            port.write(buf, (err) =>{
                if (err) return console.log('write Error: ', err.message);
            });
            firmware_flasher.flashingMessage("update finished",firmware_flasher.FLASH_MESSAGE_TYPES.NEUTRAL);
            firmware_flasher.flashProgress(packNum/packLen*100);
        }
    }
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
    
        for (var i = 0; i < jsonData.length; ++i) {
          console.log("name: "+jsonData[i].name);
          console.log("version: "+jsonData[i].version);

          addOptionValue2('boardTarget',i,jsonData[i].name);
          addOptionValue2('boardVersion',i,jsonData[i].version);

          console.log("----------------------------------"); 
        }
    });
}

function loadRemoteJsonFile(){
    //https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v1/board.json
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v1/board.json", true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        var array = new Uint8Array(xhr.response);

        fs.writeFile(path.join(__dirname, "./board.json"), array, "utf8",(err)=>{
            if(err){
                console.log("error");
            }else {
                console.log("ok");
                readJsonFile(jsonfileName);
            }
        })
    };
    xhr.send();

}

firmware_flasher.initialize = function (callback) {
    const self = this;
    self.enableFlashing(false);

    $('#content').load("./src/html/firmware_flasher.html", function () {

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
                        self.enableFlashing(true);
                        binSize = binFile.length;

                        packLen = Math.round(binSize / 1024);

                        firmware_flasher.flashingMessage("Loaded Local Firmware : ( "+ binFile.length +"bytes )",self.FLASH_MESSAGE_TYPES.NEUTRAL);
                    }
                });
    
            }).catch(err => {
                console.log(err)
            })

        });
     
        $('a.flash_firmware').click(function () {
            if (!$(this).hasClass('disabled')) {
                packNum = 0;
                var buf = Buffer(1);
                buf[0] = 0x01;

                port.write(buf, (err) =>{
                    if (err) return console.log('write Error: ', err.message);
                });

                $("a.load_file").addClass('disabled');
                
                firmware_flasher.flashProgress(0);
                self.enableFlashing(false);
                starting = 1;
            }
        });
        
        $('a.load_remote_file').click(function () {
            if (!$(this).hasClass('disabled')) {
                console.log("click");

                let targetBoardSelected = ($('#boardTarget option:selected').text());
                let targetVersionSelected = ($('#boardVersion option:selected').text());
                console.log(targetBoardSelected);
                console.log(targetVersionSelected);

                var str = targetBoardSelected + "_" + targetVersionSelected + ".bin";
                console.log(str);
                 
                var urlValue = "https://github.com/BETAFPV/BETAFPV.github.io/releases/download/v1/" + str;
                console.log(urlValue);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', urlValue, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function(e) {
                    var array = new Uint8Array(xhr.response);

                    fs.writeFile(path.join(__dirname, str), array, "utf8",(err)=>{
                        if(err){
                            console.log("error");
                        }else {
                            console.log("ok");
                            binFilePath = path.join(__dirname, str);
                            fs.readFile(binFilePath, (err, binFile) => {
                                if (err) {
                                    alert(err)
                                } else {
                                    self.enableFlashing(true);
                                    binSize = binFile.length;
            
                                    packLen = Math.round(binSize / 1024);
            
                                    firmware_flasher.flashingMessage("Loaded Local Firmware : ( "+ binFile.length +"bytes )",self.FLASH_MESSAGE_TYPES.NEUTRAL);
                                }
                            });

                        }
                    })
                };
                xhr.send();
            }
        });

        loadRemoteJsonFile();
        
        callback();
    });
};

