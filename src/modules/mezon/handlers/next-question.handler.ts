import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler } from "./base";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { PassageService } from "src/modules/toeic/services/passage.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { Question } from "src/entities/question.entity";
import { MMessageButtonClicked } from "./base";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { replyQuestionMessage } from "../utils/reply-question.util";
import { updateSession } from "../utils/update-session.util";

interface PartWithPassageParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
  currentPassageNumber?: number;
}

interface NormalPartParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
}

@Injectable()
@Interaction(CommandType.BUTTON_NEXT_QUESTION)
export class NextQuestionHandler extends BaseHandler<MMessageButtonClicked> {
  private static readonly COMPLETED_MESSAGE = { t: "✅ You have completed this part!" };

  constructor(
    protected readonly client: MezonClient,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly passageService: PassageService,
    private userProgressService: UserProgressService,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    const mezonUserId = this.event.user_id;
    if (!mezonUserId) return;

    const session = ToeicSessionStore.get(mezonUserId);
    if (!session?.testId || !session?.partId) {
      return;
    }

    const { testId, partId } = session;
    const existingProgress = await this.userProgressService.getProgress(mezonUserId, testId, partId);
    if (!existingProgress) {
      return;
    }

    if (partId === 6 || partId === 7) {
      await this.handlePartWithPassage({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        currentQuestionNumber: existingProgress.currentQuestionNumber,
        currentPassageNumber: existingProgress.currentPassageNumber,
      });
    } else {
      await this.handleNormalPart({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        currentQuestionNumber: existingProgress.currentQuestionNumber
      });
    }
  }

  private async handlePartWithPassage(partWithPassageParams: PartWithPassageParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber,
      currentPassageNumber,
    } = partWithPassageParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    let question = await this.toeicQuestionService.getQuestionWithPassage(
      testId,
      partId,
      nextQuestionNumber,
      currentPassageNumber
    );

    if (!question) {
      const nextPassageNumber = currentPassageNumber! + 1;
      const nextPassage = await this.passageService.getPassageDetail(
        testId,
        partId,
        nextPassageNumber
      );
      if (!nextPassage) {
        await this.userProgressService.updateProgress({
          userMezonId: mezonUserId,
          testId,
          partId,
          isCompleted: true,
        });
        await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(nextPassage.id);
      if (!firstQuestion) {
        await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      await this.userProgressService.updateProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: firstQuestion.passage.passageNumber,
      });

      updateSession(mezonUserId, firstQuestion);
      await replyQuestionMessage({
        question: firstQuestion,
        partId: partId,
        testId: testId,
        passage: nextPassage,
        mezonUserId: mezonUserId,
        mezonMessage: this.mezonMessage,
      });
      return;
    }

    await this.userProgressService.updateProgress({
      userMezonId: mezonUserId,
      testId,
      partId,
      currentQuestionNumber: nextQuestionNumber,
      currentPassageNumber: question.passage.passageNumber,
    });

    updateSession(mezonUserId, question);
    await replyQuestionMessage({
      question: question,
      partId: partId,
      testId: testId,
      passage: question.passage,
      mezonUserId: mezonUserId,
      mezonMessage: this.mezonMessage,
    });
  }

  private async handleNormalPart(normalPartParams: NormalPartParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber
    } = normalPartParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    const question = await this.toeicQuestionService.getQuestion(testId, partId, nextQuestionNumber);
    if (!question) {
      await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
      await this.userProgressService.updateProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        isCompleted: true,
      });
      return;
    }

    await this.userProgressService.updateProgress({
      userMezonId: mezonUserId,
      testId,
      partId,
      currentQuestionNumber: nextQuestionNumber,
    });

    updateSession(mezonUserId, question);
    await replyQuestionMessage({
      question: question,
      partId: partId,
      testId: testId,
      mezonUserId: mezonUserId,
      mezonMessage: this.mezonMessage,
    });
  }
}
