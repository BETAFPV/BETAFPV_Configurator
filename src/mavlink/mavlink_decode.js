const { mavlink10: mavlink, MAVLink10Processor: MAVLink } = require('./libraries/mavlink.js');
const mavlinkParser = new MAVLink(null, 0, 0);


mavlinkParser.on('ATTITUDE', function(msg) {
    // the parsed message is here
    FC.SENSOR_DATA.kinematics[0] = msg.roll;
    FC.SENSOR_DATA.kinematics[1] = msg.pitch;
    FC.SENSOR_DATA.kinematics[2] = msg.yaw;
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