import path from "path";
import { CSTItem } from "../../types/context";

export class CSTCache {
  private pathMap: Map<string, CSTItem[]> = new Map();
  private nameMap: Map<string, CSTItem[]> = new Map();
  private itemMap: Map<string, CSTItem> = new Map();
  //   private itemMap: Map<string, CSTItem> = new Map();

  public selectRelevantDeclarations(
    currentFile: string, // 当前文件路径
    inputCode: string, // 光标前n行代码
    historySequence: string[], // 文件打开历史序列（最近访问在前）
    maxLength: number, // 最大总长度（字符数）
  ): CSTItem[] {
    const Declarations = this.pathMap.get(currentFile) || [];

    const identifiers = this.extractIdentifiers(inputCode);
    for (const id in identifiers) {
      Declarations.push(...(this.nameMap.get(id) || []));
    }

    const selectedItems: CSTItem[] = [];
    const deduplicate = new Set<string>();

    for (const item of Declarations) {
      if (!deduplicate.has(this.getItemKey(item))) {
        selectedItems.push(item);
        deduplicate.add(this.getItemKey(item));
      }
    }

    let totalLength = selectedItems.reduce(
      (sum, item) => sum + item.signature.length,
      0,
    );
    if (totalLength >= maxLength) {
      return selectedItems;
    }

    const currentDir = path.dirname(currentFile);
    const pendingOptions: { score: number; item: CSTItem }[] = [];

    this.itemMap.forEach((v, k) => {
      if (!deduplicate.has(k)) {
        const score = this.calculateItemScore(
          v,
          inputCode,
          currentDir,
          historySequence,
        );
        pendingOptions.push({ score, item: v });
      }
    });
    pendingOptions.sort((a, b) => b.score - a.score);
    for (const { item } of pendingOptions) {
      const itemKey = this.getItemKey(item);

      const itemLength = item.signature.length;
      if (totalLength + itemLength > maxLength) {
        break;
      }

      selectedItems.push(item);
      totalLength += itemLength;
    }
    return selectedItems;
  }

  public addItems(items: CSTItem[]) {
    for (const item of items) {
      item.tokens = this.tokenize(item.signature);
      this.itemMap.set(this.getItemKey(item), item);

      if (this.pathMap.has(item.filePath)) {
        this.pathMap.get(item.filePath)?.push(item);
      } else {
        this.pathMap.set(item.filePath, [item]);
      }

      if (this.nameMap.has(item.name)) {
        this.nameMap.get(item.name)?.push(item);
      } else {
        this.nameMap.set(item.name, [item]);
      }
    }
  }

  public fileChanged(filePath: string, items: CSTItem[]) {
    const oldItems = this.pathMap.get(filePath) || [];
    for (const item of oldItems) {
      this.itemMap.delete(this.getItemKey(item));
      const nameItems = this.nameMap.get(item.name);
      nameItems?.splice(nameItems.indexOf(item), 1);
    }
    this.pathMap.delete(filePath);
    this.addItems(items);
  }

  private getItemKey(item: CSTItem): string {
    return `${item.filePath}:${item.name}`;
  }

  private extractIdentifiers(code: string): Set<string> {
    const identifierSet = new Set<string>();

    // 匹配单词边界包围的标识符（排除关键字）
    const identifierRegex = /\b([a-zA-Z_][\w$]+)\b/g;

    let match;
    while ((match = identifierRegex.exec(code)) !== null) {
      identifierSet.add(match[1]);
    }

    return identifierSet;
  }

  private calculateItemScore(
    item: CSTItem,
    inputCode: string,
    currentDir: string,
    historySequence: string[],
  ): number {
    // 1. Jaccard相似度（40%）
    const inputCodeSet = this.tokenize(inputCode);
    const jaccardScore =
      this.calculateJaccardSimilarity(inputCodeSet, item.tokens) * 0.4;

    // 2. 目录接近度（30%）
    const dirScore =
      this.calculateDirectorySimilarity(
        currentDir,
        path.dirname(item.filePath),
      ) * 0.3;

    // 3. 访问新鲜度（30%）
    const recencyScore =
      this.calculateRecencyScore(item.filePath, historySequence) * 0.3;

    return jaccardScore + dirScore + recencyScore;
  }

  private tokenize(str: string): Set<string> {
    const tokens = new Set<string>();
    const words = str.match(/\b\w+\b/g) || [];

    for (const word of words) {
      if (word.length > 2) {
        // 忽略短词
        tokens.add(word.toLowerCase());
      }
    }
    return tokens;
  }

  private calculateJaccardSimilarity(
    setA: Set<string>,
    setB: Set<string>,
  ): number {
    if (setA.size === 0 && setB.size === 0) {
      return 0;
    }

    const intersection = new Set<string>();
    const union = new Set(setB);
    for (const token of setA) {
      if (setB.has(token)) {
        intersection.add(token);
      } else {
        union.add(token);
      }
    }

    return intersection.size / union.size;
  }

  private calculateDirectorySimilarity(
    currentDir: string,
    targetDir: string,
  ): number {
    // 标准化路径
    const normalizePath = (p: string) => path.normalize(p).replace(/\\/g, "/");
    const curr = normalizePath(currentDir);
    const tgt = normalizePath(targetDir);

    // 相同目录
    if (curr === tgt) {
      return 1.0;
    }

    // 计算路径距离
    const currParts = curr.split("/").filter(Boolean);
    const tgtParts = tgt.split("/").filter(Boolean);

    // 查找共同路径深度
    let commonDepth = 0;
    for (let i = 0; i < Math.min(currParts.length, tgtParts.length); i++) {
      if (currParts[i] === tgtParts[i]) {
        commonDepth++;
      } else {
        break;
      }
    }

    // 计算总路径深度
    const totalDepth = currParts.length + tgtParts.length;

    // 相似度公式：共同深度比例
    return (2 * commonDepth) / totalDepth;
  }

  private calculateRecencyScore(
    filePath: string,
    historySequence: string[],
  ): number {
    // 查找文件在历史序列中的位置
    const index = historySequence.findIndex(
      (path) => path.normalize(path) === path.normalize(filePath),
    );

    // 文件不在历史序列中
    if (index === -1) {
      return 0.0;
    }

    // 线性衰减：最近访问为1.0，逐级递减
    return Math.max(0, 1.0 - index * 0.1);
  }
}

export function CSTItems2String(items: CSTItem[]): string {
  return items.map((item) => item.signature).join("\n");
}
