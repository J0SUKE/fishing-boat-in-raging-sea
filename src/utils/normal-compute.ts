import * as THREE from 'three'
import normalFragmentShader from '../shaders/normals/normalFragment.glsl'
import normalVertexShader from '../shaders/normals/normalVertex.glsl'
import { Size, Uniforms } from '../types/types'

interface Props {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  geometry: THREE.PlaneGeometry
  uniforms: Uniforms
}

function calculateMedian(arr: number[]) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('The input should be a non-empty array')
  }

  // Sort the array in ascending order
  arr.sort((a, b) => a - b)

  const mid = Math.floor(arr.length / 2)

  // If the array length is odd, return the middle element
  if (arr.length % 2 !== 0) {
    return arr[mid]
  }

  // If the array length is even, return the average of the two middle elements
  return (arr[mid - 1] + arr[mid]) / 2
}

export default class ComputeNormals {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  orthoCamera: THREE.OrthographicCamera
  normalRenderTarget: THREE.WebGLRenderTarget
  normalPlane: THREE.Mesh
  debugPlane: THREE.Mesh
  normalMaterial: THREE.ShaderMaterial
  normalUniforms: Uniforms
  norm: THREE.ShaderMaterial

  normalGeometry: THREE.PlaneGeometry
  size: Size
  normalResult: THREE.Vector3
  medianElevation: number

  //debug canvas
  debugCanvas: HTMLCanvasElement
  debugCanvasContext: CanvasRenderingContext2D

  //debug normalVector
  normalLine: THREE.Line | null

  constructor({ scene, renderer, geometry, uniforms }: Props) {
    this.scene = scene
    this.renderer = renderer
    this.normalUniforms = { ...uniforms }

    this.normalGeometry = geometry.clone()
    this.size = {
      width: this.normalGeometry.parameters.widthSegments,
      height: this.normalGeometry.parameters.heightSegments,
    }

    this.normalResult = new THREE.Vector3(0, 0, 0)

    this.createNormalRenderTarget()
    this.createNormalScene()
    //this.createDebugPlane()
    //this.createDebugCanvas()
  }

  createNormalRenderTarget() {
    this.normalRenderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    })
  }

  createNormalScene() {
    const { height, width } = this.normalGeometry.parameters

    this.orthoCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, height / 2)
    this.orthoCamera.position.set(0, height / 4, 0) // Position the camera above the plane
    this.orthoCamera.lookAt(0, 0, 0)

    this.normalMaterial = new THREE.ShaderMaterial({
      vertexShader: normalVertexShader,
      fragmentShader: normalFragmentShader,
      uniforms: this.normalUniforms,
    })

    this.normalPlane = new THREE.Mesh(this.normalGeometry, this.normalMaterial)
    this.normalPlane.rotateX(-Math.PI / 2)
  }

  computeNormalsResult(pixelData: Float32Array) {
    this.normalResult = new THREE.Vector3(0, 0, 0)
    //const elevations = []
    let elevations = 0

    for (let i = 0; i < pixelData.length / 4; i++) {
      const i4 = i * 4

      // Convert from [0, 1] to [-1, 1]
      const x = (pixelData[i4] - 0.5) * 2
      const y = (pixelData[i4 + 1] - 0.5) * 2
      const z = (pixelData[i4 + 2] - 0.5) * 2

      //elevations.push(pixelData[i4 + 3])
      elevations += pixelData[i4 + 3]

      this.normalResult.add(new THREE.Vector3(x, y, z))
    }

    //this.medianElevation = calculateMedian(elevations)
    this.medianElevation = elevations / (pixelData.length / 4)

    this.normalResult.normalize()
  }

  getNormalResult() {
    return this.normalResult
  }

  getMedianElevation() {
    return this.medianElevation * 2
  }

  /*
   *Debug Plane
   */
  createDebugPlane() {
    this.debugPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: `        
      
      varying vec2 vUv;
      
      void main()
      {
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);        
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;  
          
          vUv=uv;
      }
      `,
        fragmentShader: `
       uniform sampler2D uTexture;
       varying vec2 vUv;
       
       void main()
       {
         gl_FragColor = texture2D(uTexture,vUv);
       } 
      `,
        uniforms: {
          uTexture: new THREE.Uniform(new THREE.Vector4()),
        },
      })
    )

    this.debugPlane.position.y = 1

    this.scene.add(this.debugPlane)
  }
  updateDebugPlaneTexture() {
    const debugMaterial = this.debugPlane.material as THREE.ShaderMaterial
    debugMaterial.uniforms.uTexture.value = this.normalRenderTarget.texture
  }

  /*
   *Canvas
   */
  createDebugCanvas() {
    this.debugCanvas = document.createElement('canvas')
    this.debugCanvas.width = this.size.width
    this.debugCanvas.height = this.size.height

    this.debugCanvas.style.position = 'fixed'
    this.debugCanvas.style.width = '256px'
    this.debugCanvas.style.height = '256px'
    this.debugCanvas.style.top = '0px'
    this.debugCanvas.style.left = '0px'
    this.debugCanvas.style.zIndex = '100'

    document.body.append(this.debugCanvas)

    this.debugCanvasContext = this.debugCanvas.getContext('2d') as CanvasRenderingContext2D
  }

  readRenderTargetPixels() {
    const buffer = new Float32Array(this.size.width * this.size.height * 4)
    this.renderer.readRenderTargetPixels(this.normalRenderTarget, 0, 0, this.size.width, this.size.height, buffer)
    return buffer
  }

  updateNormalCanvas = (pixelData: Float32Array) => {
    const imageData = this.debugCanvasContext.createImageData(this.size.width, this.size.height)

    for (let i = 0; i < pixelData.length / 4; i++) {
      // Convert from [0, 1] to [0, 255]
      imageData.data[i * 4] = pixelData[i * 4] * 255
      imageData.data[i * 4 + 1] = pixelData[i * 4 + 1] * 255
      imageData.data[i * 4 + 2] = pixelData[i * 4 + 2] * 255
      imageData.data[i * 4 + 3] = 255 // Alpha channel
    }

    this.debugCanvasContext.clearRect(0, 0, this.size.width, this.size.height)
    this.debugCanvasContext.putImageData(imageData, 0, 0)
  }

  /*
   *Visualize Normal Result
   */
  drawNormalResult() {
    if (this.normalLine) {
      this.normalLine.geometry.dispose()
      if (this.normalLine.material instanceof THREE.Material) this.normalLine.material.dispose()
      this.scene.remove(this.normalLine)
      this.normalLine = null
    }

    const points = []
    points.push(new THREE.Vector3(0, 0, 0))
    points.push(this.normalResult.multiplyScalar(2))

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: 'white' })

    this.normalLine = new THREE.Line(geometry, material)
    this.scene.add(this.normalLine)
  }

  render(time: number) {
    this.normalMaterial.uniforms.uTime.value = time

    this.renderer.setRenderTarget(this.normalRenderTarget)
    this.renderer.render(this.normalPlane, this.orthoCamera)

    const pixelData = this.readRenderTargetPixels()

    this.computeNormalsResult(pixelData)
    //this.updateNormalCanvas(pixelData)

    this.drawNormalResult()

    this.renderer.setRenderTarget(null)
  }
}
