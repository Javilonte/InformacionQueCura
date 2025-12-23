import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function MorphingShape() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    // We'll animate the number of segments to "morph" from cylinder (32+ segments) to triangle (3 segments)
    // Since we can't easily animate geometry parameters in vanilla Three without reconstruction, 
    // we'll use a visual trick or just let React handle the reconstruction which might be glitchy-cool.

    // Better high-tech approach: Use a specialized geometry or just rotate a 3-sided cylinder 
    // but let's try the prop animation.

    const [segments, setSegments] = useState(32);

    useFrame((_) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.02;

            // Automatic oscillation between 3 and 32

            // Use a stepped function to hold the shape for a bit
            // If phase > 0, be a triangle (3). If < 0, be a cylinder (32)
            // We want a transition.
            // Actually, animating radialSegments frame-by-frame is performance heavy (new geometry every frame).
            // A better tech-noir effect is "Glitch" switching.

            if (Math.random() > 0.98) { // Occasional glitch
                setSegments(prev => prev === 3 ? 32 : 3);
            }
        }
    });

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={hovered ? 1.2 : 1}
            >
                {/* 
           radiusTop, radiusBottom, height, radialSegments 
           We use 'segments' state which flips between 3 and 32
        */}
                <cylinderGeometry args={[1, 1, 2, segments]} />
                <MeshDistortMaterial
                    color={segments === 3 ? "#3b82f6" : "#ffffff"}
                    speed={5}
                    distort={0.3}
                    radius={1}
                    wireframe={segments === 32} // Wireframe for cylinder, solid for triangle?
                />
            </mesh>
        </Float>
    );
}

export function ShapeShifter() {
    return (
        <div style={{ width: '500px', height: '500px', display: 'inline-block', verticalAlign: 'middle', marginLeft: '20px' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <MorphingShape />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
