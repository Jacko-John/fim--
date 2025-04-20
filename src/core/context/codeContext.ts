import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // 存储最近的文档内容
  let lastContent = "";

  //初始化lastContent
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    lastContent = editor.document.getText();
  }

  // 定时器：每隔 500ms 检查文档内容是否变化
  const interval = setInterval(() => {
    if (editor) {
      const currentContent = editor.document.getText();
      if (currentContent !== lastContent) {
        lastContent = currentContent;
        console.log("------------------");
        console.log("Document content changed");
        console.log("Get context:\n", getCodeContext());
        console.log("------------------");
      }
    }
  }, 500); // 每 500ms 检查一次

  // 将定时器清理逻辑添加到扩展上下文
  context.subscriptions.push(
    new vscode.Disposable(() => clearInterval(interval)),
  );
}

function getCodeContext() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage("No active editor!");
    return;
  }

  // 获取光标位置
  const position = editor.selection.active;

  let offset = 5;
  let prefixL = position.line - offset < 0 ? 0 : position.line - offset;
  let suffixL =
    position.line + offset > editor.document.lineCount
      ? editor.document.lineCount
      : position.line + offset;

  console.log(`prefixL: ${prefixL}, suffixL: ${suffixL}`);
  let rangeText = "";
  for (let l = prefixL; l < suffixL; l++) {
    const range = editor.document.lineAt(l).range;
    let text = editor.document.getText(range);

    if (l === position.line) {
      text =
        text.slice(0, position.character) +
        "<$cursor$>" +
        text.slice(position.character);
    }
    rangeText += `${text}\n`;
  }
  return rangeText;
}

export function deactivate() {}
