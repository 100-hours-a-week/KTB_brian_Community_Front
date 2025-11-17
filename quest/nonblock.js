const myFirstPromise = new Promise((resolve, reject) => {
    resolve("Hello, Promise!")
});

// 아래 코드는 수정하지 마세요.
myFirstPromise.then(message => {
    console.log(message);
});