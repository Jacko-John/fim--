export class StatusManager {
  private static debounceTimer: number = 0;
  private static debounceInterval: number = 3000;
  private static enable: boolean = true;
  public static getStatus(): boolean {
    const newTimer = new Date().getTime();
    if (
      StatusManager.debounceTimer + StatusManager.debounceInterval >
      newTimer
    ) {
      return false;
    }
    StatusManager.debounceTimer = newTimer;
    const enable = StatusManager.enable;
    StatusManager.enable = false;
    return enable;
  }

  public static resetStatus(): void {
    StatusManager.enable = true;
  }
}
