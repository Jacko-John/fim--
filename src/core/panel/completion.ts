import * as vscode from "vscode";

export class Comp {
  /** 补全结果的索引，没有匹配结果则为-1 */
  public static Index: number = 0;
  public static status = 0;

  /** 补全结果 -- 包含当前行
   * @example completions[completionIndex] = prefixOnCursor + completion
   */
  public static comps: string[] = [
    `\nprint("000000000")`,
    `\nprint("111111111")`,
    `\nprint("222222222")`,
  ];
}

export function AB(){
    console.log("123123123")
    vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    console.log("zvxcvzxcvzxcv")
}
