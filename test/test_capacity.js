function calculateAvgWordLength(text) {
    // Loại bỏ dấu câu để chỉ tính ký tự trong từ
    let cleanText = text.replace(/[.,!?;:"'(){}\[\]-]/g, "");
    
    // Tách từ bằng khoảng trắng
    let words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    // Tổng số ký tự (không tính khoảng trắng)
    let totalChars = words.reduce((sum, word) => sum + word.length, 0);

    // Tính avgWordLength
    return words.length > 0 ? (totalChars / words.length) : 0;
}


function calculateEL(textLength, avgWordLength = 5) {
    // Số lượng vị trí có thể nhúng = tổng số ký tự / (độ dài từ trung bình + 1)
    return Math.floor(textLength / (avgWordLength + 1));
}

function calculateEC(textLength, text, bpl = 2) {
    let avgWordLength = calculateAvgWordLength(text);
    let EL = calculateEL(textLength, avgWordLength);
    return {
        textLength,
        EL: EL,
        EC: EL * bpl
    };
}







module.exports = {
    calculateEC
};