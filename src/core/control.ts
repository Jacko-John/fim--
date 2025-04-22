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

interface ControllSession {
  ctx: CodeContext;
  hashKey: string;
  cancel: boolean;
  needRequest: boolean;
  completions: string[];
}

export class FIMController {
  cache: Cache<DefaultCacheType>;
  hasher: Hasher;
  editor: vscode.TextEditor | undefined;
  config: any;
  constructor() {
    this.cache = new Cache(DefaultCacheOption);
    this.hasher = new Hasher(RAW_SNIPPET);
  }
  /**
   * 获取上下文
   *
   * 该函数旨在提取生成一个上下文对象，此上下文对象用于
   * 后续的操作和决策，以确保会话的数据或状态被正确处理
   *
   * @param session 控制会话对象，包含会话的相关信息和状态
   * @returns 应返回一个上下文对象，为了简洁，复用传入的session对象
   */
  async getCtx(session: ControllSession) {
    session.ctx = getCodeContext(this.editor);
    // 以下是debug信息
    const mid =
      session.ctx.middle.slice(0, session.ctx.cursor.col) +
      CURSOR_HOLDER +
      session.ctx.middle.slice(session.ctx.cursor.col);
    const fullCode =
      session.ctx.prefix + "\n" + mid + "\n" + session.ctx.suffix;
    console.log(fullCode);
  }
  /**
   * 此函数主要为会话对象附上配置信息
   *
   * @param session 会话配置对象，包含了配置信息
   */
  async checkConfig(session: ControllSession) {}
  /**
   * 检查缓存有效性
   * 此函数用于检查给定会话的缓存是否仍然有效它通常在执行较重的操作之前调用，
   * 以避免不必要的处理如果缓存有效，则可以直接使用缓存的数据，而不是重新计算或获取数据
   *
   * @param session 控制会话对象，包含会话的相关信息和缓存数据
   */
  async checkCache(session: ControllSession) {
    if (session.cancel) {
      return;
    }
    session.hashKey = this.hasher.hashSnippet(
      session.ctx.prefix + session.ctx.suffix,
    );
    const cacheData = this.cache.get(session.hashKey);
    if (cacheData && cacheData?.completions.length > 0) {
      session.completions = cacheData.completions;
    } else {
      session.needRequest = true;
    }
  }
  /**
   * 请求API接口
   *
   * 本函数用于向API发起请求，请求的上下文信息通过参数session传递
   * 主要作用是根据当前会话状态，执行相应的API请求逻辑
   *
   * @param session 控制会话的实例，包含请求API所需的所有上下文信息
   */
  async requestApi(session: ControllSession) {}
  /**
   * 显示结果
   *
   * 此函数用于展示控制会话中的结果它接收一个ControllSession实例作为参数，
   * 通过这个实例可以访问会话中的各种数据，从而进行结果的显示
   *
   * @param session 控制会话的实例，包含会话所需的各种数据
   */
  async showResult(session: ControllSession) {}
  /**
   * 按下tab键补全
   *
   * @param session 控制会话的实例，包含会话所需的各种数据
   */
  async hookTab(session: ControllSession) {}

  async run(editor: vscode.TextEditor) {
    const session: ControllSession = {
      ctx: {
        prefix: "",
        suffix: "",
        middle: "",
        cursor: {
          line: 0,
          col: 0,
        },
      },
      hashKey: "",
      cancel: false,
      needRequest: false,
      completions: [],
    };
    this.editor = editor;
    await this.getCtx(session);
    console.log(session.ctx);
    await this.checkConfig(session);
    await this.checkCache(session);
    await this.requestApi(session);
    await this.showResult(session);
  }
}
