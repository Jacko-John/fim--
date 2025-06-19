import { Cache, DefaultCacheOption, DefaultCacheType } from "./cache/cache";
import * as vscode from "vscode";
import { getCodeContext } from "./context/codeContext";
import { DEFAULT_CONTEXT, RAW_SNIPPET } from "../globalConst";
import { Hasher } from "./cache/hash";
import { CodeContext, ControllSessionConfig } from "../types/context";
import { checkFilter } from "./cache/filter";
import {
  InlineCompletionItem,
  InlineCompletionList,
  ProviderResult,
} from "vscode";
import { StatusManager } from "./status/StatusManager";
import {
  APIConfig,
  ConfigManager,
  RLCoderConfig,
} from "../config/ConfigManager";
import { parseFile } from "./context/codeCST";
import { cstCache, HISTORY } from "../shared/cst";
import { RequestApi } from "./request/request";

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
  getCST(document: vscode.TextDocument): ControllSession {
    // console.log("get cst");
    parseFile(document);
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
    this.completionIndex = -1;
    if (cacheData && cacheData?.completions.length > 0) {
      const completionsTmp = cacheData.completions;
      const index = checkFilter(this.ctx.prefixOnCursor, completionsTmp);
      // 如果已经存在三个补全，且未命中缓存，则取消
      if (completionsTmp.length > 3 && index === -1) {
        this.completions = [];
        this.cancel = true;
      } else {
        // 若命中，则返回删去前缀的单个补全 (为什么要删除前缀请看requestApi函数)
        this.completions = [
          completionsTmp[index].slice(this.ctx.prefixOnCursor.length),
        ];
        this.completionIndex = 0;
      }
    }
    return this;
  }

  /**
   * 请求API接口
   *
   * 本函数用于向API发起请求，请求的上下文信息通过参数session传递
   * 主要作用是根据当前会话状态，执行相应的API请求逻辑
   *
   */
  async requestApi(
    hasher: Hasher,
    cache: Cache<DefaultCacheType>,
    document: vscode.TextDocument,
    requestApi: RequestApi,
  ) {
    // 已有结果 or 被取消，则返回
    if (this.completionIndex !== -1 || this.cancel) {
      return;
    }
    let res = await requestApi.request(
      this.ctx,
      document,
      ConfigManager.getWebviewOpened(),
    );

    if (res && res.length > 0) {
      // 过滤掉无效的结果，获得补全
      this.completions = res
        .filter((r) => {
          if (!r.data) {
            vscode.window.showInformationMessage(
              r.api,
              "发生了一个错误，请查看日志获取详细信息",
            );
          }
          return r.data;
        })
        .map((r) => r.data);
      // 如果没有结果，则取消补全
      if (this.completions.length === 0) {
        this.cancel = true;
        return;
      }
      this.completionIndex = 0;
      // 缓存结果
      this.hashKey = hasher.hashSnippet(this.ctx.prefix + this.ctx.suffix);
      const cacheData = cache.get(this.hashKey);
      // 为了方便后续计算缓存是否命中，添加当前行的前缀
      const completionsTmp = this.completions.map(
        (c) => this.ctx.prefixOnCursor + c,
      );
      if (cacheData && cacheData?.completions.length > 0) {
        cacheData.completions.push(...completionsTmp);
      } else {
        const newCache: DefaultCacheType = {
          contextHash: this.hashKey,
          completions: completionsTmp,
          context: this.ctx,
        };
        cache.set(this.hashKey, newCache);
      }
    }
  }

  then(func: AnyFunc) {
    func();
    return this;
  }
}

export class FIMProvider implements vscode.InlineCompletionItemProvider {
  cache: Cache<DefaultCacheType>;
  hasher: Hasher;
  cmd: vscode.Command = {
    command: "fim--.compeletionAccepted",
    title: "CompletionAccepted",
  };
  requestApi: RequestApi;
  constructor() {
    this.cache = new Cache(DefaultCacheOption);
    this.hasher = new Hasher(RAW_SNIPPET);
    this.requestApi = new RequestApi(
      ConfigManager.getAPIs(),
      ConfigManager.getRLCoderConfig(),
    );
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
      .getCST(document)
      .checkCache(this.hasher, this.cache);
    await session.requestApi(
      this.hasher,
      this.cache,
      document,
      this.requestApi,
    );

    StatusManager.resetStatus();
    if (session.cancel) {
      return;
    }
    const completion = session.completions[session.completionIndex];
    if (completion) {
      StatusManager.addTotalItem();
      const endPosition = document.positionAt(
        document.offsetAt(position) + completion.length,
      );
      const range = new vscode.Range(position, endPosition);
      return [new vscode.InlineCompletionItem(completion, range, this.cmd)];
    }
  }
}
