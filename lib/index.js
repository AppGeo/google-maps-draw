/* global google */

export default function (options) {
  if (!google) {
    throw new Error('This library depends on the Google Maps API');
  }

  var manager = new google.maps.drawing.DrawingManager({
    map: map
  });
}
