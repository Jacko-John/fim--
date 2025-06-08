export class History {
  current: string[] = [];
  addHistory(filePath: string): void {
    this.deleteHistory(filePath);
    const length = this.current.unshift(filePath);
    if (length > 10) {
      this.current.pop();
    }
  }

  deleteHistory(filePath: string): void {
    const idx = this.current.indexOf(filePath);
    if (idx !== -1) {
      this.current.splice(idx, 1);
    }
  }

  getHistory(): string[] {
    return this.current;
  }

  clearHistory(): void {
    this.current = [];
  }
}
