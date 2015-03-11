'use strict';

var test = require('tape');
var domSetup = require('./helpers/dom-setup');
var Draw;

test('setup', function (t) {
  domSetup(function (err, window) {
    global.window = window;
    global.document = window.document;
    Draw = require('../dist/google-maps-draw');
    t.end();
  });
});

test('ok', function (t) {
  var draw = new Draw();
  t.end();
});
