export interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

export interface DeepSeekCodeCompletionConfig {
  // 基本参数
  model: string;
  prompt: string;
  suffix?: string | null;

  // 生成控制参数
  max_tokens?: number;
  temperature?: number;
  top_p?: number;

  // 代码特定参数
  stop?: string | string[] | null;

  // 高级参数
  frequency_penalty?: number;
  presence_penalty?: number;
  echo?: boolean;
  logprobs?: number | null;

  // 流式处理
  stream?: boolean;
  stream_options?: any;
}
