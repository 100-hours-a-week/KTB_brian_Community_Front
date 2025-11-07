class Pet{
    constructor(name, type){
        this.name = name;
        this.type = type;
    }

    getName(){
        return this.name;
    }

    getType(){
        return this.type;
    }
}

const myPet = new Pet("Momo", "Cat");

console.log("애완동물의 이름 : " + myPet.getName() + ", 종류 : " + myPet.getType());

class Person{

    constructor(name, age){
        this.name = name;
        this.age= age;
    }

    greet(){
        console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`)
    }
}

const newPerson = new Person("Jane Doe", 25);
newPerson.greet();