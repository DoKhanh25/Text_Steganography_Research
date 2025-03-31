function calculateAITStegRobustness(coverText) {
    const tcLength = coverText.length; // Độ dài văn bản gốc (CM)
    const nl = 1; // AITSteg nhúng HM ở đầu, NL = 1
    const lp = nl / tcLength; // Xác suất mất mát
    const dr = (1 - lp) * 100; // Độ bền vững (%)
    console.log(dr);
    return {
        lp: lp.toFixed(4),
        dr: dr.toFixed(2)
    };
}

function calculateANiTWRobustness(coverText) {
    const ctLength = coverText.length; // Độ dài văn bản gốc (CT)
    // Đếm số dấu câu kết thúc câu (., !, ?)
    const nl = (coverText.match(/[.!?]/g) || []).length || 1; // Ít nhất 1 nếu không có dấu câu
    const pdr = nl / ctLength; // Xác suất phát hiện (giả định tương tự Improved ANiTW)
    const robustness = (1 - pdr) * 100; // Độ bền vững (%)
    console.log(robustness);
    return {
        pdr: pdr.toFixed(4),
        robustness: robustness.toFixed(2)
    };
}








// Tập hợp ký tự từ Table 7 (dựa trên bài báo, ví dụ cho chữ số 0-1, mở rộng cho 0-9)
const table7 = {
    0: { AMM: ['a', 'j', 'l'], BMM: ['i', 'j', 'l'] },
    1: { AMM: ['i', 'j', 'l'], BMM: ['a', 'j', 'l'] },
    2: { AMM: ['e', 'n', 's'], BMM: ['o', 'r', 't'] },
    3: { AMM: ['o', 'r', 't'], BMM: ['e', 'n', 's'] },
    4: { AMM: ['d', 'h', 'p'], BMM: ['u', 'w', 'y'] },
    5: { AMM: ['u', 'w', 'y'], BMM: ['d', 'h', 'p'] },
    6: { AMM: ['b', 'c', 'f'], BMM: ['g', 'k', 'm'] },
    7: { AMM: ['g', 'k', 'm'], BMM: ['b', 'c', 'f'] },
    8: { AMM: ['q', 'v', 'x'], BMM: ['z', 'q', 'v'] },
    9: { AMM: ['z', 'q', 'v'], BMM: ['q', 'v', 'x'] }
};

// Hàm lấy tất cả bigram từ văn bản
function getBigrams(coverText) {
    const bigrams = [];
    for (let i = 0; i < coverText.length - 1; i++) {
        const bigram = coverText.slice(i, i + 2).toLowerCase();
        bigrams.push(bigram);
    }
    return bigrams;
}

// Hàm kiểm tra bigram có khớp với Table 7 không
function isBigramMatch(bigram, digit) {
    const firstChar = bigram[0];
    const secondChar = bigram[1];
    const ammSet = table7[digit].AMM;
    const bmmSet = table7[digit].BMM;
    // Kiểm tra AMM (ký tự đầu) hoặc BMM (ký tự sau)
    return ammSet.includes(firstChar) || bmmSet.includes(secondChar);
}

// Hàm tính embeddableLocations
function calculateEmbeddableLocations(coverText, watermark) {
    const bigrams = getBigrams(coverText);
    const watermarkDigits = watermark.toString().split('').map(Number);
    const requiredLocations = watermarkDigits.length; // Số vị trí cần nhúng

    // Đếm số bigram khớp với Table 7
    let matchCount = 0;
    const usedBigrams = new Set();
    for (let i = 0; i < watermarkDigits.length && i < bigrams.length; i++) {
        const digit = watermarkDigits[i];
        const bigram = bigrams[i];
        if (isBigramMatch(bigram, digit) && !usedBigrams.has(bigram)) {
            matchCount++;
            usedBigrams.add(bigram);
        }
    }

    // embeddableLocations = số bigram khớp (MM) + số vị trí bổ sung (NM)
    let embeddableLocations = matchCount;
    if (matchCount < requiredLocations) {
        const additionalLocations = requiredLocations - matchCount;
        embeddableLocations += additionalLocations; // Bổ sung bằng NM
    }

    return {
        embeddableLocations: embeddableLocations,
        matchedBigrams: matchCount,
        additionalNM: Math.max(0, requiredLocations - matchCount)
    };
}






// Tính P(DR) cho Improved ANiTW
function calculateImprovedANiTWPDR(coverText) {
    let embeddableLocations = calculateEmbeddableLocations(coverText, "11201933").embeddableLocations;
    const ctLength = coverText.length; // Độ dài văn bản gốc (CT)
    const nl = embeddableLocations; // Số vị trí nhúng (dựa trên bigram)
    const pdr = nl / ctLength; // Xác suất phát hiện
    const robustness = (1 - pdr) * 100; // Độ bền vững (%)
    console.log(robustness);
    return {
        pdr: pdr.toFixed(4),
        robustness: robustness.toFixed(2)
    };
}

// Tính Robustness khi cắt bớt cho Improved ANiTW
function calculateImprovedANiTWTruncateRobustness(coverText, totalZWCs, truncatePercentage, position) {
    const ctLength = coverText.length;
    const truncateLength = Math.floor(ctLength * truncatePercentage / 100);
    let remainingZWCs = totalZWCs;

    // Mô phỏng cắt bớt
    if (position === 'end') {
        remainingZWCs = Math.floor(totalZWCs * (1 - truncatePercentage / 100));
    } else if (position === 'start') {
        remainingZWCs = Math.floor(totalZWCs * (truncatePercentage / 100));
    } else if (position === 'middle') {
        remainingZWCs = Math.floor(totalZWCs * 0.5); // Giả định mất 50%
    }

    const robustness = (remainingZWCs / totalZWCs * 100).toFixed(2);
    return robustness;
}



// Danh sách confusable symbols từ Table 1 và Table 2
const confusableSymbols = {
    latin: {
        '-': ['\u002D', '\u2010'], // hyphen
        ';': ['\u003B', '\u037E'], // semicolon
        'C': ['\u0043', '\u216D'],
        'D': ['\u0044', '\u216E'],
        'K': ['\u004B', '\u212A'],
        'L': ['\u004C', '\u216C'],
        'M': ['\u004D', '\u216F'],
        'V': ['\u0056', '\u216D'],
        'X': ['\u0058', '\u2169'],
        'c': ['\u0063', '\u217D'],
        'd': ['\u0064', '\u217E'],
        'i': ['\u0069', '\u2170'],
        'j': ['\u006A', '\u0458'],
        'l': ['\u006C', '\u217C'],
        'v': ['\u0076', '\u217D'],
        'x': ['\u0078', '\u2179']
    },
    whitespace: {
        ' ': ['\u0020', '\u2000', '\u2004', '\u2005', '\u2008', '\u2009', '\u202F', '\u205F']
    }
};

// Hàm đếm số confusable symbols trong văn bản
function countConfusableSymbols(coverText) {
    let nl = 0; // Số vị trí nhúng (NL)
    for (const char of coverText) {
        if (confusableSymbols.latin[char] || confusableSymbols.whitespace[char]) {
            nl++;
        }
    }
    return nl;
}

// Hàm tính DR
function calculateFineGrainDR(coverText) {
    const tcLength = coverText.length; // Độ dài văn bản gốc (|TC|)
    const nl = countConfusableSymbols(coverText); // Số vị trí nhúng (NL)
    const lp = nl / tcLength; // Xác suất mất mát (LP), nhưng điều chỉnh cho Fine-grain
    const adjustedLp = 1 - (nl / tcLength); // LP thực tế: tỷ lệ không bị mất watermark
    const dr = adjustedLp * 100; // DR (%)
    console.log(dr);
    return {
        nl: nl,
        lp: lp.toFixed(4),
        adjustedLp: adjustedLp.toFixed(4),
        dr: dr.toFixed(2)
    };
}


// Danh sách khoảng trắng từ Table 1
const spaceTypes = {
    normalSpace: '\u0020',     // Normal Space (NS)
    pseudoSpace: '\u200C',     // Pseudo-Space (PS)
    thinSpace: '\u2009',       // Thin Space (TS)
    hairSpace: '\u200A',       // Hair Space (HS)
    zeroWidthSpace: '\u200B'   // Zero Width Space (ZWS)
};

// Hàm đếm số normal spaces (vị trí nhúng) trong văn bản
function countNormalSpaces(coverText) {
    let nl = 0;
    for (const char of coverText) {
        if (char === spaceTypes.normalSpace) {
            nl++;
        }
    }
    return nl;
}

// Hàm tính DR lý thuyết theo AITSteg
function calculateMethod2DRTheoretical(coverText) {
    const tcLength = coverText.length; // Độ dài văn bản gốc (|TC|)
    const nl = countNormalSpaces(coverText); // Số vị trí nhúng (NL)
    const lp = nl / tcLength; // LP lý thuyết (tỷ lệ vị trí nhúng)
    const adjustedLp = 1 - lp; // Điều chỉnh LP: tỷ lệ không mất watermark
    const dr = adjustedLp * 100; // DR (%)
    console.log(dr)
    return {
        nl: nl,
        lp: lp.toFixed(4),
        adjustedLp: adjustedLp.toFixed(4),
        dr: dr.toFixed(2)
    };
}

// Hàm tính DR thực tế dựa trên robustness từ Table 7
function calculateMethod2DRRealistic(coverText, deletionPercentage = 0) {
    const nl = countNormalSpaces(coverText); // Số vị trí nhúng
    const tcLength = coverText.length;
    const words = coverText.split(spaceTypes.normalSpace).filter(Boolean);
    const wordCount = words.length;

    // Robustness thực tế từ Table 7
    let robustness;
    if (wordCount <= 29) { // Tiny text
        robustness = deletionPercentage >= 100 ? 0 : 1; // Biến thiên 0-100%
    } else if (wordCount <= 7707) { // Small text
        robustness = deletionPercentage >= 93 ? 0 : 1; // 93-100%
    } else { // Medium, Large, Huge
        robustness = deletionPercentage >= 100 ? 0 : 1; // 100%
    }

    const dr = robustness * 100; // DR (%)
    return {
        nl: nl,
        wordCount: wordCount,
        robustness: robustness.toFixed(4),
        dr: dr.toFixed(2)
    };
}

function getKeyBits(key) {
    const bits = [];
    for (const c of key) {
        bits.push(c.charCodeAt(0).toString(2).padStart(8, '0')); // 8 bit mỗi ký tự
    }
    return bits.join('').length; // Tổng số bit
}

// Hàm tính Robustness lý thuyết
function calculateTheoreticalRobustness(data, key) {
    const zwKey = toZeroWidth(key);
    const nl = Math.min(data.length - 1, zwKey.length); // Số vị trí nhúng thực tế
    const tcLength = data.length + nl; // Độ dài embed (ước lượng)
    const lp = nl / tcLength; // Losing Probability
    const dr = (1 - lp) * 100; // Distortion Robustness
    console.log(dr);
    return {
        nl: nl,
        tcLength: tcLength,
        lp: lp.toFixed(4),
        dr: dr.toFixed(2)
    };
}

function convertWord(s) {
    const bits = toBits(s);
    
    const zws = [];
  
    for (const b of bits) {
      zws.push(convertLetter(b));
    }
   
    return zws.join('\u200D');
  }

function toBits(s) {
    const bits = [];
    for (const c of s) {
      bits.push(c.charCodeAt().toString(2));
    }
  
    return bits;
  }
  function convertLetter(s) {
    
    let sb = '';
    for (const c of s) {
      if (c === '0') {
  
        sb += '\u200C';
        continue;
      }
  
      sb += '\u200B';
    }
    return sb;
  }
function toZeroWidth(s) {
    // Trim spaces across edges
    s = s.trim();
  
    // Split to words separated by space
    const words = s.split(' ');
    
    const zwWords = [];
    for (const w of words) {
      zwWords.push(convertWord(w));
    }
    return zwWords.join('\uFEFF');
  }

module.exports = {
    calculateAITStegRobustness,
    calculateANiTWRobustness,
    calculateImprovedANiTWPDR,
    calculateImprovedANiTWTruncateRobustness,
    calculateFineGrainDR,
    calculateMethod2DRTheoretical,
    calculateTheoreticalRobustness
};