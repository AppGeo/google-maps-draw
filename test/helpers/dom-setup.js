'use strict';

var jsdom = require('jsdom');
var options = {
  html: '<!doctype html><html><head><meta charset=\'utf-8\'>' +
    '<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=geometry,drawing&callback=setup"></script>' +
    '</head>' +
    '<body><div id="map"></div></body></html>'
};

module.exports = function (done) {
  if (global.window) {
    throw new Error('tape-jsdom: already a browser environment, or tape-jsdom invoked twice');
  }

  var parentWindow = jsdom.jsdom(options.html, {}).parentWindow;

  parentWindow.onload = function () {
    parentWindow.setup = function () {
      done(undefined, parentWindow);
    };
  };
};
