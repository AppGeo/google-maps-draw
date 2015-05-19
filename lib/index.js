import createMenu from './create-menu';
import Layer from  './layer';
import gmaps from './gmaps';

class Draw {
  constructor(options) {
    if (!gmaps) {
      throw new Error('This library depends on the Google Maps API');
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

  addLayer() {
    this.layers.push(new Layer());
  }

  toggleToolbox() {
    var $list = this.$el.querySelector('.list');
    $list.classList.toggle('collapsed');
  }

  render() {
    this.$el = createMenu({
      orientation: this.options.orientation || 'horizontal',
      modes: [
        {
          id: 'pan'
        }, {
          id: 'line'
        }, {
          id: 'circle'
        }, {
          id: 'clear'
        }
      ]
    });

    this.initDomEvents();

    if (this.map) {
      this.map.controls[this.position].push(this.$el);
      this.initMapEvents();
    }
  }

  initDomEvents() {
    this.$el.querySelector('.collapse')
      .addEventListener('click', event => this.toggleToolbox());

    Array.prototype.forEach.call(this.$el.querySelectorAll('.trigger-mode'), item => {
      item.addEventListener('click', event => {
        var id = item.dataset.modeId;

        if (id === 'clear') {
          this.activeLayer.clear();
          id = 'pan';
        }

        this.drawingMode = id;
      });
    });
  }

  initMapEvents() {
    var self = this;
    var shape = this.shape;
    var map = this.map;

    this.map.addListener('click', function (event) {
      if (self.drawingMode && self.drawingMode !== 'pan') {
        if (shape) {
          shape = undefined;
          gmaps.event.removeListener(self.shapeListener);
          return;
        }

        switch(self.drawingMode) {
          case 'circle': {
            shape = new gmaps.Circle({
              center: event.latLng,
              editable: true,
              draggable: true,
              map: map,
              strokeColor: 'black',
              strokeOpacity: 0.8,
              strokeWeight: 1
            });

            self.activeLayer.addShape(shape);

            self.shapeListener = shape.addListener('mousemove', function (event) {
              var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);
              shape.setRadius(radius * 5000000);
            });
            break;
          }

          case 'line': {
            shape = new gmaps.Polyline({
              path: [event.latLng],
              editable: true,
              draggable: true,
              map: map,
              fillColor: 'black',
              fillOpacity: 0.8
            });

            self.activeLayer.addShape(shape);

            self.shapeListener = shape.addListener('click', function (event) {
              if (!self.timer) {
                self.timer = setTimeout(function () {
                  self.dblClick = false;
                  var paths = shape.getPath();
                  paths.push(event.latLng);
                  shape.setPath(paths);
                }, 300);
              }

              if (self.dblClick) {
                self.drawingMode = null;
                if (self.timer) {
                  clearTimeout(self.timer);
                  self.timer = undefined;
                  self.dblClick = false;
                }
              }
              else {
                self.dblClick = true;
              }
            });
            break;
          }
        }
      }

      return true;
    });

    this.map.addListener('mousemove', function (event) {
      if (shape && self.drawingMode) {
        switch(self.drawingMode) {
          case 'circle': {
            var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);

            shape.setRadius(radius * 5000000);
            break;
          }

          case 'line': {
            var paths = shape.getPath();

            if (paths.length === 1) {
              paths.push(event.latLng);
            }
            else if (paths.length > 1) {
              paths.setAt(paths.length - 1, event.latLng);
            }
            //shape.setPath(paths);
            break;
          }
        }
      }
    });
  }
}

export default Draw;
