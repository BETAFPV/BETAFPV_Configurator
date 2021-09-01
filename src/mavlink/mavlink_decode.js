const { mavlink10: mavlink, MAVLink10Processor: MAVLink } = require('./libraries/mavlink.js');
const mavlinkParser = new MAVLink(null, 0, 0);


mavlinkParser.on('ATTITUDE', function(msg) {
    // the parsed message is here
    FC.SENSOR_DATA.kinematics[0] = msg.roll;
    FC.SENSOR_DATA.kinematics[1] = msg.pitch;
    FC.SENSOR_DATA.kinematics[2] = msg.yaw;
});

