import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl'
import seaVertexShader from '../shaders/sea/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import seaFragmentShader from '../shaders/sea/fragment.glsl'
import normalFragmentShader from '../shaders/normals/normalFragment.glsl'
import ComputeNormals from '../utils/normal-compute'
import GUI from 'lil-gui'
import { CSG } from 'three-csg-ts'

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

  //water container
  waterContainer: THREE.Mesh
  boxMesh: THREE.Mesh
  waterContainerMaterial: THREE.ShaderMaterial
  waterContainerGeometry: THREE.BoxGeometry

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
    this.createWaterContainer()
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(5, 5, 128, 128)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColorA: new THREE.Uniform(new THREE.Color('#0d7bd0')),
        uColorB: new THREE.Uniform(new THREE.Color('#2cc5d6')),
        uTime: new THREE.Uniform(0),
        uWavesStrengh: new THREE.Uniform(0.4),
        uWavesFreq: new THREE.Uniform(new THREE.Vector2(1, 0.4)),
      },
      transparent: true,
      depthWrite: false,
    })
  }

  setupDebug() {
    this.debug.add(this.material.uniforms.uWavesStrengh, 'value').min(0.1).max(0.6).step(0.001).name('waves Strengh')

    //this.debug.add(this.material.uniforms.uWavesFreq.value, 'x').min(0.5).max(1).step(0.1).name('X waves Frequency')
    //this.debug.add(this.material.uniforms.uWavesFreq.value, 'y').min(0.5).max(1).step(0.1).name('Z waves Frequency')
    //this.debug.addColor(this.material.uniforms.uColorA, 'value')
    //this.debug.addColor(this.material.uniforms.uColorB, 'value')
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotateX(-Math.PI / 2)
    //this.scene.add(this.mesh)
  }

  createComputeNormals() {
    this.computeNormals = new ComputeNormals({
      scene: this.scene,
      renderer: this.renderer,
      geometry: this.geometry,
      uniforms: this.material.uniforms,
    })
  }

  createWaterContainer() {
    const { width, height, widthSegments, heightSegments } = this.geometry.parameters

    this.waterContainerGeometry = new THREE.BoxGeometry(width, 1, height, widthSegments, 1, heightSegments)
    this.waterContainerMaterial = new THREE.ShaderMaterial({
      vertexShader: seaVertexShader,
      fragmentShader: seaFragmentShader,
      transparent: true,
      uniforms: {
        ...this.material.uniforms,
      },
      depthWrite: false,
      //blending: THREE.AdditiveBlending,
    })

    this.waterContainer = new THREE.Mesh(this.waterContainerGeometry, this.waterContainerMaterial)

    this.waterContainer.position.y -= 0.5

    this.scene.add(this.waterContainer)
  }

  getWavesStrengh() {
    return this.material.uniforms.uWavesStrengh.value
  }

  render(time: number) {
    this.material.uniforms.uTime.value = time

    this.computeNormals.render(time)

    //const elevations = this.computeNormals.getElevations()
    //this.waterContainerGeometry?.setAttribute('elevation', elevations)
  }
}
