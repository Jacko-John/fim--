import OpenAI from "openai";
import { ApiHandler } from "..";
import { ApiHandlerOptions } from "../../shared/api";
import { CompletionRequestBuilder } from "../builder/deepseek";
import { DeepSeekCompletionConfig } from "../../types/deepseek";
import { ChatCompletionMessage } from "openai/resources.mjs";

export class DeepSeekHandler implements ApiHandler {
  private options: ApiHandlerOptions;
  private client: OpenAI;

  /**
   * 构造函数
   * @param options API 处理器选项
   */
  constructor(options: ApiHandlerOptions) {
    this.options = options;
    this.client = new OpenAI({
      baseURL: "https://api.deepseek.com/beta",
      apiKey: this.options.deepSeekApiKey,
    });
  }

  /**
   * 创建请求构建器
   * @returns 请求构建器实例
   */
  createRequestBuilder(): CompletionRequestBuilder {
    return new CompletionRequestBuilder();
  }

  async completion(params: DeepSeekCompletionConfig) {
    try {
      const completion = await this.client.chat.completions.create({
        model: params.model,
        messages: params.messages as ChatCompletionMessage[],
      });
      return completion;
    } catch (error) {
      console.error("Error in DeepSeek completion:", error);
      throw error;
    }
  }

  /**
   * 创建上下文感知的代码补全
   * @param codeContext 代码上下文
   * @param options 补全选项
   * @returns 补全结果或流
   */
  async createCodeCompletion(
    codeContext: {
      prefix: string;
      suffix?: string;
      language?: string;
    },
    options?: Partial<DeepSeekCompletionConfig>,
  ) {
    const builder = this.createRequestBuilder().withPrompt(codeContext.prefix);

    if (codeContext.suffix) {
      builder.withSuffix(codeContext.suffix);
    }

    if (options?.model) {
      builder.withModel(options.model);
    }

    // 应用所有自定义选项
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (key !== "model" && key !== "prompt" && key !== "suffix") {
          builder.withCustomParam(key as any, value as any);
        }
      });
    }

    const config = builder.build();

    // 根据是否需要流式响应返回不同结果
    return this.completion(config);
  }
}
