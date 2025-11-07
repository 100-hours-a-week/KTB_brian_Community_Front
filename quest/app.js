/*

- "math.js"라는 이름의 파일을 생성하세요.
- 이 파일 안에, 두 숫자를 입력받아 더하는 함수 add를 정의하고,
이 함수를 외부에서 사용할 수 있도록 내보내세요 (export).
- "app.js"라는 파일에서 "math.js" 모듈의 add 함수를 가져와(import) 사용하여,
숫자 2와 3을 더한 결과를 콘솔에 출력하세요.

*/


import math from './math.js';

console.log(math.add(2,3));

/*
 
- "operations.js" 모듈 파일을 만들고, 여기에 두 숫자를 더하는 add 함수와 두 숫자를 빼는 subtract 함수를 정의한 후, Named Export를 사용하여 이 두 함수를 내보내세요.
- "userProfile.js" 모듈 파일에서, 사용자의 이름(name)과 나이(age)를 속성으로 갖는 User 클래스를 정의하고, 이 클래스를 Default Export로 내보내세요.
- "app.js" 파일에서 "operations.js" 모듈의 add와 subtract 함수를 가져와서 사용하고, "userProfile.js"에서 User 클래스를 가져와 사용하는 예제 코드를 작성하세요.

*/

import User from './userProfile.js';
import {add, subtract} from './operations.js';

const user1 = new User("사용자1", 25);
const user2 = new User("사용자2", 25);

console.log(`두 유저 나이의 합은 : ${add( user1.getAge(), user2.getAge() )}`);