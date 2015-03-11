/* global google */
import createMenu from './create-menu';
import Layer from  './layer';

var gmaps = window.google && window.google.maps;

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
              fillColor: 'black',
              fillOpacity: 0.8
            });

            self.activeLayer.addShape(shape);

            self.shapeListener = shape.addListener('mousemove', function (event) {
              var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);
              shape.setRadius(radius * 5000000);
            });
            break;
          }

          case 'line': {
            shape = new gmaps.Circle({
              path: [event.latLng],
              editable: true,
              draggable: true,
              map: map,
              fillColor: 'black',
              fillOpacity: 0.8
            });

            self.activeLayer.addShape(shape);
            break;
          }
        }
      }

      return true;
    });

    this.map.addListener('mousemove', function (event) {
      if (shape) {
        var radius = gmaps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);

        shape.setRadius(radius * 5000000);
      }
    });
  }
}

export default Draw;
