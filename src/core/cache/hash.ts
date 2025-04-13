import crypto from "crypto";

interface hashFunction {
  (snippet: string | any): string;
}

export class Hasher {
  private _hasher: crypto.Hash;
  hashSnippet: hashFunction;
  /**
   * 创建Hasher实例
   * @param hashType - hash类型，可选值："RAW_SNIPPET" | "AST_SNIPPET"
   */
  constructor(hashType: string) {
    if (hashType !== "RAW_SNIPPET" && hashType !== "AST_SNIPPET") {
      throw new Error(`Invalid hash type: ${hashType}`);
    }
    this._hasher = crypto.createHash("sha256", { outputLength: 64 });
    switch (hashType) {
      case "RAW_SNIPPET":
        this.hashSnippet = this.rawSnippetHash;
        break;
      case "AST_SNIPPET":
        this.hashSnippet = this.astSnippetHash;
        break;
      default:
        throw new Error(`Invalid hash type: ${hashType}`);
    }
  }

  /**
   * 为原始snippet生成hash值
   * @param snippet - 待hash的snippet
   * @returns hash值
   */
  private rawSnippetHash(snippet: string): string {
    return this._hasher.update(snippet).digest("hex");
  }

  /**
   * 为ast生成hash值 -- 暂未实现
   * @param snippet - 待hash的ast
   * @returns hash值
   */
  private astSnippetHash(snippet: any): string {
    return "TODO: astSnippetHash";
  }
}
