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

// POST random .txt
app.post('/upload/txt', (req, res) => {
    const content = req.body;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Lưu random txt: ${fileName}`);
    res.send(`http://${req.headers.host}/txt/${fileName}`);
});

// POST cố định .txt
app.post('/upload/text/:filename', (req, res) => {
    const content = req.body;
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    let prefix = '';
    if (fs.existsSync(filePath)) {
        const current = fs.readFileSync(filePath, 'utf8');
        if (!current.endsWith('\n')) prefix = '\n';
    }

    fs.appendFileSync(filePath, prefix + content + '\n', 'utf8');
    console.log(`[+] Ghi thêm vào file cố định: ${filename}`);
    res.send(`http://${req.headers.host}/text/${filename}`);
});

// GET xem random .txt
app.get('/txt/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, path.basename(req.params.filename));
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else res.status(404).send('Không tìm thấy file txt');
});

// GET xem cố định .txt
app.get('/text/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, path.basename(req.params.filename));
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else res.status(404).send('Không tìm thấy file text');
});

// GET upload txt random bằng URL
app.get('/upload/txt/:content', (req, res) => {
    const content = req.params.content;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content + '\n', 'utf8');
    console.log(`[+] Lưu txt qua GET: ${fileName}`);
    res.send(`http://${req.headers.host}/txt/${fileName}`);
});

// GET upload txt cố định
app.get('/upload/text/:filename/:content', (req, res) => {
    const filename = req.params.filename;
    const content = req.params.content;
    const filePath = path.join(UPLOAD_DIR, filename);

    let prefix = '';
    if (fs.existsSync(filePath)) {
        const current = fs.readFileSync(filePath, 'utf8');
        if (!current.endsWith('\n')) prefix = '\n';
    }

    fs.appendFileSync(filePath, prefix + content + '\n', 'utf8');
    console.log(`[+] Ghi thêm vào file cố định qua GET: ${filename}`);
    res.send(`http://${req.headers.host}/text/${filename}`);
});

// POST upload m3u8
app.post('/upload/m3u8', (req, res) => {
    const content = req.body;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.m3u8`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Lưu file m3u8: ${fileName}`);
    res.send(`http://${req.headers.host}/m3u8/${fileName}`);
});

// GET xem file m3u8
app.get('/m3u8/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, path.basename(req.params.filename));
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else res.status(404).send('Không tìm thấy file m3u8');
});

// GET xoá file an toàn
app.get('/del/:filename', (req, res) => {
    const filename = req.params.filename;

    if (filename.includes('..') || path.isAbsolute(filename)) {
        return res.status(400).send('Tên file không hợp lệ!');
    }

    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`[x] Đã xoá file: ${safeFilename}`);
            res.send(`Đã xoá file: ${safeFilename}`);
        } catch (err) {
            console.error(`[!] Lỗi xoá file: ${err}`);
            res.status(500).send('Lỗi khi xoá file');
        }
    } else {
        res.status(404).send('Không tìm thấy file để xoá');
    }
});

// Xoá tự động file quá 12 giờ
setInterval(() => {
    const now = Date.now();
    fs.readdirSync(UPLOAD_DIR).forEach(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        try {
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > 12 * 60 * 60 * 1000) {
                fs.unlinkSync(filePath);
                console.log(`[!] Tự xoá file cũ: ${file}`);
            }
        } catch (e) {
            console.error(`[!] Lỗi khi kiểm tra file: ${file}`);
        }
    });
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`[Mahiro-chan] Server chạy tại http://localhost:${PORT}`);
});
