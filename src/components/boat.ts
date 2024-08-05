import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

interface Props {
  scene: THREE.Scene
}

export default class Boat {
  scene: THREE.Scene
  loader: GLTFLoader
  model: THREE.Group
  barycenters: THREE.Vector3[]

  constructor({ scene }: Props) {
    this.scene = scene
    this.createLoader()
    this.createLights()
    this.createBarycenters()
    this.loadModel()
  }

  createLoader() {
    this.loader = new GLTFLoader()
  }

  createBarycenters() {
    const frontBarycenter = new THREE.Vector3(1, 0.4, 0) // Front barycenter
    const centerBarycenter = new THREE.Vector3(0, 0.2, 0) // Front barycenter
    const rearBarycenter = new THREE.Vector3(-1, 0.2, 0) // Front barycenter
    this.barycenters = [rearBarycenter, centerBarycenter, frontBarycenter]
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
      gltf.scene.position.set(0, 0.35, 0)

      this.model = gltf.scene
      this.scene.add(this.model)
      //this.model.renderOrder = 1
    })
  }

  render(forces: THREE.Vector3[], elevation: number, strengh: number) {
    if (this.model) {
      // Calculate rotation

      // Reset the model's rotation and position
      this.model.position.set(0, 0, 0)
      this.model.rotation.set(0, 0, 0)

      for (let i = 0; i < 3; i++) {
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forces[i])

        this.model.position.sub(this.barycenters[i])
        this.model.applyQuaternion(quaternion)
        this.model.position.add(this.barycenters[i])
      }

      // Adjust position
      this.model.position.y += 0.35 + elevation
    }
  }
}
