// =========================================================
// JavaScript 2일차 과제: querySelector + addEventListener로 만드는 계산기
//
// 흐름: 버튼 클릭/키보드 입력 → 이벤트 리스너 → 상태(tokens) 변경 → render()로 화면 갱신
// 계산 로직(우선순위 처리)은 1일차 콘솔 계산기와 같은 방법을 다시 사용합니다.
// =========================================================


// ---------- 1. 화면 요소 가져오기 (querySelector / querySelectorAll) ----------
const calculator = document.querySelector(".calculator");            // 계산기 전체 (전원 꺼짐 표시용)
const display = document.querySelector("#display");                  // 입력 중인 식·결과가 보이는 칸
const historyLine = document.querySelector("#history");              // 직전 계산식 줄
const numberButtons = document.querySelectorAll(".number");          // 숫자·소수점 버튼 전부 (NodeList)
const operatorButtons = document.querySelectorAll(".operator");      // + − × ÷ 버튼 전부
const clearButton = document.querySelector(".clear");                // C 버튼
const enterButton = document.querySelector(".enter");                // Enter 버튼
const powerButton = document.querySelector(".on-off");               // ON/OFF 버튼
const allButtons = document.querySelectorAll(".buttons button");     // 모든 버튼 (전원 끌 때 비활성화용)


// ---------- 2. 계산기가 기억해야 할 값(상태) ----------
let tokens = [];            // 입력한 식을 조각으로 보관. 예) ["12", "+", "3.5"]
let isPowerOn = true;       // 전원이 켜져 있는지
let justCalculated = false; // 방금 Enter로 계산을 끝낸 상태인지

// 화면용 기호 ↔ 계산용 기호 바꾸기 표
const SYMBOL_TO_OPERATOR = { "×": "*", "÷": "/", "−": "-" };   // 버튼 글자 → 계산 기호
const OPERATOR_TO_SYMBOL = { "*": "×", "/": "÷", "-": "−", "+": "+" };   // 계산 기호 → 화면 기호


// ---------- 3. 작은 도우미 함수들 ----------
function isOperator(token) {
    return ["+", "-", "*", "/"].includes(token);    // 연산자인지 확인
}

// 버튼이 뜻하는 값 읽기: data-value가 있으면 그 값, 없으면 버튼 글자
function getButtonValue(button) {
    const raw = button.dataset.value ?? button.textContent.trim();   // ?? : 왼쪽 값이 없으면(undefined) 오른쪽 값 사용
    return SYMBOL_TO_OPERATOR[raw] ?? raw;                          // "×" 같은 글자는 "*"로 바꿈
}

// tokens 배열을 화면용 문자열로: ["12", "*", "3"] → "12 × 3"
function formatExpression(list) {
    return list.map((token) => (isOperator(token) ? ` ${OPERATOR_TO_SYMBOL[token]} ` : token)).join("");
}


// ---------- 4. 화면 그리기 ----------
function render() {
    display.value = formatExpression(tokens) || "0";   // 비어 있으면 0 표시
    display.scrollLeft = display.scrollWidth;          // 식이 길면 끝부분(최근 입력)이 보이도록 스크롤
}


// ---------- 5. 버튼 동작 ----------
// 숫자·소수점 입력
function inputNumber(value) {
    if (!isPowerOn) return;                             // 전원이 꺼져 있으면 무시

    if (justCalculated) {                               // 계산 직후 숫자를 누르면
        tokens = [];                                    // 새 계산을 시작
        historyLine.textContent = "";
        justCalculated = false;
    }

    const last = tokens[tokens.length - 1];             // 마지막 조각

    if (last === undefined || isOperator(last)) {       // 비어 있거나 연산자 다음이면 → 새 숫자 시작
        tokens.push(value === "." ? "0." : value);      // "."부터 누르면 "0."으로 시작
    } else if (value === ".") {
        if (!last.includes(".")) {                      // 소수점은 숫자 하나에 한 번만
            tokens[tokens.length - 1] = last + ".";
        }
    } else if (last === "0") {
        tokens[tokens.length - 1] = value;              // "0" 다음에 숫자를 누르면 0을 바꿔치기 (07 방지)
    } else {
        tokens[tokens.length - 1] = last + value;       // 숫자 이어 붙이기: "12" + "3" → "123"
    }
    render();
}

// 연산자 입력
function inputOperator(operator) {
    if (!isPowerOn) return;
    justCalculated = false;                             // 계산 직후라면 결과값에 이어서 계산

    if (tokens.length === 0) {
        tokens.push("0");                               // 아무것도 없을 때 연산자를 누르면 0부터 시작
    }

    const last = tokens[tokens.length - 1];
    if (isOperator(last)) {
        tokens[tokens.length - 1] = operator;           // 연산자를 연달아 누르면 마지막 것으로 교체
    } else {
        if (last.endsWith(".")) {
            tokens[tokens.length - 1] = last.slice(0, -1);   // "3." 처럼 소수점으로 끝나면 점을 지움
        }
        tokens.push(operator);
    }
    render();
}

// Enter: 계산하기
function calculateResult() {
    if (!isPowerOn || tokens.length === 0) return;

    if (isOperator(tokens[tokens.length - 1])) {
        tokens.pop();                                   // "3 +" 처럼 연산자로 끝나면 마지막 연산자는 무시
    }

    try {
        const result = calculate(tokens.join(""));      // ["12", "+", "3"] → "12+3" → 계산
        historyLine.textContent = `${formatExpression(tokens)} =`;
        // 아주 크거나 작은 결과(예: 1e+21)는 이어서 계산하기 어려우므로 화면에만 보여 주고 새로 시작
        tokens = String(result).includes("e") ? [] : [String(result)];
        display.value = String(result);
        justCalculated = true;
    } catch (error) {
        historyLine.textContent = formatExpression(tokens);
        display.value = error.message === "0으로 나눌 수 없습니다." ? "0으로 나눌 수 없음" : "식 오류";
        tokens = [];                                    // 오류가 나면 처음부터 다시
        justCalculated = true;
    }
}

// C: 모두 지우기
function clearAll() {
    if (!isPowerOn) return;
    tokens = [];
    justCalculated = false;
    historyLine.textContent = "";
    render();
}

// Backspace: 마지막 글자 하나 지우기 (키보드 전용)
function deleteLast() {
    if (!isPowerOn || justCalculated) return;           // 결과 화면에서는 지우지 않음
    const last = tokens[tokens.length - 1];
    if (last === undefined) return;
    if (isOperator(last) || last.length === 1) {
        tokens.pop();                                   // 연산자이거나 한 글자짜리 숫자면 조각째 삭제
    } else {
        tokens[tokens.length - 1] = last.slice(0, -1);  // 숫자의 마지막 글자만 삭제
    }
    render();
}

// ON/OFF: 전원 켜고 끄기
function togglePower() {
    isPowerOn = !isPowerOn;                                     // true ↔ false 뒤집기
    calculator.classList.toggle("is-off", !isPowerOn);          // 꺼지면 is-off 클래스 추가 → CSS가 화면을 어둡게
    powerButton.setAttribute("aria-pressed", String(isPowerOn));

    allButtons.forEach((button) => {
        if (button !== powerButton) {
            button.disabled = !isPowerOn;                       // 전원 버튼을 뺀 나머지 버튼 비활성화/활성화
        }
    });

    tokens = [];
    justCalculated = false;
    historyLine.textContent = "";
    display.value = isPowerOn ? "0" : "";                       // 꺼지면 화면을 비움
}


// ---------- 6. 이벤트 리스너 연결 (addEventListener) ----------
// forEach로 같은 종류의 버튼 여러 개에 같은 동작을 한 번에 연결
numberButtons.forEach((button) => {
    button.addEventListener("click", () => inputNumber(getButtonValue(button)));
});

operatorButtons.forEach((button) => {
    button.addEventListener("click", () => inputOperator(getButtonValue(button)));
});

clearButton.addEventListener("click", clearAll);
enterButton.addEventListener("click", calculateResult);
powerButton.addEventListener("click", togglePower);

// 키보드 입력: 문서 전체에서 키를 누르면(keydown) 실행
document.addEventListener("keydown", (event) => {
    const key = event.key;                              // 누른 키 이름. 예) "7", "+", "Enter"

    if (/^[0-9]$/.test(key) || key === ".") {           // 숫자 0~9 또는 소수점
        inputNumber(key);
    } else if (isOperator(key)) {
        event.preventDefault();                         // "/"는 일부 브라우저의 빠른 찾기 단축키라서 기본 동작을 막음
        inputOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();                         // 포커스된 버튼이 Enter로 한 번 더 눌리는 것을 막음
        calculateResult();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearAll();
    }
});


// ---------- 7. 계산 로직 (1일차 콘솔 계산기와 같은 방법) ----------
// 계산식 문자열 → 결과 숫자. 곱셈·나눗셈을 먼저 계산한다.
function calculate(expression) {
    const parts = expression.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g) ?? [];   // 숫자와 연산자로 쪼개기
    // 정규식 설명: 숫자(소수 포함) 또는 + - * / 한 글자를 차례로 찾아 배열로 만듦. 예) "12+3*4" → ["12","+","3","*","4"]

    // 맨 앞의 "-"는 음수 기호로 합치기: ["-", "5", "+", "2"] → ["-5", "+", "2"]
    if (parts[0] === "-" && parts.length > 1) {
        parts.splice(0, 2, "-" + parts[1]);
    }

    const stack = [Number(parts[0])];              // 나중에 더할 값을 모아 두는 상자
    for (let i = 1; i < parts.length; i += 2) {
        const operator = parts[i];
        const number = Number(parts[i + 1]);
        if (Number.isNaN(number)) {
            throw new Error("식 오류");
        }
        if (operator === "*") {
            stack.push(stack.pop() * number);      // 곱셈은 바로 계산
        } else if (operator === "/") {
            if (number === 0) throw new Error("0으로 나눌 수 없습니다.");
            stack.push(stack.pop() / number);      // 나눗셈도 바로 계산
        } else if (operator === "+") {
            stack.push(number);                    // 덧셈은 보관
        } else {
            stack.push(-number);                   // 뺄셈은 음수로 보관
        }
    }

    const result = stack.reduce((sum, value) => sum + value, 0);   // 보관한 값을 모두 더하기
    if (!Number.isFinite(result)) throw new Error("식 오류");
    return Number.parseFloat(result.toPrecision(15));               // 0.1 + 0.2 같은 소수 오차 정리
}
