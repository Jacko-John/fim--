export class StatusManager {
  private static debounceTimer: number = 0;
  private static debounceInterval: number = 3000;
  private static stopFactor: number = 1;
  private static enable: boolean = true;
  private static isStopped: boolean = false;
  private static acceptedItems: number = 0;
  private static totalItems: number = 0;
  public static getStatus(): boolean {
    if (StatusManager.isStopped) {
      return false;
    }
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

  public static addAcceptedItem(): void {
    StatusManager.acceptedItems++;
    StatusManager.checkWehtherToStop();
  }

  public static addTotalItem(): void {
    StatusManager.totalItems++;
  }

  private static checkWehtherToStop() {
    if (StatusManager.isStopped || StatusManager.totalItems <= 10) return;
    const factor = StatusManager.acceptedItems / StatusManager.totalItems;
    if (factor < 0.3) {
      StatusManager.isStopped = true;
      setTimeout(
        () => {
          StatusManager.isStopped = false;
          StatusManager.totalItems = 0;
          StatusManager.acceptedItems = 0;
        },
        1000 * 60 * 2 * StatusManager.stopFactor,
      );
      StatusManager.stopFactor = Math.min(StatusManager.stopFactor + 1, 5);
    } else if (factor >= 0.5) {
      StatusManager.stopFactor = Math.max(StatusManager.stopFactor - 1, 1);
    }
  }
}
