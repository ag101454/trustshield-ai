import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

function ShieldMesh() {
  const meshRef = useRef();
  const wireframeRef = useRef();
  
  // Create shield shape
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.5);
    shape.lineTo(0.8, 1.2);
    shape.lineTo(0.8, 0.3);
    shape.lineTo(0, -0.5);
    shape.lineTo(-0.8, 0.3);
    shape.lineTo(-0.8, 1.2);
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 2,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      wireframeRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group>
      {/* Main shield */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.2}
          emissive="#00ffff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <mesh ref={wireframeRef} position={[0, 0, 0.15]}>
        <extrudeGeometry args={[shape, { ...extrudeSettings, depth: 0.05 }]} />
        <meshBasicMaterial 
          color="#00ffff" 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Glow effect */}
      <mesh position={[0, 0, -0.1]}>
        <extrudeGeometry args={[shape, { ...extrudeSettings, depth: 0.02 }]} />
        <meshBasicMaterial 
          color="#0066ff" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00ffff"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Shield3D() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00ffff" />
        <pointLight position={[-5, -3, -2]} intensity={0.5} color="#0066ff" />
        <pointLight position={[0, -5, 0]} intensity={0.3} color="#ffffff" />
        
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <ShieldMesh />
        </Float>
        
        <Particles />
        
        <Sparkles 
          count={100} 
          scale={6} 
          size={1} 
          speed={0.3} 
          color="#00ffff" 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}