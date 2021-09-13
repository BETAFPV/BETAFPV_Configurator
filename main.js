const { TouchBarColorPicker } = require('electron');
var electron = require('electron')

var app = electron.app;
var BrowserWindow = electron.BrowserWindow
var Menu = electron.Menu

var mainWindow = null

const menuTemplate = [
    {
        label:'LiteRadio',
        submenu:[
            {
                label:'Enter to',
                click(){
                    mainWindow.loadURL(`file://${__dirname}/liteRadio.html`);
                }
            }
        ]
    },
    {
        label:'FC',
        submenu:[
            {
                label:'Enter to',
                click(){
                    mainWindow.loadURL(`file://${__dirname}/index.html`);
                }
            }
        ]
    },
    {
        label:'Options',
        submenu:[
            {
                label:'Update',
                click(){

                }
            },
            {
                label:'About',
                click(){
                    newWin =new BrowserWindow({
                        width:500,
                        height:200,
                        frame:true,//是否显示边缘框
                        fullscreen:false //是否全屏显示
                    });
                    //打开一个新的窗口
                    // newWin.loadURL(`file://${__dirname}/otherWin.html`);
                    //新建窗口
                    newWin.loadURL(`file://${__dirname}/src/html/about.html`);
                    newWin.on('close',()=>{
                        newWin=null
                    });
                }
            }
        ]
    }
];


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
    //mainWindow.loadURL(`file://${__dirname}/liteRadio.html`);

    //disable app menu, IF YOU NEED MENU TO DEBUG,UNCOMMENT FOLLOW LINE
    Menu.setApplicationMenu(null);

     //const mainMenu = Menu.buildFromTemplate(menuTemplate);
     //Menu.setApplicationMenu(mainMenu);

    
    mainWindow.on('closed',()=>{
        mainWindow = null;

        app.quit();
    });
})

