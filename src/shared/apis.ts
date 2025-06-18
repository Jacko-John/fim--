export interface ModelInfo {
  stream: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  n: number;
  stop?: string[] | null;
}

export const Models: Record<string, ModelInfo> = {
  deepseek: {
    frequency_penalty: 0,
    max_tokens: 1024,
    stop: null,
    stream: false,
    temperature: 1,
    top_p: 1,
    n: 1,
  },
  qwen: {
    stream: false,
    max_tokens: 512,
    temperature: 0,
    top_p: 0.7,
    frequency_penalty: 0.5,
    n: 1,
  },
  THUDM: {
    stream: false,
    max_tokens: 512,
    temperature: 0,
    top_p: 0.7,
    frequency_penalty: 0.5,
    n: 1,
  },
};

export interface RLCoderResItem {
  code_content: string;
  file_path: string;
  languages: string;
}

export interface APIResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: {
    message: {
      role: string;
      content: string;
    };
  }[];
  error?: any;
}
