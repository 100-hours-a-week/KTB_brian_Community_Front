async function fetchNumber() {
    console.log("fetchNumber 시작")
    setTimeout(()=>{resolve(1)},1000);
    const result = await 
}

async function printNumbers() {
    console.log("1번")
    const num1 = await fetchNumber(); // 1초 대기 후 10 반환
    console.log("1번")
    const num2 = await fetchNumber(); // 추가 1초 대기 후 10 반환
    const total = num1 + num2;

    console.log(`합계: ${total}`); // 합계: 20
}

printNumbers();