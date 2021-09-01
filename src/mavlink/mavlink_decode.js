const { mavlink10: mavlink, MAVLink10Processor: MAVLink } = require('./libraries/mavlink.js');
const mavlinkParser = new MAVLink(null, 0, 0);
const commandAck = function(){

    this.command;
    this.result;
};
var cmdAck = new commandAck();

var mav_cmd = {
    MAV_CMD_PREFLIGHT_CALIBRATION:241,
};


var mav_cmd_ack = {
    MAV_CMD_ACK_OK              :1, /* Command / mission item is ok. | */
    MAV_CMD_ACK_ERR_FAIL        :2,
    MAV_CMD_ACK_LEVEL_CALI_START:3,
    MAV_CMD_ACK_LEVEL_CALI_OK   :4,
    MAV_CMD_ACK_LEVEL_CALI_FAIL :5,
    MAV_CMD_ACK_ENUM_END:       10, /*  | */
};


mavlinkParser.on('FIRMWARE_INFO', function(msg) {
    // the parsed message is here
    setup.targetID = msg.targetId;
    setup.major_version = msg.majorVersion;
    setup.minor_version = msg.minorVersion;
    setup.patch_version = msg.patchVersion;
    setup.year = msg.year;
    setup.month = msg.month;
    setup.day = msg.day;
    console.log(msg);
});



mavlinkParser.on('ATTITUDE', function(msg) {
    // the parsed message is here
    FC.SENSOR_DATA.kinematics[0] = msg.roll;
    FC.SENSOR_DATA.kinematics[1] = msg.pitch;
    FC.SENSOR_DATA.kinematics[2] = msg.yaw;
});

mavlinkParser.on('ALTITUDE', function(msg) {
    // the parsed message is here
    FC.SENSOR_DATA.tof = msg.tof;
    FC.SENSOR_DATA.barometer = msg.barometer;
    
});

mavlinkParser.on('RC_CHANNELS', function(msg) {
    // the parsed message is here
    rcData.channel_data[0] = msg.chan1_raw;
    rcData.channel_data[1] = msg.chan2_raw;
    rcData.channel_data[2] = msg.chan3_raw;
    rcData.channel_data[3] = msg.chan4_raw;
    rcData.channel_data[4] = msg.chan5_raw;
    rcData.channel_data[5] = msg.chan6_raw;
    rcData.channel_data[6] = msg.chan7_raw;
    rcData.channel_data[7] = msg.chan8_raw;
    rcData.channel_data[8] = msg.chan9_raw;
    rcData.channel_data[9] = msg.chan10_raw;
    rcData.channel_data[10] = msg.chan11_raw;
    rcData.channel_data[11] = msg.chan12_raw;
    rcData.channelCount = msg.count;
    rcData.rssi = msg.rssi;
});


mavlinkParser.on('IMU', function(msg) {
    // the parsed message is here
    FC.SENSOR_DATA.accelerometer[0] = msg.xAcc;
    FC.SENSOR_DATA.accelerometer[1] = msg.yAcc;
    FC.SENSOR_DATA.accelerometer[2] = msg.zAcc;

    FC.SENSOR_DATA.gyroscope[0] = msg.xGyro;
    FC.SENSOR_DATA.gyroscope[1] = msg.yGyro;
    FC.SENSOR_DATA.gyroscope[2] = msg.zGyro;

    FC.SENSOR_DATA.magnetometer[0] = msg.xMag;
    FC.SENSOR_DATA.magnetometer[1] = msg.yMag;
    FC.SENSOR_DATA.magnetometer[2] = msg.zMag;
    
});

mavlinkParser.on('SYS_STATUS', function(msg) {
    setup.battery_voltage = msg.voltageBattery;
    console.log("battery_voltage:"+setup.battery_voltage);
});


mavlinkParser.on('COMMAND_ACK', function(msg) {
    // the parsed message is here
    cmdAck.command = msg.command;
    cmdAck.result = msg.result;
    if(cmdAck.command == mav_cmd.MAV_CMD_PREFLIGHT_CALIBRATION){
        if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_LEVEL_CALI_START){
            $('#accel_calib_running').show();
            $('a.calibrateAccel').hide();
            
        }else if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_LEVEL_CALI_OK){
            $('#accel_calib_running').hide();
            $('a.calibrateAccel').show();
            alert("Calibrate Acclerometer ok!");
        }else if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_ERR_FAIL){
            $('#accel_calib_running').hide();
            $('a.calibrateAccel').show();
            alert("Calibrate Acclerometer failed!");
        }
        cmdAck.command = 0;
        cmdAck.result = 0;
        
    }
    if(cmdAck.command == mavlink10.MAVLINK_MSG_ID_RATE){
        if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_OK){
            pid_tuning.rate_saving_ack = true;
        }
        else {
            pid_tuning.rate_saving_ack = false;
        }
    }

    if(cmdAck.command == mavlink10.MAVLINK_MSG_ID_PID){
        if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_OK){
            pid_tuning.pid_saving_ack = true;
        }
        else {
            pid_tuning.pid_saving_ack = false;
        }
    }
    
});

