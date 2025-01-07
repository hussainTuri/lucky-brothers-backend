export class Timer {
  private readonly startTime: number;
  private readonly label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }

  stop() {
    const duration = Date.now() - this.startTime;
    console.log(`[TIMER] ${this.label}: ${duration} ms`);
  }
}
