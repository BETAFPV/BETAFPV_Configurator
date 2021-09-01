

const GuiControl = function () {
    this.auto_connect = false;
    this.connecting_to = false;
    this.connected_to = false;
    this.connect_lock = false;
    this.active_tab = null;
    this.tab_switch_in_progress = false;
    this.operating_system = null;
    this.interval_array = [];
    this.timeout_array = [];
    this.connect_hid = false;

    this.defaultAllowedTabsWhenDisconnected = [
        'landing',
        'changelog',
        'firmware_flasher',
        'privacy_policy',
        'options',
        'help',
    ];
    this.defaultAllowedFCTabsWhenConnected = [
        'setup',
        'failsafe',
        'transponder',
        'osd',
        'power',
        'adjustments',
        'auxiliary',
        'cli',
        'configuration',
        'gps',
        'led_strip',
        'logging',
        'onboard_logging',
        'modes',
        'motors',
        'pid_tuning',
        'ports',
        'receiver',
        'literadio',
        'sensors',
        'servos',
        'vtx',
    ];

    this.allowedTabs = this.defaultAllowedTabsWhenDisconnected;

};

GuiControl.prototype.interval_add = function (name, code, interval, first) {
    const data = {'name': name, 'timer': null, 'code': code, 'interval': interval, 'fired': 0, 'paused': false};

    if (first === true) {
        code(); // execute code

        data.fired++; // increment counter
    }

    data.timer = setInterval(function() {
        code(); // execute code

        data.fired++; // increment counter
    }, interval);

    this.interval_array.push(data); // push to primary interval array

    return data;
};


// name = string
GuiControl.prototype.interval_remove = function (name) {
    for (let i = 0; i < this.interval_array.length; i++) {
        if (this.interval_array[i].name === name) {
            clearInterval(this.interval_array[i].timer); // stop timer

            this.interval_array.splice(i, 1); // remove element/object from array

            return true;
        }
    }

    return false;
};
// input = array of timers thats meant to be kept, or nothing
// return = returns timers killed in last call
GuiControl.prototype.interval_kill_all = function (keepArray) {
    const self = this;
    let timersKilled = 0;

    for (let i = (this.interval_array.length - 1); i >= 0; i--) { // reverse iteration
        let keep = false;
        if (keepArray) { // only run through the array if it exists
            keepArray.forEach(function (name) {
                if (self.interval_array[i].name === name) {
                    keep = true;
                }
            });
        }

        if (!keep) {
            clearInterval(this.interval_array[i].timer); // stop timer

            this.interval_array.splice(i, 1); // remove element/object from array

            timersKilled++;
        }
    }

    return timersKilled;
};

// initialize object into GUI variable
window.GUI = new GuiControl();
