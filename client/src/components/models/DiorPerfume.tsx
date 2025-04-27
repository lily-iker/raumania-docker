"use client"

import * as THREE from "three"
import { useRef, useEffect, useState } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import type { GLTF } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    Cylinder: THREE.Mesh
    Cylinder_1: THREE.Mesh
    Cylinder_2: THREE.Mesh
    Cylinder001: THREE.Mesh
  }
  materials: {
    ["Glass "]: THREE.MeshPhysicalMaterial
    Aluminum: THREE.MeshStandardMaterial
    ["Glass Inner"]: THREE.MeshStandardMaterial
    ["Bottle Cap"]: THREE.MeshPhysicalMaterial
  }
}

type PerfumeProps = {
  position?: [number, number, number]
  scale?: number | [number, number, number]
  capOpen?: boolean
  activeAnimation?: string | null
  bottleColor?: string
  liquidColor?: string
  capColor?: string
}

export function DiorPerfume({
  position = [0, 0, 0],
  //scale = 1,
  capOpen = false,
  activeAnimation = null,
  bottleColor,
  liquidColor,
  capColor,
}: PerfumeProps) {
  const { nodes, materials } = useGLTF("/uploads_files_4123971_Dior+perfume.glb") as unknown as GLTFResult
  const bottleRef = useRef<THREE.Group>(null)
  const capRef = useRef<THREE.Group>(null)
  const bottleGlassRef = useRef<THREE.Mesh>(null)
  const liquidRef = useRef<THREE.Mesh>(null)
  const capMeshRef = useRef<THREE.Mesh>(null)

  // Create custom materials with consistent state management
  const [customMaterials] = useState(() => {
    // Create a new physical material for the bottle
    const bottleMaterial = new THREE.MeshPhysicalMaterial({
      color: bottleColor ? new THREE.Color(bottleColor) : new THREE.Color("#e7f5ff"),
      metalness: 0.1,
      roughness: 0.05,
      envMapIntensity: 2.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      ior: 1.5, // Glass-like IOR
      transmission: 0.5, // Slight transparency
      transparent: true,
      opacity: 0.9,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
    })

    // Create a new physical material for the liquid
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: liquidColor ? new THREE.Color(liquidColor) : new THREE.Color("#ffcad4"),
      metalness: 0.0,
      roughness: 0.1,
      envMapIntensity: 1.5,
      transmission: 0.8, // High transparency
      transparent: true,
      opacity: 0.9,
      ior: 1.4, // Liquid-like IOR
      reflectivity: 0.5,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
    })

    // Create a new physical material for the cap
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: capColor ? new THREE.Color(capColor) : new THREE.Color("#c0c0c0"),
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
      console.log("Updating cap color to:", capColor)
    }
  }, [bottleColor, liquidColor, capColor, customMaterials])

  // Handle animations
  useFrame((state) => {
    if (capRef.current) {
      if (capOpen) {
        // Animate cap moving up and to the side
        capRef.current.position.y = THREE.MathUtils.lerp(
          capRef.current.position.y,
          3.5, // Target position when open
          0.1,
        )
        capRef.current.position.x = THREE.MathUtils.lerp(
          capRef.current.position.x,
          0.5, // Move to the side
          0.1,
        )
        capRef.current.rotation.z = THREE.MathUtils.lerp(
          capRef.current.rotation.z,
          -Math.PI / 6, // Tilt slightly
          0.1,
        )
      } else {
        // Animate cap closing - fixed position
        capRef.current.position.y = THREE.MathUtils.lerp(
          capRef.current.position.y,
          2.775, // Original position
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

    // Add subtle animation to the bottle for visual interest
    if (bottleRef.current && activeAnimation === "spray") {
      bottleRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 20) * 0.01
    }
  })

  // Convert scale to array if it's a number


  // Create a simple placeholder model in case the real model fails to load
  const renderPlaceholderModel = () => (
    <group position={position} scale={0.5} dispose={null}>
      <group ref={bottleRef} name="Bottle" position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]} ref={bottleGlassRef}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <primitive object={customMaterials.bottleMaterial} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, 0]} ref={liquidRef}>
          <cylinderGeometry args={[0.45, 0.45, 1.9, 32]} />
          <primitive object={customMaterials.liquidMaterial} />
        </mesh>
        <group ref={capRef} position={[0, 1.2, 0]}>
          <mesh castShadow receiveShadow ref={capMeshRef}>
            <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
            <primitive object={customMaterials.capMaterial} />
          </mesh>
        </group>
      </group>
    </group>
  )

  // Use a try-catch to handle potential model loading issues
  try {
    return (
      <group position={position} scale={0.5} dispose={null}>
        {/* Add a wrapper group for the entire bottle to apply color changes */}
        <group ref={bottleRef} name="Scene">
          <group name="Bottle" position={[0, 0.998, 0]} rotation={[Math.PI, 0, Math.PI]}>
            <mesh
              name="Cylinder"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder.geometry}
              material={customMaterials.bottleMaterial}
              ref={bottleGlassRef}
            />
            <mesh
              name="Cylinder_1"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder_1.geometry}
              material={materials.Aluminum}
            />
            <mesh
              name="Cylinder_2"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder_2.geometry}
              material={customMaterials.liquidMaterial}
              ref={liquidRef}
            />
            <group ref={capRef} position={[0, 2.775, 0]}>
              <mesh
                name="Cylinder001"
                castShadow
                receiveShadow
                geometry={nodes.Cylinder001.geometry}
                material={customMaterials.capMaterial}
                ref={capMeshRef}
                rotation={[Math.PI, 0, Math.PI]}
              />
            </group>
          </group>
        </group>
      </group>
    )
  } catch (error) {
    console.error("Error rendering Dior Perfume model:", error)
    return renderPlaceholderModel()
  }
}

// Preload the model
useGLTF.preload("/uploads_files_4123971_Dior+perfume.glb")
