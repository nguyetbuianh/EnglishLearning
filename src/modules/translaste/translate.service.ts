import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import axios from 'axios';
import { VocabularyService } from "../vocabulary/vocabulary.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { Repository } from "typeorm";
import { Topic } from "../../entities/topic.entity";
import { TranslateResponse } from "../../responses/translate.response";

interface VocabularyData {
  word: string;
  part_of_speech: string;
  meaning: string;
  pronounce: string;
  example_sentence: string;
  is_english: boolean;
  topic: {
    name: string;
    type: string;
    description: string;
  }
}

@Injectable()
export class TranslateService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly vocabularyService: VocabularyService,

    @InjectRepository(Vocabulary)
    private readonly vocabularyRepo: Repository<Vocabulary>,

    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
  ) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('Missing GOOGLE_AI_API_KEY environment variable');

    this.apiKey = apiKey;
    this.baseUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  private async translateVocabularyWithAI(word: string, schemaPrompt: string): Promise<string> {
    try {
      const prompt = `Returns JSON to translate vocabulary from English to Vietnamese. 
      If the word is wrong, it will suggest the most suitable word, and if it is Vietnamese,
      return flase for the is_english field, the mean field is Vietnamese, all remaining fields are in English.: \`${word}\`.
      Structure: ${schemaPrompt}`;

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }
      );

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!result) throw new Error('Empty response from AI');

      return result;
    } catch (error) {
      throw new BadRequestException('Could not extract text or get AI response');
    }
  }

  async generateVocabularyTranslation(word: string): Promise<string> {
    const schema = `
      word: string;
      part_of_speech: string;
      meaning: string;
      pronounce: string;
      example_sentence: string;
      is_english: boolean;
      topic: {
        name: string;
        type: string;
        description: string;
      }
      
    `;
    return this.translateVocabularyWithAI(word, schema);
  }

  private parseJson<T>(raw: string): T {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err: unknown) {
      throw new BadRequestException('Data returned from AI is not valid JSON.');
    }
  }

  private async saveVocabulary(vocabulary: Vocabulary): Promise<void> {
    await this.vocabularyRepo.save(vocabulary);
  }

  private async findOrCreateTopicAndVocabulary(
    item: VocabularyData,
  ): Promise<Vocabulary> {
    if (item.is_english === false) {
      throw new BadRequestException('The provided word is not in English.');
    }
    let topic = await this.topicRepo.findOne({
      where: { name: item.topic.name },
    });

    if (!topic) {
      topic = this.topicRepo.create({
        name: item.topic.name,
        type: item.topic.type,
        description: item.topic.description,
      });

      await this.topicRepo.save(topic);
    }

    let vocabulary = await this.vocabularyRepo.findOne({
      where: { word: item.word },
      relations: ["topic"],
    });
    if (!vocabulary) {
      vocabulary = this.vocabularyRepo.create({
        word: item.word,
        partOfSpeech: item.part_of_speech,
        meaning: item.meaning,
        pronounce: item.pronounce,
        exampleSentence: item.example_sentence,
        topic: topic,
      });
    }

    return vocabulary;
  }

  async ingestVocabulary(word: string): Promise<VocabularyData> {
    const extractedText = await this.generateVocabularyTranslation(word);

    const item = this.parseJson<VocabularyData>(extractedText);

    const vocab = await this.findOrCreateTopicAndVocabulary(item);

    await this.saveVocabulary(vocab);

    return item;
  }

  async getOrCreateTranslation(word: string): Promise<TranslateResponse> {
    const existingWord = await this.vocabularyService.getVocabByWord(word);

    if (!existingWord) {
      const importedWord = await this.ingestVocabulary(word);

      return {
        word: importedWord.word,
        partOfSpeech: importedWord.part_of_speech,
        meaning: importedWord.meaning,
        pronounce: importedWord.pronounce,
        exampleSentence: importedWord.example_sentence
      };
    }

    return {
      word: existingWord.word,
      partOfSpeech: existingWord.partOfSpeech,
      meaning: existingWord.meaning,
      pronounce: existingWord.pronounce,
      exampleSentence: existingWord.exampleSentence
    };
  }
}