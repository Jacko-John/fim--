import { DeepSeekCompletionConfig } from "../../types/deepseek";

export class CompletionRequestBuilder {
  private config: Partial<DeepSeekCompletionConfig> = {
    model: "deepseek-chat",
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
   * 自定义任意参数
   * @param key 参数键
   * @param value 参数值
   */
  withCustomParam<K extends keyof DeepSeekCompletionConfig>(
    key: K,
    value: DeepSeekCompletionConfig[K],
  ): CompletionRequestBuilder {
    (this.config as any)[key] = value;
    return this;
  }

  build(): DeepSeekCompletionConfig {
    if (!this.config.prompt) {
      throw new Error("Prompt is required");
    }
    if (!this.config.model) {
      throw new Error("Model is required");
    }
    return this.config as DeepSeekCodeCompletionConfig;
  }
}
