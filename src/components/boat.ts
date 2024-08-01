import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

interface Props {
  scene: THREE.Scene
}

export default class Boat {
  scene: THREE.Scene
  loader: GLTFLoader

  constructor({ scene }: Props) {
    this.scene = scene
    this.createLoader()
    this.createLights()
    this.loadModel()
  }

  createLoader() {
    this.loader = new GLTFLoader()
  }

  createLights() {
    const ambient = new THREE.AmbientLight('white', 1) // soft white light
    this.scene.add(ambient)

    const directionalLight = new THREE.DirectionalLight('white', 10)
    directionalLight.position.set(1, 0, 0)
    //this.scene.add(directionalLight)
  }

  loadModel() {
    this.loader.load('./fishing_boat/scene-v1.glb', (gltf) => {
      gltf.scene.scale.set(0.002, 0.002, 0.002)
      gltf.scene.position.set(0, 0.3, 0)

      gltf.scene.traverse((child) => {
        if ('isMesh' in child && child.isMesh && child instanceof THREE.Mesh) {
          //console.log(child.material)
          if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace
        }
      })

      this.scene.add(gltf.scene)
    })
  }
}
