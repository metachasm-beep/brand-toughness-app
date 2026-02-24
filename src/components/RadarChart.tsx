import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, MeshWobbleMaterial, ContactShadows, Environment } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const pillars = ['Market', 'Internal', 'Loyalty', 'Innovation', 'Supply', 'Fortress'];

function SpatialCore({ scores }: { scores: number[] }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const average = useMemo(() => scores.reduce((a, b) => a + b, 0) / scores.length, [scores]);
    const wobbleFactor = useMemo(() => Math.max(0.1, 0.5 - (average / 20)), [average]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.rotation.y += 0.003;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1.2, 1]} />
                <MeshWobbleMaterial
                    color="#ffffff"
                    factor={wobbleFactor}
                    speed={0.5}
                    transparent
                    opacity={0.05}
                    wireframe
                />
            </mesh>
            <mesh>
                <octahedronGeometry args={[1.1, 0]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.1}
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.5}
                    thickness={1}
                />
            </mesh>
        </Float>
    );
}

function RadarGrid({ scores }: { scores: number[] }) {
    const points = useMemo(() => scores.map((s) => 0.5 + (s / 10) * 1.5), [scores]);
    const vertices = useMemo(() => {
        const angle = (Math.PI * 2) / pillars.length;
        const v = points.map((p, i) => [
            Math.cos(i * angle) * p,
            Math.sin(i * angle) * p,
            0,
        ]);
        return [...v, v[0]];
    }, [points]);

    const flatVertices = useMemo(() => new Float32Array(vertices.flat()), [vertices]);

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            {/* HUD Mesh */}
            <mesh>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[flatVertices, 3]}
                    />
                </bufferGeometry>
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.03}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outlines */}
            <lineLoop>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[flatVertices, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="rgba(255,255,255,0.15)" linewidth={1} />
            </lineLoop>

            {/* Hexagonal HUD Rings */}
            {[0.5, 1.0, 1.5, 2.0].map((r) => (
                <lineLoop key={r}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[
                                new Float32Array(
                                    Array.from({ length: 7 }, (_, i) => [
                                        Math.cos((i * Math.PI * 2) / 6) * r,
                                        Math.sin((i * Math.PI * 2) / 6) * r,
                                        0,
                                    ]).flat()
                                ),
                                3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="rgba(255,255,255,0.03)" />
                </lineLoop>
            ))}

            {/* Data Intersection Points */}
            {vertices.slice(0, 6).map(([x, y, z], i) => (
                <mesh key={`p-${i}`} position={[x, y, z]}>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
                    <Html distanceFactor={10}>
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{pillars[i]}</div>
                    </Html>
                </mesh>
            ))}
        </group>
    );
}

export default function RadarChart({ scores }: { scores: number[] }) {
    const safeScores = useMemo(() => {
        const s = [...scores];
        while (s.length < 6) s.push(5);
        return s.slice(0, 6);
    }, [scores]);

    return (
        <Canvas camera={{ position: [0, 4, 8], fov: 35 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            {/* Environment removed to avoid HDR loading error */}

            <SpatialCore scores={safeScores} />
            <RadarGrid scores={safeScores} />

            <ContactShadows resolution={512} scale={15} blur={2} opacity={0.2} far={10} color="#ffffff" position={[0, -2, 0]} />

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.2}
                maxPolarAngle={Math.PI / 2.5}
                minPolarAngle={Math.PI / 4}
            />
        </Canvas>
    );
}
