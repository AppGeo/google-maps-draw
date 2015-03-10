(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "google"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("google"));
  }
})(function (exports, module, _google) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var google = _interopRequire(_google);

  module.exports = function (options) {
    if (!google) {
      throw new Error("This library depends on the Google Maps API");
    }
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztNQUFPLE1BQU07O21CQUVFLFVBQVUsT0FBTyxFQUFFO0FBQ2hDLFFBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxZQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDaEU7R0FDRiIsImZpbGUiOiJkaXN0L2dvb2dsZS1tYXBzLWRyYXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ29vZ2xlIGZyb20gJ2dvb2dsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghZ29vZ2xlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGxpYnJhcnkgZGVwZW5kcyBvbiB0aGUgR29vZ2xlIE1hcHMgQVBJJyk7XG4gIH1cbn1cbiJdfQ==