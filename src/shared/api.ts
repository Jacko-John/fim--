import { languages } from "vscode";

export interface ApiHandlerOptions {
  deepSeekApiKey?: string;
  RLCoderApiKey?: string;
}

export interface ModelConfig extends Record<string, any> {
  echo?: boolean;
  frequency_penalty?: number;
  logprobs?: number | null;
  max_tokens?: number;
  presence_penalty?: number;
  stop?: string | string[] | null;
  stream?: boolean;
  stream_options?: any;
  suffix?: string | null;
  temperature?: number;
  top_p?: number;
}

export const deepseekModels: Record<string, ModelConfig> = {
  "deepseek-chat": {
    echo: false,
    frequency_penalty: 0,
    logprobs: 0,
    max_tokens: 1024,
    presence_penalty: 0,
    stop: null,
    stream: false,
    stream_options: null,
    suffix: null,
    temperature: 1,
    top_p: 1,
  },
};

export const rlCoderModels = {
  rlcoder: {},
};

export interface RLCoderResItem {
  code_content: string;
  file_path: string;
  languages: string;
}
