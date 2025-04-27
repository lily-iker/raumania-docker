"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { CameraControls, Environment, Preload, ContactShadows, Float, Sparkles, Html } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"

import { useFragranceCustomizer } from "./context"
import { DiorPerfume } from "@/components/models/DiorPerfume"
import { Tom_Ford_Noir } from "@/components/models/TomFordNoir"

const ENVIRONMENT_COLOR = "#f8f9fa"

export default function Preview() {
  const cameraControls = useRef<CameraControls>(null)
  const floorRef = useRef<THREE.Mesh>(null)

  const {
    selectedBottle,
    selectedColor,
    selectedScent,
    selectedCap,
    capOpen,
    setCapOpen,
    spraying,
    setSpraying,
    activeAnimation,
    setActiveAnimation,
  } = useFragranceCustomizer()

  // Set up camera controls when components mount
  useEffect(() => {
    if (!cameraControls.current) return

    // Default camera position - only set once
    setCameraControls(new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(1.5, 0.8, 0))
  }, [])

  // Update camera when bottle changes
  useEffect(() => {
    if (!selectedBottle) return

    // Set consistent camera position for both models
    setCameraControls(new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(1.5, 0.8, 0))
  }, [selectedBottle])

  function setCameraControls(target: THREE.Vector3, pos: THREE.Vector3) {
    if (!cameraControls.current) return

    // Use consistent damping for smooth camera movement
    cameraControls.current.dampingFactor = 0.05
    cameraControls.current.setTarget(target.x, target.y, target.z, true)
    cameraControls.current.setPosition(pos.x, pos.y, pos.z, true)
  }

  function onCameraControlStart() {
    if (!cameraControls.current || !floorRef.current || cameraControls.current.colliderMeshes.length > 0) return

    cameraControls.current.colliderMeshes = [floorRef.current]
  }

  const handleCapClick = () => {
    if (activeAnimation) return
    setActiveAnimation("cap")
    setCapOpen(!capOpen)

    setTimeout(() => {
      setActiveAnimation(null)
    }, 1000)
  }

  const handleSprayClick = () => {
    if (activeAnimation || !capOpen) return
    setActiveAnimation("spray")
    setSpraying(true)

    setTimeout(() => {
      setSpraying(false)
      setActiveAnimation(null)
    }, 1000)
  }

  return (
    <Canvas camera={{ position: [2.5, 1, 0], fov: 50 }} shadows>
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <directionalLight castShadow lookAt={[0, 0, 0]} position={[1, 1, 1]} intensity={1.6} />
        <ambientLight intensity={0.5} />
        <fog attach="fog" args={[ENVIRONMENT_COLOR, 3, 10]} />
        <color attach="background" args={[ENVIRONMENT_COLOR]} />
        <StageFloor />

        <mesh rotation={[-Math.PI / 2, 0, 0]} ref={floorRef}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2} enabled={!activeAnimation}>
          <FragranceModel
            bottleType={selectedBottle?.model || "dior"}
            capOpen={capOpen}
            spraying={spraying}
            activeAnimation={activeAnimation}
            bottleColor={selectedColor?.color}
            liquidColor={selectedScent?.color}
            capColor={selectedCap?.color}
            onCapClick={handleCapClick}
            onSprayClick={handleSprayClick}
          />
        </Float>

        <Sparkles count={50} scale={5} size={2} speed={0.3} opacity={0.5} color="#ffcad4" />

        <ContactShadows
          position={[0, -0.005, 0]}
          opacity={0.5}
          scale={10}
          blur={1.5}
          far={1}
          resolution={1024}
          color="#000000"
        />

        <CameraControls
          ref={cameraControls}
          minDistance={0.5}
          maxDistance={4}
          onStart={onCameraControlStart}
          enabled={!activeAnimation}
          dampingFactor={0.05} // Consistent damping for smooth movement
          draggingDampingFactor={0.25}
          azimuthRotateSpeed={0.5}
          polarRotateSpeed={0.5}
        />
      </Suspense>
      <Preload all />
    </Canvas>
  )
}

function StageFloor() {
  // Create a simple texture for the floor
  const texture = new THREE.TextureLoader().load("/placeholder.svg?height=512&width=512")
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)

  const material = new THREE.MeshStandardMaterial({
    roughness: 0.75,
    color: ENVIRONMENT_COLOR,
    map: texture,
  })

  return (
    <mesh castShadow receiveShadow position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <circleGeometry args={[20, 32]} />
    </mesh>
  )
}

type FragranceModelProps = {
  bottleType: "dior" | "tomford"
  capOpen: boolean
  spraying: boolean
  activeAnimation: string | null
  bottleColor?: string
  liquidColor?: string
  capColor?: string
  onCapClick: () => void
  onSprayClick: () => void
}

function FragranceModel({
  bottleType,
  capOpen,
  spraying,
  activeAnimation,
  bottleColor,
  liquidColor,
  capColor,
  onCapClick,
  onSprayClick,
}: FragranceModelProps) {
  const [sprayParticles, setSprayParticles] = useState<
    { position: THREE.Vector3; velocity: THREE.Vector3; life: number; size: number }[]
  >([])

  useFrame((state) => {
    // Create spray particles with position adjusted based on bottle type
    if (spraying && state.clock.getElapsedTime() % 0.05 < 0.025) {
      // Different spray positions for each bottle type
      const sprayPosition =
        bottleType === "dior"
          ? new THREE.Vector3(0, 1.4, 0) // Adjusted position for Dior
          : new THREE.Vector3(0.05, 0.8, 0) // Position for Tom Ford

      const newParticles = Array(10)
        .fill(0)
        .map(() => {
          const angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25
          const speed = 0.01 + Math.random() * 0.02

          return {
            position: sprayPosition.clone(),
            velocity: new THREE.Vector3(Math.sin(angle) * speed, Math.random() * 0.01 + 0.01, Math.cos(angle) * speed),
            life: 1.0,
            size: 0.002 + Math.random() * 0.004,
          }
        })
      setSprayParticles((prev) => [...prev, ...newParticles])
    }

    // Update existing spray particles
    if (sprayParticles.length > 0) {
      setSprayParticles((prev) =>
        prev
          .map((particle) => {
            particle.velocity.y -= 0.0001
            particle.velocity.multiplyScalar(0.98)

            return {
              ...particle,
              position: particle.position.clone().add(particle.velocity),
              life: particle.life - 0.01,
            }
          })
          .filter((particle) => particle.life > 0),
      )
    }
  })

  if (bottleType === "dior") {
    return (
      <group position={[0, 0, 0]}>
        <DiorPerfume
          position={[0, 0, 0]}
          scale={0.5}
          capOpen={capOpen}
          activeAnimation={activeAnimation}
          bottleColor={bottleColor}
          liquidColor={liquidColor}
          capColor={capColor}
        />

        {/* Spray particles */}
        {sprayParticles.map((particle, i) => (
          <mesh key={i} position={particle.position.toArray()}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshBasicMaterial color={liquidColor || "#f0e9d2"} transparent opacity={particle.life} />
          </mesh>
        ))}

        {/* Clickable areas - adjusted positions for Dior */}
        {!capOpen ? (
          <Html position={[0, 1.4, 0]} center>
            <div
              className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
              onClick={onCapClick}
            >
              <span className="sr-only">Open cap</span>
            </div>
          </Html>
        ) : (
          <>
            <Html position={[0, 1.4, 0]} center>
              <div
                className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                onClick={onSprayClick}
              >
                <span className="sr-only">Spray</span>
              </div>
            </Html>
            <Html position={[0.5, 1.8, 0]} center>
              <div
                className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                onClick={onCapClick}
              >
                <span className="sr-only">Close cap</span>
              </div>
            </Html>
          </>
        )}
      </group>
    )
  } else {
    return (
      <group position={[0, 0, 0]}>
        <Tom_Ford_Noir
          position={[0, 0, 0]}
          scale={5}
          capOpen={capOpen}
          spraying={spraying}
          activeAnimation={activeAnimation}
          bottleColor={bottleColor}
          liquidColor={liquidColor}
          capColor={capColor}
        />

        {/* Spray particles */}
        {sprayParticles.map((particle, i) => (
          <mesh key={i} position={particle.position.toArray()}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshBasicMaterial color={liquidColor || "#f0e9d2"} transparent opacity={particle.life} />
          </mesh>
        ))}

        {/* Clickable areas */}
        {!capOpen ? (
          <Html position={[0, 0.8, 0]} center>
            <div
              className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
              onClick={onCapClick}
            >
              <span className="sr-only">Open cap</span>
            </div>
          </Html>
        ) : (
          <>
            <Html position={[0, 0.8, 0]} center>
              <div
                className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                onClick={onSprayClick}
              >
                <span className="sr-only">Spray</span>
              </div>
            </Html>
            <Html position={[0, 0.4, 0]} center>
              <div
                className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                onClick={onCapClick}
              >
                <span className="sr-only">Close cap</span>
              </div>
            </Html>
          </>
        )}
      </group>
    )
  }
}
