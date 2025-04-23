import { CodeContext } from "../context/codeContext";
import * as vscode from "vscode";

interface ControllSession {
  ctx: CodeContext;
  hashKey: string;
  cancel: boolean;
  needRequest: boolean;
  completions: string[];
}

export async function insertCode(this: any, session: ControllSession) {
if (session.cancel || !this.editor) {
    return;
  }

  const editor = this.editor;
  const completions = session.completions;

  if (completions.length === 0) {
    vscode.window.showInformationMessage("没有可用的补全结果。");
    return;
  }

  // 默认选择第一个补全结果
  const selectedCompletion = completions[0];

  // 获取当前光标位置
  const position = editor.selection.active;

  // 使用编辑器的编辑功能插入补全内容
  await editor.edit((editBuilder: { insert: (arg0: any, arg1: string) => void; }) => {
    editBuilder.insert(position, selectedCompletion);
  });

  // 可选：显示通知，提示用户补全已插入
  vscode.window.showInformationMessage("补全已插入！");
}