# BETAFPV Configurator

## Developers
- 安装**Visual Studio Code** ：[https://code.visualstudio.com/](https://code.visualstudio.com/ "here")
- 安装**node.js**：https://nodejs.org/en/download/
- 安装**nvm**：[https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases "here")(nvm-setup.zip)
- 克隆项目到本地：`git clone git@github.com:BETAFPV/BETAFPV_Configurator.git`
- 通过VS Code打开项目文件夹，在VS Code的菜单栏的Terminal新建终端并输入以下命令：
```
#安装Node虚拟机
nvm install 14.17.0     
nvm use 14.17.0
#安装electron，注意不要安装最新版本的14.x，否则serialport模块会有context aware问题
npm install -g electron@v13.1.7
#加载所有的关联包
npm install
#启动electron程序
electron .
```

下面是以往serialport模块出现context aware问题时，一个老的解决版本。但是可能不正确。
```
#npm install -g cnpm --registry=https://registry.npm.taobao.org
#cnpm install serialport --save-dev
#cnpm install electron-rebuild --save-dev 
#.\node_modules\\.bin\electron-rebuild.cmd
```
如果到这一步出现报错，则输入`npm install -g node-gyp`，并重新执行`.\node_modules\.bin\electron-rebuild.cmd`。若没有报错则跳过此步骤。

若在VS Code输入命令时出现以下错误：无法加载文件xxx.ps1，因为在此系统中禁止脚本。 解决方案如下：
- 按下Window+R，输入**powershell**，回车或确定。
- 输入**Set-Executionpolicy remotesigned**,回车。
- 输入**y**回车。
