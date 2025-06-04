import * as vscode from "vscode";
import { FIMProvider } from "./core/control";
import { ModelPanel } from './core/panel/ModelPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "fim--" is now active!');

  const fimProvider = new FIMProvider();
  const provider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" }, // 所有文件类型都支持
    fimProvider,
  );

  let debounceTimer: NodeJS.Timeout;
  const onEditorChange = vscode.workspace.onDidChangeTextDocument(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    }, 1000);
  }); 

  context.subscriptions.push(provider, onEditorChange);

  context.subscriptions.push(
    vscode.commands.registerCommand('fim.closeAllPanels', () => {
      ModelPanel.closeAll();
    })
  );
}

export function deactivate() {}
