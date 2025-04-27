import {
  Cache,
  CacheOption,
  DefaultCacheOption,
  DefaultCacheType,
} from "./cache/cache";
import * as vscode from "vscode";
import { CodeContext, getCodeContext } from "./context/codeContext";
import { CURSOR_HOLDER, RAW_SNIPPET } from "../globalConst";
import { Hasher } from "./cache/hash";
import { insertCode } from "./insert/insert";

interface AnyFunc {
  (): void;
}

class ControllSession {
  ctx: CodeContext;
  hashKey: string;
  cancel: boolean;
  needRequest: boolean;
  completions: string[];
  editor: vscode.TextEditor;
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
    this.ctx = {
      prefix: "",
      suffix: "",
      middle: "",
      cursor: {
        line: 0,
        col: 0,
      },
    };
    this.hashKey = "";
    this.cancel = false;
    this.needRequest = false;
    this.completions = [];
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
    // 以下是debug信息
    const mid =
      this.ctx.middle.slice(0, this.ctx.cursor.col) +
      CURSOR_HOLDER +
      this.ctx.middle.slice(this.ctx.cursor.col);
    const fullCode = this.ctx.prefix + "\n" + mid + "\n" + this.ctx.suffix;
    console.log(fullCode);
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
    } else {
      this.needRequest = true;
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
        console.log(session.ctx);
      })
      .checkConfig()
      .checkCache(this.hasher, this.cache)
      .requestApi()
      .showResult();
  }
}
