import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { UserService } from "src/modules/user/user.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { UserAnswer } from "src/entities/user-answer.entity";
import { OptionEnum } from "src/enum/option.enum";
import { parseOption } from "src/utils/option.util";
import { MMessageButtonClicked } from "./base";

@Interaction("answer")
@Injectable()
export class UserAnswerHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly questionService: ToeicQuestionService,
    private readonly userService: UserService,
    private readonly toeicPartService: ToeicPartService,
    private readonly toeicTestService: ToeicTestService,
    private readonly userAnswerService: UserAnswerService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const buttonId = this.event.button_id;
      const [prefix, questionId, optionLabelString, mezonId] = buttonId.split("_")

      const questionIdNumber = Number(questionId);
      const chosenOption = parseOption(optionLabelString);

      if (!chosenOption) {
        await this.mezonMessage.reply({ t: "⚠️ Invalid option selected." });
        return;
      }

      const question = await this.questionService.findQuestionById(questionIdNumber);
      if (!question) {
        await this.mezonMessage.reply({ t: "⚠️ Question not found." });
        return;
      }

      const existingUser = await this.userService.findUserByMezonId(mezonId);
      if (!existingUser) {
        await this.mezonMessage.reply({ t: "⚠️ User not found." });
        return;
      }

      const isCorrect = question.correctOption === chosenOption;

      await this.saveUserAnswer(
        existingUser.id,
        chosenOption,
        isCorrect,
        question.part.id,
        question.test.id
      );

      const message = isCorrect ? "✅ Correct!" : "❌ Wrong answer.";
      await this.mezonMessage.reply({ t: message });

    } catch (error) {
      console.error("UserAnswerHandler Error:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while fetching User Answer. Please try again later.",
      });
    }
  }
  private async saveUserAnswer(
    userId: number,
    chosenOption: OptionEnum,
    isCorrect: boolean,
    partId: number,
    testId: number
  ): Promise<void> {
    try {
      const existingUser = await this.userService.findUserById(userId);
      if (!existingUser) {
        console.warn(`⚠️ User with user id ${userId} not found`);
        return;
      }
      const existingPart = await this.toeicPartService.findPartById(partId);
      if (!existingPart) {
        console.warn(`⚠️ Part with part id ${partId} not found`);
        return;
      }
      const existingTest = await this.toeicTestService.findTestById(testId);
      if (!existingTest) {
        console.warn(`⚠️ User with test id ${testId} not found`);
        return;
      }

      const newUserAnswer = new UserAnswer();
      newUserAnswer.user = existingUser;
      newUserAnswer.chosenOption = chosenOption;
      newUserAnswer.isCorrect = isCorrect;
      newUserAnswer.toeicPart = existingPart;
      newUserAnswer.toeicTest = existingTest;

      await this.userAnswerService.recordAnswer(newUserAnswer);


    } catch (error) {
      console.error("❌ Failed to save user answer:", error);
    }
  }
}
