import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";

const queue = new Queue('file-upload');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "server/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/uploads/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add("file-upload", JSON.stringify({
    file:req.file.originalname,
    destination:req.file.destination,
    path:req.file.path
  }));
  res.status(200).json({ status: "ok" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
