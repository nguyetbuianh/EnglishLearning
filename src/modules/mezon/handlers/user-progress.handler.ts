import { MezonClient } from "mezon-sdk";
import { BaseHandler, MChannelMessage } from "./base";
import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { UserService } from "src/modules/user/user.service";
import { MessageBuilder } from "../builders/message.builder";

interface Parts {
  partNumber: number,
  correctCount: number,
  attemptedCount: number,
  totalInPart: number,
  percent: number,
}

const TOTAL_QUESTIONS_BY_PART: Record<number, number> = {
  1: 6,
  2: 25,
  3: 39,
  4: 30,
  5: 30,
  6: 16,
  7: 54,
};

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_MY_PROGRESS)
export class UserProgressHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userProgressService: UserProgressService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.mezonMessage.sender_id;
      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!mezonUserId && !user) return;

      const userProgress = await this.userProgressService.getProgressByUserId(mezonUserId);
      if (!userProgress || userProgress.length === 0) {
        const noProgressMessage = new MessageBuilder()
          .createEmbed({
            color: "#db3f34",
            title: "📊 Your Learning Progress",
            description: "🔥 You don't have any learning progress yet. Start practicing to see your results here! 💪",
            footer: "English Learning Bot",
            timestamp: true,
          })
          .build();

        await this.mezonMessage.reply(noProgressMessage);
        return;
      }

      const progressByTest = new Map<number, { testId: number; parts: Parts[] }>();
      await Promise.all(
        userProgress.map(async (progress) => {
          try {
            const userAnswers = await this.userAnswerService.getUserAnswersByPartAndTest(
              progress.test.id,
              progress.part.id,
              user!.id);

            let attemptedCount = userAnswers.length;
            if (attemptedCount === 0) attemptedCount = 0;

            const correctCount = userAnswers.filter((a) => a.isCorrect).length;
            const totalInPart = TOTAL_QUESTIONS_BY_PART[progress.part.partNumber];
            const percent = Math.round((correctCount / totalInPart) * 100);

            let testProgress = 0;
            if (attemptedCount === totalInPart) {
              testProgress++;
            }

            if (!progressByTest.has(progress.test.id)) {
              progressByTest.set(progress.test.id, {
                testId: progress.test.id,
                parts: [],
              });
            }

            progressByTest.get(progress.test.id)!.parts.push({
              partNumber: progress.part.partNumber,
              correctCount: correctCount,
              attemptedCount: attemptedCount,
              totalInPart: totalInPart,
              percent: percent,
            });
          } catch (err) {
            console.log(err);
          }
        })
      );

      let allDescriptions = "";
      for (const testData of progressByTest.values()) {
        const sortedParts = [...testData.parts].sort(
          (a, b) => a.partNumber - b.partNumber
        );

        const completedParts = sortedParts.filter(p => p.attemptedCount === p.totalInPart).length;
        const partsDescription = sortedParts
          .map(
            (p) =>
              `🧩 *Part ${p.partNumber}*: ${p.correctCount}/${p.attemptedCount}/${p.totalInPart} (${p.percent}%)`
          )
          .join('\n');

        allDescriptions += `📘 *Test ${testData.testId}* — Progress: ${completedParts}/7 parts \n${partsDescription}\n\n`;
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#db3f34",
          title: "📊 Your Learning Progress",
          description: `*Correct / Attempted / Total Questions*\n\n${allDescriptions.trim()}`,
          footer: "English Learning Bot",
          timestamp: true,
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("❗Error handling the user progress handler:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }
}