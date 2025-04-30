import * as vscode from "vscode";

// 全局变量，用于初始化
let activeDecorationType: vscode.TextEditorDecorationType | null = null;

export async function insertCode(
  editor: vscode.TextEditor | undefined,
  completions: string[]
) {
  if (!editor) {
    return;
  }
  if (completions.length === 0) {
    vscode.window.showInformationMessage("没有可用的补全结果。");
    return;
  }

  // 默认选择第一个补全结果
  const selectedCompletion = completions[0];

  // 获取当前光标位置
  const position = editor.selection.active;

  // 初始化装饰器类型
  if (activeDecorationType) {
    activeDecorationType.dispose();
    activeDecorationType = null;
  }

  // 创建装饰器类型，用于显示 inline 提示
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: selectedCompletion,
      color: "rgba(150, 150, 150, 0.8)", // 设置提示文本的颜色
    },
  });

  // 保存当前装饰器到全局变量
  activeDecorationType = decorationType;

  // 应用装饰器
  editor.setDecorations(decorationType, [
    {
      range: new vscode.Range(position, position),
    },
  ]);

  // 等待用户按下 Tab 键（回车）
  const disposable = vscode.commands.registerCommand("type", async (args) => {
    if (args.text === "\n") {
      // \t 是 Tab 键的指令形式, 但是没有反应。？
      // 用户按下 Tab 键，插入补全内容
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, selectedCompletion);
      });

      vscode.window.showInformationMessage("补全已插入！");
    } else {
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, args.text);
      }); // 有点捞，但想不到更好的办法了

      vscode.window.showInformationMessage("跳过此补全！"); // Backspace键没跳过？
    }
    // 清除装饰器
    decorationType.dispose();
 
    // 注销监听
    disposable.dispose();
  });
}
