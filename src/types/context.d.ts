export interface CodeContext {
  /** 不包含当前行的前缀 */
  prefix: string;
  /** 不包含当前行的后缀 */
  suffix: string;
  /** 包含当前行的前缀 */
  prefixWithMid: string;
  /** 包含当前行的后缀 */
  suffixWithMid: string;
  /** 当前行的前缀 */
  prefixOnCursor: string;
  /** 光标的位置 */
  cursor: { line: number; col: number };
}

export interface ControllSessionConfig {
  /** 是否开启多模型补全模式 */
  webviewOpened: boolean;
}

export interface CSTItem {
  /** 标识符 */
  name: string;
  /** 所属路径 */
  filePath: string;
  /** 声明内容 */
  signature: string;
  /** Jaccard算法提取集合 */
  tokens: Set<string>;
}
