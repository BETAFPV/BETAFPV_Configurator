# BETAFPV_Configurator


### Developers
1.安装 **vistual studio Code** : [https://code.visualstudio.com/](https://code.visualstudio.com/ "here")

2.安装 **nvm**:[https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases "here")(nvm-setup.zip)

3.克隆项目到本地:git clone git@github.com:BETAFPV/BETAFPV_Configurator.git


4.通过vs Code打开项目文件夹,在vs Code的菜单栏的Termital新建终端并输入以下命令：

nvm install 14.17.0

nvm use 14.14.0

npm -i -g electron

npm install -g cnpm --registry=https://registry.npm.taobao.org

cnpm install serialport --save-dev

cnpm install --save-dev electron-rebuild

.\node_modules\.bin\electron-rebuild.cmd

如果到这一步出现报错，则输入
npm install -g node-gyp，并重新执行.\node_modules\.bin\electron-rebuild.cmd
若没有报错则跳过此步骤。

加载依赖并启动程序：

npm install

electron .



若在vs code输入命令时出现以下错误：无法加载文件xxx.ps1,因为在此系统中禁止脚本。


解决方案如下：

1.按下window+R，输入**powershell**，回车或确定。

2.输入**set-executionpolicy remotesigned**,回车。

3.输入**y**回车。
