function calculateProposedEC(data, key) {
    const keyBits = getKeyBits(key); // Tổng số bit của key (8 bit/ký tự)
    const slots = data.length - 1; // Số khe nhúng (giữa các ký tự)
    const ec = keyBits / slots; // EC (bits/slot)
    return {
        keyBits: keyBits,
        slots: slots,
        ec: ec.toFixed(3)
    };
}

// Hàm phụ tính số bit của key
function getKeyBits(key) {
    let bits = 0;
    for (const c of key) {
        bits += c.charCodeAt(0).toString(2).length; // 8 bit mỗi ký tự ASCII
    }
    return bits;
}


module.exports = {
    calculateProposedEC
}
