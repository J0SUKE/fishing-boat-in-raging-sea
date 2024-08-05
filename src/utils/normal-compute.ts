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
  normals3Barycenters: THREE.Vector3[]

  medianElevation: number

  //debug canvas
  debugCanvas: HTMLCanvasElement
  debugCanvasContext: CanvasRenderingContext2D

  //debug normalVector
  normalLine: THREE.Line | null
  normalLines: THREE.Line[] | null

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
    this.normals3Barycenters = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]
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
    let elevation = 0

    const pixelsCount = pixelData.length / 4
    const half = Math.floor(pixelsCount * 0.5)
    const start = Math.floor(pixelsCount * (1 / 3))
    const end = Math.floor(pixelsCount * (2 / 3))

    const normalsArray = new Float32Array(pixelsCount * 3)

    for (let i = 0; i < pixelsCount; i++) {
      const i4 = i * 4
      const i3 = i * 3

      const col = (i % this.size.width) * this.size.height
      const row = Math.floor(i / this.size.width) * this.size.height

      if (col > start && col < end && row > start && row < end) {
        elevation += pixelData[i4 + 3]
      }

      const x = (normalsArray[i3] = (pixelData[i4] - 0.5) * 2)
      const y = (normalsArray[i3 + 1] = (pixelData[i4 + 1] - 0.5) * 2)
      const z = (normalsArray[i3 + 2] = (pixelData[i4 + 2] - 0.5) * 2)

      if (col >= 0 && col < half) {
        this.normals3Barycenters[0].add(new THREE.Vector3(x, y, z))
      } else {
        this.normals3Barycenters[2].add(new THREE.Vector3(x, y, z))
      }

      this.normals3Barycenters[1].add(new THREE.Vector3(x, y, z))
      this.normalResult.add(new THREE.Vector3(x, y, z))
    }

    //this.medianElevation = calculateMedian(elevations)
    this.medianElevation = elevation / ((end - start) * 0.5)

    this.normalResult.normalize()
    this.normals3Barycenters.forEach((vector) => {
      vector.normalize()
    })
  }

  getNormalResult() {
    return this.normalResult
  }

  getNormal3Barycentres() {
    return this.normals3Barycenters
  }

  getMedianElevation() {
    const strengh = this.normalMaterial.uniforms.uWavesStrengh.value

    return this.medianElevation + Math.pow(strengh, Math.ceil(strengh) * 4.5)
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

    const pixelsCount = pixelData.length / 4
    const half = Math.floor(pixelsCount * 0.5)
    const third = Math.floor(pixelsCount * 0.4)
    const twoThirds = Math.floor(pixelsCount * 0.6)

    for (let i = 0; i < pixelsCount; i++) {
      // Convert from [0, 1] to [0, 255]
      const i4 = i * 4

      const col = (i % this.size.width) * this.size.height
      const row = Math.floor(i / this.size.width) * this.size.height

      imageData.data[i4] = pixelData[i * 4] * 255
      imageData.data[i4 + 1] = pixelData[i * 4 + 1] * 255
      imageData.data[i4 + 2] = pixelData[i * 4 + 2] * 255
      imageData.data[i4 + 3] = 255
    }

    this.debugCanvasContext.clearRect(0, 0, this.size.width, this.size.height)
    this.debugCanvasContext.putImageData(imageData, 0, 0)
  }

  /*
   *Visualize Normal Result
   */
  drawNormalsResult() {
    if (this.normalLines) {
      this.normalLines.forEach((line) => {
        line.geometry.dispose()
        if (line.material instanceof THREE.Material) line.material.dispose()
        this.scene.remove(line)
      })
      this.normalLines = null
    }

    const frontBarycenter = new THREE.Vector3(1, 0.4, 0) // Front barycenter
    const centerBarycenter = new THREE.Vector3(0, 0.2, 0) // Front barycenter
    const rearBarycenter = new THREE.Vector3(-1, 0.2, 0) // Front barycenter
    const barycenters = [rearBarycenter, centerBarycenter, frontBarycenter]

    this.normalLines = []

    for (let i = 0; i < this.normals3Barycenters.length; i++) {
      const points = []
      points.push(barycenters[i])
      points.push(this.normals3Barycenters[i].multiplyScalar(2))

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color: 'white' })

      this.normalLines.push(new THREE.Line(geometry, material))

      this.scene.add(this.normalLines[i])
    }
  }

  // drawNormalResult() {
  //   if (this.normalLine) {
  //     this.normalLine.geometry.dispose()
  //     if (this.normalLine.material instanceof THREE.Material) this.normalLine.material.dispose()
  //     this.scene.remove(this.normalLine)
  //     this.normalLine = null
  //   }

  //   const points = []
  //   points.push(new THREE.Vector3(0, 0, 0))
  //   points.push(this.normalResult.multiplyScalar(2))

  //   const geometry = new THREE.BufferGeometry().setFromPoints(points)
  //   const material = new THREE.LineBasicMaterial({ color: 'white' })

  //   this.normalLine = new THREE.Line(geometry, material)
  //   this.scene.add(this.normalLine)
  // }

  render(time: number) {
    this.normalMaterial.uniforms.uTime.value = time

    this.renderer.setRenderTarget(this.normalRenderTarget)
    this.renderer.render(this.normalPlane, this.orthoCamera)

    const pixelData = this.readRenderTargetPixels()

    this.computeNormalsResult(pixelData)
    //this.updateNormalCanvas(pixelData)

    //this.drawNormalsResult()

    this.renderer.setRenderTarget(null)
  }
}
