async function foo() {
    console.log("A");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("B");
    return 10;
}

const p1 = foo();
p1.then(
    res => console.log(res),
)

