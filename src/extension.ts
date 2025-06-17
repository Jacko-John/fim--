import * as vscode from "vscode";
import { FIMProvider } from "./core/control";
import { ConfigManager } from "./config/ConfigManager";
import { ModelPanel } from "./core/panel/ModelPanel";
//import { getParserForFile } from "./core/context/codeCST";

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
      // 只触发内联补全，不自动显示 webview
      vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    }, ConfigManager.getDebounceTime());
  });

  const showMoreResults = vscode.commands.registerCommand(
    "fim--.showMoreResults",
    () => {
      const isOpened = ConfigManager.getWebviewOpened();
      if (!isOpened) {
        ModelPanel.createOrShow("current", ["请先触发代码补全..."]);
      }
    },
  );

  // 注册切换 webview 的命令
  const toggleWebview = vscode.commands.registerCommand(
    "fim--.toggleWebview",
    () => {
      const isOpened = ConfigManager.getWebviewOpened();
      if (isOpened) {
        ModelPanel.hide();
      } else {
        // 如果没有当前补全结果，显示一个欢迎信息
        ModelPanel.createOrShow("welcome", [
          "欢迎使用 AI Completions！",
          "当您触发代码补全时，补全结果将会显示在这里。",
          "您可以使用快捷键 Ctrl+Shift+A (Mac: Cmd+Shift+A) 或点击编辑器右上角的按钮来切换此面板。"
        ]);
      }
    }
  );

  // 注册选择上一个补全项的命令
  const selectPreviousCompletion = vscode.commands.registerCommand(
    "fim--.selectPreviousCompletion",
    () => {
      ModelPanel.selectPreviousCompletion();
    }
  );

  // 注册选择下一个补全项的命令
  const selectNextCompletion = vscode.commands.registerCommand(
    "fim--.selectNextCompletion",
    () => {
      ModelPanel.selectNextCompletion();
    }
  );

  context.subscriptions.push(provider, onEditorChange, showMoreResults, toggleWebview, selectPreviousCompletion, selectNextCompletion);
}

export function deactivate() {}
