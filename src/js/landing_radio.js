const landing = {}
var { shell } = require('electron')

landing.initialize = function (callback) {
  $('#content').load('./src/html/landing_radio.html', function () {
    i18n.localizePage()
    function showLang(newLang) {
      bottomSection = $('.languageSwitcher')
      bottomSection.find('a').each(function (index) {
        const element = $(this)
        const languageSelected = element.attr('lang')
        if (newLang == languageSelected) {
          element.removeClass('selected_language')
          element.addClass('selected_language')
        } else {
          element.removeClass('selected_language')
        }
      })
    }
    let bottomSection = $('.languageSwitcher')
    bottomSection.html(' <span i18n="language_choice_message"></span>')
    // bottomSection.append(' <a href="#" i18n="language_default_pretty" lang="DEFAULT"></a>');
    const languagesAvailables = i18n.getLanguagesAvailables()
    languagesAvailables.forEach(function (element) {
      bottomSection.append(' <a href="#" lang="' + element + '" i18n="language_' + element + '"></a>')
    })
    bottomSection.find('a').each(function (index) {
      let element = $(this)
      element.click(function () {
        element = $(this)
        const languageSelected = element.attr('lang')
        if (!languageSelected) {
          return
        }
        if (i18n.selectedLanguage != languageSelected) {
          switchLanguage(languageSelected)
          i18n.changeLanguage(languageSelected)
          showLang(languageSelected)
        }
      })
    })

    showLang(i18n.selectedLanguage)
    // translate to user-selected language
    i18n.localizePage()

    let Lite_Brushed_FC_V3_href_radio = document.getElementById('Lite_Brushed_FC_V3_href_radio')
    Lite_Brushed_FC_V3_href_radio.onclick = function (e) {
      e.preventDefault() //关闭使用原生串口
      shell.openExternal(this.getAttribute('href')) //通过浏览器打开链接
    }

    let Cetus_FPV_Kit_href_radio = document.getElementById('Cetus_FPV_Kit_href_radio')
    Cetus_FPV_Kit_href_radio.onclick = function (e) {
      e.preventDefault()
      shell.openExternal(this.getAttribute('href'))
    }

    let Cetus_Pro_FPV_Kit_href_radio = document.getElementById('Cetus_Pro_FPV_Kit_href_radio')
    Cetus_Pro_FPV_Kit_href_radio.onclick = function (e) {
      e.preventDefault()
      shell.openExternal(this.getAttribute('href'))
    }

    let LiteRadio_2_SE_href_radio = document.getElementById('LiteRadio_2_SE_href_radio')
    LiteRadio_2_SE_href_radio.onclick = function (e) {
      e.preventDefault()
      shell.openExternal(this.getAttribute('href'))
    }

    let LiteRadio_3_href_radio = document.getElementById('LiteRadio_3_href_radio')
    LiteRadio_3_href_radio.onclick = function (e) {
      e.preventDefault()
      shell.openExternal(this.getAttribute('href'))
    }

    callback()
  })
}

landing.cleanup = function (callback) {
  if (callback) callback()
}
