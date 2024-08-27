export class SerialQueue {
  private queue: Array<() => Promise<void>> = [];

  private processNextItem() {
    const nextItem = this.queue[0];

    if (!nextItem) {
      return;
    }

    nextItem().finally(() => {
      this.queue.shift();
      this.processNextItem();
    });
  }

  add(processItem: () => Promise<void>) {
    this.queue.push(processItem);

    if (this.queue.length === 1) {
      this.processNextItem();
    }
  }
}
