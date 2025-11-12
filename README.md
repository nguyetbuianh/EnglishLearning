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
## 🚀 Deployment Guide - NestJS with PM2 (Yarn Version)
### 📋 Table of Contents
- Prerequisites
- Quick Start
- Manual Setup
- Environment Configuration
- PM2 Management with Yarn
- Nginx Setup
### 🛠 Prerequisites
- System Requirements
  + OS: Ubuntu 18.04+ / CentOS 7+
  + Node.js: Version 16+ (Recommended: 18/20 LTS)
  + Yarn: Version 1.22+
  + Memory: Minimum 2GB RAM
  + Storage: Minimum 10GB free space
- Required Tools
  + node --version    # Should be 20+
  + yarn --version    # Should be 1.22+
  + git --version     # Any recent version
### ⚡ Quick Start
- Automated Deployment Script for Yarn
  + Download and run deployment script
    curl -L https://raw.githubusercontent.com/your-repo/deploy-yarn.sh | bash
  + Or clone and run
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    chmod +x deploy-yarn.sh
    ./deploy-yarn.sh
### 🔧 Manual Setup
1. Server Preparation
- Update system
  + sudo apt update && sudo apt upgrade -y
- Install essential packages
  + sudo apt install -y curl wget git build-essential
2. Node.js Installation
- Using NodeSource (Recommended)
  + curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  + sudo apt-get install -y nodejs
- Verify installation
  + node --version  # v20.x.x
  + npm --version   # 10.x.x
3. Yarn Installation
- Install Yarn globally
  + sudo npm install -g yarn
- Verify Yarn installation
  + yarn --version  # 1.22+
4. PM2 Installation
- Install PM2 globally with Yarn
  + sudo yarn global add pm2
- Verify PM2 installation
  + pm2 --version
5. Application Setup with Yarn
- Clone your repository
  + git clone https://github.com/your-username/your-repo.git
  + cd your-repo
- Install dependencies with Yarn
  + yarn install
### ⚙️ Environment Configuration
1. Create Environment File
cp .env.example .env
nano .env
2. Essential Environment Variables
env
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432  
DB_USER=postgres.itoairyddqpazggdsqoe  
DB_PASSWORD=Nguyet0806!!                
DB_NAME='postgres'   
                    
PORT=3000

MEZON_BOT_TOKEN=h36hgAnhHPWBywIH
MEZON_BOT_ID=1982695248266006528

CLOUD_NAME=dmja4ijh4
CLOUD_API_KEY=989356628938661
CLOUD_API_SECRET=t9Xe33U_d0qTizS-PIwxedjP1HY

GOOGLE_AI_API_KEY=AIzaSyBbtLEJwVq-G84UGFMlffhaSjpYky-tOqk
PEXELS_API_KEY=ecRp53ZQ1rHes8j4TP9H0L5WziuGXteKIiKscxUsZuTgOQwqK4gXjiUo

PEXELS_API_KEY=ecRp53ZQ1rHes8j4TP9H0L5WziuGXteKIiKscxUsZuTgOQwqK4gXjiUo

REDIS_HOST=redis-14576.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=14576
REDIS_PASSWORD=Q3M9vCqnzqnnLv3O93rfeUb796QgnheS
3. Build Application with Yarn
- Build for production
  + yarn build
- Verify build
  + ls -la dist/
### 🚀 PM2 Management with Yarn
1. Starting Application with Yarn Commands
- Method 1: Using yarn start:prod
  + pm2 start yarn --name "your-app" -- start:prod
- Method 2: Using yarn start
  + pm2 start yarn --name "your-app" -- start
- Method 3: Direct JS file execution
  + pm2 start dist/main.js --name "your-app"
- Method 4: With specific Yarn script
  + pm2 start yarn --name "your-app" -- run start:prod
2. PM2 Configuration for Yarn Projects
- Setup startup script
  + pm2 startup
- Save current process list
  + pm2 save
- Enable monitoring
  + pm2 monit
3. Yarn-specific PM2 Commands
- Check status
  + pm2 status
- View Yarn application logs
  + pm2 logs your-app
  + pm2 logs your-app --lines 50
- Restart Yarn application
  + pm2 restart your-app
- Stop Yarn application
  + pm2 stop your-app
- Delete application
  + pm2 delete your-app
- Reload (zero-downtime) - only for direct JS files
  + pm2 reload your-app
### 🌐 Nginx Setup (Same as before)
- Install Nginx
  + sudo apt install nginx -y
- Create Nginx Configuration
  + sudo nano /etc/nginx/sites-available/your-app
- Nginx Configuration Template
  nginx
  server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
  }
- Enable Site
  + sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
  + sudo rm /etc/nginx/sites-enabled/default
  + sudo nginx -t
  + sudo systemctl restart nginx
