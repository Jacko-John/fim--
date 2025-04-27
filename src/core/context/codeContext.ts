import * as vscode from "vscode";
import { CodeContext } from "../../shared/contex";

export function getCodeContext(editor: vscode.TextEditor): CodeContext {
  let ctx: CodeContext = new CodeContext();
  if (!editor) {
    return ctx;
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

  ctx.prefix = prefixLines;
  ctx.suffix = suffixLines;
  ctx.prefixOnCursor = document
    .lineAt(position.line)
    .text.slice(0, position.character);
  ctx.prefixWithMid = prefixLines + "\n" + ctx.prefixOnCursor;
  ctx.suffixWithMid =
    document.lineAt(position.line).text.slice(position.character) +
    "\n" +
    suffixLines;
  ctx.cursor = { line: position.line, col: position.character };

  return ctx;
}
