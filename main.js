const { TouchBarColorPicker } = require('electron');
var electron = require('electron')

var app = electron.app;
var BrowserWindow = electron.BrowserWindow
var Menu = electron.Menu
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
    mainWindow.webContents.openDevTools({
        mode:'bottom'
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    //disable app menu, IF YOU NEED MENU TO DEBUG,UNCOMMENT FOLLOW LINE
    Menu.setApplicationMenu(null);

    mainWindow.on('closed',()=>{
        mainWindow = null;

        app.quit();
    });
})

