const receiver = {}
const channelData = function () {
  this.channel_data = []
  this.channelCount
  this.rssi
}

var rcData = new channelData()

receiver.initialize = function (callback) {
  $('#content').load('./src/html/receiver.html', function () {
    i18n.localizePage()
    const bar_names = ['Roll [A]', 'Pitch [E]', 'Yaw [R]', 'Throttle [T]', 'AUX 1', 'AUX 2', 'AUX 3', 'AUX 4', 'AUX 5', 'AUX 6', 'AUX 7', 'AUX 8']
    const numBars = 12
    const barContainer = $('.tab-receiver .bars')

    for (let i = 0; i < numBars; i++) {
      let name
      if (i < bar_names.length) {
        name = bar_names[i]
      }

      barContainer.append('\
                <ul>\
                    <li class="name">' + name + '</li>\
                    <li class="meter">\
                        <div class="meter-bar">\
                            <div class="label"></div>\
                            <div class="fill' + '' + '">\
                                <div class="label"></div>\
                            </div>\
                        </div>\
                    </li>\
                </ul>\
            ')
    }

    const meterScale = {
      min : 900,
      max : 2100,
    }

    const meterFillArray = []
    const meterLabelArray = []
    $('.meter .fill', barContainer).each(function () {
      meterFillArray.push($(this))
    })

    $('.meter', barContainer).each(function () {
      meterLabelArray.push($('.label', this))
    })

    // correct inner label margin on window resize (i don't know how we could do this in css)
    tabresize = function () {
      const containerWidth = $('.meter:first', barContainer).width(),
        labelWidth = $('.meter .label:first', barContainer).width(),
        margin = containerWidth / 2 - labelWidth / 2

      for (let i = 0; i < meterLabelArray.length; i++) {
        meterLabelArray[i].css('margin-left', margin)
      }
    }

    $('a.refresh').on('click', function () {})

    function update_ui() {
      // update bars with latest data
      for (let i = 0; i < rcData.channelCount; i++) {
        meterFillArray[i].css('width', ((rcData.channel_data[i] - meterScale.min) / (meterScale.max - meterScale.min)) * 100 + '%')
        meterLabelArray[i].text(rcData.channel_data[i])
      }
    }

    GUI.interval_add('receiver_pull', update_ui, 100, true)
    let plotUpdateRate
    const rxRefreshRate = $('select[name="tx_refresh_rate"]')

    rxRefreshRate.on('change', function () {
      // plotUpdateRate = parseInt($(this).val(), 10);
      plotUpdateRate = parseInt(50, 10)
      GUI.interval_remove('receiver_pull')

      // GUI.interval_add('receiver_pull', update_ui, plotUpdateRate, true);
      GUI.interval_add('receiver_pull', update_ui, plotUpdateRate, true)
      console.log('rate')
    })

    rxRefreshRate.change()

    $(window).on('resize', tabresize).resize() // trigger so labels get correctly aligned on creation

    callback()
  })
}

receiver.renderModel = function () {
  if (this.keepRendering) {
    requestAnimationFrame(this.renderModel.bind(this))
  }

  if (!this.clock) {
    this.clock = new THREE.Clock()
  }

  if (FC.RC.channels[0] && FC.RC.channels[1] && FC.RC.channels[2]) {
    const delta = this.clock.getDelta()

    const roll = delta * this.rateCurve.rcCommandRawToDegreesPerSecond(FC.RC.channels[0], FC.RC_TUNING.roll_rate, FC.RC_TUNING.RC_RATE, FC.RC_TUNING.RC_EXPO, this.useSuperExpo, this.deadband, FC.RC_TUNING.roll_rate_limit),
      pitch = delta * this.rateCurve.rcCommandRawToDegreesPerSecond(FC.RC.channels[1], FC.RC_TUNING.pitch_rate, FC.RC_TUNING.rcPitchRate, FC.RC_TUNING.RC_PITCH_EXPO, this.useSuperExpo, this.deadband, FC.RC_TUNING.pitch_rate_limit),
      yaw = delta * this.rateCurve.rcCommandRawToDegreesPerSecond(FC.RC.channels[2], FC.RC_TUNING.yaw_rate, FC.RC_TUNING.rcYawRate, FC.RC_TUNING.RC_YAW_EXPO, this.useSuperExpo, this.yawDeadband, FC.RC_TUNING.yaw_rate_limit)

    this.model.rotateBy(-degToRad(pitch), -degToRad(yaw), -degToRad(roll))
  }
}

receiver.cleanup = function (callback) {
  if (callback) callback()
}
