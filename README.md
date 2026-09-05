# BETAFPV Configurator

## Developers
- 安装**Visual Studio Code** ：[https://code.visualstudio.com/](https://code.visualstudio.com/ "here")
- 安装**node.js**：https://nodejs.org/en/download/
- 安装**nvm**：[https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases "here")(nvm-setup.zip)
- 克隆项目到本地：`git clone git@github.com:BETAFPV/BETAFPV_Configurator.git`
- 通过VS Code打开项目文件夹，在VS Code的菜单栏的Terminal新建终端并输入以下命令：
```
#安装Node虚拟机
nvm install 20
nvm use 20
#加载所有的关联包
npm install

#启动electron程序
electron .
```

`serialport` and `node-hid` now ship prebuilt native binaries (N-API, ABI-stable) for
Windows/macOS/Linux, so **no rebuild step is required** after `npm install` — do not run
`electron-rebuild`. That tool predates these packages' current prebuild mechanism and will
force an unnecessary from-source `node-gyp` recompile, which can fail (missing a full native
toolchain) or silently produce a broken/mismatched binary, causing serial/USB device detection
to stop working with no visible error. If you ever hit an actual `NODE_MODULE_VERSION mismatch`
error (which means no prebuild matched your platform), use the maintained replacement instead:
```
npx @electron/rebuild



若在VS Code输入命令时出现以下错误：无法加载文件xxx.ps1，因为在此系统中禁止脚本。 解决方案如下：
- 按下Window+R，输入**powershell**，回车或确定。
- 输入**Set-Executionpolicy remotesigned**,回车。
- 输入**y**回车。


