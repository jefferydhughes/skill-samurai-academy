import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function VoxelWorldView({ isPlaying }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Ground plane (grass)
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x7CFC00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Sample voxel blocks
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    for (let i = 0; i < 3; i++) {
      const block = new THREE.Mesh(blockGeometry, blockMaterial);
      block.position.set(i - 1, 0.5, 0);
      scene.add(block);
    }

    // Player (simple cube)
    const playerGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.8, 2);
    scene.add(player);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle camera orbit
      const time = Date.now() * 0.0001;
      camera.position.x = Math.cos(time) * 7;
      camera.position.z = Math.sin(time) * 7;
      camera.lookAt(0, 1, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {isPlaying && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
          🎮 Running your code...
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-xs text-slate-600 shadow-lg">
        <div className="font-semibold mb-1">🎮 Controls</div>
        <div>WASD - Move around</div>
        <div>Mouse - Look around</div>
      </div>
    </div>
  );
}