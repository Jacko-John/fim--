import * as vscode from "vscode";
import { CURSOR_HOLDER } from "../../globalConst";

export interface CodeContext {
  prefix: string;
  suffix: string;
  middle: string;
  cursor: { line: number; col: number };
}
export function getCodeContext(
  editor: vscode.TextEditor | undefined,
): CodeContext {
  if (!editor) {
    return {
      prefix: "",
      suffix: "",
      middle: "",
      cursor: { line: 0, col: 0 },
    };
  }
  const document = editor.document;
  const position = editor.selection.active;

  // 定义上下文范围（光标前后各 5 行）
  const offset = 5;
  const prefixL = Math.max(0, position.line - offset);
  const suffixL = Math.min(document.lineCount, position.line + offset);

  // 提取前缀和后缀
  const prefixLines = Array.from(
    { length: position.line - prefixL },
    (_, i) => {
      return document.lineAt(prefixL + i).text;
    },
  ).join("\n");

  const suffixLines = Array.from(
    { length: suffixL - position.line - 1 },
    (_, i) => {
      return document.lineAt(position.line + 1 + i).text;
    },
  ).join("\n");

  return {
    prefix: prefixLines,
    suffix: suffixLines,
    middle: document.lineAt(position.line).text,
    cursor: { line: position.line, col: position.character },
  };
}
