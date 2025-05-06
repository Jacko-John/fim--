import * as vscode from "vscode";
import { InsertionStateManager } from "./InsertionStateManager";

export async function insertCode(
  editor: vscode.TextEditor | undefined,
  completions: string[],
) {
  if (!editor) {
    return;
  }

  const position = editor.selection.active;

  // 清理之前的监听和装饰器
  InsertionStateManager.clear();

  // 创建并设置装饰器
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: completions[0],
      color: "rgba(150, 150, 150, 0.8)",
    },
  });

  InsertionStateManager.setState({
    editor,
    position,
    completions,
    currentIndex: 0,
    decorationType,
  });
  updateCurrentDecoration();
}

function updateCurrentDecoration() {
  const state = InsertionStateManager.getState();
  if (!state) {
    return;
  }

  const { editor, position, decorationType } = state;

  editor.setDecorations(decorationType, [
    {
      range: new vscode.Range(position, position),
    },
  ]);
}
