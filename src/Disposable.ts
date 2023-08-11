export class Disposable {
  private toDispose = new Set<() => void>();
  public isDisposed = false;

  public onDispose(cb: () => void) {
    this.toDispose.add(cb);

    return () => {
      this.toDispose.delete(cb);
    };
  }

  public dispose() {
    if (this.isDisposed) return;

    this.isDisposed = true;
    this.toDispose.forEach((dispose) => {
      dispose();
    });
    this.toDispose.clear();
  }
}
