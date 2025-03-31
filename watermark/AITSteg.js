// Định nghĩa các ZWC tương ứng với 2-bit
const ZWC_MAP = {
    '00': '\u200C', // Zero-Width-Non-Joiner
    '01': '\u202C', // POP Directional
    '10': '\u202D', // Left-To-Right Override
    '11': '\u200E'  // Left-To-Right Mark
};

// Hàm chuyển số sang chuỗi nhị phân với độ dài cố định
function toBinary(num, length) {
    return num.toString(2).padStart(length, '0');
}

// Hàm Gödel: Tính cặp số <α, β> từ mã ASCII của ký tự
function getGodelPair(asciiCode) {
    let eta = asciiCode;
    let alpha = 0;
    while ((eta + 1) % (Math.pow(2, alpha + 1)) === 0) {
        alpha++;
    }
    let beta = (((eta + 1) / Math.pow(2, alpha)) - 1) / 2;
    return [alpha, beta];
}

// Hàm tạo khóa đối xứng từ thời gian gửi
function generateSymmetricKey(sendTime) {
    // Ví dụ: sendTime = "12:15" -> "121" -> binary 8-bit
    const timeStr = sendTime.replace(':', '').slice(0, 3);
    const timeNum = parseInt(timeStr);
    return toBinary(timeNum, 8);
}

// Hàm nhúng tin nhắn bí mật vào tin nhắn bìa
function embedMessage(secretMessage, coverMessage, sendTime) {
    // Bước 1: Tạo SM binary từ từng ký tự của secret message
    let smBinary = '';
    for (let char of secretMessage) {
        const asciiCode = char.charCodeAt(0);
        const [alpha, beta] = getGodelPair(asciiCode);
        smBinary += toBinary(alpha, 6) + toBinary(beta, 6); // 12-bit mỗi ký tự
    }

    // Bước 2: Tạo khóa đối xứng và hash SM binary
    const skBinary = generateSymmetricKey(sendTime);
    const ls = secretMessage.length * 12; // Độ dài SM binary
    const lsk = skBinary.length; // Độ dài SK binary (8-bit)
    const p = ls % lsk === 0 ? 0 : 1;
    const nc = Math.floor(ls / lsk) + p;
    let hashPositionBits = skBinary.repeat(nc).slice(0, ls);

    // XOR SM binary với hash position bits
    let hashedSMBinary = '';
    for (let i = 0; i < smBinary.length; i++) {
        hashedSMBinary += (parseInt(smBinary[i]) ^ parseInt(hashPositionBits[i])).toString();
    }

    // Bước 3: Tạo HM_SK (ẩn khóa SK)
    let hmSK = '';
    for (let i = 0; i < skBinary.length; i += 2) {
        const bits = skBinary.slice(i, i + 2);
        hmSK += ZWC_MAP[bits];
    }

    // Bước 4: Tạo HM từ hashed SM binary
    let hm = '';
    for (let i = 0; i < hashedSMBinary.length; i += 2) {
        const bits = hashedSMBinary.slice(i, i + 2);
        hm += ZWC_MAP[bits];
    }

    // Bước 5: Kết hợp HM_SK, HM và CM thành CM_HM
    const cmHM = hmSK + hm + coverMessage;
    return cmHM;
}

// Ví dụ sử dụng
const secretMessage = "Ali";
const coverMessage = "How are you?";
const sendTime = "12:15";
const carrierMessage = embedMessage(secretMessage, coverMessage, sendTime);
console.log("Carrier Message (CM_HM):", carrierMessage);


// Định nghĩa ngược từ ZWC sang 2-bit
const ZWC_TO_BITS = {
    '\u200C': '00',
    '\u202C': '01',
    '\u202D': '10',
    '\u200E': '11'
};

// Hàm tính η từ cặp <α, β>
function getAsciiFromGodelPair(alpha, beta) {
    return Math.pow(2, alpha) * (2 * beta + 1) - 1;
}

// Hàm trích xuất tin nhắn bí mật từ CM_HM
function extractMessage(carrierMessage, receiveTime) {
    // Bước 1: Trích xuất HM_SK và HM từ CM_HM
    let binaryString = '';
    for (let char of carrierMessage) {
        if (ZWC_TO_BITS[char]) {
            binaryString += ZWC_TO_BITS[char];
        } else {
            break; // Khi gặp ký tự không phải ZWC, dừng lại (bắt đầu CM)
        }
    }

    // Tách HM_SK (8-bit đầu tiên, tức 4 ZWC)
    const hmSKBinary = binaryString.slice(0, 8);
    const hashedSMBinary = binaryString.slice(8);

    // Bước 2: Kiểm tra khóa đối xứng
    const mrSK = generateSymmetricKey(receiveTime);
    if (hmSKBinary !== mrSK) {
        throw new Error("Symmetric key mismatch!");
    }

    // Bước 3: Tính hash position bits để đảo ngược hash
    const ls = hashedSMBinary.length;
    const lsk = mrSK.length;
    const p = ls % lsk === 0 ? 0 : 1;
    const nc = Math.floor(ls / lsk) + p;
    const hashPositionBits = mrSK.repeat(nc).slice(0, ls);

    // Đảo ngược hash bằng XOR
    let smBinary = '';
    for (let i = 0; i < hashedSMBinary.length; i++) {
        smBinary += (parseInt(hashedSMBinary[i]) ^ parseInt(hashPositionBits[i])).toString();
    }

    // Bước 4: Chuyển SM binary về ký tự
    let secretMessage = '';
    for (let i = 0; i < smBinary.length; i += 12) {
        const chunk = smBinary.slice(i, i + 12);
        const alphaBinary = chunk.slice(0, 6);
        const betaBinary = chunk.slice(6, 12);
        const alpha = parseInt(alphaBinary, 2);
        const beta = parseInt(betaBinary, 2);
        const asciiCode = getAsciiFromGodelPair(alpha, beta);
        secretMessage += String.fromCharCode(asciiCode);
    }

    return secretMessage;
}

// Ví dụ sử dụng
const receivedMessage = carrierMessage; // Giả định từ embedding
const receiveTime = "12:15";
try {
    const extractedMessage = extractMessage(receivedMessage, receiveTime);
    console.log("Extracted Secret Message:", extractedMessage);
} catch (error) {
    console.error(error.message);
}

module.exports = {
    embedMessage,
    extractMessage
};