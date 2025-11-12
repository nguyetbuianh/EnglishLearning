import { Injectable } from '@nestjs/common';
import { appConfig } from '../../../appConfig';
import { Vocabulary } from '../../../entities/vocabulary.entity';

interface PexelsPhoto {
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

@Injectable()
export class PexelsService {
  async getImage(vocab: Vocabulary): Promise<string> {
    try {
      const queryRaw = `${vocab.word} ${vocab.exampleSentence || ''}`;
      const query = queryRaw
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!query) throw new Error('Empty search query');

      const randomPage = Math.floor(Math.random() * 5) + 1;
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=15&page=${randomPage}`;

      const res = await fetch(url, {
        headers: { Authorization: appConfig.pexels.apiKey },
      });

      if (!res.ok) {
        throw new Error(`Pixabay returned ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as PexelsResponse;
      const randomIndex = Math.floor(Math.random() * data.photos.length);
      return data.photos[randomIndex].src.medium;
    } catch (error) {
      console.error(`❌ Error fetching image from Pixabay: ${error}`);
      return 'https://placehold.co/600x400?text=No+Image+Found';
    }
  }
}
