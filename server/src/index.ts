import express from "express";
import cors from "cors";
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  }
})

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ storage: storage })
const app = express();
const PORT=8000;
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post('/uploads/pdf', upload.single('pdf'),(req,res)=>{
return res.json({message:"Pdf uploaded Successfully"})
})
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});