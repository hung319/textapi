const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const folderM3U8 = path.join(__dirname, 'm3u8_files');
const folderTXT = path.join(__dirname, 'txt_files');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(folderM3U8)) fs.mkdirSync(folderM3U8);
if (!fs.existsSync(folderTXT)) fs.mkdirSync(folderTXT);

// Middleware
app.use(cors());
app.use(express.text({ limit: '10mb' }));

// Tự động xoá file quá 12 tiếng
setInterval(() => {
    const now = Date.now();
    const maxAge = 12 * 60 * 60 * 1000; // 12h tính bằng mili giây

    [folderM3U8, folderTXT].forEach(folder => {
        fs.readdir(folder, (err, files) => {
            if (err) return console.error('Lỗi đọc thư mục:', err);

            files.forEach(file => {
                const filepath = path.join(folder, file);
                fs.stat(filepath, (err, stats) => {
                    if (err) return console.error('Lỗi đọc file:', err);
                    
                    if (now - stats.mtimeMs > maxAge) {
                        fs.unlink(filepath, (err) => {
                            if (err) console.error('Lỗi xoá file:', err);
                            else console.log(`[+] Đã tự động xoá file: ${file}`);
                        });
                    }
                });
            });
        });
    });
}, 10 * 60 * 1000); // Kiểm tra mỗi 10 phút

// Upload m3u8
app.post('/upload/m3u8', (req, res) => {
    const content = req.body;
    if (!content) {
        return res.status(400).send('Không có nội dung gửi lên!');
    }

    const filename = Math.random().toString(36).substring(2, 10) + '.m3u8';
    const filepath = path.join(folderM3U8, filename);

    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error('Lỗi khi lưu file:', err);
            return res.status(500).send('Lỗi server khi lưu file!');
        }

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const fileUrl = `${protocol}://${host}/m3u8/${filename}`;

        console.log(`[+] File .m3u8 mới lưu: ${filename}`);
        console.log(`[+] Link truy cập: ${fileUrl}`);
        
        res.send(fileUrl);
    });
});

// Upload txt
app.post('/upload/txt', (req, res) => {
    const content = req.body;
    if (!content) {
        return res.status(400).send('Không có nội dung gửi lên!');
    }

    const filename = Math.random().toString(36).substring(2, 10) + '.txt';
    const filepath = path.join(folderTXT, filename);

    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error('Lỗi khi lưu file:', err);
            return res.status(500).send('Lỗi server khi lưu file!');
        }

        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const fileUrl = `${protocol}://${host}/txt/${filename}`;

        console.log(`[+] File .txt mới lưu: ${filename}`);
        console.log(`[+] Nội dung file:\n${content}`);
        console.log(`[+] Link truy cập: ${fileUrl}`);
        
        res.send(fileUrl);
    });
});

// Phục vụ file tĩnh
app.use('/m3u8', express.static(folderM3U8));
app.use('/txt', express.static(folderTXT));

// Start server
app.listen(PORT, () => {
    console.log(`Mahiro Server đang chạy tại http://localhost:${PORT} ~~ UwU ~~`);
});
