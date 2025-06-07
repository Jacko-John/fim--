import * as vscode from "vscode";
import { FIMProvider } from "./core/control";
import { ConfigManager } from "./config/ConfigManager";
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
      vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    }, ConfigManager.getDebounceTime());
  });

  const showMoreResults = vscode.commands.registerCommand(
    "fim--.showMoreResults",
    () => {
      let a = ConfigManager.getWebviewOpened();
      console.log(a);
      ConfigManager.setWebviewOpened(true);
      a = ConfigManager.getWebviewOpened();
      console.log(a);
      setTimeout(() => {
        ConfigManager.setWebviewOpened(false);
        console.log(ConfigManager.getWebviewOpened());
      }, 1000);
      vscode.window.showInformationMessage("您执行了extension.sayHello命令！");
    },
  );

  context.subscriptions.push(provider, onEditorChange, showMoreResults);
}

export function deactivate() {}
