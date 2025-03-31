// Define confusable symbols from Table 1 and Table 2
const CONFUSABLE_CHARS = {
    // Latin letters and punctuation (Table 1)
    '-': ['U+002D', 'U+2010'],  // hyphen
    ';': ['U+003B', 'U+037E'],  // semicolon
    'C': ['U+0043', 'U+216D'],
    'D': ['U+0044', 'U+216E'],
    'K': ['U+004B', 'U+212A'],
    'L': ['U+004C', 'U+216C'],
    'M': ['U+004D', 'U+216F'],
    'V': ['U+0056', 'U+216D'],
    'X': ['U+0058', 'U+2169'],
    'c': ['U+0063', 'U+217D'],
    'd': ['U+0064', 'U+217E'],
    'i': ['U+0069', 'U+2170'],
    'j': ['U+006A', 'U+0458'],
    'l': ['U+006C', 'U+217C'],
    'v': ['U+0076', 'U+217D'],
    'x': ['U+0078', 'U+2179']
};

// Whitespace characters from Table 2 (3-bit encoding)
const WHITESPACE_CHARS = {
    '000': '\u0020',  // Space
    '001': '\u2000',  // En quad
    '010': '\u2004',  // Three-per-em space
    '011': '\u2005',  // Four-per-em space
    '100': '\u2008',  // Punctuation space
    '101': '\u2009',  // Thin space
    '110': '\u202F',  // Narrow no-break space
    '111': '\u205F'   // Medium mathematical space
};

// Simple SipHash-like function for watermark generation
function generateWatermark(text, password) {
    // This is a simplified hash function for demonstration
    // In practice, you'd want to use a proper cryptographic hash like SipHash
    let hash = 0;
    const combined = text + password;
    for (let i = 0; i < combined.length; i++) {
        hash = (hash * 31 + combined.charCodeAt(i)) & 0xFFFFFFFF;
    }
    
    
    // Convert to 64-bit binary string
    let binary = hash.toString(2).padStart(64, '0');
    if (binary.length > 64) binary = binary.slice(-64);
    return binary;
}

function watermarkEmbed(text, password) {
   
    const watermark = generateWatermark(text, password);
    // Initialize variables
    let watermarkedText = '';
    let watermarkIndex = 0;
    
    // Process each character in the input text
    for (let i = 0; i < text.length; i++) {
        const currentChar = text[i];
        
        // Check if character is a whitespace
        if (currentChar === ' ') {
            // Get 3 bits from watermark (repeating if necessary)
            const bits = watermark.slice(watermarkIndex % 64, (watermarkIndex % 64) + 3)
                .padEnd(3, watermark[watermarkIndex % 64]);
            
            // Replace with appropriate whitespace character
            watermarkedText += WHITESPACE_CHARS[bits];
            watermarkIndex += 3;
        }
        // Check if character is a confusable symbol
        else if (currentChar in CONFUSABLE_CHARS) {
            // Get single bit from watermark (repeating if necessary)
            const bit = watermark[watermarkIndex % 64];
            
            // Replace with original (0) or duplicate (1) Unicode character
            const unicode = CONFUSABLE_CHARS[currentChar][parseInt(bit)];
            
            if(unicode !== undefined){
                watermarkedText += String.fromCharCode(parseInt(unicode.slice(2), 16));
            }
            watermarkIndex += 1;
        }
        // Keep non-confusable characters unchanged
        else {
            watermarkedText += currentChar;
        }
    }

    return watermarkedText;
}



// Reverse lookup maps for extraction
const CHAR_TO_BIT = {};
for (const [char, [orig, dup]] of Object.entries(CONFUSABLE_CHARS)) {
    CHAR_TO_BIT[String.fromCharCode(parseInt(orig.slice(2), 16))] = '0';
    CHAR_TO_BIT[String.fromCharCode(parseInt(dup.slice(2), 16))] = '1';
}

const WHITESPACE_TO_BITS = {};
for (const [bits, char] of Object.entries(WHITESPACE_CHARS)) {
    WHITESPACE_TO_BITS[char] = bits;
}

function watermarkExtract(watermarkedText) {
    let extractedBits = '';
    
    // Process each character in the watermarked text
    for (let i = 0; i < watermarkedText.length; i++) {
        const currentChar = watermarkedText[i];
        
        // Check if character is a whitespace
        if (currentChar in WHITESPACE_TO_BITS) {
            extractedBits += WHITESPACE_TO_BITS[currentChar];
        }
        // Check if character is a confusable symbol
        else if (currentChar in CHAR_TO_BIT) {
            extractedBits += CHAR_TO_BIT[currentChar];
        }
        // Skip non-confusable characters
    }
    
    return extractedBits;
}

// Function to verify watermark (non-blind)
function verifyWatermark(watermarkedText, originalText, password) {
    const extractedBits = watermarkExtract(watermarkedText);
    const expectedWatermark = generateWatermark(originalText, password);
    
    // Since watermark repeats, we need to check if extracted bits contain
    // the watermark pattern (or its rotation)
    const watermarkLength = expectedWatermark.length;
    
    // Handle case where extracted bits might be shorter than watermark
    if (extractedBits.length < watermarkLength) {
        return false;
    }
    
    // Check all possible rotations of the watermark
    const doubleWatermark = expectedWatermark + expectedWatermark;
    return doubleWatermark.includes(extractedBits.slice(0, watermarkLength));
}

// Include the previous generateWatermark function for completeness
// function generateWatermark(text, password) {
//     let hash = 0;
//     const combined = text + password;
//     for (let i = 0; i < combined.length; i++) {
//         hash = (hash * 31 + combined.charCodeAt(i)) & 0xFFFFFFFF;
//     }
//     let binary = hash.toString(2).padStart(64, '0');
//     if (binary.length > 64) binary = binary.slice(-64);
//     return binary;
// }

// Example usage with the previous embed function

module.exports = {
    watermarkEmbed,
    watermarkExtract,
    verifyWatermark
}