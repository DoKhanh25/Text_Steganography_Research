function calculateEL(textLength, avgCharsPerWatermark = 10) {
    return Math.floor(textLength / avgCharsPerWatermark);
}

function calculateEC(text , EL_BAMM_ratio = 0.5, EL_AMM_BMM_ratio = 0.3, EL_NM_ratio = 0.2) {
    let textLength = text.length;
    let EL = calculateEL(textLength);
    
    let EL_BAMM = Math.floor(EL * EL_BAMM_ratio);
    let EL_AMM_BMM = Math.floor(EL * EL_AMM_BMM_ratio);
    let EL_NM = Math.floor(EL * EL_NM_ratio);

    let EC = EL_BAMM + (EL_AMM_BMM / 2) + (EL_NM / 4);

    return {
        EL_BAMM: EL_BAMM,
        EL_AMM_BMM: EL_AMM_BMM,
        EL_NM: EL_NM,
        EC: EC,
        EL: EL
    };
}

module.exports = {
    calculateEC
};
