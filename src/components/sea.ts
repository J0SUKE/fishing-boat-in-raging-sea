import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import normalFragmentShader from '../shaders/normals/normalFragment.glsl'
import ComputeNormals from '../utils/normal-compute'
import GUI from 'lil-gui'

interface Props {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  debug: GUI
}

export default class Sea {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  mesh: THREE.Mesh
  renderer: THREE.WebGLRenderer
  computeNormals: ComputeNormals
  debug: GUI

  constructor({ scene, renderer, camera, debug }: Props) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.debug = debug

    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    this.createComputeNormals()
    this.setupDebug()
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(5, 5, 100, 100)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uColorA: new THREE.Uniform(new THREE.Color('#0d7bd0')),
        uColorB: new THREE.Uniform(new THREE.Color('#2cc5d6')),
        uTime: new THREE.Uniform(0),
        uWavesStrengh: new THREE.Uniform(0.4),
        uWavesFreq: new THREE.Uniform(new THREE.Vector2(1, 0.3)),
      },
    })
  }

  setupDebug() {
    this.debug.add(this.material.uniforms.uWavesStrengh, 'value').min(0.1).max(0.4).step(0.001).name('waves Strengh')

    this.debug.add(this.material.uniforms.uWavesFreq.value, 'x').min(0).max(3).step(0.1).name('X waves Frequency')
    //this.debug.add(this.material.uniforms.uWavesStrengh.value,'y').min(0).max(0.3).step(0.001)
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
      geometry: this.geometry,
      uniforms: this.material.uniforms,
    })
  }

  render(time: number) {
    this.material.uniforms.uTime.value = time

    this.computeNormals.render(time)
  }
}
