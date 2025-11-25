import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GrokService {
  private readonly logger = new Logger(GrokService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('GROK_API_KEY');
    this.baseUrl = this.configService.get('GROK_API_URL', 'https://api.x.ai/v1');
    
    if (!this.apiKey) {
      this.logger.warn('GROK_API_KEY not found in environment variables');
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException('Grok API key not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const prompt = `Please provide a concise summary of the following content in maximum ${maxLength} characters. Focus on the main points and key information:\n\n${content}`;

      const response = await this.httpClient.post('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, accurate summaries of content. Focus on extracting the most important information and present it clearly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: Math.ceil(maxLength / 4), // Rough estimate for token count
        temperature: 0.3, // Lower temperature for more focused summaries
      });

      const summary = response.data.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        throw new Error('No summary generated from Grok API');
      }

      // Ensure summary doesn't exceed max length
      return summary.length > maxLength 
        ? summary.substring(0, maxLength - 3) + '...'
        : summary;

    } catch (error) {
      this.logger.error('Error generating summary with Grok API:', error);
      
      if (error.response?.status === 401) {
        throw new HttpException('Invalid Grok API key', HttpStatus.UNAUTHORIZED);
      } else if (error.response?.status === 429) {
        throw new HttpException('Grok API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      } else if (error.response?.status >= 500) {
        throw new HttpException('Grok API service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
      
      throw new HttpException('Failed to generate summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generatePostExcerpt(title: string, content: string): Promise<string> {
    const combinedContent = `Title: ${title}\n\nContent: ${content}`;
    return this.generateSummary(combinedContent, 150);
  }

  async generateTags(content: string, maxTags: number = 5): Promise<string[]> {
    if (!this.apiKey) {
      throw new HttpException('Grok API key not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const prompt = `Analyze the following content and suggest up to ${maxTags} relevant tags/keywords that would be appropriate for categorizing this content. Return only the tags as a comma-separated list, no additional text:\n\n${content}`;

      const response = await this.httpClient.post('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a content analyzer that extracts relevant tags/keywords from text. Return only the tags as a comma-separated list.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.4,
      });

      const tagsResponse = response.data.choices[0]?.message?.content?.trim();
      
      if (!tagsResponse) {
        return [];
      }

      // Parse comma-separated tags and clean them up
      const tags = tagsResponse
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .slice(0, maxTags);

      return tags;

    } catch (error) {
      this.logger.error('Error generating tags with Grok API:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  async improveContent(content: string, instruction: string): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException('Grok API key not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      const prompt = `${instruction}\n\nOriginal content:\n${content}`;

      const response = await this.httpClient.post('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled content editor and writer. Help improve the given content according to the specific instructions provided.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const improvedContent = response.data.choices[0]?.message?.content?.trim();
      
      if (!improvedContent) {
        throw new Error('No improved content generated from Grok API');
      }

      return improvedContent;

    } catch (error) {
      this.logger.error('Error improving content with Grok API:', error);
      throw new HttpException('Failed to improve content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
