/* global google */
import createMenu from './create-menu';


export default function (options) {
  if (!google) {
    throw new Error('This library depends on the Google Maps API');
  }

  var modes = {
    'pan': null,
    'line': google.maps.drawing.OverlayType.POLYLINE,
    'circle': google.maps.drawing.OverlayType.CIRCLE
  };

  var map = options.map;
  var position = options.position || google.maps.ControlPosition.LEFT_TOP;
  var $menu = createMenu({
    orientation: 'vertical',
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
  var layer = [];
  var shape, shapeListener, drawingMode;

  map.controls[position].push($menu);

  $menu.querySelector('.collapse').addEventListener('click', function (event) {
    var $list = $menu.querySelector('.list');
    $list.classList.toggle('collapsed');
  });

  Array.prototype.forEach.call($menu.querySelectorAll('.trigger-mode'), function (item) {
    item.addEventListener('click', function (event) {
      var id = item.dataset.modeId;

      if (id === 'clear') {
        layer.forEach(shape => shape.setMap(null));
        layer = [];
        id = 'pan';
      }

      drawingMode = id;
    });
  });

  map.addListener('click', function (event) {
    if (drawingMode && drawingMode !== 'pan') {
      if (shape) {
        shape = undefined;
        google.maps.event.removeListener(shapeListener);
        return;
      }

      switch(drawingMode) {
        case 'circle': {
          shape = new google.maps.Circle({
            center: event.latLng,
            editable: true,
            draggable: true,
            map: map,
            fillColor: 'black',
            follOpacity: 0.8
          });

          layer.push(shape);

          shapeListener = shape.addListener('mousemove', function (event) {
            var radius = google.maps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);
            shape.setRadius(radius * 5000000);
          });
        }
      }
    }
  });

  map.addListener('mousemove', function (event) {
    if (shape) {
      var radius = google.maps.geometry.spherical.computeDistanceBetween(shape.getCenter(), event.latLng, true);
      shape.setRadius(radius * 5000000);
    }
  });
}
