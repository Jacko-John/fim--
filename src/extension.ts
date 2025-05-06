import * as vscode from "vscode";
import { FIMController } from "./core/control";
import { InsertionStateManager } from "./core/insert/InsertionStateManager";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "fim--" is now active!');

  const fimController = new FIMController();
  let debounceTimer: string | number | NodeJS.Timeout | undefined;
  vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fimController.run(editor);
      }, 500);
    }
  });

  vscode.window.onDidChangeTextEditorSelection(() => {
    InsertionStateManager.hasActiveSession() && InsertionStateManager.clear();
  });

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "fim--.acceptCompletionWithTab",
      async (editor, edit) => {
        if (editor && InsertionStateManager.hasActiveSession()) {
          const state = InsertionStateManager.getState();
          if (state) {
            const { position, completions, currentIndex } = state;
            await editor.edit((editBuilder) => {
              editBuilder.insert(position, completions[currentIndex]);
            });
            InsertionStateManager.clear();
            vscode.window.showInformationMessage(
              `补全已插入：${completions[currentIndex]}`,
            );
          } else {
            vscode.window.showWarningMessage("当前没有可用的补全状态。");
          }
        }
      },
    ),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
