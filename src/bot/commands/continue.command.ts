// import { ToeicService } from "src/modules/toeic/toeic.service";
// import { CommandHandler } from "./command-handler.interface";
// import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
// import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
// import { parseMarkdown } from "../utils/parse-markdown";

// export class ContinueCommandHandler implements CommandHandler {
//   constructor(private toeicService: ToeicService) {}

//   async handle(channel: TextChannel, message: Message): Promise<void> {
//     const progress = await this.toeicService.getLastProgress(message.sender_id);
//     if (!progress) {
//       await message.reply(parseMarkdown("⚠️ You haven't started any test yet. Use *start <test_id> <part_id>"));
//       return;
//     }

//     const question = await this.toeicService.getQuestionById(progress.current_question_id);
//     await message.reply(parseMarkdown(`Resuming Test ${progress.test_id} Part ${progress.part_id}:\n${question.question_text}`));
//   }
// }