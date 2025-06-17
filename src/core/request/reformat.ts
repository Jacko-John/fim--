// filepath: d:\Project\fim--\src\core\request\reformat.ts
import { APIResponse } from "../../shared/apis";

export function reformat(messages: any[]): string[] {
  // 提取每个 data.choices 下的 message.content，并去除 Markdown 代码块包裹
  return messages
    .flatMap((msg) =>
      (msg.data?.choices ?? []).map((choice: any) => choice.message?.content),
    )
    .filter((content: any) => typeof content === "string")
    .map((content: string) => {
      // 先去除开头空白，再去除 Markdown 代码块包裹
      return content
        .replace(/^\s*```[\w]*\s*\n?/, "") // 去除开头的空白和 ``` 或 ```javascript
        .replace(/```[\s\n]*$/, "") // 去除结尾的 ``` 及其后空白
        .trim(); // 去除首尾空白
    });
}
