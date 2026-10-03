import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function GlowingNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Wireframe Sphere representing global reach */}
      <Sphere args={[2.8, 32, 32]}>
        <meshBasicMaterial 
          color="#f97316" 
          wireframe 
          transparent 
          opacity={0.15} 
        />
      </Sphere>

      {/* Middle glowing distorted energy core */}
      <Sphere args={[2.2, 64, 64]}>
        <MeshDistortMaterial 
          color="#eab308" 
          distort={0.4} 
          speed={2} 
          roughness={0.2} 
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </Sphere>

      {/* Inner dense core */}
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial 
          color="#ef4444" 
          roughness={0.1} 
          metalness={1}
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.9 }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        {/* Dynamic colored lighting */}
        <pointLight position={[-5, -5, -5]} color="#f97316" intensity={4} />
        <pointLight position={[5, -5, 5]} color="#eab308" intensity={3} />
        <pointLight position={[0, 5, 0]} color="#ef4444" intensity={3} />
        
        {/* High speed stars representing data/speed */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
        
        <GlowingNetwork />
      </Canvas>
    </div>
  );
}