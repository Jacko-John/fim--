import * as vscode from "vscode";

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

  // 创建装饰器类型，用于显示 inline 提示
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: selectedCompletion,
      color: "rgba(150, 150, 150, 0.8)", // 设置提示文本的颜色
    },
  }); 

  // 应用装饰器
  editor.setDecorations(decorationType, [
    {
      range: new vscode.Range(position, position),
    },
  ]);

  // 等待用户按下 Tab 键
  const disposable = vscode.commands.registerCommand("type", async (args) => {
    if (args.text === "\n") { // \t 是 Tab 键的指令形式, 但是没有反应。。。？
      // 用户按下 Tab 键，插入补全内容
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, selectedCompletion);
      });
 
      // 清除装饰器
      decorationType.dispose();

      // 注销监听
      disposable.dispose();
 
      vscode.window.showInformationMessage("补全已插入！");
    }
  });

  // 使用编辑器的编辑功能插入补全内容
  // await editor.edit(
  //   (editBuilder: { insert: (arg0: any, arg1: string) => void }) => {
  //     editBuilder.insert(position, selectedCompletion);
  //   },
  // );
}
