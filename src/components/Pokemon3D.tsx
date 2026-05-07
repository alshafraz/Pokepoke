'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { useTexture, Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Hologram({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Use a more robust texture loader with CORS support
  const texture = useTexture(imageUrl, (tex) => {
    if (tex instanceof THREE.Texture) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 16; // Maximize sharpness
      tex.needsUpdate = true;
    }
  });

  // Ensure texture has cross-origin set if possible
  if (texture.image) {
    texture.image.crossOrigin = 'anonymous';
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glow Effect */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  );
}

export default function Pokemon3D({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Handles high-DPI displays for sharpness
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Hologram imageUrl={imageUrl} />
        </Suspense>
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
