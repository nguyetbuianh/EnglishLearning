import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GoogleAIService } from '../google-ai/google-ai.service';
import { ToeicQuestionService } from '../toeic/services/toeic-question.service';
import { ToeicTestService } from '../toeic/services/toeic-test.service';
import { ToeicPartService } from '../toeic/services/toeic-part.service';
import { PassageService } from '../toeic/services/passage.service';
import { Question } from 'src/entities/question.entity';
import { Passage } from 'src/entities/passage.entity';
import { OptionEnum } from 'src/enum/option.enum';
import { ToeicPart } from 'src/entities/toeic-part.entity';
import { ToeicTest } from 'src/entities/toeic-test.entity';
import { QuestionOptionService } from '../question-option/question-option.service';
import { QuestionOption } from 'src/entities/question-option.entity';

interface ToeicQuestionData {
  question_number: number;
  question_string: string;
  correct_option?: OptionEnum | string;
  answer: string | Record<string, string>;
}

interface PassageData extends ToeicQuestionData {
  passage_number: number;
  passage: string;
}

@Injectable()
export class ToeicImportService {
  private readonly logger = new Logger(ToeicImportService.name);

  constructor(
    private readonly googleAiService: GoogleAIService,
    private readonly questionService: ToeicQuestionService,
    private readonly testService: ToeicTestService,
    private readonly partService: ToeicPartService,
    private readonly passageService: PassageService,
    private readonly questionOptionService: QuestionOptionService,
  ) { }

  private parseJson<T>(raw: string): T[] {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T[];
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error('Lỗi parse JSON:', err.message);
      }
      throw new BadRequestException('Dữ liệu trả về từ AI không hợp lệ JSON.');
    }
  }

  private buildQuestion(
    part: ToeicPart,
    test: ToeicTest,
    item: ToeicQuestionData,
    passage?: Passage,

  ): Question {
    const question = new Question();
    question.part = part;
    question.test = test;
    question.questionNumber = item.question_number;
    question.questionText = item.question_string ?? '';
    question.correctOption =
      (item.correct_option as OptionEnum) ?? OptionEnum.A;



    question.explanation =
      typeof item.answer === 'string'
        ? item.answer

        : Object.entries(item.answer)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
    return question;
  }
  private buildQuestion34(
    part: ToeicPart,
    test: ToeicTest,
    item: ToeicQuestionData,
    passage?: Passage,

  ): Question {
    const question = new Question();
    question.part = part;
    question.test = test;
    question.questionNumber = item.question_number;
    question.questionText = item.question_string ?? '';
    question.correctOption =
      (item.correct_option as OptionEnum) ?? OptionEnum.A;
    return question;
  }

  private buildQuestionOptions(item: ToeicQuestionData, question: Question) {
    if (typeof item.answer !== 'object') return [];
    return Object.entries(item.answer)
      .map(([key, value]) => ({
        question,
        optionLabel: key as OptionEnum,
        optionText: value,
      }));
  }


  private async saveQuestionWithLog(question: Question): Promise<void> {
    this.logger.log(
      `Lưu câu hỏi ${question.questionNumber} - ${question.questionText?.slice(0, 60)}...`,
    );
    const saved = await this.questionService.saveQuestion(question);
    this.logger.debug(`→ Saved question ID: ${saved.id}`);
  }

  async uploadPDF(
    testNumber: number,
    partNumber: number,
    qaItem: string,
    pdf: Buffer,
  ): Promise<{ success: boolean; total: number; data: ToeicQuestionData[] | PassageData[] }> {
    if (!pdf?.length) throw new BadRequestException('Invalid PDF file');

    const test = await this.testService.findTestById(testNumber);
    if (!test) throw new BadRequestException('Không tồn tại bài test');

    const part = await this.partService.findPartById(partNumber);
    if (!part) throw new BadRequestException('Không tồn tại part');

    let extractedText = '';
    let jsonData: ToeicQuestionData[] | PassageData[] = [];

    // --- PART 1 ---
    if (partNumber === 1 && qaItem === 'answer') {
      extractedText = await this.googleAiService.generateTextPart1Anwser(pdf);
      jsonData = this.parseJson<ToeicQuestionData>(extractedText);


      for (const item of jsonData) {
        const q = this.buildQuestion(part, test, item);
        await this.saveQuestionWithLog(q);
      }
    }

    // --- PART 2 ---
    else if (partNumber === 2 && qaItem === 'answer') {
      extractedText = await this.googleAiService.generateTextPart2Answer(pdf);
      jsonData = this.parseJson<ToeicQuestionData>(extractedText);

      for (const item of jsonData) {
        const q = this.buildQuestion(part, test, item);
        q.questionText = 'Listening';
        await this.saveQuestionWithLog(q);
      }
    }

    // --- PART 3–4: Question ---
    else if ((partNumber === 3 || partNumber === 4) && qaItem === 'question') {
      extractedText = await this.googleAiService.generateTextPart34Question(pdf);
      jsonData = this.parseJson<ToeicQuestionData>(extractedText);

      for (const item of jsonData) {
        const q = this.buildQuestion34(part, test, item);
        await this.saveQuestionWithLog(q);

        const options = this.buildQuestionOptions(item, q);
        for (const opt of options) {
          const savedOpt = new QuestionOption();
          if (opt.question?.id) {
            savedOpt.question = opt.question;
          } else {
            continue;
          }
          savedOpt.optionLabel = opt.optionLabel;
          savedOpt.optionText = opt.optionText;
          await this.questionOptionService.saveQuestionOptions(savedOpt);
        }
      }
    }

    // --- PART 3–4: Answer ---
    else if ((partNumber === 3 || partNumber === 4) && qaItem === 'answer') {
      extractedText = await this.googleAiService.generateTextPart34Answer(pdf);
      jsonData = this.parseJson<PassageData>(extractedText);

      for (const rawItem of jsonData) {
        const item = rawItem as PassageData;
        try {
          const questionUpdate = new Question();
          questionUpdate.explanation =
            typeof item.passage === 'string'
              ? item.passage
              : Object.entries(item.passage)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
          const existingQuestion = await this.questionService.getQuestion(
            test.id,
            part.id,
            item.question_number,
          );

          if (!existingQuestion) {
            throw new Error('Question not found');
          }
          console.log(questionUpdate);
          await this.questionService.updateQuestion(
            part.id,
            test.id,
            item.question_number,
            questionUpdate,
          );
          this.logger.debug(`Đã cập nhật câu hỏi ${item.question_number}`);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          this.logger.error(`Lỗi khi cập nhật câu hỏi ${item.question_number}: ${message}`);
        }
      }
    }

    // --- PART 5 ---
    else if (partNumber === 5 && qaItem === 'question') {
      extractedText = await this.googleAiService.generateTextPart5Question(pdf);
      jsonData = this.parseJson<ToeicQuestionData>(extractedText);

      for (const item of jsonData) {
        const q = this.buildQuestion34(part, test, item);
        await this.saveQuestionWithLog(q);

        const options = this.buildQuestionOptions(item, q);
        for (const opt of options) {
          const savedOpt = new QuestionOption();
          if (opt.question?.id) {
            savedOpt.question = opt.question;
          } else {
            continue;
          }
          savedOpt.optionLabel = opt.optionLabel;
          savedOpt.optionText = opt.optionText;
          await this.questionOptionService.saveQuestionOptions(savedOpt);
        }
      }
    }

    // --- PART 6 7 ---
    else if (partNumber === 6 || partNumber === 7 && qaItem === 'question') {
      const extractedPassage = await this.googleAiService.generatePassagePart67Question(pdf);
      const passageData = this.parseJson<PassageData>(extractedPassage);

      let passageIndex = 1;
      for (const passag of passageData) {
        const passage = new Passage();
        passage.part = part;
        passage.test = test;
        passage.passageNumber = passageIndex++;
        passage.content = passag.passage;

        const savedPassage = await this.passageService.savePassage(passage);
        this.logger.log(`✅ Saved passage #${passage.passageNumber}`);
      }
      const extractedText = await this.googleAiService.generateTextPart67Question(pdf);
      const textData = this.parseJson<ToeicQuestionData>(extractedText);
      for (const item of textData) {
        const q = this.buildQuestion34(part, test, item);
        await this.saveQuestionWithLog(q);

        this.logger.log(
          `✅ Saved ${textData.length} questions`,
        );

        const options = this.buildQuestionOptions(item, q);
        for (const opt of options) {
          const savedOpt = new QuestionOption();
          if (opt.question?.id) {
            savedOpt.question = opt.question;
          } else {
            continue;
          }
          savedOpt.optionLabel = opt.optionLabel;
          savedOpt.optionText = opt.optionText;
          await this.questionOptionService.saveQuestionOptions(savedOpt);
        }
      }
    }

    if (!extractedText?.trim()) {
      throw new BadRequestException('Không thể trích xuất được nội dung từ PDF.');
    }

    return {
      success: true,
      total: jsonData.length,
      data: jsonData,
    };
  }
}
