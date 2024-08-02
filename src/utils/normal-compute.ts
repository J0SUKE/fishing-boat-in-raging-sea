import * as THREE from 'three'
import normalFragmentShader from '../shaders/normalFragment.glsl'
import normalVertexShader from '../shaders/normalVertex.glsl'

interface Props {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  verticesCount: number
  geometry: THREE.PlaneGeometry
}

export default class ComputeNormals {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  orthoCamera: THREE.OrthographicCamera
  normalRenderTarget: THREE.WebGLRenderTarget
  normalPlane: THREE.Mesh
  debugPlane: THREE.Mesh
  normalDataTexture: THREE.DataTexture
  verticesCount: number
  normalMaterial: THREE.ShaderMaterial
  normalGeometry: THREE.PlaneGeometry

  constructor({ scene, renderer, verticesCount, geometry }: Props) {
    this.scene = scene
    this.renderer = renderer
    this.verticesCount = verticesCount
    this.normalGeometry = geometry.clone()

    this.createNormalRenderTarget()
    this.createNormalScene()
    this.createDebugPlane()
  }

  createNormalRenderTarget() {
    this.normalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    })
  }

  createNormalScene() {
    const { height, width } = this.normalGeometry.parameters

    this.orthoCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, height)

    this.normalMaterial = new THREE.ShaderMaterial({
      vertexShader: normalVertexShader,
      fragmentShader: normalFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
      },
    })

    this.normalPlane = new THREE.Mesh(this.normalGeometry, this.normalMaterial)
  }

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

  getNormalDataTexture() {
    return this.normalDataTexture
  }

  render(time: number) {
    this.normalMaterial.uniforms.uTime.value = time

    this.renderer.setRenderTarget(this.normalRenderTarget)
    this.renderer.render(this.normalPlane, this.orthoCamera)

    this.renderer.setRenderTarget(null)

    this.normalDataTexture = new THREE.DataTexture(
      this.normalRenderTarget.texture.image.data,
      this.verticesCount,
      this.verticesCount,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    this.normalDataTexture.needsUpdate = true

    const debugMaterial = this.debugPlane.material as THREE.ShaderMaterial
    debugMaterial.uniforms.uTexture.value = this.normalRenderTarget.texture
  }
}
