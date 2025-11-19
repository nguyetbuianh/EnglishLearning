import { BadRequestException, Injectable } from "@nestjs/common";
import axios from 'axios';

@Injectable()
export class TranslateService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('Missing GOOGLE_AI_API_KEY environment variable');

    this.apiKey = apiKey;
    this.baseUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  private async translateText(word: string, schemaPrompt: string): Promise<string> {
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
  async translateWord(word: string): Promise<string> {
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
    return this.translateText(word, schema);
  }
}