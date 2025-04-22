import OpenAI from "openai";
import { ApiHandler } from "..";
import { ApiStream, ApiStreamTextChunk } from "../transform/steams";
import { DeepSeekCodeCompletionConfig } from "../../types/deepseek";
import { ApiHandlerOptions } from "../../shared/api";
import { Completion } from "openai/resources.mjs";
import { CompletionRequestBuilder } from "../builder/deepseek";

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

  /**
   * 创建代码补全流
   * @param systemPrompt 系统提示词
   * @returns API 流
   */
  async *createCompletion(systemPrompt: string): ApiStream {
    try {
      const requestConfig = this.createRequestBuilder()
        .withPrompt(systemPrompt)
        .withStream(true)
        .build();

      const stream = await this.streamCompletion(requestConfig);
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error("Error in DeepSeek createCompletion:", error);
      throw error;
    }
  }

  /**
   * 执行补全请求（非流式）
   * @param params 补全参数
   * @returns 补全结果
   */
  async completion(params: DeepSeekCodeCompletionConfig) {
    try {
      const completion = await this.client.completions.create({
        model: params.model,
        prompt: params.prompt,
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        stop: params.stop,
        suffix: params.suffix,
      });
      return completion;
    } catch (error) {
      console.error("Error in DeepSeek completion:", error);
      throw error;
    }
  }

  /**
   * 执行流式补全请求
   * @param params 补全参数
   * @returns 流式补全结果
   */
  async streamCompletion(
    params: DeepSeekCodeCompletionConfig
  ): Promise<ApiStream> {
    const streamParams = { ...params, stream: true };

    try {
      const stream = await this.client.completions.create(streamParams);
      return this.processCompletionStream(stream);
    } catch (error) {
      console.error("Error in DeepSeek streamCompletion:", error);
      throw error;
    }
  }

  /**
   * 处理流式补全结果
   * @param stream 流式补全结果
   * @returns 处理后的流式补全结果
   */
  private async *processCompletionStream(stream: any): ApiStream {
    let index = 0;
    try {
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];
          yield {
            type: "text",
            index: index++,
            text: choice.text,
            finish_reason: choice.finish_reason || null,
          } as ApiStreamTextChunk;
        }
      }
    } catch (error) {
      console.error("Error in processing completion stream:", error);
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
    options?: Partial<DeepSeekCodeCompletionConfig>
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
    return options?.stream
      ? this.streamCompletion(config)
      : this.completion(config);
  }
}
