import { Cache, DefaultCacheOption, DefaultCacheType } from "./cache/cache";
import * as vscode from "vscode";
import { getCodeContext } from "./context/codeContext";
import { DEFAULT_CONTEXT, RAW_SNIPPET } from "../globalConst";
import { Hasher } from "./cache/hash";
import { CodeContext, ControllSessionConfig } from "../types/context";
import { checkFilter } from "./cache/filter";
import { ModelPanel } from "./panel/ModelPanel";
import {
  InlineCompletionItem,
  InlineCompletionList,
  ProviderResult,
} from "vscode";
import { StatusManager } from "./status/StatusManager";
import { ConfigManager } from "../config/ConfigManager";

interface AnyFunc {
  (): void;
}

class ControllSession {
  /** 代码上下文 */
  ctx: CodeContext = DEFAULT_CONTEXT;
  /** 代码CST */
  // cst: Parser.Tree | undefined = undefined;
  /** 上下文哈希值 */
  hashKey: string = "";
  /** 是否取消补全 */
  cancel: boolean = false;
  /** 补全结果的索引，没有匹配结果则为-1 */
  completionIndex: number = -1;
  /** 补全结果 -- 包含当前行
   * @example completions[completionIndex] = prefixOnCursor + completion
   */
  completions: string[] = [`\nprint("hello world")`];
  /** 存储不同模型的补全结果 */
  modelCompletions: Map<string, string[]> = new Map();

  /**
   * 获取上下文
   *
   * 该函数旨在提取生成一个上下文对象，此上下文对象用于
   * 后续的操作和决策，以确保会话的数据或状态被正确处理
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  getCtx(document: vscode.TextDocument, position: vscode.Position) {
    // console.log("in getCtx");
    this.ctx = getCodeContext(document, position, undefined);
    return this;
  }

  /**
   * 获取CST
   *
   * 此函数用于获取代码的抽象语法树（CST），它通常用于分析和处理代码结构
   * 该函数会将获取到的CST存储在当前会话对象中，以便后续使用
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  getCST(): ControllSession {
    // this.cst = getCodeCST(this.editor);
    // console.log("in getCST");
    return this;
  }

  /**
   * 检查缓存有效性
   * 此函数用于检查给定会话的缓存是否仍然有效它通常在执行较重的操作之前调用，
   * 以避免不必要的处理如果缓存有效，则可以直接使用缓存的数据，而不是重新计算或获取数据
   *
   * @param hasher 缓存的哈希函数实例
   * @param cache 缓存实例
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  checkCache(hasher: Hasher, cache: Cache<DefaultCacheType>): ControllSession {
    // console.log("in checkCache");
    if (this.cancel) {
      return this;
    }
    this.hashKey = hasher.hashSnippet(this.ctx.prefix + this.ctx.suffix);
    const cacheData = cache.get(this.hashKey);
    if (cacheData && cacheData?.completions.length > 0) {
      this.completions = cacheData.completions;
      this.completionIndex = checkFilter(
        this.ctx.prefixOnCursor,
        this.completions
      );
    } else {
      this.completionIndex = -1;
    }
    return this;
  }

  /**
   * 显示模型补全结果
   * @param modelId 模型标识符
   */
  showModelCompletions(modelId: string) {
    const completions = this.modelCompletions.get(modelId);
    if (completions) {
      ModelPanel.createOrShow(modelId, completions);
    }
  }

  /**
   * 更新模型补全结果
   * @param modelId 模型标识符
   * @param completions 补全结果
   */
  updateModelCompletions(modelId: string, completions: string[]) {
    this.modelCompletions.set(modelId, completions);
    // 只更新结果，不自动显示
    if (ConfigManager.getWebviewOpened()) {
      this.showModelCompletions(modelId);
    }
  }

  /**
   * 请求API接口
   *
   * 本函数用于向API发起请求，请求的上下文信息通过参数session传递
   * 主要作用是根据当前会话状态，执行相应的API请求逻辑
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  requestApi(): ControllSession {
    // console.log("in requestApi");
    if (this.completionIndex !== -1) {
      return this;
    }

    // 模拟多个模型的补全结果
    this.updateModelCompletions('model1', [
        'Completion from Model 1 - Option 1',
        'Completion from Model 1 - Option 2'
    ]);

    this.updateModelCompletions('model2', [
        'Completion from Model 2 - Option 1',
        'Completion from Model 2 - Option 2'
    ]);

    return this;
  }
  then(func: AnyFunc) {
    func();
    return this;
  }
}

export class FIMProvider implements vscode.InlineCompletionItemProvider {
  cache: Cache<DefaultCacheType>;
  hasher: Hasher;
  config: any;
  debounceTimer: number = 0;
  constructor() {
    this.cache = new Cache(DefaultCacheOption);
    this.hasher = new Hasher(RAW_SNIPPET);
  }
  public async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken,
    //@ts-ignore
  ): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
    if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
      console.log("Automatic trigger is banned");
      return null;
    }
    if (!StatusManager.getStatus()) {
      return;
    }
    const session = new ControllSession();
    session
      .getCtx(document, position)
      .getCST()
      .checkCache(this.hasher, this.cache)
      .requestApi()
      .then(() => {
        // TODO: Check if the completion is valid
        // console.log(session.ctx);
        session.completionIndex = 0;
      });
    StatusManager.resetStatus();
    if (session.cancel) {
      return;
    }
    const completion = session.completions[session.completionIndex];
    
    console.log(completion);

    if (completion) {
      const endPosition = document.positionAt(
        document.offsetAt(position) + completion.length,
      );
      const range = new vscode.Range(position, endPosition);
      return [new vscode.InlineCompletionItem(completion, range)];
    }
  }
}
