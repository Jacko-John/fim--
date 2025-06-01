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
