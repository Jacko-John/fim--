import { Cache, DefaultCacheOption, DefaultCacheType } from "./cache/cache";
import * as vscode from "vscode";
import { getCodeContext } from "./context/codeContext";
import { CURSOR_HOLDER, DEFAULT_CONTEXT, RAW_SNIPPET } from "../globalConst";
import { Hasher } from "./cache/hash";
import { insertCode } from "./insert/insert";
import { CodeContext } from "../shared/contex";
import { checkFilter } from "./cache/filter";

interface AnyFunc {
  (): void;
}

class ControllSession {
  /** 代码上下文 */
  ctx: CodeContext = DEFAULT_CONTEXT;
  /** 上下文哈希值 */
  hashKey: string = "";
  /** 是否取消补全 */
  cancel: boolean = false;
  /** 补全结果的索引，没有匹配结果则为-1 */
  completionIndex: number = -1;
  /** 补全结果 -- 包含当前行
   * @example completions[completionIndex] = prefixOnCursor + completion
   */
  completions: string[] = ["SYSU SSE"];
  /** 编辑器实例 */
  editor: vscode.TextEditor;
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  /**
   * 获取上下文
   *
   * 该函数旨在提取生成一个上下文对象，此上下文对象用于
   * 后续的操作和决策，以确保会话的数据或状态被正确处理
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  getCtx(): ControllSession {
    this.ctx = getCodeContext(this.editor);
    return this;
  }

  /**
   * 此函数主要为会话对象附上配置信息
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  checkConfig(): ControllSession {
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
   * 请求API接口
   *
   * 本函数用于向API发起请求，请求的上下文信息通过参数session传递
   * 主要作用是根据当前会话状态，执行相应的API请求逻辑
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  requestApi(): ControllSession {
    if (this.completionIndex !== -1) {
      return this;
    }
    return this;
  }

  /**
   * 显示结果
   *
   * 此函数用于展示控制会话中的结果，它接收一个ControllSession实例作为参数，
   * 通过这个实例可以访问会话中的各种数据，从而进行结果的显示
   *
   * @returns 应返回当前上下文对象，用于链式调用
   */
  showResult(): ControllSession {
    insertCode(this.editor, this.completions);
    return this;
  }

  then(func: AnyFunc) {
    func();
    return this;
  }
}

export class FIMController {
  cache: Cache<DefaultCacheType>;
  hasher: Hasher;
  config: any;
  constructor() {
    this.cache = new Cache(DefaultCacheOption);
    this.hasher = new Hasher(RAW_SNIPPET);
  }

  /**
   * 按下tab键补全
   *
   * @param session 控制会话的实例，包含会话所需的各种数据
   */
  async hookTab(session: ControllSession) {}

  run(editor: vscode.TextEditor) {
    const session = new ControllSession(editor);
    session
      .getCtx()
      .then(() => {
        const fullCode =
          session.ctx.prefixWithMid + CURSOR_HOLDER + session.ctx.suffixWithMid;
        console.log(fullCode);
        console.log(session.ctx);
      })
      .checkConfig()
      .checkCache(this.hasher, this.cache)
      .requestApi()
      .showResult();
  }
}
