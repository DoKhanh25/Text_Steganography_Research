const elliptic = require('elliptic');
const EC = new elliptic.ec('secp256k1'); // Using secp256k1 curve
const crypto = require("crypto");

const hashSecret = "1oqo2i3h1o23iho12h3o1";

function WatermarkDigitsMapper(watermarkCharacter, twoDigits){
  this.watermarkCharacter = watermarkCharacter;
  this.twoDigits = twoDigits;
}

let ZWCTable = {
  ZWC1: "U+200C",
  ZWC2: "U+200E",
  ZWC3: "U+202A",
  ZWC4: "U+202C",
  ZWC5: "U+202D",
  ZWC6: "U+2064"
}


// Stage 1: Init the table 
let charRefTable = ['a', 'i', 'u', 'e', 'o'];
 
let watermarkDigitsTable = []
let i65 = 65;
let i48 = 48;
let x = -1;
let i15 = 15;
let i10 = 10;

for (let i = 0; i <=57; i++){
  let temp;
  let currentChar  = String.fromCharCode(i65+i);
  if(currentChar >= "[" && currentChar <= "`" ){
      continue
  }
  if(currentChar < "Q"){
      temp = new WatermarkDigitsMapper(currentChar, (i48+i).toString());
  } else if(currentChar >= "Q" && currentChar < "a"){
      temp = new WatermarkDigitsMapper(currentChar, "0" + (++x).toString())
  } else {
      temp = new WatermarkDigitsMapper(currentChar,  (++i15).toString())
  }
  
  watermarkDigitsTable.push(temp);
}
let tempTable = [
  new WatermarkDigitsMapper("0", "10"),
  new WatermarkDigitsMapper("1", "11"),
  new WatermarkDigitsMapper("2", "12"),
  new WatermarkDigitsMapper("3", "13"),
  new WatermarkDigitsMapper("4", "14"),
  new WatermarkDigitsMapper("5", "15"),
  new WatermarkDigitsMapper("6", "42"),
  new WatermarkDigitsMapper("7", "43"),
  new WatermarkDigitsMapper("8", "44"),
  new WatermarkDigitsMapper("9", "45"),
  new WatermarkDigitsMapper("!", "47")
]
watermarkDigitsTable = watermarkDigitsTable.concat(tempTable)


const embedWatermarkDigits_MM = {
  0: {
    AMM: ['a', 'j', 'o'],
    BMM: ['n', 'u', 'c']
  },
  1: {
    AMM: ['n', 'h', '.'],
    BMM: [' ', 'o', '0']
  },
  2: {
    AMM: ['i', ',', 'w'],
    BMM: ['g', 'y', '2']
  },
  3: {
    AMM: [' ', 'u', '^'],
    BMM: ['d', 'j', ',']
  },
  4: {
    AMM: ['e', 'b', 'c'],
    BMM: ['r', 'h', 'w']
  },
  5: {
    AMM: ['k', 'p', '2'],
    BMM: ['a', 'l', '(']
  },
  6: {
    AMM: ['t', 'g', 'f'],
    BMM: ['p', 't', 'x']
  },
  7: {
    AMM: ['d', 'y', 'q'],
    BMM: ['m', 'e', 'v']
  },
  8: {
    AMM: ['l', 's', 'v'],
    BMM: ['s', 'b', 'f']
  },
  9: {
    AMM: ['m', 'r', 'x'],
    BMM: ['i', 'k', 'q']
  }
};

// const embedWatermarkDigits_MM = [
//   {
//     AMM: ['a', 'j', 'o'],
//     BMM: ['n', 'u', 'c']
//   },
//   {
//     AMM: ['n', 'h', '.'],
//     BMM: [' ', 'o', '0']
//   },
//   {
//     AMM: ['i', ',', 'w'],
//     BMM: ['g', 'y', '2']
//   },
//   {
//     AMM: [' ', 'u', '^'],
//     BMM: ['d', 'j', ',']
//   },
//   {
//     AMM: ['e', 'b', 'c'],
//     BMM: ['r', 'h', 'w']
//   },
//   {
//     AMM: ['k', 'p', '2'],
//     BMM: ['a', 'l', '(']
//   },
//   {
//     AMM: ['t', 'g', 'f'],
//     BMM: ['p', 't', 'x']
//   },
//   {
//     AMM: ['d', 'y', 'q'],
//     BMM: ['m', 'e', 'v']
//   },
//   {
//     AMM: ['l', 's', 'v'],
//     BMM: ['s', 'b', 'f']
//   },
//   {
//     AMM: ['m', 'r', 'x'],
//     BMM: ['i', 'k', 'q']
//   }
// ]

const embedWatermarkDigits_NonMatch = {
  0: ZWCTable.ZWC4,
  1: ZWCTable.ZWC5,
  2: ZWCTable.ZWC6,
  3: ZWCTable.ZWC4 + ZWCTable.ZWC1,
  4: ZWCTable.ZWC4 + ZWCTable.ZWC2,
  5: ZWCTable.ZWC4 + ZWCTable.ZWC3,
  6: ZWCTable.ZWC5 + ZWCTable.ZWC1,
  7: ZWCTable.ZWC5 + ZWCTable.ZWC2,
  8: ZWCTable.ZWC5 + ZWCTable.ZWC3,
  9: ZWCTable.ZWC6 + ZWCTable.ZWC2,
  "*": ZWCTable.ZWC6 + ZWCTable.ZWC2,
  " ": ZWCTable.ZWC3 + ZWCTable.ZWC3
}


// Stage 2: Generate ShiftedID 

function generateShiftedID(coverText, ID){
  let indexCharRef = Math.floor(Math.random()*(charRefTable.length - 1));
  // let randomChar = charRefTable[indexCharRef];
  let randomChar = charRefTable[1]; // fix 

  let shiftedVal = countCharacter(coverText, randomChar);
  let shiftedID = removeCharacterAtPosAndReverse(ID, shiftedVal);
  return [shiftedID, indexCharRef];
}

// Stage 3: Generate Watermark Digits
// watermark = shiftedID + indexCharef
// watermarkdigits is watermark which is converted by look up watermarkDigitsTable

function generateWatermarkDigits(watermark){
  let watermarkDigits ="";

  for(let i = 0; i < watermark.length; i++){
      for(let j = 0; j < watermarkDigitsTable.length; j++){
          if(watermark[i] == watermarkDigitsTable[j].watermarkCharacter){
              watermarkDigits += watermarkDigitsTable[j].twoDigits
          }
      }
  }
  return watermarkDigits;
}



// Stage 4: Embed WatermarkDigits Into Cover Text
// W_digits is embed into Cover Text depend on "Embed Mode", "Position" and "Setting Position"
// Embed Mode contain 3 types: BMM, AMM, BAMM

function Embed_W_into_CT(watermark, CT, MMType = "BMM"){
// init
let arrayCT = new Array(CT.length).fill(0);
let CTW = CT.split('');
let matchEmbedPos = [];
let nonMatchZWC= "";


let watermarkDigits = generateWatermarkDigits(watermark);


[...watermarkDigits].forEach(e => {

  if(!isCharacterExistInCoverText(CT, e, MMType).isExist){
    nonMatchZWC += embedWatermarkDigits_NonMatch[e];
  } else {
    let indexMatch = isCharacterExistInCoverText(CT, e, MMType).indexMatchChar;

    if(MMType == "BMM"){
      indexMatch = indexMatch - 1; 
    }

    arrayCT[indexMatch] += -1; // fix 
    CTW[indexMatch ] = (nonMatchZWC !== '' ? nonMatchZWC : '') + CTW[indexMatch];

    nonMatchZWC = ''; // Đặt lại chuỗi nonMatchZWC sau khi sử dụng

    // Ghi lại vị trí ký tự đã nhúng
    matchEmbedPos.push(indexMatch);
  }

});

if (nonMatchZWC !== '') {
  CTW[CTW.length - 1] += nonMatchZWC;
}

return { 
  CTW: CTW.join(''), 
  matchEmbedPos 
};
}


function isCharacterExistInCoverText(coverText, digit, MMType){
let isExist = false;
let indexMatchChar = -1;
let matchingCharacter = "";

if(MMType == "AMM"){
  for(let i = 0; i < coverText.length; i++){
    for(let j = 0; j <= embedWatermarkDigits_MM[digit].AMM.length; j++){
      if(coverText.includes(embedWatermarkDigits_MM[digit].AMM[j])){
        isExist = true;
        indexMatchChar = coverText.indexOf(embedWatermarkDigits_MM[digit].AMM[j]);
        matchingCharacter = embedWatermarkDigits_MM[digit].AMM[j];
        break;
      }
    }
  }
} else if(MMType == "BMM"){
  for(let i = 0; i < coverText.length; i++){
    for(let j = 0; j <= embedWatermarkDigits_MM[digit].BMM.length; j++){
      if(coverText.includes(embedWatermarkDigits_MM[digit].BMM[j])){
        isExist = true;
        indexMatchChar = coverText.indexOf(embedWatermarkDigits_MM[digit].BMM[j]);
        matchingCharacter = embedWatermarkDigits_MM[digit].BMM[j];
        break;
      }
    }
  }
}
isExist = false; // cheat



return {isExist, indexMatchChar, matchingCharacter};


}



// stage 4 - End

// test 
console.log(Embed_W_into_CT("HAllofdqwfewasdfo", "Hello world you will miss measdasdasdasdasd"))
let matchEmbedPos = Embed_W_into_CT("HAllofdqwfewasdfo", "Hello world you will miss measdasdasdasdasd").matchEmbedPos;
console.log(generateHashedValue("Hello world you will miss measdasdasdasdasd", matchEmbedPos))
//test 

// stage 5: calculating and selecting hash
function generateCleanedCoverText(ct){
  return ct.toLowerCase().replace(/[^a-z0-9]/g, '');
}



function generateHashedValue(ct, matchEmbedPos){
let cleanedCoverText = generateCleanedCoverText(ct);
let hashedValue = crypto.createHash('sha256', hashSecret).update(cleanedCoverText).digest('hex');
return hashedValue.slice(0, matchEmbedPos.length);
}



console.log(generateHashedValue("asdasdasd", 5))





function countCharacter(converText, char){
  let count = 0;
  for (let i=0; i<= converText.length -1; i++){
      if(converText[i] == char){
          count++;
      }
  }
  return count;
}

function removeCharacterAtPosAndReverse(str, pos){
  if(pos < 0 || pos >= str.length){
      throw new Error("Position not correct")
  }
  return str.slice(pos + 1) + str.slice(0, pos - 1);

}

function generateSignature(selectedHash, cleanCT = "exampleCleanedCT"){

 // The cleaned cover text
const ID = "userID"; // User ID
const ZID = EC.genKeyPair().getPublic(); // Public parameter of user (elliptic curve point)
const dID = EC.genKeyPair().getPrivate(); // Secret parameter of user (private key)
const Pub = EC.genKeyPair().getPublic(); // System public parameter

// Hash functions (H1 and H2) implementation
function H1(input) {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return EC.keyFromPrivate(hash, 'hex').getPrivate();
}

function H2(...inputs) {
    const combined = inputs.map(i => i.toString()).join('');
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return EC.keyFromPrivate(hash, 'hex').getPrivate();
}



// Step 1: Choosing a random rmID
function generateRandomID() {
    const randomBytes = crypto.randomBytes(32);
    const randomHex = randomBytes.toString('hex');
    return EC.keyFromPrivate(randomHex, 'hex').getPrivate();
}

const rmID = generateRandomID();

// Step 2: Calculating S1 = rmID * ZID
const S1 = ZID.mul(rmID);

// Step 3: Calculating h = H2(cleanCT || ID || ZID || Pub)
const h = H2(cleanCT, ID, ZID, Pub);

// Step 4: Calculating S2 = (rmID + h) * dID
const S2 = rmID.add(h).mul(dID).umod(EC.n);

// Step 5: Compressing S1
const xCoord = S1.getX().toString(16); // Extract x-coordinate
const yCoord = S1.getY();
const compressedS1 = (yCoord.isEven() ? '0' : '1') + xCoord;

// Result: Compressed S1 and S2
console.log("Compressed S1:", compressedS1);
console.log("S2:", S2.toString(16));

let watermark = compressedS1 + "*" + S2.toString(16) + selectedHash
return watermark;
}
