import template from './templates/infowindow.hbs';

export default function (options) {
  var element = document.createElement('div');

  element.innerHTML = template(options);

  return element.firstChild;
}
