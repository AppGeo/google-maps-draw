google.maps.visualRefresh = true;

var options = {
  zoom: 10,
  center: new google.maps.LatLng(49.4966, -66.7968)
};

var draw = window.googleMapsDraw;
var $container = document.querySelector('#map');
var map = new google.maps.Map($container, options);

draw({
  map: map
});
