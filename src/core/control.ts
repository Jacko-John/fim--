import { Cache, CacheOption, DefaultCacheOption } from "./cache/cache";

abstract class FIMController {
  abstract cache: Cache<string>;
  config: any;
  constructor() {}
  /**
   * 获取上下文
   *
   * 该函数旨在提取生成一个上下文对象，此上下文对象用于
   * 后续的操作和决策，以确保会话的数据或状态被正确处理
   *
   * @param session 控制会话对象，包含会话的相关信息和状态
   * @returns 应返回一个上下文对象，为了简洁，复用传入的session对象
   */
  getCtx(session: ControllSession) {}
  /**
   * 此函数主要为会话对象附上配置信息
   *
   * @param session 会话配置对象，包含了配置信息
   */
  checkConfig(session: ControllSession) {}
  /**
   * 检查缓存有效性
   * 此函数用于检查给定会话的缓存是否仍然有效它通常在执行较重的操作之前调用，
   * 以避免不必要的处理如果缓存有效，则可以直接使用缓存的数据，而不是重新计算或获取数据
   *
   * @param session 控制会话对象，包含会话的相关信息和缓存数据
   */
  checkCache(session: ControllSession) {}
  /**
   * 请求API接口
   *
   * 本函数用于向API发起请求，请求的上下文信息通过参数session传递
   * 主要作用是根据当前会话状态，执行相应的API请求逻辑
   *
   * @param session 控制会话的实例，包含请求API所需的所有上下文信息
   */
  requestApi(session: ControllSession) {}
  /**
   * 显示结果
   *
   * 此函数用于展示控制会话中的结果它接收一个ControllSession实例作为参数，
   * 通过这个实例可以访问会话中的各种数据，从而进行结果的显示
   *
   * @param session 控制会话的实例，包含会话所需的各种数据
   */
  showResult(session: ControllSession) {}
  /**
   * 按下tab键补全
   *
   * @param session 控制会话的实例，包含会话所需的各种数据
   */
  hookTab(session: ControllSession) {}
}

interface ControllSession {
  ctx: any;
  cancel: boolean;
  needRequest: boolean;
  completions: string[];
}

export class FIMControllerImpl extends FIMController {
  cache: Cache<string>;
  constructor() {
    super();
    this.cache = new Cache(DefaultCacheOption);
  }
  register() {}
  run() {
    var session: ControllSession = {
      ctx: undefined,
      cancel: false,
      needRequest: false,
      completions: [],
    };
    this.getCtx(session);
    this.checkConfig(session);
    this.checkCache(session);
    this.requestApi(session);
    this.showResult(session);
  }
}
