import OpenAI from "openai";
import { DeepSeekCodeCompletionConfig, DeepSeekConfig } from "../../shared/api";

export class DeepSeekHandler {
  private openaiClient: OpenAI;
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = {
      baseURL: "https://api.deepseek.com/beta",
      apiKey: config.apiKey,
    };

    // 初始化OpenAI客户端
    this.openaiClient = new OpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
    });
  }

  /**
   * 使用OpenAI SDK发送完成请求
   */
  async completion(params: DeepSeekCodeCompletionConfig) {
    try {
      const completion = await this.openaiClient.completions.create({
        model: params.model,
        prompt: params.prompt,
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        stop: params.stop,
        suffix: params.suffix,
        // 其他参数
      });
      return completion;
    } catch (error) {
      console.error("Error in DeepSeek completion:", error);
      throw error;
    }
  }
}
