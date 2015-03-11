import template from './templates/infowindow.hbs';

export default function (options) {
  var element = document.createElement('div');

  element.className = 'google-maps-draw shape-infowindow';
  element.innerHTML = template(options);

  return element.firstChild;
}
