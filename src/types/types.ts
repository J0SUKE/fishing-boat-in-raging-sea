import { IUniform } from 'three'

export interface Size {
  width: number
  height: number
}

export interface Dimensions {
  width: number
  height: number
  pixelRatio: number
}

export interface Position {
  x: number
  y: number
}

export interface Uniforms {
  [uniform: string]: IUniform<any>
}
