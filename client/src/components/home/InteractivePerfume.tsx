"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, Html, PresentationControls, Sparkles, Float } from "@react-three/drei"
import * as THREE from "three"
import { Tom_Ford_Noir } from "../models/TomFordNoir"

export function InteractivePerfume() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <Canvas
        className="w-full h-full"
        camera={{ position: [3, 2, 3], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        shadows
      >
    
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Scene() {
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const pointLightRef = useRef<THREE.PointLight>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [capOpen, setCapOpen] = useState(false)
  const [spraying, setSpraying] = useState(false)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const [sprayParticles, setSprayParticles] = useState<
    { position: THREE.Vector3; velocity: THREE.Vector3; life: number; size: number }[]
  >([])
  

  // Subtle animation for the perfume
  useFrame((state) => {
    if (groupRef.current) {
      // Base floating animation
      if (!activeAnimation) {
        groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05
        groupRef.current.rotation.y =
          Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05 + state.clock.getElapsedTime() * 0.05
      }
    }

    // Move spotlight in a circular pattern
    if (spotLightRef.current) {
      const time = state.clock.getElapsedTime()
      spotLightRef.current.position.x = Math.sin(time * 0.2) * 3
      spotLightRef.current.position.z = Math.cos(time * 0.2) * 3
    }

    // Animate point light for dynamic highlights
    if (pointLightRef.current) {
      const time = state.clock.getElapsedTime()
      pointLightRef.current.position.x = Math.sin(time * 0.3) * 2
      pointLightRef.current.position.z = Math.cos(time * 0.3) * 2
      pointLightRef.current.intensity = 1 + Math.sin(time) * 0.2
    }

    // Update spray particles
    if (spraying && state.clock.getElapsedTime() % 0.05 < 0.025) {
      // Create more particles when spraying
      const newParticles = Array(10)
        .fill(0)
        .map(() => {
          // Calculate spray direction (forward and slightly up)
          const angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25 // Spray cone
          const speed = 0.01 + Math.random() * 0.02

          return {
            position: new THREE.Vector3(0.05, 0.8, 0), // Start position at spray nozzle
            velocity: new THREE.Vector3(
              Math.sin(angle) * speed,
              Math.random() * 0.01 + 0.01, // Upward drift
              Math.cos(angle) * speed,
            ),
            life: 1.0,
            size: 0.002 + Math.random() * 0.004, // Varied particle sizes
          }
        })
      setSprayParticles((prev) => [...prev, ...newParticles])
    }

    // Update existing spray particles
    if (sprayParticles.length > 0) {
      setSprayParticles((prev) =>
        prev
          .map((particle) => {
            // Apply some gravity and air resistance
            particle.velocity.y -= 0.0001 // Gravity
            particle.velocity.multiplyScalar(0.98) // Air resistance

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

  const handleCapClick = () => {
    if (activeAnimation) return // Don't allow new animations while one is in progress

    setActiveAnimation("cap")
    setCapOpen(!capOpen)

    // Reset animation state after animation completes
    setTimeout(() => {
      setActiveAnimation(null)
    }, 1000)
  }

  const handleSprayClick = () => {
    if (activeAnimation || !capOpen) return // Don't allow spray if cap is not open

    setActiveAnimation("spray")
    setSpraying(true)

    // Reset spray state after animation completes
    setTimeout(() => {
      setSpraying(false)
      setActiveAnimation(null)
    }, 1000)
  }

  return (
    <>
      {/* Main environment and controls */}
      <PresentationControls
        global
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 3, Math.PI / 3]}

        enabled={!activeAnimation} // Disable controls during animations
      >
        {/* Sparkle effects around the perfume */}
        <Sparkles
          count={50}
          scale={5}
          size={2}
          speed={0.3}
          opacity={0.5}
          color="#ffcad4" // Light pink sparkles
          position={[1, 0, 0]}
        />

        <Float
          speed={0.3} // Animation speed
          rotationIntensity={0.2} // Rotation intensity
          floatIntensity={0.5} // Float intensity
        >
          {/* Position the model lower and to the right to avoid blocking header */}
          <group ref={groupRef} position={[1, -0.5, 0]}>
            <Tom_Ford_Noir
              position={[0, 0, 0]}
              scale={1.2}
              capOpen={capOpen}
              spraying={spraying}
              activeAnimation={activeAnimation}
            />

            {/* Spray particles */}
            {sprayParticles.map((particle, i) => (
              <mesh key={i} position={particle.position.clone().add(new THREE.Vector3(0, 0, 0))}>
                <sphereGeometry args={[particle.size, 8, 8]} />
                <meshBasicMaterial color="#f0e9d2" transparent opacity={particle.life * 0.7} />
              </mesh>
            ))}

            {/* Clickable hotspots */}
            {!capOpen && (
              <Html position={[0, 0.8, 0]} center>
                <div
                  className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                  onClick={handleCapClick}
                >
                  <span ></span>
                </div>
              </Html>
            )}

            {capOpen && (
              <>
                <Html position={[0, 0.8, 0]} center>
                  <div
                    className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                    onClick={handleSprayClick}
                  >
                    <span ></span>
                  </div>
                </Html>
                <Html position={[0, 0.4, 0]} center>
                  <div
                    className="cursor-pointer w-12 h-12 rounded-full bg-pink-200 bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all shadow-lg"
                    onClick={handleCapClick}
                  >
                    <span ></span>
                  </div>
                </Html>
              </>
            )}
          </group>
        </Float>
      </PresentationControls>

     

      

      {/* Environment and enhanced shadows */}
      <Environment preset="studio" background={false} />
      <ContactShadows
        position={[0, -1.0, 0]}
        opacity={0.6}
        scale={10}
        blur={1.5}
        far={3}
        resolution={1024}
        color="#000000"
      />

      {/* Additional soft glow under the perfume */}
      <Environment preset="studio" background={false} />
      <ContactShadows
        position={[0, -1.0, 0]}
        opacity={0.6}
        scale={10}
        blur={1.5}
        far={3}
        resolution={1024}
        color="#000000"
      />
    </>
  )
}
