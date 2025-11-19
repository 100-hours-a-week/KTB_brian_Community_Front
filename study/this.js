const obj = {
    name : 'Kim',
    greet() {
        setTimeout( function() {
            console.log(`hi ${this.name}`);
        }
        , 1000);
    }
};

obj.greet();