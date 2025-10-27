import { CronJob, CronJobParams } from 'cron'
import { Logger } from 'tslog'
import { newLogger } from 'useless-helpers'
type CronTaskParams = Partial<Omit<CronJobParams, 'utcOffset' | 'cronTime' | 'start'>>
export abstract class CronTaskBase {
  protected cronExpression: string
  protected taskName: string
  protected runOnInit: boolean
  protected cronJob?: CronJob
  logger: Logger<unknown>

  protected constructor(cronExpression: string, taskName: string = '', runOnInit: boolean = false) {
    this.cronExpression = cronExpression
    this.runOnInit = runOnInit
    this.taskName = taskName || this.constructor.name
    this.logger = newLogger(this.taskName)
  }
  abstract startTask(): Promise<void> | void

  start(params: CronTaskParams = {}): void | Promise<any> {
    this.cronJob = CronJob.from({
      cronTime: this.cronExpression,
      onTick: async () => await this.startTask(),
      start: this.runOnInit,
      timeZone: 'UTC',
      waitForCompletion: true,
      ...params,
    })
    this.cronJob.start()
  }

  async stop(): Promise<any> {
    await this.cronJob.stop()
  }
}
