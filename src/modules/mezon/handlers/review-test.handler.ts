import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { MessageBuilder } from "../builders/message.builder";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { UserService } from "src/modules/user/user.service";
import { UserAnswer } from "src/entities/user-answer.entity";

interface PartStat {
  correct: number;
  total: number;
  details: { questionNumber: number; isCorrect: boolean }[];
}

interface ToeicScoreSummary {
  listeningCorrect: number;
  listeningTotal: number;
  readingCorrect: number;
  readingTotal: number;
  listeningScore: number;
  readingScore: number;
  totalScore: number;
}

@Interaction(CommandType.BUTTON_REVIEW_TEST)
@Injectable()
export class ReviewTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService,
  ) {
    super(client);
  }

  private calculateToeicScore(correct: number, total: number): number {
    if (total === 0) return 0;
    const rawScore = (correct / total) * 495;
    return Math.max(0, Math.round(rawScore));
  }

  private buildPartStats(userAnswers: UserAnswer[]): Map<number, PartStat> {
    const partStats = new Map<number, PartStat>();

    for (const ua of userAnswers) {
      const partNumber = ua.toeicPart.partNumber;
      if (!partStats.has(partNumber)) {
        partStats.set(partNumber, { correct: 0, total: 0, details: [] });
      }

      const stat = partStats.get(partNumber)!;
      stat.total++;
      stat.details.push({
        questionNumber: ua.question.questionNumber,
        isCorrect: ua.isCorrect,
      });

      if (ua.isCorrect) stat.correct++;
    }

    return partStats;
  }

  private computeToeicScore(partStats: Map<number, PartStat>): ToeicScoreSummary {
    let listeningCorrect = 0,
      listeningTotal = 0,
      readingCorrect = 0,
      readingTotal = 0;

    for (const [partNumber, stat] of partStats.entries()) {
      if (partNumber <= 4) {
        listeningCorrect += stat.correct;
        listeningTotal += stat.total;
      } else {
        readingCorrect += stat.correct;
        readingTotal += stat.total;
      }
    }

    const listeningScore = this.calculateToeicScore(listeningCorrect, listeningTotal);
    const readingScore = this.calculateToeicScore(readingCorrect, readingTotal);
    const totalScore = listeningScore + readingScore;

    return {
      listeningCorrect: listeningCorrect,
      listeningTotal: listeningTotal,
      readingCorrect: readingCorrect,
      readingTotal: readingTotal,
      listeningScore: listeningScore,
      readingScore: readingScore,
      totalScore: totalScore,
    };
  }

  private formatPartDetails(partStats: Map<number, PartStat>): string {
    let result = "";

    for (const [partNumber, stat] of partStats.entries()) {
      const correctIcon = stat.correct === stat.total ? "💯" : "📊";
      const detailLines = stat.details
        .map((d) => `• Q${d.questionNumber}: ${d.isCorrect ? "✅" : "❌"}`)
        .join("\n");

      result += `
      ━━━━━━━━━━━━━━━━━━━━━━━
      Part ${partNumber} ${correctIcon}
      > ✅ Correct: ${stat.correct}/${stat.total}
      ${detailLines}
      `;
    }

    return result;
  }

  private getScoreMessage(totalScore: number): { emoji: string; message: string } {
    if (totalScore >= 850) {
      return {
        emoji: "🥇",
        message: "Outstanding performance! You’re a TOEIC master!",
      };
    } else if (totalScore >= 700) {
      return { emoji: "🥈", message: "Great job! You’re doing really well!" };
    } else if (totalScore >= 500) {
      return { emoji: "🥉", message: "Nice effort! You’re on the right track!" };
    } else {
      return { emoji: "🔥", message: "Keep practicing, you’re improving!" };
    }
  }

  private buildResultEmbed(
    summary: ToeicScoreSummary,
    partStats: Map<number, PartStat>,
  ) {
    const { emoji, message } = this.getScoreMessage(summary.totalScore);
    const partDetails = this.formatPartDetails(partStats);

    return new MessageBuilder()
      .createEmbed({
        color: "#00bfa5",
        title: `${emoji} TOEIC Test Completed!`,
        description: `
      ━━━━━━━━━━━━━━━━━━━━━━━
      🎧 Listening
      > ✅ Correct: ${summary.listeningCorrect}/${summary.listeningTotal}
      > 🧮 Score: ${summary.listeningScore} / 495

      📖 Reading
      > ✅ Correct: ${summary.readingCorrect}/${summary.readingTotal}
      > 🧮 Score: ${summary.readingScore} / 495

      ━━━━━━━━━━━━━━━━━━━━━━━
      🏆 Total Score: ${summary.totalScore} / 990

      💬 ${message}

      ${partDetails}

      ━━━━━━━━━━━━━━━━━━━━━━━
      🎓 Keep practicing to reach your target score! 💪
              `,
        footer: "English Learning Bot | TOEIC Practice Results",
        timestamp: true,
      })
      .build();
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const session = ToeicSessionStore.get(mezonUserId);
      if (!session?.testId) {
        await this.mezonMessage.reply({
          t: "⚠️ You don’t have an active TOEIC test session.",
        });
        return;
      }

      const { testId } = session;
      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) return;

      const userAnswers = await this.userAnswerService.getUserAnswersByTest(user.id, testId);
      if (!userAnswers || userAnswers.length === 0) {
        await this.mezonMessage.reply({
          t: "❌ No answers found for this test.",
        });
        return;
      }
      const partStats = this.buildPartStats(userAnswers);

      const summary = this.computeToeicScore(partStats);

      const messagePayload = this.buildResultEmbed(summary, partStats);

      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❗Error in ReviewTestHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}
