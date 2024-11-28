// 간단한 LMC 시뮬레이터 코드

// 메모리 초기화 (0으로 채워진 25개의 메모리 셀)
let memory = new Array(25).fill(0);

// 누산기와 프로그램 카운터 초기화
let accumulator = 0;
let programCounter = 0;

// 프로그램 라인 저장용
let lines = [];

// 초기 프로그램 코드 설정
const defaultProgram = `
// 두 수를 더하는 프로그램
INP       // 첫 번째 수 입력
STA 10    // 메모리 주소 10에 저장
INP       // 두 번째 수 입력
ADD 10    // 메모리 주소 10의 값과 누산기의 값을 더함
OUT       // 결과 출력
HLT       // 프로그램 종료
`;

// 프로그램 입력 영역에 초기 코드 삽입
document.getElementById('program').value = defaultProgram.trim();

// 메모리 셀들을 화면에 표시
const memoryGrid = document.querySelector('.memory-grid');
memory.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.classList.add('memory-cell');
    cell.innerText = value;
    cell.setAttribute('data-index', index);
    cell.id = `cell-${index}`;
    memoryGrid.appendChild(cell);
});

// 누산기와 프로그램 카운터 표시 업데이트 함수
function updateRegisters() {
    document.getElementById('accumulator').innerText = `누산기: ${accumulator}`;
    document.getElementById('program-counter').innerText = `프로그램 카운터: ${programCounter}`;
}

// 메모리 셀 표시 업데이트
function updateMemoryDisplay() {
    memory.forEach((value, index) => {
        const cell = document.getElementById(`cell-${index}`);
        cell.innerText = value;
    });
}

// 레이블 인덱스 가져오기
function getLabelIndex(label) {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`${label}:`)) {
            return i;
        }
    }
    return -1;
}

// 실행 버튼 이벤트 리스너
document.getElementById('run').addEventListener('click', () => {
    // 프로그램을 파싱하고 실행합니다.
    const programText = document.getElementById('program').value;
    const outputContent = document.getElementById('output-content');
    outputContent.innerText = ''; // 이전 출력 초기화

    // 초기화
    accumulator = 0;
    programCounter = 0;
    memory.fill(0);
    updateRegisters();
    updateMemoryDisplay();

    // 프로그램 라인 단위로 분할
    lines = programText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('//'));

    // 프로그램 실행 루프
    while (programCounter < lines.length) {
        const line = lines[programCounter];
        let [command, arg] = line.split(' ');

        if (arg === undefined) arg = '';

        // 레이블 처리
        if (command.endsWith(':')) {
            // 레이블은 건너뜁니다.
            programCounter++;
            continue;
        }

        switch (command.toUpperCase()) {
            case 'INP':
                const input = prompt('입력 값을 입력하세요:');
                accumulator = parseInt(input);
                if (isNaN(accumulator)) {
                    alert('숫자를 입력해야 합니다.');
                    return;
                }
                updateRegisters();
                break;
            case 'OUT':
                outputContent.innerText += accumulator + '\n';
                break;
            case 'ADD':
                accumulator += getValue(arg);
                updateRegisters();
                break;
            case 'SUB':
                accumulator -= getValue(arg);
                updateRegisters();
                break;
            case 'STA':
                setValue(arg, accumulator);
                updateMemoryDisplay();
                break;
            case 'LDA':
                accumulator = getValue(arg);
                updateRegisters();
                break;
            case 'BRA':
                programCounter = getLabelIndex(arg);
                if (programCounter === -1) {
                    alert(`레이블을 찾을 수 없습니다: ${arg}`);
                    return;
                }
                continue;
            case 'BRZ':
                if (accumulator === 0) {
                    programCounter = getLabelIndex(arg);
                    if (programCounter === -1) {
                        alert(`레이블을 찾을 수 없습니다: ${arg}`);
                        return;
                    }
                    continue;
                }
                break;
            case 'BRP':
                if (accumulator >= 0) {
                    programCounter = getLabelIndex(arg);
                    if (programCounter === -1) {
                        alert(`레이블을 찾을 수 없습니다: ${arg}`);
                        return;
                    }
                    continue;
                }
                break;
            case 'HLT':
                programCounter = lines.length;
                break;
            default:
                alert(`알 수 없는 명령어: ${command}`);
                return;
        }
        programCounter++;
        updateRegisters();
    }
});

// 메모리에서 값 가져오기
function getValue(address) {
    const index = parseInt(address);
    if (isNaN(index) || index < 0 || index >= memory.length) {
        alert(`유효하지 않은 메모리 주소: ${address}`);
        throw new Error('Invalid memory address');
    }
    return memory[index] || 0;
}

// 메모리에 값 저장하기
function setValue(address, value) {
    const index = parseInt(address);
    if (isNaN(index) || index < 0 || index >= memory.length) {
        alert(`유효하지 않은 메모리 주소: ${address}`);
        throw new Error('Invalid memory address');
    }
    memory[index] = value;
}
