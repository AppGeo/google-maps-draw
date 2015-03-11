import css from './styles/lib.less';
import template from './templates/menu.hbs';

export default function (options) {
  var element = document.createElement('div');

  element.innerHTML = template({
    orientation: options.orientation,
    enabledModes: options.modes,
    millis: Date.now()
  });

  return element.firstChild;
}
