(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.googleMapsDraw = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/iradchenko/sandbox/google-maps-draw/lib/index.js":[function(require,module,exports){
"use strict";

/* global google */

module.exports = function (options) {
  if (!google) {
    throw new Error("This library depends on the Google Maps API");
  }

  var manager = new google.maps.drawing.DrawingManager({
    map: map
  });
};

},{}]},{},["/Users/iradchenko/sandbox/google-maps-draw/lib/index.js"])("/Users/iradchenko/sandbox/google-maps-draw/lib/index.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvaXJhZGNoZW5rby9zYW5kYm94L2dvb2dsZS1tYXBzLWRyYXcvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztpQkNFZSxVQUFVLE9BQU8sRUFBRTtBQUNoQyxNQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsVUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0dBQ2hFOztBQUVELE1BQUksT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBQ25ELE9BQUcsRUFBRSxHQUFHO0dBQ1QsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIGdvb2dsZSAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9ucykge1xuICBpZiAoIWdvb2dsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBsaWJyYXJ5IGRlcGVuZHMgb24gdGhlIEdvb2dsZSBNYXBzIEFQSScpO1xuICB9XG5cbiAgdmFyIG1hbmFnZXIgPSBuZXcgZ29vZ2xlLm1hcHMuZHJhd2luZy5EcmF3aW5nTWFuYWdlcih7XG4gICAgbWFwOiBtYXBcbiAgfSk7XG59XG4iXX0=
