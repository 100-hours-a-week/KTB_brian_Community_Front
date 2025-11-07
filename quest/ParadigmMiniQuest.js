
const list = [1,2,3,4,5];

console.log(list.toString())

const sumAll = function(){
    return list.reduce((acc, num)=> acc + num, 0);
}

console.log(`sumAll : ${sumAll()}`)

const multiply2 = function(){
    return list.map((num) => 2*num);
}

console.log(multiply2(list).toString());

/* 

화살표 함수를 사용하여 두 숫자의 합을 반환하는 add 함수를 정의하고,
이 함수를 사용하여 2와 3의 합을 구한 뒤, 그 결과를 sum 변수에 저장하고 출력해보세요!

*/

const add = (num1, num2) => num1 + num2;
const sum = add(2,3);
console.log(sum);

/*

화살표 함수를 사용하여 주어진 배열 내의 모든 숫자를 더하는 sumArray 함수를 정의하세요.
그리고 이 함수를 사용하여 [1, 2, 3, 4, 5] 배열의 숫자를 모두 더한 결과를 total 변수에 저장하세요.
- sumArray 함수는 숫자 배열을 매개변수로 받습니다.
- sumArray 함수 내에서는 반복문을 사용해 배열의 모든 요소를 더해야 합니다.

*/

const sumArray1 = (list) => {
    let sum = 0;
    for(let i = 0 ; i < list.length; i ++ ){
        sum += list[i];
    }
    return sum;
}

const sumArray2 = (list) => {
    let sum = 0;
    for(const num of list){
        sum += num;
    }
    return sum;
}

const total = sumArray2(list);
console.log(total);