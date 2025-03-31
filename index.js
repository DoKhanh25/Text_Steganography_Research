const path = require('path')
const express  = require("express");
const app = express();
const ANiTW_2019 = require('./watermark/ANiTW_2019.js')
const Spachs = require('./watermark/4_Spachs.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const ProposedMethod = require('./watermark/Propose_Method.js');
const { log } = require('console');
const PORT = 5000
const jaroWinklerDistance = require('./test/test_visiblity.js').jaro_Winkler;
const jaroDistance = require('./test/test_visiblity.js').jaro_distance;
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const testCapacityFineGrain = require('./test/test_capacity_Fine-grain.js');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Kiểm tra nếu thư mục uploads chưa tồn tại thì tạo mới
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ storage: storage });

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Xử lý upload file
app.post('/upload', upload.single('excelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Không có file nào được upload');
  }

  try {
    const filePath = req.file.path;
    
    // Đọc file excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Lấy sheet đầu tiên
    const worksheet = workbook.getWorksheet(1);
    
    // Mảng để lưu dữ liệu từ cột B (từ dòng 2 đến dòng 11)
    const columnBData = [];
    rsC = [];
    
    // Lặp qua các dòng từ 2 đến 11
    for (let i = 2; i <= 11; i++) {
      const cell = worksheet.getCell(`B${i}`);
      columnBData.push({
        row: i,
        value: cell.value
      });


      
      let result = testCapacityFineGrain.calculateEmbeddingCapacity(cell.value);
      
      console.log(result.w);
    

    }


    

    // Xóa file sau khi xử lý xong
    fs.unlinkSync(filePath);
    
    // Trả về kết quả
    res.json({
      message: 'Xử lý file thành công',
      data: columnBData,
      data2: rsC
    });
    
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).send('Đã xảy ra lỗi khi xử lý file Excel');
  }
});


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
  let result = ANiTW_2019.embedWatermark(coverText, watermark);
  console.log(jaroDistance(coverText, result))

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