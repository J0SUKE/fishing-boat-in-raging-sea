import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import normalFragmentShader from '../shaders/normalFragment.glsl'

interface Props {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
}

export default class Sea {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  mesh: THREE.Mesh
  verticesCount: number
  renderer: THREE.WebGLRenderer

  //normal
  normalRenderTarget: THREE.WebGLRenderTarget
  normalMaterial: THREE.ShaderMaterial

  constructor({ scene, renderer, camera }: Props) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.verticesCount = 50

    this.createGeometry()
    this.createMaterial()
    this.createMesh()

    this.createNormalRenderTarget()
    this.createNormalMaterial()
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(5, 5, this.verticesCount, this.verticesCount)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: new THREE.Uniform(new THREE.Color('#0d7bd0')),
        uTime: new THREE.Uniform(0),
      },
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotateX(-Math.PI / 2)
    this.scene.add(this.mesh)
  }

  //normal
  createNormalMaterial() {
    this.normalMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: normalFragmentShader,
    })
  }

  createNormalRenderTarget() {
    this.normalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    })
  }

  render(time: number) {
    this.material.uniforms.uTime.value = time
  }
}
