const path = require('path')
const express  = require("express");
const app = express();
const ANiTW_2019 = require('./watermark/ANiTW_2019.js')
const Spachs = require('./watermark/4_Spachs.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const ProposedMethod = require('./watermark/Propose_Method.js');
const PORT = 5000
const jaroWinklerDistance = require('./test/test_visiblity.js').jaro_Winkler;
const jaroDistance = require('./test/test_visiblity.js').jaro_distance;

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/",  (req, res) => {
  return res.sendFile(path.join(__dirname, '/templates' ,'/index.html'));
})

app.post("/4_Spach_embed", (req, res) => {
  let coverText = req.body.coverText;
  let watermark = req.body.watermark;

  if(coverText== null || watermark == null || coverText == undefined || watermark == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = Spachs.embedMethod2(coverText, watermark);

  return res.json({
    result: result
  })

})

app.post("/4_Spach_extract", (req, res) => {
  let coverText = req.body.coverText;

  if(coverText== null ||  coverText == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = Spachs.extractMethod2(coverText);

  return res.json({
    result: result
  })

})




app.post("/proposed_embed", (req, res) => {
  let coverText = req.body.coverText;
  let watermark = req.body.watermark;

  if(coverText== null || watermark == null || coverText == undefined || watermark == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = ProposedMethod.Embed(coverText, watermark);

  return res.json({
    result: result
  })

})

app.post("/proposed_extract", (req, res) => {
  let coverText = req.body.coverText;

  if(coverText== null ||  coverText == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = ProposedMethod.Extract(coverText);

  return res.json({
    result: result
  })

})


app.post("/ANITW_embed", (req, res) => {
  let coverText = req.body.coverText;
  let watermark = req.body.watermark;

  if(coverText== null || watermark == null || coverText == undefined || watermark == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = ANiTW_2019.embedWatermark(coverText, watermark);

  return res.json({
    result: result
  })

})

app.post("/ANITW_extract", (req, res) => {
  let coverText = req.body.coverText;

  if(coverText== null ||  coverText == undefined){
    return req.json({
      result: "undefine or null value"
    })
  }
  let result = ANiTW_2019.proofOfOwnership(coverText, ANiTW_2019.extractWatermark(coverText));

  return res.json({
    result: result
  })

})

app.listen(PORT, ()=> {
  console.log(`Server is listening port ${PORT}`);
})