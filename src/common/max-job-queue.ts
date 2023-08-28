class MaxJobQueue {
  private jobCount: number;
  private jobWaitResolve?: () => void;

  constructor(private maxJobs: number) {
    this.jobCount = 0;
  }

  public async addJob<T>(cb: () => T): Promise<T> {
    await new Promise<void>((resolve) => {
      if (this.jobCount < this.maxJobs) {
        resolve();
        return;
      }
      this.jobWaitResolve = resolve;
      this.resolveIfJobAllowed();
    });

    this.jobWaitResolve = undefined;

    this.jobCount += 1;

    let res;
    try {
      res = await cb();
    } finally {
      this.removeJob();
    }
    return res;
  }

  public removeJob() {
    this.jobCount -= 1;
  }

  private resolveIfJobAllowed() {
    const interval = setInterval(() => {
      if (this.jobCount < this.maxJobs) {
        clearInterval(interval);
        this.jobWaitResolve?.();
      }
    }, 500);
  }
}

export { MaxJobQueue };
