export interface PerformanceMetric {
  component: string
  action: string
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private marks: Record<string, number> = {}
  private thresholds = {
    render: 16, // ms (targeting 60fps)
    dataFetch: 500, // ms
    interaction: 100, // ms
  }

  mark(name: string) {
    this.marks[name] = performance.now()
  }

  measure(startMark: string, endMark: string, metadata?: Record<string, any>): PerformanceMetric {
    const startTime = this.marks[startMark]
    const endTime = this.marks[endMark]
    
    if (!startTime || !endTime) {
      throw new Error(`Missing marks for measurement: ${startMark} -> ${endMark}`)
    }

    const metric: PerformanceMetric = {
      component: startMark.split('_')[0],
      action: startMark.split('_')[1],
      startTime,
      endTime,
      duration: endTime - startTime,
      metadata,
    }

    this.metrics.push(metric)
    return metric
  }

  isPerformant(metric: PerformanceMetric): boolean {
    const threshold = this.thresholds[metric.action as keyof typeof this.thresholds] || 100
    return metric.duration <= threshold
  }

  getMetrics() {
    return this.metrics
  }

  clearMetrics() {
    this.metrics = []
    this.marks = {}
  }
}

export const performanceMonitor = new PerformanceMonitor()

export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  component: string,
  action: string
): T {
  return ((...args: Parameters<T>) => {
    const startMark = `${component}_${action}_start`
    const endMark = `${component}_${action}_end`
    
    performanceMonitor.mark(startMark)
    const result = fn(...args)
    
    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.finally(() => {
        performanceMonitor.mark(endMark)
        performanceMonitor.measure(startMark, endMark)
      })
    }
    
    performanceMonitor.mark(endMark)
    performanceMonitor.measure(startMark, endMark)
    return result
  }) as T
}