export default class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  getAge() { return this.age; }
}


/* 

    class 를 export 하기 위해서는 위 형식으로 사용한다.
*/