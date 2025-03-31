function calculateEL(text, avgSentenceLength) {
    // Đếm số lượng dấu câu có thể dùng để nhúng watermark
    let embeddableLocations = (text.match(/[.!?]/g) || []).length;
    
    // Hoặc ước lượng dựa trên độ dài trung bình câu
    if (embeddableLocations === 0) {
        embeddableLocations = Math.floor(text.length / avgSentenceLength);
    }

    return embeddableLocations;
}

function calculateEC(text, bpl = 3) {
    let avgSentenceLength = calculateAvgSentenceLength(text);
    let EL = calculateEL(text, avgSentenceLength);
    return {
        EL: EL,
        EC: EL * bpl
    };
}

function calculateAvgSentenceLength(text) {
    // Tách văn bản thành các câu dựa trên các dấu chấm câu (., !, ?)
    let sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);

    // Tính tổng số ký tự (không tính khoảng trắng đầu/cuối)
    let totalChars = sentences.reduce((sum, sentence) => sum + sentence.trim().length, 0);

    // Tính độ dài trung bình của câu
    return sentences.length > 0 ? (totalChars / sentences.length) : 0;
}


module.exports = {
    calculateEC
}