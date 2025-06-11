export interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

export interface DeepSeekCompletionConfig {
  model: string;
  messages: DeepSeekMessage[];
}

interface DeepSeekMessage {
  role: string;
  content: string;
}
