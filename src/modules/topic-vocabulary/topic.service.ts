import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Topic } from "../../entities/topic.entity";
import { In, Repository } from "typeorm";
import { SubmitTopicTestInterface } from "../../interfaces/submit-test.interface";
import { UserService } from "../user/user.service";
import { User } from "../../entities/user.entity";
import { StatService } from "../stat/stat.service";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { TopicTestResultResponse, TopicTestQuestionResult } from "../../responses/topic-response";
import { TopicDto } from "../../dtos/topic.dto";

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicVocabularyRepo: Repository<Topic>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepo: Repository<Vocabulary>,
    private readonly userService: UserService,
    private readonly statService: StatService,
  ) { }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicVocabularyRepo.find({
      order: { id: 'ASC' }
    })
  }

  async save(topic: Topic): Promise<Topic | null> {
    return this.topicVocabularyRepo.save(topic);
  }

  async getTopicById(topicId: number): Promise<Topic> {
    const topic = await this.topicVocabularyRepo.findOne({
      where: {
        id: topicId
      }
    });
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async getAllTopicsPagination(page: number, limit: number): Promise<{ data: Topic[]; total: number }> {
    const [data, total] = await this.topicVocabularyRepo.findAndCount({
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total
    }
  }

  async getRandomTopics(): Promise<Topic[]> {
    const ids = await this.topicVocabularyRepo
      .createQueryBuilder('topic')
      .select('topic.id')
      .getMany();

    if (ids.length === 0) return [];

    const shuffled = ids
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(i => i.id);

    return this.topicVocabularyRepo.findBy({ id: In(shuffled) });
  }

  async handleSubmitAnswers(submitTest: SubmitTopicTestInterface): Promise<TopicTestResultResponse> {
    const { topicId, userId, userMezonId, submitAnswers } = submitTest;

    await this.getTopicById(topicId);

    const user = await this.userService.getUser(userMezonId, false) as User;
    if (!user) throw new NotFoundException('User not found');

    if (!submitAnswers || submitAnswers.length === 0) {
      throw new NotFoundException('No answers submitted');
    }

    const normalize = (value?: string) => value?.trim().toLowerCase() ?? '';

    const vocabIds = submitAnswers.map(a => Number(a.questionId));

    const vocabularies = await this.vocabularyRepo.find({
      where: {
        id: In(vocabIds),
        topic: { id: topicId },
        isActive: true
      }
    });

    if (!vocabularies.length) {
      throw new NotFoundException('No vocabularies found for submitted answers');
    }

    const vocabMap = new Map<number, Vocabulary>(
      vocabularies.map(v => [Number(v.id), v])
    );

    let totalQuestions = 0;
    let correctCount = 0;
    let scoreChange = 0;
    const questions: TopicTestQuestionResult[] = [];

    submitAnswers.forEach((ans) => {
      const ansId = Number(ans.questionId);
      const vocab = vocabMap.get(ansId);
      if (!vocab) return;

      totalQuestions++;

      const userAnswer = normalize(ans.answer);
      const meaningVariants = vocab.meaning
        ?.split(/[;,]/)
        .map(normalize)
        .filter(Boolean) ?? [];
      const isCorrect =
        meaningVariants.includes(userAnswer) ||
        normalize(vocab.word) === userAnswer;

      if (isCorrect) {
        correctCount++;
        scoreChange += 5;
      } else {
        scoreChange -= 5;
      }

      questions.push({
        id: vocab.id,
        word: vocab.word,
        pronounce: vocab.pronounce,
        partOfSpeech: vocab.partOfSpeech,
        meaning: vocab.meaning,
        exampleSentence: vocab.exampleSentence,
        userAnswer: ans.answer,
        isCorrect
      });
    });
    await this.statService.updateUserStatsInApi(userId, {
      totalQuestions,
      correctCount,
      scoreChange
    });

    return {
      totalQuestions,
      correctCount,
      scoreChange,
      questions
    };
  }

  async getTopicsByUser(userId: number): Promise<Topic[]> {
    const topics = await this.topicVocabularyRepo.find({
      where: { userId },
      order: { id: 'ASC' },
    });
    if (!topics) throw new NotFoundException('Topics not found');
    return topics;
  }

  async createTopic(createTopicDto: TopicDto, userId: number): Promise<Topic> {
    const topic = this.topicVocabularyRepo.create({
      name: createTopicDto.name,
      type: createTopicDto.type,
      description: createTopicDto.description,
      userId: userId
    });

    return await this.topicVocabularyRepo.save(topic);
  }

  async updateTopic(topicId: number, updateTopicDto: TopicDto, userId: number): Promise<Topic> {
    const topic = await this.topicVocabularyRepo.findOne({
      where: { id: topicId, userId }
    });
    if (!topic) throw new NotFoundException('Topic not found');

    topic.name = updateTopicDto.name;
    topic.type = updateTopicDto.type;
    topic.description = updateTopicDto.description;

    return await this.topicVocabularyRepo.save(topic);
  }

  async deleteTopic(topicId: number, userId: number): Promise<void> {
    await this.topicVocabularyRepo.delete({ id: topicId, userId });
  }
}