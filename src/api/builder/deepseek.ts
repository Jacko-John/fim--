import { DeepSeekCodeCompletionConfig } from "../../types/deepseek";

export class CompletionRequestBuilder {
  private config: Partial<DeepSeekCodeCompletionConfig> = {
    model: "deepseek-chat",
    max_tokens: 1024,
  };

  /**
   * 模型的 ID
   * @param model 模型名称，默认为"deepseek-chat"
   */
  withModel(model: string): CompletionRequestBuilder {
    this.config.model = model || "deepseek-chat";
    return this;
  }

  /**
   * 用于生成完成内容的提示
   * @param prompt 提示词内容
   */
  withPrompt(prompt: string): CompletionRequestBuilder {
    this.config.prompt = prompt;
    return this;
  }

  /**
   * 制定被补全内容的后缀
   * @param suffix 后缀内容
   */
  withSuffix(suffix: string): CompletionRequestBuilder {
    this.config.suffix = suffix;
    return this;
  }

  /**
   * 最大生成 token 数量
   * @param max_tokens 最大生成 token 数量，默认为1024
   */
  withMaxTokens(max_tokens: number): CompletionRequestBuilder {
    this.config.max_tokens = max_tokens || 1024;
    return this;
  }

  /**
   * 采样温度，介于 0 和 2 之间。更高的值，如 0.8，会使输出更随机，而更低的值，如 0.2，会使其更加集中和确定。 我们通常建议可以更改这个值或者更改 top_p，但不建议同时对两者进行修改。
   * @param temperature 温度值，默认为 1，范围为 0 到 2
   */
  withTemperature(temperature: number): CompletionRequestBuilder {
    this.config.temperature = temperature;
    return this;
  }

  /**
   * 作为调节采样温度的替代方案，模型会考虑前 top_p 概率的 token 的结果。所以 0.1 就意味着只有包括在最高 10% 概率中的 token 会被考虑。 我们通常建议修改这个值或者更改 temperature，但不建议同时对两者进行修改。
   * @param top_p top_p 值，默认为 1，范围为 0 到 1
   */
  withTopP(top_p: number): CompletionRequestBuilder {
    this.config.top_p = top_p;
    return this;
  }

  /**
   * 一个 string 或最多包含 16 个 string 的 list，在遇到这些词时，API 将停止生成更多的 token。
   * @param stop 停止词，可以是字符串或字符串数组
   */
  withStop(stop: string | string[] | null): CompletionRequestBuilder {
    this.config.stop = stop;
    return this;
  }

  /**
   * 介于 -2.0 和 2.0 之间的数字。如果该值为正，那么新 token 会根据其在已有文本中的出现频率受到相应的惩罚，降低模型重复相同内容的可能性。
   * @param frequency_penalty 频率惩罚值，范围为 -2 到 2
   * @returns
   */
  withFrequencyPenalty(frequency_penalty: number): CompletionRequestBuilder {
    this.config.frequency_penalty = frequency_penalty;
    return this;
  }

  /**
   * 介于 -2.0 和 2.0 之间的数字。如果该值为正，那么新 token 会根据其是否已在已有文本中出现受到相应的惩罚，从而增加模型谈论新主题的可能性。
   * @param presence_penalty
   * @returns
   */
  withPresencePenalty(presence_penalty: number): CompletionRequestBuilder {
    this.config.presence_penalty = presence_penalty;
    return this;
  }

  /**
   * 如果设置为 True，将会以 SSE（server-sent events）的形式以流式发送消息增量。消息流以 data: [DONE] 结尾。
   * @param stream
   * @returns
   */
  withStream(stream: boolean): CompletionRequestBuilder {
    this.config.stream = stream;
    return this;
  }

  /**
   * 在输出中，把 prompt 的内容也输出出来
   * @param echo
   * @returns
   */
  withEcho(echo: boolean): CompletionRequestBuilder {
    this.config.echo = echo;
    return this;
  }

  /**
   * 制定输出中包含 logprobs 最可能输出 token 的对数概率，包含采样的 token。例如，如果 logprobs 是 20，API 将返回一个包含 20 个最可能的 token 的列表。API 将始终返回采样 token 的对数概率，因此响应中可能会有最多 logprobs+1 个元素。
   * logprobs 的最大值是 20。
   * @param logprobs
   * @returns
   */
  withLogprobs(logprobs: number): CompletionRequestBuilder {
    this.config.logprobs = logprobs;
    return this;
  }

  /**
   * 自定义任意参数
   * @param key 参数键
   * @param value 参数值
   */
  withCustomParam<K extends keyof DeepSeekCodeCompletionConfig>(
    key: K,
    value: DeepSeekCodeCompletionConfig[K],
  ): CompletionRequestBuilder {
    (this.config as any)[key] = value;
    return this;
  }

  build(): DeepSeekCodeCompletionConfig {
    if (!this.config.prompt) {
      throw new Error("Prompt is required");
    }
    if (!this.config.model) {
      throw new Error("Model is required");
    }
    return this.config as DeepSeekCodeCompletionConfig;
  }
}
