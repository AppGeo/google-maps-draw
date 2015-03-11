import gmaps from './gmaps';
import createInfowindow from './ceeate-infowindow';

class Shape extends gmaps.MVCObject {
  constructor(options) {
    this.listeners = [];
    this.infoWindow = new gmaps.InfoWindow({
      content: createInfowindow()
    });
  }

  finish() {
    this.listeners.forEach(listener => gmaps.event.removeListener(listener));
  }
}

export default Shape;
