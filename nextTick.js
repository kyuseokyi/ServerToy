function func(callback) {
    //1 nextTick을 사용해 인자 값으로 전달된 callback 함수 호출
    process.nextTick(callback, "callback!!");
}

try {                           // 2 예외 처리를 위해 try-catch 문 선언
    func((param) => {
        a.a = 0;                // 3 의도적으로 예외 발생
    });
} catch (e) {
    console.log("exception!!"); // 4 같은 스레드일 경우 호출ㅜㅐㅇㄷ
}