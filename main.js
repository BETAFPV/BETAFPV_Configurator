const { app, BrowserWindow, Menu, webContents } = require('electron')
const { initialize, enable } = require('@electron/remote/main')

app.whenReady().then(() => {
  for (const wc of webContents.getAllWebContents()) {
    enable(wc)
  }
})

initialize()

var mainWindow = null

app.allowRendererProcessReuse = false

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    minWidth       : 1024,
    minHeight      : 550,
    width          : 1500,
    height         : 1000,
    webPreferences : {
      nodeIntegration    : true,
      contextIsolation   : false,
      enableRemoteModule : true,
    },
  })

  if (process.env.ELECTRON_OPEN_DEV_TOOLS === 'true') {
    mainWindow.webContents.openDevTools({
      mode : 'bottom',
    })
  }

  if (process.env.liteRadio === 'true') {
    mainWindow.loadURL(`file://${__dirname}/LiteRadio.html`)
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }

  //disable app menu, IF YOU NEED MENU TO DEBUG,UNCOMMENT FOLLOW LINE
  Menu.setApplicationMenu(null)

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
})
