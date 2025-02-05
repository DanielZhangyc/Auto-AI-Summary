import axios, { AxiosError } from 'axios';
import { encode } from 'gpt-tokenizer';
import { Notice } from 'obsidian';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        message: ChatMessage;
        finish_reason: string;
        index: number;
    }[];
}

const MAX_TOKENS = 4096;
const COMPLETION_TOKENS = 500;

export class OpenAIService {
    private apiKey: string;
    private baseUrl: string;
    private model: string;
    private systemPrompt: string;

    constructor(apiKey: string, baseUrl: string, model: string, systemPrompt: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.systemPrompt = systemPrompt;
    }

    private async makeRequest(messages: ChatMessage[]): Promise<string> {
        try {
            const response = await axios.post<ChatCompletion>(
                `${this.baseUrl}/v1/chat/completions`,
                {
                    model: this.model,
                    messages,
                    temperature: 0.7,
                    max_tokens: COMPLETION_TOKENS,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // 移除可能的markdown格式
            let summary = response.data.choices[0].message.content;
            summary = summary.replace(/[#*_`~]/g, ''); // 移除markdown标记
            summary = summary.replace(/\n+/g, ' '); // 将多个换行替换为空格
            return summary.trim();

        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 429) {
                    new Notice('API rate limit exceeded. Please try again later.');
                } else if (error.response?.status === 401) {
                    new Notice('Invalid API key. Please check your settings.');
                } else {
                    new Notice(`API Error: ${error.message}`);
                }
            } else {
                new Notice('An unexpected error occurred.');
            }
            throw error;
        }
    }

    private truncateContent(content: string): string {
        const systemTokens = encode(this.systemPrompt).length;
        const availableTokens = MAX_TOKENS - COMPLETION_TOKENS - systemTokens;
        
        const tokens = encode(content);
        if (tokens.length <= availableTokens) {
            return content;
        }

        // 截取tokens并解码回文本
        const truncatedTokens = tokens.slice(0, availableTokens);
        return new TextDecoder().decode(new Uint8Array(truncatedTokens));
    }

    public async generateSummary(content: string): Promise<string> {
        const truncatedContent = this.truncateContent(content);
        
        const messages: ChatMessage[] = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: truncatedContent }
        ];

        try {
            return await this.makeRequest(messages);
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }
} 