import './style.css'
import Canvas from './canvas'
import Debug from './utils/debug'

class App {
  canvas: Canvas
  debug: Debug

  constructor() {
    this.debug = new Debug()
    this.canvas = new Canvas()
    this.render()
  }

  render() {
    this.debug.stats.begin()
    this.canvas.render()
    this.debug.stats.end()
    requestAnimationFrame(this.render.bind(this))
  }
}

export default new App()
