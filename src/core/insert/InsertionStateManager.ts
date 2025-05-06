import * as vscode from "vscode";

let state: {
  editor: vscode.TextEditor;
  position: vscode.Position;
  completions: string[];
  currentIndex: number;
  decorationType: vscode.TextEditorDecorationType;
} | null = null;

export class InsertionStateManager {
  static setState(newState: {
    editor: vscode.TextEditor;
    position: vscode.Position;
    completions: string[];
    currentIndex: number;
    decorationType: vscode.TextEditorDecorationType;
  }) {
    this.clear();
    state = newState;
  }

  static getState() {
    return state;
  }

  static hasActiveSession() {
    return !!state;
  }

  static clear() {
    if (state?.decorationType) {
      state.decorationType.dispose();
    }
    state = null;
  }
}
