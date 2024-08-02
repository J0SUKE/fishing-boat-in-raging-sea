import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import normalFragmentShader from '../shaders/normalFragment.glsl'
import ComputeNormals from '../utils/normal-compute'

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
  computeNormals: ComputeNormals

  constructor({ scene, renderer, camera }: Props) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.verticesCount = 50

    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    this.createComputeNormals()
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(5, 5, this.verticesCount, this.verticesCount)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: normalFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uColorA: new THREE.Uniform(new THREE.Color('#0d7bd0')),
        uColorB: new THREE.Uniform(new THREE.Color('#2cc5d6')),
        uTime: new THREE.Uniform(0),
      },
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotateX(-Math.PI / 2)
    this.scene.add(this.mesh)
  }

  createComputeNormals() {
    this.computeNormals = new ComputeNormals({
      scene: this.scene,
      renderer: this.renderer,
      verticesCount: this.verticesCount,
      geometry: this.geometry,
    })
  }

  render(time: number) {
    this.material.uniforms.uTime.value = time

    this.computeNormals.render(time)
  }
}
