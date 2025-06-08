import * as vscode from "vscode";
import { FIMProvider } from "./core/control";
import { ConfigManager } from "./config/ConfigManager";
import { cstCache, HISTORY } from "./shared/cst";
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

  const onActiveEditorChanged = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        //console.log("用户切换到了文件:", vscode.workspace.asRelativePath(editor.document.uri));
        HISTORY.addHistory(
          vscode.workspace.asRelativePath(editor.document.uri),
        );
      }
    },
  );

  const onWillDeleteFiles = vscode.workspace.onWillDeleteFiles(
    async (event) => {
      event.files.forEach(async (file) => {
        try {
          const stack = [file];
          while (stack.length > 0) {
            const currentFile = stack.pop();
            if (!currentFile) continue;
            const entries =
              await vscode.workspace.fs.readDirectory(currentFile);
            for (const [name, type] of entries) {
              const subFilePath = vscode.Uri.joinPath(currentFile, name);
              //console.log(`将要处理文件: ${vscode.workspace.asRelativePath(subFilePath)}`);
              if (type === vscode.FileType.Directory) {
                stack.push(subFilePath);
              } else if (type === vscode.FileType.File) {
                // 处理文件删除逻辑
                //console.log(`将要删除文件: ${vscode.workspace.asRelativePath(subFilePath)}`);
                const path = vscode.workspace.asRelativePath(subFilePath);
                cstCache.fileChanged(path, []);
                HISTORY.deleteHistory(path);
              }
            }
          }
        } catch (error) {
          console.error(
            `Get err when handle onWillDeleteFiles event: ${error}`,
          );
        }
      });
    },
  );

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

  context.subscriptions.push(
    provider,
    onEditorChange,
    onActiveEditorChanged,
    onWillDeleteFiles,
    showMoreResults,
  );
}

export function deactivate() {}
