/*

아래의 요구사항을 충족하는 자바스크립트 모듈을 작성해보세요.
- "math.js"라는 이름의 파일을 생성하세요.
- 이 파일 안에, 두 숫자를 입력받아 더하는 함수 add를 정의하고,
이 함수를 외부에서 사용할 수 있도록 내보내세요 (export).
- "app.js"라는 파일에서 "math.js" 모듈의 add 함수를 가져와(import) 사용하여,
숫자 2와 3을 더한 결과를 콘솔에 출력하세요.

*/

export default {
    add(num1, num2) {
        return num1 + num2;
    }
};

export function add1(num1, num2) {
        return num1 + num2;
    }

export const add2 = function(num1, num2) {
    return num1, num2;
}

export const add3 = (num1, num2) => num1 + num2;



/*

    각각의 함수를 내보낼 때는 함수 선언 방식에 관계 없다.

    하나로 묶어서 내보내는 경우에는 함수 선언문에서 function 을 제외한 형태로 작성한다.
    - 화살표 함수, 함수 표현식 불가능

*/