class Layer {
  constructor(ordinal) {
    this.shapes = [];
    this.ordinal = ordinal;
  }

  clear() {
    this.shapes.forEach(shape => {
      shape.setMap(null);
    });
    this.shapes = [];
  }

  addShape(shape) {
    shape.zIndex = this.ordinal;
    this.shapes.push(shape);
  }

  hide() {
    this.shapes.forEach(shape => shape.setVisible(false));
  }

  show() {
    this.shapes.forEach(shape => shape.setVisible(true));
  }
}

export default Layer;
