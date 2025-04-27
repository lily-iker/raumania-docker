"use client"

import * as THREE from "three"
import { useRef, useEffect, useState } from "react"
import { useGLTF } from "@react-three/drei"
import type { GLTF } from "three-stdlib"
import { useFrame } from "@react-three/fiber"

type GLTFResult = GLTF & {
  nodes: {
    Cube004: THREE.Mesh
    Cube004_1: THREE.Mesh
    Cube004_2: THREE.Mesh
    Cube001: THREE.Mesh
    Cube001_1: THREE.Mesh
    Cube003: THREE.Mesh
    Cube003_1: THREE.Mesh
    Cube003_2: THREE.Mesh
    Cube003_3: THREE.Mesh
  }
  materials: {
    ["Tom ford Cap"]: THREE.MeshStandardMaterial
    Raffles: THREE.MeshStandardMaterial
    TF: THREE.MeshStandardMaterial
    ["Tom Ford Spray"]: THREE.MeshStandardMaterial
    Studio: THREE.MeshStandardMaterial
    ["Tom Ford Bottle"]: THREE.MeshPhysicalMaterial
    T: THREE.MeshStandardMaterial
    ["Tom Ford Liquid"]: THREE.MeshStandardMaterial
  }
}

type PerfumeProps = {
  position?: [number, number, number]
  scale?: number | [number, number, number]
  capOpen?: boolean
  spraying?: boolean
  activeAnimation?: string | null
  bottleColor?: string
  liquidColor?: string
  capColor?: string
}

export function Tom_Ford_Noir({
  position = [0, 0, 0],
  //scale = 1,
  capOpen = false,
  spraying = false,
  activeAnimation = null,
  bottleColor,
  liquidColor,
  capColor,
}: PerfumeProps) {
  const { nodes, materials } = useGLTF("/Tom+Ford+Noir.glb") as unknown as GLTFResult
  const capRef = useRef<THREE.Group>(null)
  const sprayRef = useRef<THREE.Group>(null)
  const bottleRef = useRef<THREE.Group>(null)
  const bottleMeshRef = useRef<THREE.Mesh>(null)
  const liquidMeshRef = useRef<THREE.Mesh>(null)
  const capMeshRef = useRef<THREE.Mesh>(null)

  const [sprayParticles, setSprayParticles] = useState<
    { position: THREE.Vector3; velocity: THREE.Vector3; life: number }[]
  >([])

  // Clone the original materials to avoid modifying the shared materials
  const [customMaterials] = useState(() => {
    // Create a new physical material for the bottle
    const bottleMaterial = new THREE.MeshPhysicalMaterial({
      color: bottleColor ? new THREE.Color(bottleColor) : new THREE.Color("#000000"),
      metalness: 0.1,
      roughness: 0.05,
      envMapIntensity: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      ior: 1.5,
      transmission: 0.05,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
    })

    // Create a new physical material for the liquid
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: liquidColor ? new THREE.Color(liquidColor) : new THREE.Color("#3a3a3a"),
      metalness: 0.0,
      roughness: 0.1,
      envMapIntensity: 1.5,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
      ior: 1.4,
      reflectivity: 0.5,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
    })

    // Create a new physical material for the cap
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: capColor ? new THREE.Color(capColor) : new THREE.Color("#000000"),
      metalness: 0.8,
      roughness: 0.1,
      envMapIntensity: 1.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    })

    return {
      bottleMaterial,
      liquidMaterial,
      capMaterial,
    }
  })

  // Update materials when colors change
  useEffect(() => {
    if (bottleColor) {
      customMaterials.bottleMaterial.color = new THREE.Color(bottleColor)
    }

    if (liquidColor) {
      customMaterials.liquidMaterial.color = new THREE.Color(liquidColor)
    }

    if (capColor) {
      customMaterials.capMaterial.color = new THREE.Color(capColor)
    }
  }, [bottleColor, liquidColor, capColor, customMaterials])

  // Handle animations
  useFrame((state) => {
    // Animate materials for shimmer effect
    if (customMaterials.bottleMaterial.envMapIntensity !== undefined) {
      customMaterials.bottleMaterial.envMapIntensity = 1.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2
    }

    if (customMaterials.liquidMaterial.envMapIntensity !== undefined) {
      customMaterials.liquidMaterial.envMapIntensity = 1.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2
    }

    if (customMaterials.capMaterial.envMapIntensity !== undefined) {
      customMaterials.capMaterial.envMapIntensity = 1.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2
    }

    // Cap animation
    if (capRef.current) {
      if (capOpen) {
        // Animate cap moving up and to the side
        capRef.current.position.y = THREE.MathUtils.lerp(
          capRef.current.position.y,
          0.3, // Target position when open
          0.1,
        )
        capRef.current.position.x = THREE.MathUtils.lerp(
          capRef.current.position.x,
          0.15, // Move to the side
          0.1,
        )
        capRef.current.rotation.z = THREE.MathUtils.lerp(
          capRef.current.rotation.z,
          -Math.PI / 6, // Tilt slightly
          0.1,
        )
      } else {
        // Animate cap closing
        capRef.current.position.y = THREE.MathUtils.lerp(
          capRef.current.position.y,
          0.087, // Original position
          0.1,
        )
        capRef.current.position.x = THREE.MathUtils.lerp(
          capRef.current.position.x,
          0, // Original position
          0.1,
        )
        capRef.current.rotation.z = THREE.MathUtils.lerp(
          capRef.current.rotation.z,
          0, // Original rotation
          0.1,
        )
      }
    }

    // Spray animation
    if (sprayRef.current && spraying) {
      // Add a little press-down animation for the spray
      sprayRef.current.position.y = 0.028 - Math.sin(state.clock.getElapsedTime() * 10) * 0.005

      // Create spray particles
      if (state.clock.getElapsedTime() % 0.1 < 0.05) {
        const newParticles = Array(5)
          .fill(0)
          .map(() => ({
            position: new THREE.Vector3(0, 0.15, 0),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              Math.random() * 0.05 + 0.02,
              (Math.random() - 0.5) * 0.02,
            ),
            life: 1.0,
          }))
        setSprayParticles((prev) => [...prev, ...newParticles])
      }
    }

    // Update spray particles
    if (sprayParticles.length > 0) {
      setSprayParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            position: particle.position.add(particle.velocity),
            life: particle.life - 0.02,
          }))
          .filter((particle) => particle.life > 0),
      )
    }

    // Add subtle animation to the bottle for visual interest
    if (bottleRef.current && activeAnimation === "spray") {
      bottleRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 20) * 0.01
    }
  })

  // Convert scale to array if it's a number
 

  return (
    <group position={position} scale={10} dispose={null}>
      <group name="Scene">
        {/* Cap group */}
        <group ref={capRef} name="Cap" position={[0, 0.087, -0.004]}>
          <mesh
            name="Cube004"
            castShadow
            receiveShadow
            geometry={nodes.Cube004.geometry}
            material={customMaterials.capMaterial}
            ref={capMeshRef}
          />
          <mesh
            name="Cube004_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube004_1.geometry}
            material={materials.Raffles}
          />
          <mesh name="Cube004_2" castShadow receiveShadow geometry={nodes.Cube004_2.geometry} material={materials.TF} />
        </group>

        {/* Spray group */}
        <group ref={sprayRef} name="Spray" position={[0, 0.028, -0.003]}>
          <mesh
            name="Cube001"
            castShadow
            receiveShadow
            geometry={nodes.Cube001.geometry}
            material={materials["Tom Ford Spray"]}
          />
          <mesh
            name="Cube001_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1.geometry}
            material={materials.Studio}
          />
        </group>

        {/* Bottle group */}
        <group ref={bottleRef} name="Tom_Ford_Noir" position={[0, 0.028, -0.003]}>
          <mesh
            name="Cube003"
            castShadow
            receiveShadow
            geometry={nodes.Cube003.geometry}
            material={customMaterials.bottleMaterial}
            ref={bottleMeshRef}
          />
          <mesh
            name="Cube003_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube003_1.geometry}
            material={materials.Raffles}
          />
          <mesh name="Cube003_2" castShadow receiveShadow geometry={nodes.Cube003_2.geometry} material={materials.T} />
          <mesh
            name="Cube003_3"
            castShadow
            receiveShadow
            geometry={nodes.Cube003_3.geometry}
            material={customMaterials.liquidMaterial}
            ref={liquidMeshRef}
          />
        </group>

        {/* Spray particles */}
        {sprayParticles.map((particle, i) => (
          <mesh key={i} position={particle.position.toArray()}>
            <sphereGeometry args={[0.003, 8, 8]} />
            <meshBasicMaterial color={liquidColor || "#f0e9d2"} transparent opacity={particle.life} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Preload the model
useGLTF.preload("/Tom+Ford+Noir.glb")
