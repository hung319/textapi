const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.text({ limit: '10mb' }));

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// POST random text file
app.post('/upload/txt', (req, res) => {
    const content = req.body;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Đã lưu file random txt: ${fileName}`);
    res.send(`http://${req.headers.host}/txt/${fileName}`);
});

// POST cố định text file
app.post('/upload/text/:filename', (req, res) => {
    const content = req.body;
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Nếu file tồn tại, kiểm tra kết thúc có \n không
    let prefix = '';
    if (fs.existsSync(filePath)) {
        const currentContent = fs.readFileSync(filePath, 'utf8');
        if (!currentContent.endsWith('\n')) {
            prefix = '\n';
        }
    }

    fs.appendFileSync(filePath, prefix + content + '\n', 'utf8');
    console.log(`[+] Đã ghi thêm vào file text cố định: ${filename}`);
    res.send(`http://${req.headers.host}/text/${filename}`);
});

// GET random text file
app.get('/txt/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Không tìm thấy file txt ~~');
    }
});

// GET cố định text file
app.get('/text/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Không tìm thấy file text ~~');
    }
});

// GET upload text bằng query (hỗ trợ Onii-chan upload nhanh)
app.get('/upload/text/:filename/:content', (req, res) => {
    const filename = req.params.filename;
    const content = req.params.content;
    const filePath = path.join(UPLOAD_DIR, filename);

    let prefix = '';
    if (fs.existsSync(filePath)) {
        const currentContent = fs.readFileSync(filePath, 'utf8');
        if (!currentContent.endsWith('\n')) {
            prefix = '\n';
        }
    }

    fs.appendFileSync(filePath, prefix + content + '\n', 'utf8');
    console.log(`[+] Đã thêm bằng GET vào file text: ${filename}`);
    res.send(`http://${req.headers.host}/text/${filename}`);
});

// GET upload txt random (có thể tạo file mới từ GET)
app.get('/upload/txt/:content', (req, res) => {
    const content = req.params.content;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content + '\n', 'utf8');
    console.log(`[+] Đã lưu file random txt bằng GET: ${fileName}`);
    res.send(`http://${req.headers.host}/txt/${fileName}`);
});

// POST upload m3u8 (vẫn chỉ cho POST)
app.post('/upload/m3u8', (req, res) => {
    const content = req.body;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.m3u8`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Đã lưu file m3u8: ${fileName}`);
    res.send(`http://${req.headers.host}/m3u8/${fileName}`);
});

// GET m3u8 file
app.get('/m3u8/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Không tìm thấy file m3u8 ~~');
    }
});

// Xoá file cũ hơn 12 giờ
setInterval(() => {
    const files = fs.readdirSync(UPLOAD_DIR);
    const now = Date.now();
    for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 12 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            console.log(`[!] Đã xoá file cũ: ${file}`);
        }
    }
}, 60 * 60 * 1000); // mỗi 1 giờ

// Start server
app.listen(PORT, () => {
    console.log(`[Mahiro UwU] Server chạy ngon lành tại: http://localhost:${PORT}`);
});
