const { TouchBarColorPicker } = require('electron');
var electron = require('electron')

var app = electron.app;
var BrowserWindow = electron.BrowserWindow


var mainWindow = null

app.allowRendererProcessReuse = false

app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        minWidth: 1024,
        minHeight: 550,
        width:1500,
        height:1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
          },
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    
    mainWindow.on('closed',()=>{
        mainWindow = null;

        app.quit();
    });
})

