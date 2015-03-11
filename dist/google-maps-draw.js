(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.googleMapsDraw = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/iradchenko/sandbox/google-maps-draw/lib/create-menu.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var css = _interopRequire(require("./styles/lib.less"));

var template = _interopRequire(require("./templates/menu.hbs"));

module.exports = function (options) {
  var element = document.createElement("div");

  element.className = "google-maps-draw draw-toolbox gm-style";
  element.innerHTML = template({
    orientation: options.orientation,
    enabledModes: options.modes,
    millis: Date.now()
  });

  return element.firstChild;
};

},{"./styles/lib.less":"/Users/iradchenko/sandbox/google-maps-draw/lib/styles/lib.less","./templates/menu.hbs":"/Users/iradchenko/sandbox/google-maps-draw/lib/templates/menu.hbs"}],"/Users/iradchenko/sandbox/google-maps-draw/lib/index.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/* global google */

var createMenu = _interopRequire(require("./create-menu"));

var Layer = _interopRequire(require("./layer"));

var gmaps = window.google && window.google.maps;

var Draw = (function () {
  function Draw(options) {
    _classCallCheck(this, Draw);

    if (!gmaps) {
      throw new Error("This library depends on the Google Maps API");
    }

    var mainLayer = new Layer(1);

    options = options || {};

    this.map = options.map;
    this.position = options.position || gmaps.ControlPosition.LEFT_TOP;
    this.options = options;
    this.activeLayer = mainLayer;
    this.layers = [mainLayer];
    this.shape = undefined;

    this.render();
  }

  _createClass(Draw, {
    addLayer: {
      value: function addLayer() {
        this.layers.push(new Layer());
      }
    },
    toggleToolbox: {
      value: function toggleToolbox() {
        var $list = this.$el.querySelector(".list");
        $list.classList.toggle("collapsed");
      }
    },
    render: {
      value: function render() {
        this.$el = createMenu({
          orientation: this.options.orientation || "horizontal",
          modes: [{
            id: "pan"
          }, {
            id: "line"
          }, {
            id: "circle"
          }, {
            id: "clear"
          }]
        });

        this.initDomEvents();

        if (this.map) {
          this.map.controls[this.position].push(this.$el);
          this.initMapEvents();
        }
      }
    },
    initDomEvents: {
      value: function initDomEvents() {
        var _this = this;

        this.$el.querySelector(".collapse").addEventListener("click", function (event) {
          return _this.toggleToolbox();
        });

        Array.prototype.forEach.call(this.$el.querySelectorAll(".trigger-mode"), function (item) {
          item.addEventListener("click", function (event) {
            var id = item.dataset.modeId;

            if (id === "clear") {
              _this.activeLayer.clear();
              id = "pan";
            }

            _this.drawingMode = id;
          });
        });
      }
    },
    initMapEvents: {
      value: function initMapEvents() {
        var self = this;
        var shape = this.shape;
        var map = this.map;

        this.map.addListener("click", function (event) {
          if (self.drawingMode && self.drawingMode !== "pan") {
            if (shape) {
              shape = undefined;
              gmaps.event.removeListener(self.shapeListener);
              return;
            }

            switch (self.drawingMode) {
              case "circle":
                {
                  shape = new gmaps.Circle({
                    center: event.latLng,
                    editable: true,
                    draggable: true,
                    map: map,
                    fillColor: "black",
                    fillOpacity: 0.8
                  });

                  self.activeLayer.addShape(shape);

                  self.shapeListener = shape.addListener("mousemove", function (event) {
                    var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);
                    shape.setRadius(radius * 5000000);
                  });
                  break;
                }

              case "line":
                {
                  shape = new gmaps.Circle({
                    path: [event.latLng],
                    editable: true,
                    draggable: true,
                    map: map,
                    fillColor: "black",
                    fillOpacity: 0.8
                  });

                  self.activeLayer.addShape(shape);
                  break;
                }
            }
          }

          return true;
        });

        this.map.addListener("mousemove", function (event) {
          if (shape) {
            var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);

            shape.setRadius(radius * 5000000);
          }
        });
      }
    }
  });

  return Draw;
})();

module.exports = Draw;

},{"./create-menu":"/Users/iradchenko/sandbox/google-maps-draw/lib/create-menu.js","./layer":"/Users/iradchenko/sandbox/google-maps-draw/lib/layer.js"}],"/Users/iradchenko/sandbox/google-maps-draw/lib/layer.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Layer = (function () {
  function Layer(ordinal) {
    _classCallCheck(this, Layer);

    this.shapes = [];
    this.ordinal = ordinal;
  }

  _createClass(Layer, {
    clear: {
      value: function clear() {
        this.shapes.forEach(function (shape) {
          shape.setMap(null);
        });
        this.shapes = [];
      }
    },
    addShape: {
      value: function addShape(shape) {
        shape.zIndex = this.ordinal;
        this.shapes.push(shape);
      }
    },
    hide: {
      value: function hide() {
        this.shapes.forEach(function (shape) {
          return shape.setVisible(false);
        });
      }
    },
    show: {
      value: function show() {
        this.shapes.forEach(function (shape) {
          return shape.setVisible(true);
        });
      }
    }
  });

  return Layer;
})();

module.exports = Layer;

},{}],"/Users/iradchenko/sandbox/google-maps-draw/lib/styles/lib.less":[function(require,module,exports){
var css = ".draw-toolbox {\n  margin: 5px;\n  direction: ltr;\n  overflow: hidden;\n  text-align: left;\n  position: relative;\n  color: #565656;\n  font-family: Roboto, Arial, sans-serif;\n  -webkit-user-select: none;\n  font-size: 11px;\n  -webkit-background-clip: padding-box;\n  border-width: 1px 1px 1px 0px;\n  border-top-style: solid;\n  border-right-style: solid;\n  border-bottom-style: solid;\n  border-top-color: rgba(0, 0, 0, 0.14902);\n  border-right-color: rgba(0, 0, 0, 0.14902);\n  border-bottom-color: rgba(0, 0, 0, 0.14902);\n  -webkit-box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px;\n  box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px;\n  background-color: #FFF;\n  background-clip: padding-box;\n}\n.draw-toolbox.draw-toolbox-horizontal ul,\n.draw-toolbox.draw-toolbox-horizontal li,\n.draw-toolbox.draw-toolbox-horizontal .collapse {\n  display: inline-block;\n}\n.draw-toolbox .collapse {\n  cursor: pointer;\n  padding: 4px;\n}\n.draw-toolbox ul.list {\n  padding: 0;\n  margin: 0;\n}\n.draw-toolbox ul.list.collapsed {\n  display: none;\n}\n.draw-toolbox ul.list > li {\n  list-style-type: none;\n}\n.draw-toolbox a {\n  padding: 4px;\n  display: block;\n  text-align: center;\n}\n";(require('lessify'))(css); module.exports = css;
},{"lessify":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/lessify/transform.js"}],"/Users/iradchenko/sandbox/google-maps-draw/lib/templates/menu.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <li>\n        <a href=\"#\" class=\"trigger-mode\" data-mode-id=\"";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a>\n      </li>\n    ";
  return buffer;
  }

  buffer += "<div id=\"google-maps-draw-";
  if (helper = helpers.millis) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.millis); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"draw-toolbox draw-toolbox-";
  if (helper = helpers.orientation) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.orientation); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <div class=\"collapse\">Draw</div>\n\n  <ul class=\"list collapsed\">\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.enabledModes), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </ul>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/hbsfy/runtime.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars.runtime.js":[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/base.js","./handlebars/exception":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/exception.js","./handlebars/runtime":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/runtime.js","./handlebars/safe-string":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/safe-string.js","./handlebars/utils":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/base.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/exception.js":[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/runtime.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/base.js","./exception":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/safe-string.js":[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/utils.js":[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars/safe-string.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/dist/cjs/handlebars.runtime.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/hbsfy/runtime.js":[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/handlebars/runtime.js"}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/lessify/node_modules/cssify/browser.js":[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],"/Users/iradchenko/sandbox/google-maps-draw/node_modules/lessify/transform.js":[function(require,module,exports){
module.exports = require('cssify');

},{"cssify":"/Users/iradchenko/sandbox/google-maps-draw/node_modules/lessify/node_modules/cssify/browser.js"}]},{},["/Users/iradchenko/sandbox/google-maps-draw/lib/index.js"])("/Users/iradchenko/sandbox/google-maps-draw/lib/index.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvaXJhZGNoZW5rby9zYW5kYm94L2dvb2dsZS1tYXBzLWRyYXcvbGliL2NyZWF0ZS1tZW51LmpzIiwiL1VzZXJzL2lyYWRjaGVua28vc2FuZGJveC9nb29nbGUtbWFwcy1kcmF3L2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9pcmFkY2hlbmtvL3NhbmRib3gvZ29vZ2xlLW1hcHMtZHJhdy9saWIvbGF5ZXIuanMiLCJsaWIvc3R5bGVzL2xpYi5sZXNzIiwibGliL3RlbXBsYXRlcy9tZW51LmhicyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvYmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvZXhjZXB0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9zYWZlLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hic2Z5L3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvbGVzc2lmeS9ub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvbGVzc2lmeS90cmFuc2Zvcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0lDQU8sR0FBRywyQkFBTSxtQkFBbUI7O0lBQzVCLFFBQVEsMkJBQU0sc0JBQXNCOztp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QUFDLElBQUksQ0FBQztTQUFBLENBQUMsQ0FBQztPQUN0RDs7OztTQXhCRyxLQUFLOzs7aUJBMkJJLEtBQUs7OztBQzNCcEI7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgY3NzIGZyb20gJy4vc3R5bGVzL2xpYi5sZXNzJztcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9tZW51Lmhicyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgZWxlbWVudC5jbGFzc05hbWUgPSAnZ29vZ2xlLW1hcHMtZHJhdyBkcmF3LXRvb2xib3ggZ20tc3R5bGUnO1xuICBlbGVtZW50LmlubmVySFRNTCA9IHRlbXBsYXRlKHtcbiAgICBvcmllbnRhdGlvbjogb3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICBlbmFibGVkTW9kZXM6IG9wdGlvbnMubW9kZXMsXG4gICAgbWlsbGlzOiBEYXRlLm5vdygpXG4gIH0pO1xuXG4gIHJldHVybiBlbGVtZW50LmZpcnN0Q2hpbGQ7XG59XG4iLCIvKiBnbG9iYWwgZ29vZ2xlICovXG5pbXBvcnQgY3JlYXRlTWVudSBmcm9tICcuL2NyZWF0ZS1tZW51JztcbmltcG9ydCBMYXllciBmcm9tICAnLi9sYXllcic7XG5cbnZhciBnbWFwcyA9IHdpbmRvdy5nb29nbGUgJiYgd2luZG93Lmdvb2dsZS5tYXBzO1xuXG5jbGFzcyBEcmF3IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGlmICghZ21hcHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBsaWJyYXJ5IGRlcGVuZHMgb24gdGhlIEdvb2dsZSBNYXBzIEFQSScpO1xuICAgIH1cblxuICAgIHZhciBtYWluTGF5ZXIgPSBuZXcgTGF5ZXIoMSk7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMubWFwID0gb3B0aW9ucy5tYXA7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gfHwgZ21hcHMuQ29udHJvbFBvc2l0aW9uLkxFRlRfVE9QO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hY3RpdmVMYXllciA9IG1haW5MYXllcjtcbiAgICB0aGlzLmxheWVycyA9IFttYWluTGF5ZXJdO1xuICAgIHRoaXMuc2hhcGUgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgYWRkTGF5ZXIoKSB7XG4gICAgdGhpcy5sYXllcnMucHVzaChuZXcgTGF5ZXIoKSk7XG4gIH1cblxuICB0b2dnbGVUb29sYm94KCkge1xuICAgIHZhciAkbGlzdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5saXN0Jyk7XG4gICAgJGxpc3QuY2xhc3NMaXN0LnRvZ2dsZSgnY29sbGFwc2VkJyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy4kZWwgPSBjcmVhdGVNZW51KHtcbiAgICAgIG9yaWVudGF0aW9uOiB0aGlzLm9wdGlvbnMub3JpZW50YXRpb24gfHwgJ2hvcml6b250YWwnLFxuICAgICAgbW9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAncGFuJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdsaW5lJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdjaXJjbGUnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ2NsZWFyJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXREb21FdmVudHMoKTtcblxuICAgIGlmICh0aGlzLm1hcCkge1xuICAgICAgdGhpcy5tYXAuY29udHJvbHNbdGhpcy5wb3NpdGlvbl0ucHVzaCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLmluaXRNYXBFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBpbml0RG9tRXZlbnRzKCkge1xuICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5jb2xsYXBzZScpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB0aGlzLnRvZ2dsZVRvb2xib3goKSk7XG5cbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmlnZ2VyLW1vZGUnKSwgaXRlbSA9PiB7XG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICB2YXIgaWQgPSBpdGVtLmRhdGFzZXQubW9kZUlkO1xuXG4gICAgICAgIGlmIChpZCA9PT0gJ2NsZWFyJykge1xuICAgICAgICAgIHRoaXMuYWN0aXZlTGF5ZXIuY2xlYXIoKTtcbiAgICAgICAgICBpZCA9ICdwYW4nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmF3aW5nTW9kZSA9IGlkO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0TWFwRXZlbnRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc2hhcGUgPSB0aGlzLnNoYXBlO1xuICAgIHZhciBtYXAgPSB0aGlzLm1hcDtcblxuICAgIHRoaXMubWFwLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKHNlbGYuZHJhd2luZ01vZGUgJiYgc2VsZi5kcmF3aW5nTW9kZSAhPT0gJ3BhbicpIHtcbiAgICAgICAgaWYgKHNoYXBlKSB7XG4gICAgICAgICAgc2hhcGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZ21hcHMuZXZlbnQucmVtb3ZlTGlzdGVuZXIoc2VsZi5zaGFwZUxpc3RlbmVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2goc2VsZi5kcmF3aW5nTW9kZSkge1xuICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6IHtcbiAgICAgICAgICAgIHNoYXBlID0gbmV3IGdtYXBzLkNpcmNsZSh7XG4gICAgICAgICAgICAgIGNlbnRlcjogZXZlbnQubGF0TG5nLFxuICAgICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5hY3RpdmVMYXllci5hZGRTaGFwZShzaGFwZSk7XG5cbiAgICAgICAgICAgIHNlbGYuc2hhcGVMaXN0ZW5lciA9IHNoYXBlLmFkZExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgdmFyIHJhZGl1cyA9IGdtYXBzLmdlb21ldHJ5LnNwaGVyaWNhbC5jb21wdXRlRGlzdGFuY2VCZXR3ZWVuKHNoYXBlLmdldENlbnRlcigpLCBldmVudC5sYXRMbmcsIHRydWUpO1xuICAgICAgICAgICAgICBzaGFwZS5zZXRSYWRpdXMocmFkaXVzICogNTAwMDAwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhc2UgJ2xpbmUnOiB7XG4gICAgICAgICAgICBzaGFwZSA9IG5ldyBnbWFwcy5DaXJjbGUoe1xuICAgICAgICAgICAgICBwYXRoOiBbZXZlbnQubGF0TG5nXSxcbiAgICAgICAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuOFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuYWN0aXZlTGF5ZXIuYWRkU2hhcGUoc2hhcGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tYXAuYWRkTGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKHNoYXBlKSB7XG4gICAgICAgIHZhciByYWRpdXMgPSBnbWFwcy5nZW9tZXRyeS5zcGhlcmljYWwuY29tcHV0ZURpc3RhbmNlQmV0d2VlbihzaGFwZS5nZXRDZW50ZXIoKSwgZXZlbnQubGF0TG5nLCB0cnVlKTtcblxuICAgICAgICBzaGFwZS5zZXRSYWRpdXMocmFkaXVzICogNTAwMDAwMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRHJhdztcbiIsImNsYXNzIExheWVyIHtcbiAgY29uc3RydWN0b3Iob3JkaW5hbCkge1xuICAgIHRoaXMuc2hhcGVzID0gW107XG4gICAgdGhpcy5vcmRpbmFsID0gb3JkaW5hbDtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuc2hhcGVzLmZvckVhY2goc2hhcGUgPT4ge1xuICAgICAgc2hhcGUuc2V0TWFwKG51bGwpO1xuICAgIH0pO1xuICAgIHRoaXMuc2hhcGVzID0gW107XG4gIH1cblxuICBhZGRTaGFwZShzaGFwZSkge1xuICAgIHNoYXBlLnpJbmRleCA9IHRoaXMub3JkaW5hbDtcbiAgICB0aGlzLnNoYXBlcy5wdXNoKHNoYXBlKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgdGhpcy5zaGFwZXMuZm9yRWFjaChzaGFwZSA9PiBzaGFwZS5zZXRWaXNpYmxlKGZhbHNlKSk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMuc2hhcGVzLmZvckVhY2goc2hhcGUgPT4gc2hhcGUuc2V0VmlzaWJsZSh0cnVlKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGF5ZXI7XG4iLCJ2YXIgY3NzID0gXCIuZHJhdy10b29sYm94IHtcXG4gIG1hcmdpbjogNXB4O1xcbiAgZGlyZWN0aW9uOiBsdHI7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGNvbG9yOiAjNTY1NjU2O1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bywgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xcbiAgZm9udC1zaXplOiAxMXB4O1xcbiAgLXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6IHBhZGRpbmctYm94O1xcbiAgYm9yZGVyLXdpZHRoOiAxcHggMXB4IDFweCAwcHg7XFxuICBib3JkZXItdG9wLXN0eWxlOiBzb2xpZDtcXG4gIGJvcmRlci1yaWdodC1zdHlsZTogc29saWQ7XFxuICBib3JkZXItYm90dG9tLXN0eWxlOiBzb2xpZDtcXG4gIGJvcmRlci10b3AtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xNDkwMik7XFxuICBib3JkZXItcmlnaHQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xNDkwMik7XFxuICBib3JkZXItYm90dG9tLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMTQ5MDIpO1xcbiAgLXdlYmtpdC1ib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuMjk4MDM5KSAwcHggMXB4IDRweCAtMXB4O1xcbiAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjI5ODAzOSkgMHB4IDFweCA0cHggLTFweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkY7XFxuICBiYWNrZ3JvdW5kLWNsaXA6IHBhZGRpbmctYm94O1xcbn1cXG4uZHJhdy10b29sYm94LmRyYXctdG9vbGJveC1ob3Jpem9udGFsIHVsLFxcbi5kcmF3LXRvb2xib3guZHJhdy10b29sYm94LWhvcml6b250YWwgbGksXFxuLmRyYXctdG9vbGJveC5kcmF3LXRvb2xib3gtaG9yaXpvbnRhbCAuY29sbGFwc2Uge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbn1cXG4uZHJhdy10b29sYm94IC5jb2xsYXBzZSB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBwYWRkaW5nOiA0cHg7XFxufVxcbi5kcmF3LXRvb2xib3ggdWwubGlzdCB7XFxuICBwYWRkaW5nOiAwO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4uZHJhdy10b29sYm94IHVsLmxpc3QuY29sbGFwc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbi5kcmF3LXRvb2xib3ggdWwubGlzdCA+IGxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuLmRyYXctdG9vbGJveCBhIHtcXG4gIHBhZGRpbmc6IDRweDtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cIjsocmVxdWlyZSgnbGVzc2lmeScpKShjc3MpOyBtb2R1bGUuZXhwb3J0cyA9IGNzczsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlciwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIiwgZXNjYXBlRXhwcmVzc2lvbj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIHNlbGY9dGhpcztcblxuZnVuY3Rpb24gcHJvZ3JhbTEoZGVwdGgwLGRhdGEpIHtcbiAgXG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGhlbHBlcjtcbiAgYnVmZmVyICs9IFwiXFxuICAgICAgPGxpPlxcbiAgICAgICAgPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcInRyaWdnZXItbW9kZVxcXCIgZGF0YS1tb2RlLWlkPVxcXCJcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaWQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuaWQpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuaWQpOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiPC9hPlxcbiAgICAgIDwvbGk+XFxuICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgYnVmZmVyICs9IFwiPGRpdiBpZD1cXFwiZ29vZ2xlLW1hcHMtZHJhdy1cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMubWlsbGlzKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLm1pbGxpcyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJkcmF3LXRvb2xib3ggZHJhdy10b29sYm94LVwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5vcmllbnRhdGlvbikgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5vcmllbnRhdGlvbik7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCJcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiY29sbGFwc2VcXFwiPkRyYXc8L2Rpdj5cXG5cXG4gIDx1bCBjbGFzcz1cXFwibGlzdCBjb2xsYXBzZWRcXFwiPlxcbiAgICBcIjtcbiAgc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5lbmFibGVkTW9kZXMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYubm9vcCxmbjpzZWxmLnByb2dyYW0oMSwgcHJvZ3JhbTEsIGRhdGEpLGRhdGE6ZGF0YX0pO1xuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXFxuICA8L3VsPlxcbjwvZGl2PlxcblwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypnbG9iYWxzIEhhbmRsZWJhcnM6IHRydWUgKi9cbnZhciBiYXNlID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9iYXNlXCIpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nXCIpW1wiZGVmYXVsdFwiXTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3V0aWxzXCIpO1xudmFyIHJ1bnRpbWUgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3J1bnRpbWVcIik7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxudmFyIGNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gU2FmZVN0cmluZztcbiAgaGIuRXhjZXB0aW9uID0gRXhjZXB0aW9uO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn07XG5cbnZhciBIYW5kbGViYXJzID0gY3JlYXRlKCk7XG5IYW5kbGViYXJzLmNyZWF0ZSA9IGNyZWF0ZTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBIYW5kbGViYXJzOyIsIlwidXNlIHN0cmljdFwiO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vZXhjZXB0aW9uXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIFZFUlNJT04gPSBcIjEuMy4wXCI7XG5leHBvcnRzLlZFUlNJT04gPSBWRVJTSU9OO3ZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5leHBvcnRzLlJFVklTSU9OX0NIQU5HRVMgPSBSRVZJU0lPTl9DSEFOR0VTO1xudmFyIGlzQXJyYXkgPSBVdGlscy5pc0FycmF5LFxuICAgIGlzRnVuY3Rpb24gPSBVdGlscy5pc0Z1bmN0aW9uLFxuICAgIHRvU3RyaW5nID0gVXRpbHMudG9TdHJpbmcsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG59XG5cbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O0hhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICAgIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgZGF0YS5sYXN0ICA9IChpID09PSAoY29udGV4dC5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGlmKGRhdGEpIHsgXG4gICAgICAgICAgICAgIGRhdGEua2V5ID0ga2V5OyBcbiAgICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICAgIGRhdGEuZmlyc3QgPSAoaSA9PT0gMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoaSA9PT0gMCl7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsKSB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNofSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICAgIGluc3RhbmNlLmxvZyhsZXZlbCwgY29udGV4dCk7XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDMsXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmZ1bmN0aW9uIGxvZyhsZXZlbCwgb2JqKSB7IGxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH1cblxuZXhwb3J0cy5sb2cgPSBsb2c7dmFyIGNyZWF0ZUZyYW1lID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBvYmogPSB7fTtcbiAgVXRpbHMuZXh0ZW5kKG9iaiwgb2JqZWN0KTtcbiAgcmV0dXJuIG9iajtcbn07XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxpbmU7XG4gIGlmIChub2RlICYmIG5vZGUuZmlyc3RMaW5lKSB7XG4gICAgbGluZSA9IG5vZGUuZmlyc3RMaW5lO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG5cbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIGlmIChsaW5lKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IG5vZGUuZmlyc3RDb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEV4Y2VwdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSByZXF1aXJlKFwiLi9iYXNlXCIpLkNPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSByZXF1aXJlKFwiLi9iYXNlXCIpLlJFVklTSU9OX0NIQU5HRVM7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uOy8vIFRPRE86IFJlbW92ZSB0aGlzIGxpbmUgYW5kIGJyZWFrIHVwIGNvbXBpbGVQYXJ0aWFsXG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIk5vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZVwiKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIHZhciBpbnZva2VQYXJ0aWFsV3JhcHBlciA9IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7IHJldHVybiByZXN1bHQ7IH1cblxuICAgIGlmIChlbnYuY29tcGlsZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB7IGRhdGE6IGRhdGEgIT09IHVuZGVmaW5lZCB9LCBlbnYpO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBwcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHByb2dyYW0oaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgKHBhcmFtICE9PSBjb21tb24pKSB7XG4gICAgICAgIHJldCA9IHt9O1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgcHJvZ3JhbVdpdGhEZXB0aDogZW52LlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5wYXJ0aWFsID8gb3B0aW9ucyA6IGVudixcbiAgICAgICAgaGVscGVycyxcbiAgICAgICAgcGFydGlhbHM7XG5cbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIHBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKFxuICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICBuYW1lc3BhY2UsIGNvbnRleHQsXG4gICAgICAgICAgaGVscGVycyxcbiAgICAgICAgICBwYXJ0aWFscyxcbiAgICAgICAgICBvcHRpb25zLmRhdGEpO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGVudi5WTS5jaGVja1JldmlzaW9uKGNvbnRhaW5lci5jb21waWxlckluZm8pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmV4cG9ydHMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtmdW5jdGlvbiBwcm9ncmFtV2l0aERlcHRoKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtV2l0aERlcHRoID0gcHJvZ3JhbVdpdGhEZXB0aDtmdW5jdGlvbiBwcm9ncmFtKGksIGZuLCBkYXRhKSB7XG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnRzLnByb2dyYW0gPSBwcm9ncmFtO2Z1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgdmFyIG9wdGlvbnMgPSB7IHBhcnRpYWw6IHRydWUsIGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO2Z1bmN0aW9uIG5vb3AoKSB7IHJldHVybiBcIlwiOyB9XG5cbmV4cG9ydHMubm9vcCA9IG5vb3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIlwiICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFNhZmVTdHJpbmc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKmpzaGludCAtVzAwNCAqL1xudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqLCB2YWx1ZSkge1xuICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkge1xuICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDt2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxudmFyIGlzRnVuY3Rpb247XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtcbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIFNhZmVTdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSBpZiAoIXN0cmluZyAmJiBzdHJpbmcgIT09IDApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuXG4gIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gIHN0cmluZyA9IFwiXCIgKyBzdHJpbmc7XG5cbiAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydHMuZXNjYXBlRXhwcmVzc2lvbiA9IGVzY2FwZUV4cHJlc3Npb247ZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGFuZGxlYmFycy9ydW50aW1lXCIpW1wiZGVmYXVsdFwiXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcywgY3VzdG9tRG9jdW1lbnQpIHtcbiAgdmFyIGRvYyA9IGN1c3RvbURvY3VtZW50IHx8IGRvY3VtZW50O1xuICBpZiAoZG9jLmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICB2YXIgc2hlZXQgPSBkb2MuY3JlYXRlU3R5bGVTaGVldCgpXG4gICAgc2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICByZXR1cm4gc2hlZXQub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIHN0eWxlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ5VXJsID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQodXJsKS5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgbGluay5ocmVmID0gdXJsO1xuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICByZXR1cm4gbGluaztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnY3NzaWZ5Jyk7XG4iXX0=
