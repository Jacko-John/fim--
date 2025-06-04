import * as vscode from "vscode";
import { CodeContext } from "../../types/context";
// import { parseFile } from "./codeCST";
import { DEFAULT_CONTEXT } from "../../globalConst";

export function getCodeContext(
  document: vscode.TextDocument,
  position: vscode.Position,
  offset: number = 5,
): CodeContext {
  // return new Promise<CodeContext>(() => {
  // console.log("getCodeContext");
  let ctx: CodeContext = DEFAULT_CONTEXT;

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

  // console.log("complete");

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

  // parseFile(vscode.window.activeTextEditor!);
  return ctx;
  // });
}
