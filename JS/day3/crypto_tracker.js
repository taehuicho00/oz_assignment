// =========================================================
// JavaScript 3일차 과제: 암호화폐 가격 변동 추적기
//
// 최소 구현 기능
//   1) 바이낸스 API에 1초마다 GET 요청 → USDT 마켓 목록을 만들고 실시간 반영
//   2) 코인 검색
//   3) localStorage를 이용한 관심 코인 저장 (새로고침해도 유지)
//   4) 전체 보기 / 관심 코인 보기 탭
//
// 흐름: fetchTickers()가 1초마다 데이터를 받아 tickers에 저장 → render()가 표를 갱신
// =========================================================


// ---------- 1. 설정값 ----------
const API_URL = "https://api4.binance.com/api/v3/ticker/24hr";   // 과제에서 제공한 24시간 시세 API
const REFRESH_MS = 1000;                                        // 갱신 주기: 1000ms = 1초
const FAVORITES_KEY = "cryptoTracker.favorites";                // localStorage에 저장할 때 쓰는 이름(키)


// ---------- 2. 화면 요소 가져오기 ----------
const priceList = document.querySelector("#priceList");          // 표의 tbody (행을 넣을 곳)
const searchInput = document.querySelector("#searchInput");      // 검색창
const tabButtons = document.querySelectorAll(".tab");            // 전체/관심 탭 버튼 2개
const countAll = document.querySelector("#countAll");            // 전체 개수 표시
const countFavorites = document.querySelector("#countFavorites");// 관심 개수 표시
const statusBox = document.querySelector("#status");             // 연결 상태 영역
const statusText = document.querySelector("#statusText");        // 연결 상태 글자
const emptyMessage = document.querySelector("#emptyMessage");    // 안내 문구


// ---------- 3. 상태(기억해야 할 값) ----------
let tickers = [];                   // 화면에 보여줄 USDT 코인 목록 (API 응답을 정리한 것)
let currentView = "all";            // 지금 보고 있는 탭: "all"(전체) 또는 "favorites"(관심)
let isLoading = false;              // 요청이 진행 중인지 (요청이 겹치지 않게 막는 깃발)
const favorites = loadFavorites();  // 관심 코인 심볼 모음 (Set: 중복 없는 값의 모음)
const rows = new Map();             // 심볼 → 표의 행(tr). 매초 표를 새로 만들지 않고 값만 바꾸려고 기억해 둠

// '움직임 줄이기'를 설정한 사용자에게는 가격 변화 깜빡임을 보여주지 않음
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ---------- 4. localStorage: 관심 코인 불러오기 / 저장하기 ----------
// localStorage는 문자열만 저장할 수 있어서 배열을 JSON 문자열로 바꿔 저장하고, 꺼낼 때 다시 배열로 바꾼다.
function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);      // 예) '["BTCUSDT","ETHUSDT"]' 또는 null
        return new Set(saved ? JSON.parse(saved) : []);         // 문자열 → 배열 → Set
    } catch (error) {
        return new Set();                                       // 시크릿 모드 등에서 실패하면 빈 목록으로 시작
    }
}

function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));   // Set → 배열 → JSON 문자열
    } catch (error) {
        setStatus("error", "관심 코인을 저장하지 못했습니다. (브라우저 저장소를 쓸 수 없음)");
    }
}


// ---------- 5. API에서 시세 가져오기 ----------
async function fetchTickers() {
    if (isLoading) return;          // 이전 요청이 아직 안 끝났으면 이번 차례는 건너뜀 (요청이 쌓이지 않게)
    isLoading = true;

    try {
        const response = await fetch(API_URL);                  // GET 요청 보내고 응답을 기다림
        if (!response.ok) {                                     // 상태 코드가 200번대가 아니면
            throw new Error(`HTTP ${response.status}`);         // 에러로 처리해서 catch로 보냄
        }
        const data = await response.json();                     // 응답 바디(JSON 문자열) → 자바스크립트 배열

        tickers = data
            .filter((item) => item.symbol.endsWith("USDT") && Number(item.lastPrice) > 0)
            // USDT 마켓만 남기고, 거래가 멈춘 코인(가격 0)은 뺀다
            .map(toTicker)                                      // 필요한 값만 숫자로 정리
            .sort((a, b) => b.quoteVolume - a.quoteVolume);     // 거래대금이 큰 순서로 정렬

        render();                                               // 표 갱신
        setStatus("live", `실시간 연결됨, ${formatTime(new Date())} 갱신`);
    } catch (error) {
        setStatus("error", `시세를 불러오지 못했습니다 (${error.message}). 1초 뒤 다시 시도합니다.`);
        if (tickers.length === 0) {
            emptyMessage.textContent = "시세를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.";
        }
    } finally {
        isLoading = false;          // 성공하든 실패하든 다음 요청을 받을 수 있게 깃발 내리기
    }
}

// API 응답 한 줄을 화면에 필요한 모양으로 바꾸기
// (API는 숫자도 "67123.45000000" 같은 문자열로 주므로 Number()로 숫자로 바꿔야 계산·비교가 가능)
function toTicker(item) {
    return {
        symbol: item.symbol,                         // 예) "BTCUSDT"
        base: item.symbol.slice(0, -4),              // 끝의 "USDT" 4글자를 뺀 코인 이름: "BTC"
        price: Number(item.lastPrice),               // 현재가
        changePercent: Number(item.priceChangePercent),  // 24시간 변동률(%)
        high: Number(item.highPrice),                // 24시간 최고가
        low: Number(item.lowPrice),                  // 24시간 최저가
        quoteVolume: Number(item.quoteVolume),       // 24시간 거래대금 (USDT 기준)
    };
}


// ---------- 6. 화면 그리기 ----------
function render() {
    const keyword = searchInput.value.trim().toUpperCase();     // 검색어를 대문자로 (btc → BTC)
    const currentSymbols = new Set();                           // 이번 응답에 들어 있는 심볼들
    let visibleCount = 0;                                       // 화면에 보이는 행 개수

    for (const ticker of tickers) {
        currentSymbols.add(ticker.symbol);
        const row = rows.get(ticker.symbol) ?? createRow(ticker);   // 이미 만든 행이 있으면 재사용, 없으면 새로 만들기

        const matchesTab = currentView === "all" || favorites.has(ticker.symbol);  // 탭 조건
        const matchesSearch = keyword === "" || ticker.symbol.includes(keyword);   // 검색 조건
        row.hidden = !(matchesTab && matchesSearch);            // 두 조건을 모두 만족할 때만 보이기

        updateRow(row, ticker);                                 // 값 갱신
        if (!row.hidden) visibleCount++;
    }

    // 이번 응답에서 사라진 코인(상장 폐지 등)의 행은 숨김
    rows.forEach((row, symbol) => {
        if (!currentSymbols.has(symbol)) row.hidden = true;
    });

    countAll.textContent = tickers.length;
    countFavorites.textContent = tickers.filter((ticker) => favorites.has(ticker.symbol)).length;
    updateEmptyMessage(visibleCount, keyword);
}

// 표의 행(tr)을 처음 한 번 만들기
// 행은 만들 때 한 번만 tbody 끝에 붙이므로, 화면 순서는 '처음 불러왔을 때의 거래대금 순서'로 고정된다.
// (매초 순서가 바뀌면 별 버튼을 누르려는 순간 행이 움직여 버리기 때문)
function createRow(ticker) {
    const row = document.createElement("tr");
    row.dataset.symbol = ticker.symbol;          // <tr data-symbol="BTCUSDT"> : 어떤 코인의 행인지 표시

    // 구조(빈칸)만 innerHTML로 만들고, API에서 온 글자는 아래에서 textContent로 넣는다.
    // (외부 데이터를 innerHTML로 넣으면 HTML 코드로 해석될 위험이 있기 때문)
    row.innerHTML = `
        <td class="col-fav"><button class="fav-btn" type="button" aria-pressed="false">☆</button></td>
        <th scope="row"><span class="base"></span><span class="quote">/USDT</span></th>
        <td class="num price"></td>
        <td class="num change"></td>
        <td class="num col-wide high"></td>
        <td class="num col-wide low"></td>
        <td class="num col-wide volume"></td>
    `;
    row.querySelector(".base").textContent = ticker.base;

    priceList.appendChild(row);                  // tbody 끝에 행 추가
    rows.set(ticker.symbol, row);                // 다음부터 재사용하려고 기억
    return row;
}

// 이미 있는 행의 값만 바꾸기
function updateRow(row, ticker) {
    const priceCell = row.querySelector(".price");
    const previousPrice = Number(row.dataset.price);            // 직전에 표시했던 가격 (처음이면 NaN)

    setText(priceCell, formatPrice(ticker.price));
    if (!row.hidden && previousPrice && ticker.price !== previousPrice) {
        flash(priceCell, ticker.price > previousPrice);          // 가격이 바뀌었으면 잠깐 색으로 알려 줌
    }
    row.dataset.price = ticker.price;                           // 이번 가격을 기억

    const changeCell = row.querySelector(".change");
    setText(changeCell, formatPercent(ticker.changePercent));
    changeCell.className = `num change ${directionClass(ticker.changePercent)}`;   // 상승/하락 색 클래스

    setText(row.querySelector(".high"), formatPrice(ticker.high));
    setText(row.querySelector(".low"), formatPrice(ticker.low));
    setText(row.querySelector(".volume"), formatVolume(ticker.quoteVolume));

    const isFavorite = favorites.has(ticker.symbol);
    const favButton = row.querySelector(".fav-btn");
    setText(favButton, isFavorite ? "★" : "☆");
    favButton.setAttribute("aria-pressed", String(isFavorite));
    favButton.setAttribute("aria-label", `${ticker.base} ${isFavorite ? "관심 코인에서 빼기" : "관심 코인에 추가"}`);
}

// 글자가 실제로 바뀔 때만 화면을 고치기 (매초 수백 칸을 고치므로 불필요한 작업을 줄임)
function setText(element, text) {
    if (element.textContent !== text) {
        element.textContent = text;
    }
}

// 가격 칸을 잠깐 빨강(상승)/파랑(하락) 배경으로 깜빡이기 (Web Animations API)
function flash(cell, isUp) {
    if (reduceMotion) return;
    const color = isUp ? "rgba(200, 36, 58, 0.14)" : "rgba(30, 91, 198, 0.14)";
    cell.animate([{ backgroundColor: color }, { backgroundColor: "transparent" }], { duration: 600, easing: "ease-out" });
}

function updateEmptyMessage(visibleCount, keyword) {
    if (tickers.length === 0) return;                           // 아직 데이터가 없으면 '불러오는 중' 문구 유지
    if (visibleCount > 0) {
        emptyMessage.hidden = true;                             // 보이는 행이 있으면 안내 문구 숨김
        return;
    }
    emptyMessage.hidden = false;
    if (keyword !== "") {
        emptyMessage.textContent = `'${keyword}' 검색 결과가 없습니다.`;
    } else {
        emptyMessage.textContent = "아직 관심 코인이 없습니다. 전체 목록에서 ☆를 눌러 추가해 보세요.";
    }
}

function setStatus(state, text) {
    statusBox.dataset.state = state;            // CSS가 data-state 값에 따라 점 색을 바꿈
    statusText.textContent = text;
}


// ---------- 7. 숫자 보기 좋게 바꾸기 ----------
// 가격대에 따라 소수점 자릿수를 다르게: 비싼 코인은 2자리, 아주 싼 코인은 8자리
function formatPrice(value) {
    let digits = 8;
    if (value >= 1000) digits = 2;
    else if (value >= 1) digits = 4;
    else if (value >= 0.01) digits = 6;
    return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    // toLocaleString: 세 자리마다 쉼표를 찍어 줌. 예) 67123.4 → "67,123.40"
}

function formatPercent(value) {
    const sign = value > 0 ? "+" : "";          // 음수는 원래 "-"가 붙어 있으므로 양수에만 "+"
    return `${sign}${value.toFixed(2)}%`;
}

function directionClass(value) {
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "flat";
}

// 거래대금을 한국식 단위로: 2,345,678,901 → "23.5억", 94,674,000 → "9,467.4만"
function formatVolume(value) {
    const oneDecimal = { minimumFractionDigits: 1, maximumFractionDigits: 1 };   // 소수점 한 자리로 통일
    if (value >= 1e12) return `${(value / 1e12).toLocaleString("ko-KR", oneDecimal)}조`;   // 1e12 = 1조
    if (value >= 1e8) return `${(value / 1e8).toLocaleString("ko-KR", oneDecimal)}억`;     // 1e8 = 1억
    if (value >= 1e4) return `${(value / 1e4).toLocaleString("ko-KR", oneDecimal)}만`;     // 1e4 = 1만
    return value.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
}

// 시각을 "17:03:22" 모양으로. padStart(2, "0"): 한 자리 숫자 앞에 0을 붙여 두 자리로 (7 → "07")
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}


// ---------- 8. 이벤트 연결 ----------
// 검색: 글자를 입력할 때마다(input 이벤트) 다시 그리기
searchInput.addEventListener("input", render);

// 탭 전환
tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentView = button.dataset.view;                      // "all" 또는 "favorites"
        tabButtons.forEach((tab) => {
            const isActive = tab === button;
            tab.classList.toggle("is-active", isActive);        // 선택된 탭만 강조
            tab.setAttribute("aria-pressed", String(isActive));
        });
        render();
    });
});

// 별 버튼: 행이 수백 개라 버튼마다 리스너를 달지 않고, tbody 하나에만 달아서 처리 (이벤트 위임)
priceList.addEventListener("click", (event) => {
    const button = event.target.closest(".fav-btn");            // 클릭한 곳이 별 버튼인지 확인
    if (!button) return;                                        // 다른 곳을 클릭했으면 무시

    const symbol = button.closest("tr").dataset.symbol;         // 버튼이 들어 있는 행의 심볼
    if (favorites.has(symbol)) {
        favorites.delete(symbol);                               // 이미 관심 코인이면 빼고
    } else {
        favorites.add(symbol);                                  // 아니면 추가
    }
    saveFavorites();                                            // localStorage에 저장
    render();
});


// ---------- 9. 시작 ----------
fetchTickers();                                 // 페이지를 열자마자 한 번 요청
setInterval(fetchTickers, REFRESH_MS);          // 그 뒤로 1초마다 요청
