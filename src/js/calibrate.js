const calibrate = {};
calibrate.initialize = function (callback) {

    $('#content').load("./src/html/calibrate.html", function () {

        callback();
    });
};

calibrate.cleanup = function (callback) {
    if (callback) callback();
};
