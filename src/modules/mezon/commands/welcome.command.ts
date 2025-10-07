import { CommandHandler } from "../interfaces/command-handler.interface";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { handleBotError } from "../utils/error-handler";

export class WelcomeCommandHandler implements CommandHandler {
  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const welcomeMessage = `
        **🎓 ENGLISH MASTER BOT – YOUR TOEIC STUDY COMPANION 🎯**

        👋 **WELCOME!**
        I’m your AI assistant to help you improve English vocabulary, grammar, and TOEIC skills every day 💪  

        ---

        📘 **VOCABULARY**
        • *vocab <word> → Get meaning, examples, and synonyms  
        • *save <word> → Save the word to your study list  
        • *review → Review your saved vocabulary  

        ---

        🧠 **QUIZZES**
        • *quiz → Start a random TOEIC-style quiz  
        • *quiz part5 → Grammar & Vocabulary  
        • *quiz part6 → Text completion  

        ---

        📈 **PROGRESS**
        • *stats → Check your learning progress  
        • *goal <target_score> → Set your TOEIC goal  
        • *rank → See the leaderboard of top learners 🔥  

        ---

        💬 **QUICK START**
        1️⃣ Type *vocab hello to learn the word "hello"  
        2️⃣ Type *quiz to start a TOEIC-style quiz  
        3️⃣ Type *save work to add “work” to your study list  

        ---

        📚 **TIP**
        Study at least 15 minutes daily — your TOEIC score will soar 🚀  
      `.trim();

      await message.reply(parseMarkdown(welcomeMessage));

    } catch (error: any) {
      await handleBotError(channel, error);
    }
  }
}
