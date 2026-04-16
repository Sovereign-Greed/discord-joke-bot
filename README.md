# 🤖 Discord Joke Bot  

Welcome to **Discord Joke Bot**, the bot nobody asked for but everyone needed! 🎉  

This is a fun side project I started to spice up my friends' Discord server with some good ol’ humor, banter, and random hilarity. Whether you're into dad jokes, meme references, or want to see some adorable cat pictures, Joke Bot's got you covered!  

---

## ✨ Features  

### 🔑 Trigger-based Replies  
It’s simple: you say something, and the bot replies with a preloaded zinger! For example:  
- **apples**: "Well I got her number, how\'d you like them apples"

Trigger keys = fun. Values = epic comebacks. It's the circle of Discord life.  

### 🐱 Meow-velous Cats 
Check out [**The Cat API**](https://thecatapi.com/) that I used.

### 🃏 Jokes Galore 
Check out the [**The Joke API**](https://v2.jokeapi.dev/) that I used.

---

## 📚 Documentation  
Want to make your own bot or just check out the magic behind the madness?  
The Discord.js documentation is your new best friend. It's well-written and a breeze to follow:  
[**Discord.js Docs**](https://discord.js.org)  

---

## 🚀 Quick Start  

1. Clone this repo and navigate into the directory:  
   ```bash  
   git clone git@github.com:Sovereign-Greed/discord-joke-bot.git 
   cd discord-joke-bot  
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create your local `.env` (copy from the template):
   ```bash
   npm run env:init
   ```
   Then edit `.env` and set **BOT_TOKEN**, **APPLICATION_ID**, and **PUBLIC_KEY** from the [Discord Developer Portal](https://discord.com/developers/applications) → your app → **General Information**.
4. Confirm variables are present and shaped correctly:
   ```bash
   npm run check-env
   ```
5. Start the bot (`prestart` runs `check-env` automatically):
   ```bash
   npm start
   ```  

## 🤝 Contributing  
Pull requests are welcome! Feel free to contribute by adding new triggers, enhancing APIs, or even optimizing the jokes.  

---

## 📜 License  
This project is licensed under the [ISC License](LICENSE).
