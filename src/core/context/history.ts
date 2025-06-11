export class History {
  current: string[] = [];
  addHistory(filePath: string): void {
    const idx = this.current.indexOf(filePath);
    if (idx !== -1) {
      this.current.splice(idx, 1);
    }
    const length = this.current.unshift(filePath);
    if (length > 10) {
      this.current.pop();
    }
  }

  getHistory(): string[] {
    return this.current;
  }

  clearHistory(): void {
    this.current = [];
  }
}
