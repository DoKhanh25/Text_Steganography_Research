// Zero-Width Characters
const ZWC = {
    ZWC1: '\u200C', // U+200C
    ZWC2: '\u200D', // U+200D
    ZWC3: '\u202C'  // U+202C
};

// Bảng tra cứu cho việc chuyển đổi ký tự watermark thành mã decimal 2 chữ số (Table 5)
const watermarkToDigits = {
    '0': '10', '1': '11', '2': '12', '3': '13', '4': '14',
    '5': '15', '6': '42', '7': '43', '8': '44', '9': '45'
};

// Bảng tra cứu cho Match Embedding Mode (Table 7 - ví dụ đơn giản hóa)
const matchEmbeddingMap = {
    '0': [['a', 'e'], ['i', 'o']],
    '1': [['b', 'f'], ['j', 'p']],
    '2': [['c', 'g'], ['k', 'q']],
    '3': [['d', 'h'], ['l', 'r']],
    '4': [['e', 'i'], ['m', 's']],
    '5': [['f', 'j'], ['n', 't']],
    '6': [['g', 'k'], ['o', 'u']],
    '7': [['h', 'l'], ['p', 'v']],
    '8': [['i', 'm'], ['q', 'w']],
    '9': [['j', 'n'], ['r', 'x']]
};

// Bảng tra cứu ngược để trích xuất
const reverseMatchEmbeddingMap = {};
for (let digit in matchEmbeddingMap) {
    matchEmbeddingMap[digit].forEach(pair => {
        pair.forEach(char => {
            reverseMatchEmbeddingMap[char] = reverseMatchEmbeddingMap[char] || [];
            reverseMatchEmbeddingMap[char].push(digit);
        });
    });
}

// Bảng tra cứu cho ký tự tham chiếu (Table 4)
const charReferenceTable = ['a', 'i', 'u', 'e', 'o'];

function embedWatermark(coverText, authorID) {
    // Bước 1: Chọn ký tự tham chiếu ngẫu nhiên (CharRef)
    const indexCharRef = Math.floor(Math.random() * 5); // 0-4
    const charRef = charReferenceTable[indexCharRef];

    // Bước 2: Tính ShiftVal dựa trên số lần xuất hiện của CharRef trong CT
    const shiftVal = (coverText.match(new RegExp(charRef, 'g')) || []).length;

    // Bước 3: Dịch chuyển ID
    const shiftedID = shiftString(authorID, shiftVal);

    // Bước 4: Kết hợp ShiftedID với indexCharRef
    const watermarkInput = shiftedID + indexCharRef;

    // Bước 5: Chuyển đổi watermark thành dạng decimal 2 chữ số
    let wDigits = '';
    for (let char of watermarkInput) {
        wDigits += watermarkToDigits[char] || '00'; // Mặc định là 00 nếu không tìm thấy
    }


    // Bước 6: Nhúng watermark vào CT
    let watermarkedText = '';
    let ctIndex = 0;
    let digitIndex = 0;

    while (ctIndex < coverText.length && digitIndex < wDigits.length) {
        const currentDigit = wDigits[digitIndex];
        const possiblePairs = matchEmbeddingMap[currentDigit];

        // Tìm vị trí nhúng phù hợp trong CT
        if (ctIndex + 1 < coverText.length) {
            const bigram = coverText.slice(ctIndex, ctIndex + 2);
            let embedded = false;

            // Kiểm tra BMM (Before-ZWC Match Embedding Mode)
            for (let pair of possiblePairs[1]) {
                if (bigram[0] === pair) {
                    watermarkedText += bigram[0] + ZWC.ZWC1 + bigram[1];
                    embedded = true;
                    digitIndex++;
                    ctIndex += 2;
                    break;
                }
            }

            // Kiểm tra AMM (After-ZWC Match Embedding Mode)
            if (!embedded) {
                for (let pair of possiblePairs[0]) {
                    if (bigram[1] === pair) {
                        watermarkedText += bigram[0] + ZWC.ZWC2 + bigram[1];
                        embedded = true;
                        digitIndex++;
                        ctIndex += 2;
                        break;
                    }
                }
            }

            // Nếu không tìm thấy cặp phù hợp, sử dụng ký tự hiện tại
            if (!embedded) {
                watermarkedText += coverText[ctIndex];
                ctIndex++;
            }
        } else {
            watermarkedText += coverText[ctIndex];
            ctIndex++;
        }
    }

    // Thêm phần còn lại của CT nếu có
    if (ctIndex < coverText.length) {
        watermarkedText += coverText.slice(ctIndex);
    }

    return watermarkedText;
}

// Hàm dịch chuyển chuỗi
function shiftString(str, shift) {
    shift = shift % str.length;
    return str.slice(shift) + str.slice(0, shift);
}

// Ví dụ sử dụng
const coverText = "Stay alert Impersonators are sending QR codes.";
const authorID = "100064701336980";
const watermarked = embedWatermark(coverText, authorID);
console.log("Watermarked Text:", watermarked);

function extractWatermark(watermarkedText) {
    let wDigits = '';
    let i = 0;

    while (i < watermarkedText.length) {
        if (i + 2 < watermarkedText.length) {
            const char1 = watermarkedText[i];
            const zwc = watermarkedText[i + 1];
            const char2 = watermarkedText[i + 2];

            if (zwc === ZWC.ZWC1) { // BMM
                const possibleDigits = reverseMatchEmbeddingMap[char1];
                if (possibleDigits) {
                    wDigits += possibleDigits[0]; // Giả định đơn giản hóa
                }
                i += 3;
            } else if (zwc === ZWC.ZWC2) { // AMM
                const possibleDigits = reverseMatchEmbeddingMap[char2];
                if (possibleDigits) {
                    wDigits += possibleDigits[0]; // Giả định đơn giản hóa
                }
                i += 3;
            } else {
                i++;
            }
        } else {
            i++;
        }
    }

    // Khôi phục watermark từ wDigits
    let watermarkInput = '';
    for (let j = 0; j < wDigits.length; j += 2) {
        const digitPair = wDigits.slice(j, j + 2);
        for (let char in watermarkToDigits) {
            if (watermarkToDigits[char] === digitPair) {
                watermarkInput += char;
                break;
            }
        }
    }

    // Tách ShiftedID và indexCharRef
    const shiftedID = watermarkInput.slice(0, -1);
    const indexCharRef = parseInt(watermarkInput.slice(-1));
    const charRef = charReferenceTable[indexCharRef];

    // Tính ShiftVal từ watermarkedText
    const shiftVal = (watermarkedText.match(new RegExp(charRef, 'g')) || []).length;

    // Dịch ngược để lấy ID gốc
    const originalID = shiftString(shiftedID, shiftedID.length - (shiftVal % shiftedID.length));

    return originalID;
}

// Ví dụ sử dụng
const extractedID = extractWatermark(watermarked);
console.log("Extracted Author ID:", extractedID);

module.exports = {
    embedWatermark,
    extractWatermark
};