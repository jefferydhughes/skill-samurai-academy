import React, { Suspense } from 'react';
import WorldToolbar from './WorldToolbar';
import BlockPalette from './BlockPalette';

// Lazy load Three.js components
const VoxelWorldViewInner = React.lazy(() => import('./VoxelWorldViewInner'));

export default function VoxelWorldView({ isPlaying, buildMode = false, onWorldChange }) {
  const [selectedTool, setSelectedTool] = React.useState('place');
  const [selectedBlock, setSelectedBlock] = React.useState('grass');
  const [showBlockPalette, setShowBlockPalette] = React.useState(false);

  return (
    <div className="w-full h-full relative">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading 3D environment...</div>
        </div>
      }>
        <VoxelWorldViewInner
          isPlaying={isPlaying}
          buildMode={buildMode}
          onWorldChange={onWorldChange}
          selectedTool={selectedTool}
          selectedBlock={selectedBlock}
          showBlockPalette={showBlockPalette}
          onToolSelect={setSelectedTool}
          onBlockSelect={setSelectedBlock}
          onPaletteToggle={setShowBlockPalette}
        />
      </Suspense>
      
      {buildMode && (
        <>
          <WorldToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            selectedBlock={selectedBlock}
            onBlockSelect={setSelectedBlock}
            onTogglePalette={() => setShowBlockPalette(!showBlockPalette)}
          />
          {showBlockPalette && (
            <BlockPalette
              selectedBlock={selectedBlock}
              onBlockSelect={setSelectedBlock}
              onClose={() => setShowBlockPalette(false)}
            />
          )}
        </>
      )}
    </div>
  );
}