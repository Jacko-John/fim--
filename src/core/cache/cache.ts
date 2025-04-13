import { LRUCache } from "lru-cache";

/**
 * 缓存类
 * @example
 * const cache = new Cache<DefaultCacheType>({ max: 500 });
 */
export class Cache<T extends {}> {
  cache: LRUCache<string, T>;
  /**
   * 构造函数
   * @param options 缓存选项
   */
  constructor(options: CacheOption) {
    this.cache = new LRUCache(options);
  }

  /**
   * 获取缓存
   * @param key 缓存键
   */
  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T) {
    return this.cache.set(key, value);
  }

  /**
   * 是否存在缓存
   * @param key 缓存键
   */
  has(key: string) {
    return this.cache.has(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    return this.cache.clear();
  }
}

/**
 * 缓存选项
 */
export type CacheOption = {
  max: number; // 最大缓存数量
  maxAge: number; // 最大缓存时间，单位：豪秒
};

/**
 * 默认缓存类型
 */
export type DefaultCacheType = {
  contextHash: string; // 上下文指纹
  completions: string[]; // 补全建议列表
  context: SnippetContext; // 上下文内容
};

/**
 * 代码片段上下文
 */
export type SnippetContext = {
  text: string;
  methods: string[];
};
