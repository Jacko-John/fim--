import * as vscode from 'vscode';
import { ConfigManager } from '../../config/ConfigManager';

export class ModelPanel {
    private static currentPanel: vscode.WebviewPanel | undefined;
    
    public static createOrShow(modelId: string, completions: string[]) {
        if (this.currentPanel) {
            this.updateContent(modelId, completions);
            return;
        }

        // 创建固定在最右侧的面板
        this.currentPanel = vscode.window.createWebviewPanel(
            'modelCompletions',
            'AI Completions',
            {
                viewColumn: vscode.ViewColumn.Three,
                preserveFocus: true
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

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

    private static updateContent(modelId: string, completions: string[]) {
        if (!this.currentPanel) return;
        this.currentPanel.webview.html = this.getWebviewContent(modelId, completions);
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
                    .completion-item:hover {
                        border-color: var(--vscode-focusBorder);
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
            </head>
            <body>
                <h2>Model ${modelId} Completions</h2>
                ${completions.map((completion, index) => `
                    <div class="completion-item">
                        <h3>Completion ${index + 1}</h3>
                        <pre>${this.escapeHtml(completion)}</pre>
                    </div>
                `).join('')}
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