import * as vscode from 'vscode';

export class ModelPanel {
    private static panels: Map<string, vscode.WebviewPanel> = new Map();
    
    public static createOrShow(modelId: string, completions: string[]) {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this.panels.has(modelId)) {
            this.panels.get(modelId)?.reveal(columnToShowIn);
            this.updateContent(modelId, completions);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            `model-${modelId}`,
            `Model ${modelId} Completions`,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panels.set(modelId, panel);
        this.updateContent(modelId, completions);

        panel.onDidDispose(() => {
            this.panels.delete(modelId);
        });
    }

    private static updateContent(modelId: string, completions: string[]) {
        const panel = this.panels.get(modelId);
        if (!panel) return;

        panel.webview.html = this.getWebviewContent(modelId, completions);
    }

    private static getWebviewContent(modelId: string, completions: string[]) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { padding: 20px; }
                    .completion-item {
                        padding: 10px;
                        margin: 10px 0;
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
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

    public static closeAll() {
        this.panels.forEach(panel => panel.dispose());
        this.panels.clear();
    }
}