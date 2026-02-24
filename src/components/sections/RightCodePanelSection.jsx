import React from 'react';

export default function RightCodePanelSection() {
  return (
    <aside className="hidden xl:flex w-[380px] bg-white border-l border-black/5 flex-col">
      <div className="p-4 border-b border-black/5">
        <h3 className="font-semibold">Code Workspace</h3>
        <p className="text-xs text-slate-500">Blocks appear here</p>
      </div>
      <div className="flex-1 p-4 text-slate-400 text-sm">
        Drag blocks to begin coding
      </div>
    </aside>
  );
}