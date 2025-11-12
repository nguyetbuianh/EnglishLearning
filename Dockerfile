# Dùng Node 22 làm base image
FROM node:22

# Đặt thư mục làm việc
WORKDIR /src

# Copy file cấu hình trước (để cache tốt hơn)
COPY package.json yarn.lock ./

# Cài dependencies (trực tiếp trong môi trường Linux)
RUN yarn install --frozen-lockfile --build-from-source

# Copy toàn bộ source code vào container
COPY . .

# Build app
RUN yarn build

# Expose port cho app (ví dụ 3000)
EXPOSE 3000

# Lệnh khởi chạy app
CMD ["yarn", "start"]
