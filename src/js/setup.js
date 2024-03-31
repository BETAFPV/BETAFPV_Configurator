var setupModel
const setup = {
  SerialNumber      : null,
  yaw_fix           : 0,
  targetID          : 0,
  major_version     : 0,
  minor_version     : 0,
  patch_version     : 0,
  year              : 0,
  month             : 0,
  day               : 0,
  battery_voltage   : 0,
  factory_reset_ack : false,
  mavlinkConnected  : false,
}
function resetSetup() {
  setup.SerialNumber = null
  setup.yaw_fix = 0
  setup.targetID = 0
  setup.major_version = 0
  setup.minor_version = 0
  setup.patch_version = 0
  setup.year = 0
  setup.month = 0
  setup.day = 0
  setup.battery_voltage = 0
  setup.factory_reset_ack = false
  setup.mavlinkConnected = false
}
setup.initialize = function (callback) {
  const self = this
  resetSetup()
  $('#content').load('./src/html/setup.html', function () {
    i18n.localizePage()
    const backupButton = $('#content .backup')
    self.initModel()

    $('div#interactive_block > a.reset').click(function () {
      self.yaw_fix = FC.SENSOR_DATA.kinematics[2] * 1.0
      $(this).text(i18n.getMessage('initialSetupButtonResetZaxisValue', [self.yaw_fix]))
    })

    $('a.calibrateAccel').click(function () {
      const _self = $(this)
      if (!_self.hasClass('calibrating')) {
        _self.addClass('calibrating')
        let msg = new mavlink10.messages.command(1, mav_cmd.MAV_CMD_PREFLIGHT_CALIBRATION, 1, 0)
        let buffer = msg.pack(msg)
        console.log(buffer)
        mavlinkSend(buffer)
      }
    })

    $('a.resetSettings').click(function () {
      let msg = new mavlink10.messages.command(1, mav_cmd.MAV_CMD_RESTORE_FACTORY_SETTING, 0, 0)
      let buffer = msg.pack(msg)
      console.log(buffer)
      mavlinkSend(buffer)

      setTimeout(() => {
        if (setup.factory_reset_ack == true) {
          const dialogFactoryResetOK = $('.dialogFactoryResetOK')[0]
          dialogFactoryResetOK.showModal()
          $('.dialogFactoryResetOK-confirmbtn').click(function () {
            console.log(' dialogFactoryResetOK.close')
            dialogFactoryResetOK.close()
          })
        } else {
          const dialogFactoryResetfailed = $('.dialogFactoryResetfailed')[0]
          dialogFactoryResetfailed.showModal()
          $('.dialogFactoryResetfailed-confirmbtn').click(function () {
            dialogFactoryResetfailed.close()
          })
        }
      }, 1000)
    })

    function display_Info() {
      const SerialNumber_e = $('.SerialNumber')
      target_id_e = $('.target')
      version_e = $('.firmwareVersion')
      build_time_e = $('.buil-time')
      voltage_e = $('.bat-voltage')
      switch (setup.targetID) {
        case 0:
          target_id_e.text('Unknow')
          break
        case 1:
          target_id_e.text('Cetus')
          break
        case 2:
          target_id_e.text('Cetus pro')
          break
        case 3:
          target_id_e.text('Lite brush v3')
          break
        default:
          target_id_e.text('Unknow')
          break
      }
      if (setup.SerialNumber != null) {
        SerialNumber_e.text(setup.SerialNumber)
      }
      version_e.text(setup.major_version + '.' + setup.minor_version + '.' + setup.patch_version)
      build_time_e.text(setup.year + '-' + setup.month + '-' + setup.day)
      voltage_e.text(setup.battery_voltage.toFixed(2))
    }
    GUI.interval_add('display_Info', display_Info, 1000, true) // 1 fps

    function get_fast_data() {
      self.renderModel()
    }
    GUI.interval_add('setup_data_pull_fast', get_fast_data, 33, true) // 30 fps

    callback()
  })
}

setup.cleanup = function (callback) {
  if (callback) callback()
}

setup.initializeInstruments = function () {
  const options = { size: 90, showBox: false, img_directory: 'images/flightindicators/' }
  const attitude = $.flightIndicator('#attitude', 'attitude', options)
  const heading = $.flightIndicator('#heading', 'heading', options)
}

setup.initModel = function () {
  this.model = new Model($('.model-and-info #canvas_wrapper'), $('.model-and-info #canvas'))
  setupModel = this.model
  $(window).on('resize', $.proxy(this.model.resize, this.model))
}

setup.renderModel = function () {
  const x = FC.SENSOR_DATA.kinematics[1] * -1.0 * 0.017453292519943295,
    y = parseInt(FC.SENSOR_DATA.kinematics[2] * 1.0 - setup.yaw_fix) * 0.017453292519943295,
    z = FC.SENSOR_DATA.kinematics[0] * -1.0 * 0.017453292519943295

  let roll = parseInt(FC.SENSOR_DATA.kinematics[0]).toFixed(0)
  let pitch = parseInt(FC.SENSOR_DATA.kinematics[1]).toFixed(0)
  let yaw = parseInt(FC.SENSOR_DATA.kinematics[2]).toFixed(0)
  $('dd.roll_display').text(roll + ' ' + 'deg')
  $('dd.pitch_display').text(pitch + ' ' + 'deg')
  $('dd.yaw_dislpay').text(yaw + ' ' + 'deg')
  this.model.rotateTo(x, y, z)
}
