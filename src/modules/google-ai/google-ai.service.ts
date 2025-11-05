import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class GoogleAIService {
  private readonly logger = new Logger(GoogleAIService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('Missing GOOGLE_AI_API_KEY environment variable');

    this.apiKey = apiKey;
    this.baseUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  private async processPdf(pdfBuffer: Buffer, schemaPrompt: string): Promise<string> {
    try {
      const uint8Array = new Uint8Array(pdfBuffer);
      const parser = new PDFParse(uint8Array);
      const extractedText = await parser.getText();

      const prompt = `Return a JSON array for this TOEIC PDF content: \`${extractedText.text}\`.
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
    } catch (error: any) {
      this.logger.error('PDF extraction or AI request failed:', error.message);
      throw new BadRequestException('Could not extract text or get AI response');
    }
  }

  async generateTextPart1Anwser(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    question_number: number;
    question_string: Look at the picture;
    correct_option: string;
    answer: { A: string; B: string; C: string; D: string }
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generateTextPart2Answer(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    question_number: number;
    answer: {question_string: string; A: string; B: string; C: string } }}]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generateTextPart34Question(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{
     question_number: number;
     question_string: string;
     answer: { A: string; B: string; C: string; D: string }
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generateTextPart34Answer(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    question_number: number;
    passage: string;
    correct: { A: string; B: string; C: string; D: string }
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generateTextPart5Question(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    question_number: number;
    question_string: string;
     answer: { A: string; B: string; C: string; D: string }
     }]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generatePassagePart6Question(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    passage_number: string;
    passage: string;
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }
  async generateTextPart6Question(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    question_number: number;
    answer: { A: string; B: string; C: string; D: string }
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }

  async generateTextPart7Question(pdfBuffer: Buffer): Promise<string> {
    const schema = `[{ 
    passage_number: string;
    passage: string;
    question_number: number;
    question_string: string;
    answer: { A: string; B: string; C: string; D: string }
    }]`;
    return this.processPdf(pdfBuffer, schema);
  }
}