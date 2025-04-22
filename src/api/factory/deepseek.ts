import { ApiHandler } from "..";
import { ApiHandlerOptions } from "../../shared/api";
import { DeepSeekHandler } from "../providers/deepseek";

export class ApiFactory {
  private static instance: ApiFactory;
  private handlers: Map<string, ApiHandler> = new Map();
  private options: ApiHandlerOptions;

  private constructor(options: ApiHandlerOptions) {
    this.options = options;
  }

  /**
   * 获取 API 处理器实例
   * @param options API 处理器选项
   * @returns
   */
  public static getInstance(options: ApiHandlerOptions): ApiFactory {
    if (!ApiFactory.instance && options) {
      ApiFactory.instance = new ApiFactory(options);
    } else if (!ApiFactory.instance) {
      throw new Error(
        "ApiFactory instance is not initialized. Please provide options.",
      );
    }
    return ApiFactory.instance;
  }

  public getDeepSeekHandler(): DeepSeekHandler {
    const key = "deepseek";
    if (!this.handlers.has(key)) {
      const handler = new DeepSeekHandler(this.options);
      this.handlers.set(key, handler);
    }
    return this.handlers.get(key) as DeepSeekHandler;
  }

  public getHandler(type: string): ApiHandler | undefined {
    switch (type.toLowerCase()) {
      case "deepseek":
        return this.getDeepSeekHandler();
      default:
        throw new Error(`Unsupported API handler type: ${type}`);
    }
  }
}
