import React, { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Code2,
  Blocks,
  HelpCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";

/**
 * LessonTemplatePage (Base44-friendly)
 * ---------------------------------------------------------
 * Interaction model: Build → Play → Fix
 *
 * BUILD:
 *  - Guide panel (progressive steps)
 *  - World Preview (live, small)
 *  - Bottom: Blocks / Code Canvas / Toolbox
 *
 * PLAY:
 *  - World goes full-screen
 *  - Minimal HUD (goal + progress)
 *  - "Edit / Fix" button opens overlay
 *
 * FIX:
 *  - World paused (or dimmed)
 *  - Overlay editor slides in (Blocks/Text tabs)
 *  - Apply & Resume returns to PLAY
 *
 * Notes:
 *  - Replace WorldPreview/WorldFullscreen with your Blip embed when ready.
 *  - Replace mock block palette + code canvas with Blockly + Epic Mode editor.
 */

const demoSteps = [
  {
    id: "s1",
    title: "Make it move",
    studentText:
      "Drag **when ▶ clicked** into the canvas, then add **move forward** below it. Press Play and see what happens.",
    teacherTip:
      "Keep the block set small. Early wins build confidence fast.",
    allowedCategories: ["Events", "Player"],
    successHint: "If nothing moves, make sure the move block is snapped under the event.",
  },
  {
    id: "s2",
    title: "Add a turn",
    studentText:
      "Add **turn left** after moving forward. Play again. What changed?",
    teacherTip:
      "Ask: 'What did the computer do first? What did it do next?'",
    allowedCategories: ["Events", "Player"],
    successHint: "Order matters. Drag blocks to rearrange them.",
  },
  {
    id: "s3",
    title: "Repeat it",
    studentText:
      "Use a **repeat 3 times** loop around your movement blocks. Try different numbers.",
    teacherTip:
      "When they ask 'how do I do it faster?', introduce loops as a shortcut.",
    allowedCategories: ["Events", "Player", "Control"],
    successHint: "Put the movement blocks INSIDE the loop.",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useHotkeys(handlers) {
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = [];
      if (e.ctrlKey) key.push("ctrl");
      if (e.metaKey) key.push("meta");
      if (e.shiftKey) key.push("shift");
      if (e.altKey) key.push("alt");
      key.push(e.key.toLowerCase());
      const combo = key.join("+");
      if (handlers[combo]) {
        e.preventDefault();
        handlers[combo]();
      }
      // Esc convenience
      if (e.key === "Escape" && handlers["escape"]) {
        e.preventDefault();
        handlers["escape"]();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}

/** Replace this with your Blip embed (iframe/canvas) when ready. */
function WorldSurface({ variant, isPaused }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900/40 via-slate-900/70 to-slate-950 shadow-[0_12px_48px_rgba(0,0,0,0.35)]",
        variant === "preview" ? "h-[320px]" : "h-full"
      )}
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.25),transparent_45%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Placeholder "world" */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 border border-white/10">
            <Sparkles className="h-4 w-4" />
            World {variant === "preview" ? "Preview" : "Play Mode"}
          </div>
          <div className="mt-3 text-white font-semibold text-xl">
            Replace this with your Blip embed
          </div>
          <div className="mt-2 text-white/70 text-sm">
            (iframe/canvas) — same page, instant feedback.
          </div>
        </div>
      </div>

      {/* Pause veil */}
      {isPaused ? (
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-white/90 text-sm backdrop-blur">
            Paused
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Pill({ children, tone = "neutral", icon }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/20"
      : tone === "locked"
      ? "bg-white/5 text-white/60 border-white/10"
      : tone === "brand"
      ? "bg-cyan-500/15 text-cyan-100 border-cyan-400/20"
      : "bg-white/10 text-white/80 border-white/10";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur",
        toneClass
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden border border-white/10">
      <div
        className="h-full rounded-full bg-white/60"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/**
 * Main template page
 */
export default function LessonTemplatePage() {
  const [mode, setMode] = useState("build");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [blocksTab, setBlocksTab] = useState("blocks");
  const [showTeacherTip, setShowTeacherTip] = useState(false);

  // Mock "workspace"
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [epicText, setEpicText] = useState(
    `-- Epic Mode (text)\n-- when play clicked\n-- repeat 3 times\n--   move forward\n-- end\n`
  );

  const step = demoSteps[activeStepIndex];
  const progressPct = useMemo(() => {
    return ((activeStepIndex + 1) / demoSteps.length) * 100;
  }, [activeStepIndex]);

  const canPrev = activeStepIndex > 0;
  const canNext = activeStepIndex < demoSteps.length - 1;

  const isPlay = mode === "play";
  const isFix = mode === "fix";
  const isBuild = mode === "build";

  // Keyboard shortcuts:
  //  - Space: Play/Pause-ish (build->play, play->fix via Esc)
  //  - Esc: Exit fix or play back to build
  //  - Ctrl/Cmd+Enter: Apply & Resume (from fix)
  useHotkeys({
    " ": () => {
      if (mode === "build") setMode("play");
      else if (mode === "play") setMode("fix");
      else if (mode === "fix") setMode("play");
    },
    escape: () => {
      if (mode === "fix") setMode("play");
      else if (mode === "play") setMode("build");
    },
    "ctrl+enter": () => {
      if (mode === "fix") setMode("play");
    },
    "meta+enter": () => {
      if (mode === "fix") setMode("play");
    },
  });

  // When entering FIX, default to blocks view (kids) but remember last choice
  useEffect(() => {
    if (mode === "fix" && blocksTab !== "blocks" && blocksTab !== "text") {
      setBlocksTab("blocks");
    }
  }, [mode, blocksTab]);

  // A little "unlock" simulation: categories allowed per step
  const categories = useMemo(() => {
    const all = [
      { name: "Events", color: "from-amber-500/30 to-amber-300/10", locked: false },
      {
        name: "Control",
        color: "from-sky-500/30 to-sky-300/10",
        locked: !step.allowedCategories.includes("Control"),
      },
      {
        name: "Player",
        color: "from-emerald-500/30 to-emerald-300/10",
        locked: !step.allowedCategories.includes("Player"),
      },
      {
        name: "Building",
        color: "from-violet-500/30 to-violet-300/10",
        locked: !step.allowedCategories.includes("Building"),
      },
    ];
    return all;
  }, [step.allowedCategories]);

  // Block palette items for the demo (replace with Blockly toolbox config)
  const palette = useMemo(() => {
    const byCategory = {
      Events: [
        { id: "ev_click", label: "when ▶ clicked" },
        { id: "ev_space", label: "when space key pressed" },
      ],
      Player: [
        { id: "pl_forward", label: "move forward" },
        { id: "pl_left", label: "turn left" },
        { id: "pl_right", label: "turn right" },
      ],
      Control: [
        { id: "ct_repeat3", label: "repeat 3 times" },
        { id: "ct_wait1", label: "wait 1 sec" },
      ],
      Building: [
        { id: "bd_place", label: "place block" },
        { id: "bd_remove", label: "remove block" },
      ],
    };

    // Only show allowed categories (locked categories shown disabled)
    return categories.map((c) => ({
      ...c,
      items: byCategory[c.name] || [],
    }));
  }, [categories]);

  const onAddBlock = (label) => {
    setWorkspaceItems((prev) => [...prev, label]);
  };

  const onResetWorkspace = () => {
    setWorkspaceItems([]);
    setEpicText(
      `-- Epic Mode (text)\n-- when play clicked\n-- repeat 3 times\n--   move forward\n-- end\n`
    );
  };

  const goPrevStep = () => {
    if (!canPrev) return;
    setActiveStepIndex((i) => i - 1);
    setWorkspaceItems([]);
  };

  const goNextStep = () => {
    if (!canNext) return;
    setActiveStepIndex((i) => i + 1);
    setWorkspaceItems([]);
  };

  const startPlay = () => setMode("play");
  const enterFix = () => setMode("fix");
  const backToBuild = () => setMode("build");
  const applyAndResume = () => setMode("play");

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070A12]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
              <Blocks className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">
                Lesson Template
              </div>
              <div className="text-xs text-white/60 leading-tight">
                Build → Play → Fix
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 w-full max-w-[640px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span className="truncate">
                  {step.title} <span className="text-white/40">•</span>{" "}
                  Step {activeStepIndex + 1} / {demoSteps.length}
                </span>
                <span className="tabular-nums">{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={progressPct} />
            </div>

            <div className="flex items-center gap-2">
              {isBuild ? (
                <button
                  onClick={startPlay}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold shadow-[0_12px_30px_rgba(16,185,129,0.25)]"
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>
              ) : isPlay ? (
                <>
                  <button
                    onClick={enterFix}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold"
                    title="Open editor overlay (Space)"
                  >
                    <Code2 className="h-4 w-4" />
                    Edit / Fix
                  </button>
                  <button
                    onClick={backToBuild}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold"
                    title="Exit play (Esc)"
                  >
                    <Minimize2 className="h-4 w-4" />
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={applyAndResume}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-500 px-4 py-2 text-sm font-semibold shadow-[0_12px_30px_rgba(34,211,238,0.20)]"
                    title="Apply & resume (Ctrl/Cmd+Enter)"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Apply & Resume
                  </button>
                  <button
                    onClick={() => setMode("play")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold"
                    title="Close overlay (Esc)"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BUILD mode layout */}
      <main className="mx-auto max-w-[1600px] px-4 py-5">
        {/* Mode badge row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Pill tone="brand" icon={<Sparkles className="h-4 w-4" />}>
            Mode: {mode.toUpperCase()}
          </Pill>
          <Pill icon={<HelpCircle className="h-4 w-4" />}>
            Space = toggle (Build→Play→Fix) • Esc = back
          </Pill>
          <Pill tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>
            Advantage: play + code on one screen
          </Pill>
        </div>

        {/* BUILD: Two-row grid (top: guide+world, bottom: editor area) */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT: Guide */}
          <section
            className={cn(
              "col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden",
              isPlay ? "hidden" : "block"
            )}
          >
            <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Guide</div>
                <div className="text-xs text-white/60">
                  Steps unlock as you progress.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTeacherTip((v) => !v)}
                  className="rounded-xl px-3 py-2 text-xs bg-white/10 hover:bg-white/15 border border-white/10"
                >
                  {showTeacherTip ? "Hide" : "Show"} teacher tip
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Step navigator */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <button
                  onClick={goPrevStep}
                  disabled={!canPrev}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10",
                    !canPrev && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <div className="text-center">
                  <div className="text-sm font-semibold">{step.title}</div>
                  <div className="text-xs text-white/60">
                    Step {activeStepIndex + 1} of {demoSteps.length}
                  </div>
                </div>

                <button
                  onClick={goNextStep}
                  disabled={!canNext}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10",
                    !canNext && "opacity-40 cursor-not-allowed"
                  )}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Student instructions */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/60">
                  Student mission
                </div>
                <div className="mt-2 text-sm leading-relaxed text-white/90">
                  {/* basic markdown-ish bold */}
                  {step.studentText.split("**").map((part, idx) =>
                    idx % 2 === 1 ? (
                      <span key={idx} className="font-semibold text-white">
                        {part}
                      </span>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  )}
                </div>

                {step.successHint ? (
                  <div className="mt-3 text-xs text-white/70">
                    <span className="text-white/50">Hint:</span>{" "}
                    {step.successHint}
                  </div>
                ) : null}
              </div>

              {/* Teacher tip */}
              {showTeacherTip && step.teacherTip ? (
                <div className="mt-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/15 p-4">
                  <div className="text-xs uppercase tracking-wide text-emerald-100/80">
                    Instructor note
                  </div>
                  <div className="mt-2 text-sm text-emerald-50/90 leading-relaxed">
                    {step.teacherTip}
                  </div>
                </div>
              ) : null}

              {/* Allowed categories */}
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
                  Blocks unlocked
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Pill
                      key={c.name}
                      tone={c.locked ? "locked" : "neutral"}
                      icon={c.locked ? <Lock className="h-4 w-4" /> : null}
                    >
                      {c.name}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: World preview (BUILD) */}
          <section
            className={cn(
              "col-span-12 lg:col-span-8",
              isPlay ? "hidden" : "block"
            )}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 pb-3">
                <div>
                  <div className="text-sm font-semibold">World</div>
                  <div className="text-xs text-white/60">
                    Live preview (stays on-screen while you build)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetWorkspace}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-xs"
                    title="Reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={startPlay}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold"
                    title="Play (Space)"
                  >
                    <Play className="h-4 w-4" />
                    Play
                  </button>
                </div>
              </div>

              <WorldSurface variant="preview" />
              <div className="mt-3 flex items-center justify-between text-xs text-white/60 px-2">
                <div>WASD move • Mouse look</div>
                <div>Tip: press Space to jump into Play/Editor flow</div>
              </div>
            </div>
          </section>

          {/* Bottom editor row (BUILD) */}
          <section
            className={cn(
              "col-span-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden",
              isPlay ? "hidden" : "block"
            )}
          >
            <div className="grid grid-cols-12">
              {/* Blocks palette */}
              <aside className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="p-4 border-b border-white/10">
                  <div className="text-sm font-semibold">Blocks</div>
                  <div className="text-xs text-white/60">
                    Locked set keeps it simple.
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {palette.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-white/80">
                          {cat.name}
                        </div>
                        {cat.locked ? (
                          <span className="text-[11px] text-white/45 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        {cat.items.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => !cat.locked && onAddBlock(b.label)}
                            disabled={cat.locked}
                            className={cn(
                              "w-full text-left rounded-xl px-3 py-2 border text-sm transition",
                              cat.locked
                                ? "bg-white/5 border-white/10 text-white/35 cursor-not-allowed"
                                : "bg-white/10 hover:bg-white/15 border-white/10 text-white/90"
                            )}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Code canvas */}
              <div className="col-span-12 lg:col-span-6 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Code Canvas</div>
                    <div className="text-xs text-white/60">
                      Drag blocks here (replace with Blockly workspace).
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBlocksTab("blocks")}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border",
                        blocksTab === "blocks"
                          ? "bg-white/15 border-white/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <Blocks className="h-4 w-4" />
                      Blocks
                    </button>
                    <button
                      onClick={() => setBlocksTab("text")}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border",
                        blocksTab === "text"
                          ? "bg-white/15 border-white/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <Code2 className="h-4 w-4" />
                      Epic Mode
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {blocksTab === "blocks" ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[220px]">
                      {workspaceItems.length === 0 ? (
                        <div className="text-center py-10 text-white/55">
                          Drag blocks from the left to start coding.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {workspaceItems.map((w, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm flex items-center justify-between"
                            >
                              <span>{w}</span>
                              <button
                                className="text-white/50 hover:text-white"
                                onClick={() =>
                                  setWorkspaceItems((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={epicText}
                      onChange={(e) => setEpicText(e.target.value)}
                      className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white/90 outline-none focus:border-white/20"
                    />
                  )}
                </div>
              </div>

              {/* Toolbox */}
              <aside className="col-span-12 lg:col-span-3">
                <div className="p-4 border-b border-white/10">
                  <div className="text-sm font-semibold">Toolbox</div>
                  <div className="text-xs text-white/60">
                    Contextual tools + run controls.
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      Quick actions
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={startPlay}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold"
                      >
                        <Play className="h-4 w-4" />
                        Play
                      </button>
                      <button
                        onClick={onResetWorkspace}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-xs font-semibold"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      Diagnostics
                    </div>
                    <div className="mt-2 text-xs text-white/70 leading-relaxed">
                      In FIX mode, this area becomes:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>"What happened?" replay</li>
                        <li>Hints / checks</li>
                        <li>AI companion suggestions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/15 p-4">
                    <div className="text-xs uppercase tracking-wide text-cyan-100/80">
                      Fresh feel
                    </div>
                    <div className="mt-2 text-xs text-cyan-50/90 leading-relaxed">
                      Use smooth mode transitions + celebratory micro-animations
                      when students hit a goal.
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>

      {/* PLAY mode full-screen layer */}
      {isPlay ? (
        <div className="fixed inset-0 z-50 bg-[#070A12]">
          <div className="absolute inset-0 p-4">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden relative">
              {/* HUD */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-3">
                <div className="max-w-[720px]">
                  <Pill tone="brand" icon={<Maximize2 className="h-4 w-4" />}>
                    PLAY MODE
                  </Pill>
                  <div className="mt-2 text-white font-semibold text-lg">
                    {step.title}
                  </div>
                  <div className="text-white/70 text-sm">
                    Goal: {step.studentText.replaceAll("**", "")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode("fix")}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-500 px-4 py-2 text-sm font-semibold"
                    title="Open Fix overlay (Space)"
                  >
                    <Code2 className="h-4 w-4" />
                    Edit / Fix
                  </button>
                  <button
                    onClick={() => setMode("build")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold"
                    title="Exit Play (Esc)"
                  >
                    <Minimize2 className="h-4 w-4" />
                    Back to Build
                  </button>
                </div>
              </div>

              {/* World */}
              <div className="absolute inset-0 p-4 pt-24">
                <WorldSurface variant="fullscreen" />
              </div>

              {/* Bottom hint */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-white/60">
                <div>WASD move • Mouse look</div>
                <div>Press Space to open the Fix overlay • Esc to exit</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* FIX overlay (slides over PLAY) */}
      {isFix ? (
        <div className="fixed inset-0 z-[60]">
          {/* dim + world behind */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 p-4">
            <div className="h-full rounded-3xl border border-white/10 bg-[#070A12]/85 backdrop-blur-2xl overflow-hidden relative">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 border-b border-white/10 bg-white/5">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Pill tone="brand" icon={<Pause className="h-4 w-4" />}>
                      FIX MODE
                    </Pill>
                    <div>
                      <div className="text-sm font-semibold">Pause → Edit → Resume</div>
                      <div className="text-xs text-white/60">
                        Make a change, then Apply & Resume.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={applyAndResume}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-500 px-4 py-2 text-sm font-semibold"
                      title="Apply & Resume (Ctrl/Cmd+Enter)"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Apply & Resume
                    </button>
                    <button
                      onClick={() => setMode("play")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold"
                      title="Close (Esc)"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Content: world + overlay panel */}
              <div className="absolute inset-0 pt-[64px] p-4">
                <div className="h-full grid grid-cols-12 gap-4">
                  {/* World behind */}
                  <div className="col-span-12 lg:col-span-7">
                    <WorldSurface variant="fullscreen" isPaused />
                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                      <span>World is paused (or could be slow-mo)</span>
                      <span>Goal: fix the behavior and test again</span>
                    </div>
                  </div>

                  {/* Fix panel */}
                  <div className="col-span-12 lg:col-span-5">
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">Editor Overlay</div>
                          <div className="text-xs text-white/60">
                            Blocks for beginners, Epic Mode for advanced.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setBlocksTab("blocks")}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border",
                              blocksTab === "blocks"
                                ? "bg-white/15 border-white/20"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                          >
                            <Blocks className="h-4 w-4" />
                            Blocks
                          </button>
                          <button
                            onClick={() => setBlocksTab("text")}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border",
                              blocksTab === "text"
                                ? "bg-white/15 border-white/20"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                          >
                            <Code2 className="h-4 w-4" />
                            Epic
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {blocksTab === "blocks" ? (
                          <>
                            <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
                              Quick blocks (contextual)
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {["move forward", "turn left", "turn right", "repeat 3 times"].map(
                                (b) => (
                                  <button
                                    key={b}
                                    onClick={() => onAddBlock(b)}
                                    className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-xs text-left"
                                  >
                                    {b}
                                  </button>
                                )
                              )}
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[260px]">
                              {workspaceItems.length === 0 ? (
                                <div className="text-center py-10 text-white/55">
                                  Add or adjust blocks to fix your code.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {workspaceItems.map((w, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm flex items-center justify-between"
                                    >
                                      <span>{w}</span>
                                      <button
                                        className="text-white/50 hover:text-white"
                                        onClick={() =>
                                          setWorkspaceItems((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                          )
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
                              Epic Mode text
                            </div>
                            <textarea
                              value={epicText}
                              onChange={(e) => setEpicText(e.target.value)}
                              className="w-full min-h-[420px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white/90 outline-none focus:border-white/20"
                            />
                          </>
                        )}

                        {/* Diagnostics / hints area */}
                        <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/15 p-4">
                          <div className="text-xs uppercase tracking-wide text-emerald-100/80">
                            Hint
                          </div>
                          <div className="mt-2 text-xs text-emerald-50/90 leading-relaxed">
                            This area becomes your <b>AI companion</b> + automated checks:
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>"Your event block is missing."</li>
                              <li>"Try placing blocks inside the loop."</li>
                              <li>"Want a faster solution?"</li>
                            </ul>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-white/55">
                          Shortcuts: <span className="text-white/70">Ctrl/Cmd+Enter</span>{" "}
                          apply & resume • <span className="text-white/70">Esc</span> close
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>Fix Mode keeps flow: no context switching, no extra apps.</span>
                  <span>Next: wire this to Blip + Blockly generators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}