const { mavlink10: mavlink, MAVLink10Processor: MAVLink } = require('./libraries/mavlink.js');
const mavlinkParser = new MAVLink(null, 0, 0);


const commandAck = function(){
    this.command;
    this.result;
};
var cmdAck = new commandAck();

var mav_cmd = {
    MAV_CMD_RESTORE_FACTORY_SETTING:1,
    MAV_CMD_READ_PID_FROM_FC:2,
    MAV_CMD_READ_RATE_FROM_FC:3,
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
});

mavlinkParser.on('PID', function(msg) { 
    document.getElementById('roll_p').value = msg.PID_ROLL_P.toFixed(2);
    document.getElementById('roll_i').value = msg.PID_ROLL_I.toFixed(2);
    document.getElementById('roll_d').value = msg.PID_ROLL_D.toFixed(2);
    document.getElementById('roll_imax').value = msg.PID_ROLL_I_MAX;
    document.getElementById('roll_cutfre').value = msg.PID_ROLL_D_CUTFREQ;

    document.getElementById('pitch_p').value = msg.PID_PITCH_P.toFixed(2);
    document.getElementById('pitch_i').value = msg.PID_PITCH_I.toFixed(2);
    document.getElementById('pitch_d').value = msg.PID_PITCH_D.toFixed(2);
    document.getElementById('pitch_imax').value = msg.PID_PITCH_I_MAX;
    document.getElementById('pitch_cutfre').value = msg.PID_PITCH_D_CUTFREQ;

    document.getElementById('yaw_p').value = msg.PID_YAW_P.toFixed(2);
    document.getElementById('yaw_i').value = msg.PID_YAW_I.toFixed(2);
    document.getElementById('yaw_d').value = msg.PID_YAW_D.toFixed(2);
    document.getElementById('yaw_imax').value = msg.PID_YAW_I_MAX;
    document.getElementById('yaw_cutfre').value = msg.PID_YAW_D_CUTFREQ;
});

mavlinkParser.on('RATE', function(msg) {

    document.getElementById('rc_rate_roll').value = msg.rcRateRoll.toFixed(2);
    document.getElementById('roll_rate').value = msg.rateRoll.toFixed(2);
    document.getElementById('rc_roll_expo').value = msg.rcExpoRoll.toFixed(2);

    document.getElementById('rc_rate_pitch').value = msg.rcRatePitch.toFixed(2);
    document.getElementById('pitch_rate').value = msg.ratePitch.toFixed(2);
    document.getElementById('rc_pitch_expo').value = msg.rcExpoPitch.toFixed(2);

    document.getElementById('rc_rate_yaw').value = msg.rcRateYaw.toFixed(2);
    document.getElementById('yaw_rate').value = msg.rateYaw.toFixed(2);
    document.getElementById('rc_yaw_expo').value = msg.rcExpoYaw.toFixed(2);

    document.getElementById('throttle_mid').value = msg.throttleMid.toFixed(2);
    document.getElementById('throttle_expo').value = msg.throttleExpo.toFixed(2);
});

mavlinkParser.on('COMMAND_ACK', function(msg) {
    // the parsed message is here
    cmdAck.command = msg.command;
    cmdAck.result = msg.result;
    switch(cmdAck.command){
        case mav_cmd.MAV_CMD_PREFLIGHT_CALIBRATION:
            if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_LEVEL_CALI_START){
                $('#accel_calib_running').show();
                $('a.calibrateAccel').hide();
                
            }else if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_LEVEL_CALI_OK){
                $('#accel_calib_running').hide();
                $('a.calibrateAccel').show();
                //alert("Calibrate Acclerometer ok!");
                const dialogCalibrateAcclerometerOK = $('.dialogCalibrateAcclerometerOK')[0];
                dialogCalibrateAcclerometerOK.showModal();
                $('.dialogCalibrateAcclerometerOK-confirmbtn').click(function() {
                    dialogCalibrateAcclerometerOK.close();
                });

            }else if(cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_ERR_FAIL){
                $('#accel_calib_running').hide();
                $('a.calibrateAccel').show();
                //alert("Calibrate Acclerometer failed!");
                const dialogCalibrateAcclerometerFailed = $('.dialogCalibrateAcclerometerFailed')[0];
                dialogCalibrateAcclerometerFailed.showModal();
                $('.dialogCalibrateAcclerometerFailed-confirmbtn').click(function() {
                    dialogCalibrateAcclerometerFailed.close();
                });
                
            }
            break;
        case mav_cmd.MAV_CMD_RESTORE_FACTORY_SETTING:
            setup.factory_reset_ack = (cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_OK)? true: false;
            break;
        case mavlink10.MAVLINK_MSG_ID_RATE:
            pid_tuning.rate_saving_ack = (cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_OK)? true: false;
            break;
        case mavlink10.MAVLINK_MSG_ID_PID:
            pid_tuning.pid_saving_ack = (cmdAck.result == mav_cmd_ack.MAV_CMD_ACK_OK)? true: false;
            break;
        default:
            console.log("unknow command ack");
            break;
    }
    cmdAck.command = 0;
    cmdAck.result = 0;
});

