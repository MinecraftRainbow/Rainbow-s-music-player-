const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('audio')) {
      cb(null, 'public/music');
    } else if (file.originalname.endsWith('.lrc')) {
      cb(null, 'public/lyrics');
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// 上传接口：支持上传音乐与歌词
app.post('/upload', upload.fields([{ name: 'music' }, { name: 'lyrics' }]), (req, res) => {
  res.redirect('/');
});

// 返回当前 music 文件夹中的所有音频文件
app.get('/songs', (req, res) => {
  const musicDir = path.join(__dirname, 'public/music');
  const files = fs.readdirSync(musicDir).filter(file =>
    ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase())
  );
  res.json(files);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
