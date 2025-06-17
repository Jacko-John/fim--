import * as vscode from "vscode";
import { ConfigManager } from "../../config/ConfigManager";
import { Comp } from "./completion";
import { StatusManager } from "../status/StatusManager";

export class ModelPanel {
  private static currentPanel: vscode.WebviewPanel | undefined;
  private static onCompletionSelected: ((index: number) => void) | undefined;

  public static createOrShow(
    modelId: string,
    completions: string[],
    onSelect?: (index: number) => void
  ) {
    this.onCompletionSelected = onSelect;

    if (this.currentPanel) {
      this.updateContent(modelId, completions);
      return;
    }

    // 创建固定在最右侧的面板
    this.currentPanel = vscode.window.createWebviewPanel(
      "modelCompletions",
      "AI Completions",
      {
        viewColumn: vscode.ViewColumn.Three,
        preserveFocus: true,
      },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    // 处理来自webview的消息
    this.currentPanel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "selectCompletion":
          if (this.onCompletionSelected) {
            // this.onCompletionSelected(message.index);
            Comp.Index = message.index; // 更新全局Index
            // 可以在这里添加其他需要的处理逻辑
            StatusManager.isHaveRequiredApi = true;
            console.log(`Selected completion index: ${Comp.Index}`);
            vscode.commands.executeCommand(
              "editor.action.inlineSuggest.trigger"
            );
          }
          return;
      }
    });

    this.updateContent(modelId, completions);

    // 当面板被关闭时
    this.currentPanel.onDidDispose(() => {
      this.currentPanel = undefined;
      ConfigManager.setWebviewOpened(false);
    }, null);

    ConfigManager.setWebviewOpened(true);
  }

  public static hide() {
    if (this.currentPanel) {
      this.currentPanel.dispose();
    }
  }

  public static selectPreviousCompletion() {
    if (this.currentPanel) {
      this.currentPanel.webview.postMessage({
        command: 'selectPrevious'
      });
    }
  }

  public static selectNextCompletion() {
    if (this.currentPanel) {
      this.currentPanel.webview.postMessage({
        command: 'selectNext'
      });
    }
  }

  private static updateContent(modelId: string, completions: string[]) {
    if (!this.currentPanel) return;
    this.currentPanel.webview.html = this.getWebviewContent(
      modelId,
      completions
    );
  }

  private static getWebviewContent(modelId: string, completions: string[]) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        padding: 20px;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-editor-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .completion-item {
                        padding: 10px;
                        margin: 10px 0;
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .completion-item.selected {
                        border-color: var(--vscode-focusBorder);
                        background-color: var(--vscode-list-activeSelectionBackground);
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        background-color: var(--vscode-textBlockQuote-background);
                        padding: 8px;
                        border-radius: 4px;
                    }
                    h2 {
                        color: var(--vscode-editor-foreground);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 8px;
                    }
                    h3 {
                        color: var(--vscode-textLink-foreground);
                    }
                </style>
                <script>
                    const vscode = acquireVsCodeApi();
                    let currentIndex = -1;
                    let totalItems = 0;
                    
                    function selectCompletion(index) {
                        // 移除之前选中项的高亮
                        const items = document.querySelectorAll('.completion-item');
                        items.forEach(item => item.classList.remove('selected'));
                        
                        // 设置新的选中项
                        if (index >= 0 && index < items.length) {
                            items[index].classList.add('selected');
                            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            currentIndex = index;
                            
                            vscode.postMessage({
                                command: 'selectCompletion',
                                index: index
                            });
                        }
                    }

                    function selectPrevious() {
                        const items = document.querySelectorAll('.completion-item');
                        totalItems = items.length;
                        
                        if (currentIndex > 0) {
                            selectCompletion(currentIndex - 1);
                        } else {
                            selectCompletion(totalItems - 1);
                        }
                    }

                    function selectNext() {
                        const items = document.querySelectorAll('.completion-item');
                        totalItems = items.length;
                        
                        if (currentIndex < totalItems - 1) {
                            selectCompletion(currentIndex + 1);
                        } else {
                            selectCompletion(0);
                        }
                    }

                    // 监听来自扩展的消息
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'selectPrevious':
                                selectPrevious();
                                break;
                            case 'selectNext':
                                selectNext();
                                break;
                        }
                    });

                    // 初始化时选中第一项
                    document.addEventListener('DOMContentLoaded', () => {
                        selectCompletion(0);
                    });
                </script>
            </head>
            <body>
                <h2> 可选补全结果 (使用Ctrl+↑↓键切换) </h2>
                ${completions
                    .map(
                        (completion, index) => `
                        <div class="completion-item">
                            <h3>${modelId} Completions: </h3>
                            <pre>${this.escapeHtml(completion)}</pre>
                        </div>
                    `
                    )
                    .join("")}
            </body>
            </html>
        `;
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
