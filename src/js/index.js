'use strict'

class PGroup {
  constructor(members) {
    this.members = members;
  }

  add(value) {
    if (this.has(value)) return this;
    return new PGroup(this.members.concat([value]));
  }

  delete(value) {    
    if (!this.has(value)) return this;
    return new PGroup(this.members.filter(m => m!== value));
  }

  has(value) {
    return this.members.includes(value);
  }

  toString() {
    return this.members.length ? this.members.toString() : 'Empty group';
  }
}
PGroup.empty = new PGroup([]);

let empty = PGroup.empty;
empty = empty.add(5);
let second = empty.add(5);
second.delete(5);
console.log(empty.toString());
console.log(second.toString());

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false