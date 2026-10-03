import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Edges } from '@react-three/drei';
import * as THREE from 'three';

function CargoBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={2}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
        {/* Glowing Edges */}
        <Edges scale={1.05} threshold={15} color="#818cf8" />
        <Edges scale={1} threshold={15} color="#a855f7" />
      </mesh>
    </Float>
  );
}

function FloatingDataNodes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 3, 
            Math.cos((i * 2)) * 1.5, 
            Math.cos((i / 6) * Math.PI * 2) * 3
          ]}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#38bdf8' : '#c084fc'} />
        </mesh>
      ))}
    </group>
  );
}

export default function Transport3D() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
        
        <CargoBox />
        <FloatingDataNodes />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}