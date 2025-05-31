import { on } from "events";
import * as vscode from "vscode";

export function registerInlineCompletionProvider(
  context: vscode.ExtensionContext,
) {
  const provider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" }, // 所有文件类型都支持
    {
      async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken,
      ): Promise<vscode.InlineCompletionItem[] | undefined> {
        console.log(context.triggerKind);
        if (
          context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic
        ) {
          return [];
        }
        console.log(context.selectedCompletionInfo);
        console.log("provideInlineCompletionItems");
        // 示例：从 API 或缓存中获取的补全建议
        const completions = await fetchCompletions(document, position);
        if (!completions || completions.length === 0) {
          return [];
        }

        // 返回多个内联补全项（可按上下文排序）
        return completions.map((completion, index) => {
          const endPosition = document.positionAt(
            document.offsetAt(position) + completion.length,
          );
          return new vscode.InlineCompletionItem(
            completion,
            new vscode.Range(position, endPosition),
            {
              title: "Accept Completion",
              command: "acceptMyInlineCompletion",
              arguments: [completion, position],
            },
          );
        });
      },
    },
  );

  context.subscriptions.push(provider);

  let debounceTimer: NodeJS.Timeout;

  const onEditorChange = vscode.workspace.onDidChangeTextDocument((event) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    });
  });

  context.subscriptions.push(onEditorChange);
}

// 示例函数：模拟异步获取补全结果
async function fetchCompletions(
  document: vscode.TextDocument,
  position: vscode.Position,
): Promise<string[]> {
  // 实际项目中应调用 API 或缓存系统获取补全内容
  // 此处仅作为示例返回静态值
  return ["variableName"];
}
