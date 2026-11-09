// =========================================================
// JavaScript 1일차 과제: 웹 브라우저 콘솔에서 쓰는 사칙연산 계산기
//
// 사용법 (개발자 도구 > Console 탭에 입력)
//   calc("1 + 2 * 3")    → 7 을 출력
//   start()              → 입력창(prompt)으로 계산식을 계속 받아 계산, 취소하면 종료
//
// 과제 조건
//   1) 사칙연산(+ - * /) 계산
//   2) 길이가 긴 계산식도 계산
//   3) 곱셈·나눗셈을 덧셈·뺄셈보다 먼저 계산 (연산자 우선순위)
//
// 계산 순서 한눈에 보기
//   "10 - 4 / 2"  --(1) 조각내기-->  [10, "-", 4, "/", 2]
//                 --(2) 검사하기-->  숫자와 연산자가 번갈아 나오는지 확인
//                 --(3) 계산하기-->  곱셈·나눗셈은 바로 계산, 덧셈·뺄셈은 모아 두었다가 마지막에 더함
// =========================================================


// ---------- (1) 조각내기: 계산식 문자열을 숫자와 연산자로 나누기 ----------
// 예) "12+3 * -4"  →  [12, "+", 3, "*", -4]
function tokenize(expression) {
    const tokens = [];                     // 잘라낸 조각(토큰)을 담을 배열
    let i = 0;                             // 지금 읽고 있는 글자의 위치(인덱스)

    while (i < expression.length) {        // 문자열 끝까지 한 글자씩 읽기
        const char = expression[i];        // 현재 글자

        if (char === " ") {                // 공백이면
            i++;                           // 무시하고 다음 글자로
            continue;
        }

        const prev = tokens[tokens.length - 1];                         // 바로 앞 조각
        const isNegativeSign =
            char === "-" && (tokens.length === 0 || typeof prev === "string");
        // '-'가 맨 앞이거나 연산자 바로 뒤에 오면 빼기가 아니라 '음수 기호'로 본다. 예) "-3 + 1", "2 * -5"

        if (isDigit(char) || char === "." || isNegativeSign) {         // 숫자가 시작되는 경우
            let numberText = char;                                      // 숫자 글자를 모을 변수
            i++;
            while (i < expression.length && (isDigit(expression[i]) || expression[i] === ".")) {
                numberText += expression[i];                            // 숫자나 소수점이 이어지는 동안 계속 붙임
                i++;
            }
            const value = Number(numberText);                           // 문자열 "3.5" → 숫자 3.5
            if (Number.isNaN(value)) {                                  // "1.2.3", "-" 처럼 숫자가 아니면
                throw new Error(`'${numberText}'은(는) 올바른 숫자가 아닙니다.`);
            }
            tokens.push(value);                                         // 숫자 조각 추가
            continue;
        }

        if ("+-*/".includes(char)) {        // 사칙연산 기호이면
            tokens.push(char);              // 연산자 조각(문자열) 추가
            i++;
            continue;
        }

        // 여기까지 왔다면 숫자도 연산자도 아닌 글자
        throw new Error(`'${char}'은(는) 쓸 수 없는 문자입니다. 숫자와 + - * / 만 입력하세요.`);
    }

    return tokens;
}

// 글자가 0~9 숫자인지 확인하는 작은 도우미 함수
function isDigit(char) {
    return char >= "0" && char <= "9";      // 문자열도 크기 비교가 가능 (문자 코드 순서)
}


// ---------- (2) 검사하기: 숫자 - 연산자 - 숫자 ... 순서가 맞는지 ----------
function validate(tokens) {
    if (tokens.length === 0) {
        throw new Error("계산식이 비어 있습니다.");
    }

    tokens.forEach((token, index) => {
        const shouldBeNumber = index % 2 === 0;     // 짝수 자리(0, 2, 4...)는 숫자, 홀수 자리는 연산자여야 함
        if (shouldBeNumber && typeof token !== "number") {
            throw new Error("연산자가 연달아 나왔거나, 숫자가 와야 할 자리에 연산자가 있습니다.");
        }
        if (!shouldBeNumber && typeof token !== "string") {
            throw new Error("숫자와 숫자 사이에는 연산자가 필요합니다.");
        }
    });

    if (typeof tokens[tokens.length - 1] !== "number") {   // 마지막 조각은 반드시 숫자
        throw new Error("계산식이 연산자로 끝났습니다.");
    }
}


// ---------- (3) 계산하기: 곱셈·나눗셈 먼저, 덧셈·뺄셈은 나중에 ----------
// 아이디어: '나중에 더할 값'을 모아 두는 상자(stack 배열)를 쓴다.
//   * , / 를 만나면 → 상자의 마지막 값을 꺼내 바로 계산하고 다시 넣는다. (먼저 계산)
//   +     를 만나면 → 다음 숫자를 그대로 상자에 넣는다.
//   -     를 만나면 → 다음 숫자를 음수로 바꿔 상자에 넣는다. (빼기 = 음수를 더하기)
//   끝나면 상자 안의 값을 모두 더한다.
// 예) 10 - 4 / 2 * 3 + 1
//   [10] → [10, -4] → [10, -2] → [10, -6] → [10, -6, 1] → 합계 5
function evaluate(tokens) {
    const stack = [tokens[0]];                     // 첫 번째 숫자를 넣고 시작

    for (let i = 1; i < tokens.length; i += 2) {   // 연산자 자리(1, 3, 5...)만 차례로 보기
        const operator = tokens[i];                // 연산자
        const number = tokens[i + 1];              // 연산자 오른쪽 숫자

        if (operator === "*") {
            stack.push(stack.pop() * number);      // 마지막 값을 꺼내 곱한 뒤 다시 넣기
        } else if (operator === "/") {
            if (number === 0) {
                throw new Error("0으로 나눌 수 없습니다.");
            }
            stack.push(stack.pop() / number);      // 마지막 값을 꺼내 나눈 뒤 다시 넣기
        } else if (operator === "+") {
            stack.push(number);                    // 나중에 더하려고 그대로 보관
        } else if (operator === "-") {
            stack.push(-number);                   // 음수로 바꿔 보관
        }
    }

    // reduce: 배열의 값을 하나로 합치는 함수. sum에 value를 차례로 더함 (시작값 0)
    return stack.reduce((sum, value) => sum + value, 0);
}


// ---------- 위 세 단계를 묶은 함수: 계산식(문자열) → 결과(숫자) ----------
function calculate(expression) {
    if (typeof expression !== "string") {
        throw new Error('계산식은 따옴표로 감싼 문자열로 입력하세요. 예) calc("1 + 2")');
    }

    const tokens = tokenize(expression);   // (1) 조각내기
    validate(tokens);                      // (2) 검사하기
    const result = evaluate(tokens);       // (3) 계산하기

    if (!Number.isFinite(result)) {        // 너무 큰 수가 되어 Infinity가 나온 경우
        throw new Error("결과가 너무 커서 표시할 수 없습니다.");
    }

    // 컴퓨터는 소수를 2진수로 저장해서 0.1 + 0.2 = 0.30000000000000004 같은 오차가 생긴다.
    // 유효숫자 15자리에서 반올림하면 이런 자잘한 오차가 사라진다. (0.30000000000000004 → 0.3)
    return Number.parseFloat(result.toPrecision(15));
}


// ---------- 콘솔용 함수 1: calc("식") ----------
function calc(expression) {
    try {
        const result = calculate(expression);           // 계산 시도
        console.log(`${expression} = ${result}`);       // 성공하면 "식 = 결과" 출력
        return result;                                  // 결과를 돌려줘서 다른 계산에도 쓸 수 있게
    } catch (error) {
        console.error(`계산할 수 없습니다: ${error.message}`);   // 실패하면 이유를 빨간 글씨로 출력
        return null;
    }
}


// ---------- 콘솔용 함수 2: start() → 입력창으로 반복 계산 ----------
function start() {
    console.log("계산기를 시작합니다. 입력창에서 '취소'를 누르거나 빈 칸으로 확인하면 끝납니다.");

    while (true) {                                      // 사용자가 그만둘 때까지 반복
        const input = prompt("계산식을 입력하세요. (예: 3 + 4 * 2 - 10 / 5)");
        if (input === null || input.trim() === "") {    // 취소를 누르면 null, 빈 칸이면 ""
            console.log("계산기를 종료합니다.");
            break;                                      // 반복문 빠져나가기
        }
        calc(input);                                    // 입력한 식을 계산해서 출력
    }
}


// ---------- 페이지가 열리면 콘솔에 사용법 안내 ----------
if (typeof window !== "undefined") {                    // 브라우저에서 실행될 때만 (Node.js에는 window가 없음)
    console.log("사칙연산 계산기가 준비되었습니다.");
    console.log('사용법: calc("1 + 2 * 3")  또는  start()');
}


// ---------- (참고) Node.js로 테스트할 때만 쓰는 코드 ----------
// 브라우저에는 module이 없어서 이 부분은 그냥 건너뛴다.
if (typeof module !== "undefined") {
    module.exports = { tokenize, validate, evaluate, calculate, calc };
}
