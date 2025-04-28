# Chọn image Node.js nhẹ
FROM node:20-slim

# Tạo thư mục app
WORKDIR /app

# Copy file package.json và package-lock.json nếu có
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Tạo thư mục lưu file m3u8 nếu chưa có
RUN mkdir -p m3u8_files

# Mở port 3000
EXPOSE 3000

# Lệnh chạy server
CMD ["node", "server.js"]
