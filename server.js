const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const folder = path.join(__dirname, 'm3u8_files');

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

// Middlewares
app.use(cors());
app.use(express.text({ limit: '10mb' })); // Cho phép nhận text body tối đa 1MB

// Route để upload file qua POST
app.post('/upload', (req, res) => {
    const content = req.body;
    if (!content) {
        return res.status(400).send('Không có nội dung gửi lên!');
    }

    const filename = Math.random().toString(36).substring(2, 10) + '.m3u8';
    const filepath = path.join(folder, filename);

    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error('Lỗi khi lưu file:', err);
            return res.status(500).send('Lỗi server khi lưu file!');
        }
        const fileUrl = `https://text.example.com/${filename}`;
        
        console.log(`[+] File mới được lưu: ${filename}`);
        console.log(`[+] Link truy cập: ${fileUrl}`);
        
        res.send(fileUrl);
    });
});

// Route để phục vụ file
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(folder, filename);

    if (!fs.existsSync(filepath)) {
        return res.status(404).send('Không tìm thấy file!');
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filepath).pipe(res);
});

// Khởi động server
app.listen(port, () => {
    console.log(`Mahiro Server đang chạy tại http://localhost:${port}`);
});
