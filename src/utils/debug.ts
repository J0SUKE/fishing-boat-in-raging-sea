import Stats from 'stats.js'

export default class Debug {
  stats: Stats

  constructor() {
    this.stats = new Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)
  }
}
