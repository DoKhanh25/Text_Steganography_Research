// Danh sách các ký tự Latin và dấu câu có thể thay thế (homoglyph)
const confusableSymbols = ['c', 'd', 'i', 'j', 'l', 'v', 'x', ';', '-'];

// Hàm tính dung lượng nhúng
function calculateEmbeddingCapacity(text) {
    let s = 0; // Số ký tự Latin và dấu câu có thể thay thế
    let w = 0; // Số khoảng trắng

    // Duyệt qua từng ký tự trong văn bản
    for (let char of text) {
        if (confusableSymbols.includes(char)) {
            s++; // Mỗi ký tự thay thế được nhúng 1 bit
        } else if (char === ' ') {
            w++; // Mỗi khoảng trắng nhúng 3 bit
        }
    }

    // Tính dung lượng nhúng theo công thức: s * 1 + w * 3
    const capacity = s * 1 + w * 3;
    return {
        s: s,
        w: w,
        capacity: capacity
    };
}

module.exports = {
    calculateEmbeddingCapacity
};