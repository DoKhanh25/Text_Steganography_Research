function countSpaces(text) {
    // Đếm số lượng khoảng trắng giữa các từ
    return (text.match(/ /g) || []).length;
}

function calculateEC(text, bpl = 4) {
    let EL = countSpaces(text);  // Số vị trí có thể nhúng
    return {
        EL: EL,
        EC: EL * bpl
    };
}

module.exports = {calculateEC};