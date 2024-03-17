function Classes(bases) {
  class Bases {
    constructor(...args) {
      bases.forEach(base => Object.assign(this, new base(...args)));
    }
  }
  bases.forEach(base => {
    Object.getOwnPropertyNames(base.prototype)
      .filter(prop => prop !== 'constructor')
      .forEach(prop => (Bases.prototype[prop] = base.prototype[prop]));
  });
  return Bases;
}