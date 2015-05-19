import gmaps from './gmaps';
import createInfowindow from './create-infowindow';

class Shape extends gmaps.MVCObject {
  constructor(options) {
    this.listeners = [];

    this.infoWindow = new gmaps.InfoWindow({
      content: createInfowindow({
        actions: [
          {
            id: 'scale',
            name: 'Scale'
          }, {
            id: 'move',
            name: 'Move'
          }, {
            id: 'delete',
            name: 'Delete'
          }
        ]
      })
    });
  }

  finish() {
    this.listeners.forEach(listener => gmaps.event.removeListener(listener));
  }
}

export default Shape;
