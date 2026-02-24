import React, { useRef, useEffect, useState } from 'react';

const BLOCK_TYPES = {
  grass: { color: 0x7CFC00, name: 'Grass' },
  dirt: { color: 0x8B4513, name: 'Dirt' },
  stone: { color: 0x808080, name: 'Stone' },
  wood: { color: 0xDEB887, name: 'Wood' },
  brick: { color: 0xB22222, name: 'Brick' },
  sand: { color: 0xF4A460, name: 'Sand' },
};

export default function VoxelWorldViewInner({ isPlaying, buildMode = false, onWorldChange }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  });
  const mouseRef = useRef({ x: 0, y: 0, locked: false });
  const blocksRef = useRef(new Map());
  let raycasterRef, mousePositionRef, highlightBoxRef;
  let THREE;

  const [selectedTool, setSelectedTool] = useState('place');
  const [selectedBlock, setSelectedBlock] = useState('grass');
  const [showBlockPalette, setShowBlockPalette] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initThree = async () => {
      const threeModule = await import('three');
      THREE = threeModule;
      
      if (!mounted || !mountRef.current) return;

      raycasterRef = new THREE.Raycaster();
      mousePositionRef = new THREE.Vector2();

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
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Grid helper
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
      scene.add(gridHelper);

      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(20, 20);
      const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x7CFC00 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      scene.add(ground);

      // Highlight box for block placement
      const highlightGeometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      const highlightBox = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlightBox.visible = false;
      scene.add(highlightBox);
      highlightBoxRef = highlightBox;

      // Sample blocks
      addBlock(0, 0, 0, 'dirt');
      addBlock(1, 0, 0, 'grass');
      addBlock(2, 0, 0, 'stone');

      // Animation loop
      const animate = () => {
        if (!mounted) return;
        requestAnimationFrame(animate);
        
        // Update camera controls
        updateCameraControls();
        
        // Update raycaster for block highlighting
        if (buildMode && !isPlaying) {
          raycasterRef.setFromCamera(mousePositionRef, camera);
          const intersects = raycasterRef.intersectObjects(
            Array.from(blocksRef.current.values())
          );
          
          highlightBoxRef.visible = intersects.length > 0;
          if (intersects.length > 0) {
            const intersect = intersects[0];
            const position = intersect.point.clone();
            position.x = Math.floor(position.x + 0.5);
            position.y = Math.floor(position.y + 0.5);
            position.z = Math.floor(position.z + 0.5);
            highlightBoxRef.position.copy(position);
          }
        }
        
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
    };

    initThree();

    return () => {
      mounted = false;
    };
  }, []);

  const updateCameraControls = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    if (camera && !isPlaying) {
      const speed = 0.1;
      if (controls.moveForward) camera.position.z -= speed;
      if (controls.moveBackward) camera.position.z += speed;
      if (controls.moveLeft) camera.position.x -= speed;
      if (controls.moveRight) camera.position.x += speed;
      if (controls.moveUp) camera.position.y += speed;
      if (controls.moveDown) camera.position.y -= speed;
    }
  };

  const addBlock = (x, y, z, type) => {
    if (!THREE || !sceneRef.current) return;
    
    const blockType = BLOCK_TYPES[type];
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: blockType.color });
    const block = new THREE.Mesh(geometry, material);
    
    block.position.set(x, y, z);
    block.userData = { type, position: { x, y, z } };
    
    sceneRef.current.add(block);
    blocksRef.current.set(`${x}-${y}-${z}`, block);
  };

  const removeBlock = (x, y, z) => {
    const key = `${x}-${y}-${z}`;
    const block = blocksRef.current.get(key);
    if (block && sceneRef.current) {
      sceneRef.current.remove(block);
      blocksRef.current.delete(key);
    }
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative"
      style={{ cursor: isPlaying ? 'default' : 'crosshair' }}
    />
  );
}