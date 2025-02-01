export interface HistoryState<T> {
  data: T
  timestamp: number
  description: string
}

export interface UndoableAction<T> {
  type: string
  payload: T
  timestamp: number
  description: string
}

export class HistoryManager<T> {
  private history: HistoryState<T>[] = []
  private currentIndex: number = -1
  private maxHistoryLength: number = 50

  constructor(initialState: T, maxHistoryLength: number = 50) {
    this.pushState(initialState, 'Initial state')
    this.maxHistoryLength = maxHistoryLength
  }

  pushState(data: T, description: string) {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add new state
    this.history.push({
      data,
      timestamp: Date.now(),
      description
    })

    // Remove oldest states if we exceed max length
    if (this.history.length > this.maxHistoryLength) {
      this.history = this.history.slice(
        this.history.length - this.maxHistoryLength
      )
    }

    this.currentIndex = this.history.length - 1
  }

  undo(): HistoryState<T> | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): HistoryState<T> | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  getCurrentState(): HistoryState<T> {
    return this.history[this.currentIndex]
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getHistory(): HistoryState<T>[] {
    return this.history
  }

  getHistoryPreview(): { undo: string | null; redo: string | null } {
    return {
      undo: this.canUndo() ? this.history[this.currentIndex - 1].description : null,
      redo: this.canRedo() ? this.history[this.currentIndex + 1].description : null
    }
  }
}