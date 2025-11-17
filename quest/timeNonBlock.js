async function waitForMessage(){
    return new Promise(resolve=>{
        setTimeout(resolve("Hello, Async/Await!"), 1000);
    })
}

async function init(){
    let msg = await waitForMessage();
    console.log(msg);
}

init();