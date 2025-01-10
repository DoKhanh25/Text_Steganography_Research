const ZWC202D = '\u202D'
const UpperA = {
  "00": { 
    "00": "A", 
    "01": "B", 
    "10": "C", 
    "11": "D" },
  "01": { 
    "00": "E", 
    "01": "F", 
    "10": "G", 
    "11": "H" },
  "10": { 
    "00": "I", 
    "01": "J", 
    "10": "K", 
    "11": "L" },
  "11": { 
    "00": "M", 
    "01": "N", 
    "10": "O", 
    "11": "P" },
};

const UpperB = {
  "00": { 
    "00": "Q", 
    "01": "R", 
    "10": "S", 
    "11": "T" },
  "01": { 
    "00": "U", 
    "01": "V", 
    "10": "W", 
    "11": "X" },
  "10": { 
    "00": "Y", 
    "01": "Z", 
    "10": "0", 
    "11": "1" },
  "11": { 
    "00": "2", 
    "01": "3", 
    "10": "4", 
    "11": "5" },
}
const LowerA = {
  "00": { 
    "00": "a", 
    "01": "b", 
    "10": "c", 
    "11": "d" },
  "01": { 
    "00": "e", 
    "01": "f", 
    "10": "g", 
    "11": "h" },
  "10": { 
    "00": "i", 
    "01": "j", 
    "10": "k", 
    "11": "l" },
  "11": { 
    "00": "m", 
    "01": "n", 
    "10": "o", 
    "11": "p" },
}
const LowerB = {
  "00": { 
    "00": "q", 
    "01": "r", 
    "10": "s", 
    "11": "t" },
  "01": { 
    "00": "u", 
    "01": "v", 
    "10": "w", 
    "11": "x" },
  "10": { 
    "00": "y", 
    "01": "z", 
    "10": "6", 
    "11": "7" },
  "11": { 
    "00": "8", 
    "01": "9", 
    "10": "\"\"", 
    "11": "!" },
}

const table4 = {
  "000": "\u200E" + "\u200E",
  "001": "\u200C" + "\u200E",
  "010": "\u200E" + "\u200C",
  "011": "\u200C" + "\u200C",
  "100": "\u202C" + "\u202C",
  "101": "\u202C" + "\u200E",
  "110": "\u200E" + "\u202C",
  "111": "\u200C" + "\u202C"
}

const tableAllZWC = ["\u200E", "\u200C", "\u202C" ]


let tableList = [UpperA, UpperB, LowerA, LowerB];



function convertWatermarkToBits(watermark){
  let bits = ""
  for (let i = 0; i < watermark.length; i++){
    
    for (let j=0; j<tableList.length; j++){

      if(getAllCharacters(tableList[j]).includes(watermark[i])){

        let pos = findCharacterPosition(watermark[i], tableList[j]);
        if(pos == null){
          return bits;
        }
        let encodeBit6 = "";
        switch (j){
          case 0: encodeBit6 = "11" + pos.rowBits + pos.colBits; break;
          case 1: encodeBit6 = "00" + pos.rowBits + pos.colBits; break;
          case 2: encodeBit6 = "01" + pos.rowBits + pos.colBits; break;
          case 3: encodeBit6 = "10" + pos.rowBits + pos.colBits; break;
        }
        bits += encodeBit6
        break
      }
    }
  }
  return bits;
}




function getAllCharacters(table) {
  const characters = [];
  for (const rowBits in table) {
    for (const colBits in table[rowBits]) {
      characters.push(table[rowBits][colBits]);
    }
  }
  return characters;
}

function findCharacterPosition(character, table) {
  for (const rowBits in table) {
    for (const colBits in table[rowBits]) {
      if (table[rowBits][colBits] === character) {
        return { rowBits, colBits };
      }
    }
  }
  return null; 
}


function embedZWCToCoverText(text) {
  const words = text.split(/\s+/);
  
  const modifiedWords = words.map(word => {
      if (word.length > 0) {
          return word.slice(0, -1) + ZWC202D + word.slice(-1);
      }
      return word;
  });
  
  return modifiedWords.join(' ');
}

function countWordsInCoverText(ct){
  const words = ct.split(" ");
  const nw = words.length;
  return nw;
}


function embedWatermark(coverText, watermark){
  let wBits = convertWatermarkToBits(watermark);
  let nwBits = countWordsInCoverText(coverText).toString(2);
  // let HBS = nwBits + "101111" + wBits;
  let HBS = wBits  + "101111" + nwBits ;
  console.log(nwBits);

  let CT = embedZWCToCoverText(coverText);

  let WH = '';
  while(HBS.length >= 3){
    let threeBits = HBS.substring(0,3);
    HBS = HBS.substring(3);
    
    const zwcPair = getZWCForThreeBits(threeBits);
    WH += zwcPair;
  }
  

  return insertWatermarkBeforePunctuation(CT, WH);
}


function getZWCForThreeBits(bits) {
  return table4[bits] || '';  // Trả về cặp ZWC tương ứng
}

function insertWatermarkBeforePunctuation(CT, WH) {
  const punctuation = /([.!?])/g;  // Các dấu câu kết thúc câu
  let result = '';
  let lastIndex = 0;
  
  // Duyệt qua văn bản CT và chèn WH vào trước các dấu câu
  CT.replace(punctuation, (match, punc, offset) => {
      result += CT.substring(lastIndex, offset) + WH + punc;
      lastIndex = offset + 1;
  });
  
  // Thêm phần còn lại của CT nếu có
  result += CT.substring(lastIndex);
  
  return result;
}


function extractWatermark(coverTextW){
  const words = coverTextW.split(" ");
  let WH = "";
  let v = [];
  let HBS = "";
  let watermarkString = "";
  let nwBits = "";



  for (let word of words) {
    let vi = word.includes('\u202D') ? 1 : 0;
    v.push(vi);
    WH += extractZWCs(word);
  }
 
  while(WH.length >= 2){
    let twoChars = WH.substring(0, 2);
    WH = WH.substring(2);
    HBS += findKeyByValue(table4, twoChars);
  }
  while(HBS.length >= 6){
    let CS = HBS.substring(0 , 6);
    watermarkString += convert6BitsToCharacter(CS);
    HBS = HBS.substring(6);
    if(watermarkString.includes("!")){
      CS = HBS.substring(0 ,12);
      nwBits = bitsToNumber(CS);
      break;
    }
  }
  watermarkString += nwBits;
  
  return {
    watermarkString, 
    v
  };
}
function proofOfOwnership(coverTextW, extractResult){
  let AC = 0;
  let rs = extractResult.watermarkString.split("!");
  let nw = Number(rs[1]);
  let nw2 = Number(countWordsInCoverText(coverTextW));
  let R ="";
  let W = rs[0];


  console.log(W);
  if(nw > nw2){
    let sum = 0;
    for (let i = 0; i < nw2; i++){
      sum += Number(extractResult.v[i]);
    }
    AC = sum/nw;
    
  } else {
    let sum = 0;
    for (let i = 0; i < nw; i++){
      sum += Number(extractResult.v[i]);
    }
    AC = sum/nw2;
  }
  if(AC == 1){
    R = "The CT is original!";
  } else {
    R = "The CT has been manipulated!";
  }
  return {
    AC, 
    W,
    R
  }
}

function convert6BitsToCharacter(bits){
  let headbits = bits.substring(0, 2);
  let row = bits.substring(2, 4);
  let col = bits.substring(4, 6)
  let character = "";
  switch (headbits) {
    case "11": character = UpperA[row][col]; break;
    case "00": character = UpperB[row][col]; break; 
    case "01": character = LowerA[row][col]; break;
    case "10": character = LowerB[row][col]; break;
  }

  return character;
}


function extractZWCs(word) {
  let zwcWatermark = ""
  for(let i = 0; i < word.length; i++){
    if(tableAllZWC.includes(word[i])){
      zwcWatermark += word[i];
    }
    
  }
  return zwcWatermark;
}

function bitsToNumber(bits) {
  return parseInt(bits, 2);
}
function findKeyByValue(obj, value) {
  return Object.keys(obj).find(key => obj[key] === value) || null;
}

module.exports = {
    proofOfOwnership, embedWatermark, extractWatermark
}