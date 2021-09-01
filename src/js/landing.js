const landing = {};
landing.initialize = function (callback) {

  $('#content').load("./src/html/landing.html", function () {
    

    callback();
  });

};

landing.cleanup = function (callback) {
    if (callback) callback();
};
