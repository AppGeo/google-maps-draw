import gmaps from './gmaps';

class Shape extends gmaps.MVCObject {
  constructor(options) {
    this.listeners = [];
  }

  finish() {
    this.listeners.forEach(listener => gmaps.event.removeListener(listener));
  }
}

export default Shape;
