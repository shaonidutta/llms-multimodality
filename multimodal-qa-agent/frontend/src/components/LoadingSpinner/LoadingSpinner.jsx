import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Animated 3D loading component
const AnimatedSphere = () => {
  const meshRef = useRef();
  const particlesRef = useRef();

  // Create particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
        ],
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate main sphere
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
    }

    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, index) => {
        const offset = index * 0.1;
        particle.position.y = Math.sin(time + offset) * 0.5;
        particle.rotation.z = time + offset;
      });
    }
  });

  return (
    <>
      {/* Main rotating sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Floating particles */}
      <group ref={particlesRef}>
        {particles.map((particle, index) => (
          <mesh key={index} position={particle.position} scale={particle.scale * 0.1}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>
        ))}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
};

// Simple CSS loading spinner fallback
const SimpleSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="loading-spinner w-8 h-8"></div>
  </div>
);

const LoadingSpinner = ({ use3D = true, message = "Analyzing image..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-6 py-8"
    >
      {/* 3D Loading Animation */}
      {use3D ? (
        <div className="w-32 h-32 mx-auto">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <AnimatedSphere />
          </Canvas>
        </div>
      ) : (
        <SimpleSpinner />
      )}

      {/* Loading Text */}
      <div className="space-y-2">
        <motion.h3
          className="text-lg font-semibold text-gray-900"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.h3>
        
        <div className="flex items-center justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-md mx-auto">
        <div className="space-y-2 text-sm text-gray-600">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Processing image...</span>
          </motion.div>
          
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Analyzing with AI models...</span>
          </motion.div>
          
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Generating response...</span>
          </motion.div>
        </div>
      </div>

      {/* Estimated time */}
      <motion.p
        className="text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        This usually takes 10-30 seconds
      </motion.p>
    </motion.div>
  );
};

export default LoadingSpinner;
