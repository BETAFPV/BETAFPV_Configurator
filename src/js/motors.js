// 'use strict';
const motors = {
  idelThrottleValue : 0,
}
motors.initialize = function (callback) {
  const self = this
  let rangeMin = 0
  let rangeMax = 2000
  self.numberOfValidOutputs = 4
  let motorsRunning = false
  const motorData = []

  $('#content').load('./src/html/motors.html', function () {
    $('a.refresh').click(function () {
      console.log('get motor setting')

      let msg = new mavlink10.messages.command(1, mav_cmd.MAV_CMD_GET_IDLE_THROTTLE_VALUE, 0, 0)
      let buffer = msg.pack(msg)
      mavlinkSend(buffer)
      console.log(buffer)
    })

    $('a.update').click(function () {
      console.log('save motor setting')
      let idelThrottleValue = parseInt(document.getElementById('idelThrottleValue').value)
      console.log(idelThrottleValue)
      if (idelThrottleValue > 20) {
        idelThrottleValue = 20
      }
      if (idelThrottleValue < 0) {
        idelThrottleValue = 0
      }

      let msg = new mavlink10.messages.motors_minivalue(idelThrottleValue)
      let buffer = msg.pack(msg)
      mavlinkSend(buffer)
    })

    i18n.localizePage()

    const motorsEnableTestModeElement = $('#motorsEnableTestMode')
    motorsEnableTestModeElement.prop('checked', false)

    $('div.sliders input').prop('min', rangeMin).prop('max', rangeMax)
    $('div.values li:not(:last)').text(rangeMin)

    buffer_delay = false
    $('div.sliders input:not(.master)').on('input', function () {
      const index = $(this).index()

      $('div.values li').eq(index).text($(this).val())

      for (let i = 0; i < self.numberOfValidOutputs; i++) {
        const val = parseInt($('div.sliders input').eq(i).val())
        motorData[i] = val
      }

      if (!buffer_delay) {
        buffer_delay = setTimeout(function () {
          let msg = new mavlink10.messages.motors_test(motorsRunning, motorData[0], motorData[1], motorData[2], motorData[3])
          let buffer = msg.pack(msg)
          mavlinkSend(buffer)
          buffer_delay = false
        }, 50)
      }
    })

    $('div.sliders input.master').on('input', function () {
      const val = $(this).val()

      $('div.sliders input:not(:disabled, :last)').val(val)
      $('div.values li:not(:last)').slice(0, self.numberOfValidOutputs).text(val)
      $('div.sliders input:not(:last):first').trigger('input')
    })

    function setSlidersEnabled(isEnabled) {
      if (isEnabled) {
        $('div.sliders input').slice(0, self.numberOfValidOutputs).prop('disabled', false)
        // unlock master slider
        $('div.sliders input:last').prop('disabled', false)
        motorsRunning = true
        console.log('motorsRunning:' + motorsRunning)
      } else {
        setSlidersDefault()

        // disable sliders / min max
        $('div.sliders input').prop('disabled', true)
        motorsRunning = false
      }

      $('div.sliders input').trigger('input')
    }

    function setSlidersDefault() {
      $('div.sliders input').val(rangeMin)
    }

    motorsEnableTestModeElement
      .change(function () {
        let enabled = $(this).is(':checked')
        console.log(enabled)
        setSlidersEnabled(enabled)
      })
      .change()

    callback()
  })
  //每次切换到电机界面，自动请求一次电机设置参数
  let msg = new mavlink10.messages.command(1, mav_cmd.MAV_CMD_GET_IDLE_THROTTLE_VALUE, 0, 0)
  let buffer = msg.pack(msg)
  mavlinkSend(buffer)
}
