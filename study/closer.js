function throttling(callback, delay) {
    let timerId; // 클로저를 통해서 기억될 상태

    // 디바운스가 적용된 새로운 함수를 반환한다.
    return function(...args) {
        // 이함수는 외부의 timerId를 기억하고 있다.
        if (timerId === undefined) {
            // delay 이후에 callback 함수를 실행하도록 새로운 타이머를 설정한다.
            timerId = setTimeout(() => {
                callback(...args);
                clearTimeout(timerId); // 이전에 설정된 타이머 있다면 취소하는 함수
            }, delay);
        }
    };

}


// 사용 예시
const searchAPI = (keword) => console.log('`${keword}`로 API 검색 요청 ');
const throttlingSearch = throttling(serarchAPI, 500); // searchAPI를 500ms로 debounce

inputElement.addEventListner('input', (e) => throttlingSearch(e.target.value));
