// Hàm tính khả năng nhúng (Embedding Capacity)
function calculateEmbeddingCapacity(BPL, CPL, EL, useBitsPerLocation = true) {
    if (useBitsPerLocation) {
        // Sử dụng số bit trên mỗi vị trí
        return BPL * EL;
    } else {
        // Sử dụng số ký tự trên mỗi vị trí
        return CPL * EL;
    }
}

// Ví dụ sử dụng:
// BPL: số bit trên mỗi vị trí
// CPL: số ký tự trên mỗi vị trí
// EL: số lượng vị trí có thể nhúng

const BPL = 2;  // Số bit trên mỗi vị trí
const CPL = 1;  // Số ký tự trên mỗi vị trí
const EL = 100; // Số lượng vị trí có thể nhúng

// Tính EC dựa trên BPL
const EC_BPL = calculateEmbeddingCapacity(BPL, CPL, EL, true);
console.log(`Embedding Capacity (dựa trên BPL): ${EC_BPL} bits`);

// Tính EC dựa trên CPL
const EC_CPL = calculateEmbeddingCapacity(BPL, CPL, EL, false);
console.log(`Embedding Capacity (dựa trên CPL): ${EC_CPL} characters`);
