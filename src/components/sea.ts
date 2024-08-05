import * as THREE from 'three'
import seaVertexShader from '../shaders/sea/vertex.glsl'
import seaFragmentShader from '../shaders/sea/fragment.glsl'
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
  geometry: THREE.BoxGeometry
  surfaceGeometry: THREE.PlaneGeometry
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

    //the surface of the water will be a plane
    this.createSurfaceGeometry()
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    this.createComputeNormals()
    this.setupDebug()
  }

  createSurfaceGeometry() {
    this.surfaceGeometry = new THREE.PlaneGeometry(5, 5, 128, 128)
    this.surfaceGeometry.deleteAttribute('normal')
    this.surfaceGeometry.deleteAttribute('uv')
  }

  createGeometry() {
    const { width, height, widthSegments, heightSegments } = this.surfaceGeometry.parameters
    this.geometry = new THREE.BoxGeometry(width, 1, height, widthSegments, 1, heightSegments)
    this.geometry.deleteAttribute('normal')
    this.geometry.deleteAttribute('uv')
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: seaVertexShader,
      fragmentShader: seaFragmentShader,
      uniforms: {
        uColorA: new THREE.Uniform(new THREE.Color('#0d7bd0')),
        uColorB: new THREE.Uniform(new THREE.Color('#2cc5d6')),
        uTime: new THREE.Uniform(0),
        uWavesStrengh: new THREE.Uniform(0.4),
        uWavesFreq: new THREE.Uniform(new THREE.Vector2(1, 0.5)),
      },
      depthWrite: false,
      transparent: true,
    })
  }

  setupDebug() {
    this.debug.add(this.material.uniforms.uWavesStrengh, 'value').min(0.1).max(0.6).step(0.001).name('waves Strengh')

    //this.debug.add(this.material.uniforms.uWavesFreq.value, 'x').min(0.5).max(1).step(0.1).name('X waves Frequency')
    //this.debug.add(this.material.uniforms.uWavesFreq.value, 'y').min(0.5).max(1).step(0.1).name('Z waves Frequency')
    //this.debug.addColor(this.material.uniforms.uColorA, 'value')
    //this.debug.addColor(this.material.uniforms.uColorB, 'value')
  }

  createComputeNormals() {
    this.computeNormals = new ComputeNormals({
      scene: this.scene,
      renderer: this.renderer,
      geometry: this.surfaceGeometry,
      uniforms: this.material.uniforms,
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.mesh.position.y -= 0.5

    this.scene.add(this.mesh)
  }

  getWavesStrengh() {
    return this.material.uniforms.uWavesStrengh.value
  }

  render(time: number) {
    this.material.uniforms.uTime.value = time

    this.computeNormals.render(time)
  }
}
