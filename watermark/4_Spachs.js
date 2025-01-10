

let zwSpace = ['\u200C', '\u2009', '\u200A', '\u200B'];

function embedMethod2(originalText, mess){
  let e = originalText.split(' ');
  let m = splitBits(mess);
  let result = []

  if(m.length > e.length){
    console.log('Message is too long')
    return 'Message is too long'
  }
  for(let i = 0 ; i < m.length; i++ ){
    let temp = e[i];
        for(let j = 0; j <= 3; j++){
            if(m[i][j] == '1'){
                temp = temp + zwSpace[j];
        }
     }
        result.push(temp);
  }
  
  return result.join(' ') + e.slice(m.length).join(' ')   
}
function splitBits(message){
  const result = [];
  for (let i = 0; i < message.length; i += 4) {
    result.push(message.substring(i, i + 4));
  }
  return result;
}

function extractMethod2(watermarkedText){
    let e = watermarkedText.split(' ');
    let result = [];

    for(let i = 0; i < e.length; i++){
        let temp = '';
        for(let j = 0; j <= 3; j++){
        if(e[i].includes(zwSpace[j])){
            temp += '1';
        }else{
            temp += '0';
        }
        }
        result.push(temp);
    }
    return result.join('');
}



module.exports = {
  embedMethod2, extractMethod2
}


