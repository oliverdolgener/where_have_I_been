export default class Speed {
  constructor(bufferSize) {
    this.bufferSize = bufferSize;
    this.buffer = [];
  }

  getAverage() {
    if (this.buffer.length < 1) {
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i];
    }
    return Math.round(sum / this.buffer.length);
  }

  addToBuffer(speed) {
    this.buffer.unshift(speed);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.pop();
    }
  }
}
