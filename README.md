# 🧠 ENGLISH LEARNING BOT

Welcome to the official documentation of **English Learning Bot**.  
This guide covers the **features**, **environment setup**, and **how to run the project**.

---

## 🚀 Features
- 📝 Practice TOEIC test  
- 📚 Learn vocabulary by TOEIC topics  
- 📈 Track your learning progress  
- 🎁 Daily challenges  

---

## 🧩 Tech Stack
- **Backend:** NestJS + TypeORM  
- **Database:** PostgreSQL  
- **Cloud Storage:** Cloudinary  

---

## 🔗 Usage
You can invite the bot into your clan using this link:  
👉 [Invite English Learning Bot](https://mezon.ai/developers/bot/install/1975032200969588736)

---

## ⚙️ Environment Variables
Create a `.env` file in the root folder and add the following (replace with your own credentials):

```env
# DATABASE
DB_HOST=your-db-host
DB_PORT=your-db-port  
DB_USER=your-db-user  
DB_PASSWORD=your-db-password               
DB_NAME=your-db-name   

# APP
PORT=your-port

# MEZON BOT
MEZON_BOT_TOKEN=your-mezon-bot-token
MEZON_BOT_ID=your-mezon-bot-id

# CLOUDINARY
CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-cloud-api
CLOUD_API_SECRET=your-cloud-api-secret

# GOOGLE
GOOGLE_AI_API_KEY=your-google-ai-api-key

# PEXELS
PEXELS_API_KEY=your-pexels-api-key

# REDIS
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```

## 🛠️ Setup Guide
1️⃣ Clone the repository
```
git clone https://github.com/nguyetbuianh/EnglishLearning.git
cd EnglishLearning
```
2️⃣ Install dependencies
```
yarn install
```
3️⃣ Create environment file
In the root directory, create a file named .env and paste the environment variables from the section above.
Make sure to replace the placeholders with your actual credentials.
4️⃣ Run database migrations (optional)
```
yarn migration:run
```
5️⃣ Start the project
Run the following command to start your application:
```
yarn start
```
Once the project starts successfully, the English Learning Bot will connect automatically to Mezon API 🚀

## 💡 Note
- Ensure that PostgreSQL and Redis servers are running before starting the app.
- Default timezone: Asia/Ho_Chi_Minh
- The bot will automatically connect and respond to user commands once deployed.



