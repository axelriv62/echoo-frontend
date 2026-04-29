import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Song {
    name: string;
    bpm: number;
    color: string;
    accent: string;
    pattern: number[][];
    emoji: string;
}

interface NoteObj {
    id: number;
    el: HTMLDivElement | null;
    lane: number;
    startTime: number;
    hit: boolean;
    missed: boolean;
}

interface GameState {
    running: boolean;
    score: number;
    combo: number;
    hp: number;
    hits: number;
    total: number;
    notes: NoteObj[];
    patternStep: number;
    nextNoteTime: number;
    startTime: number;
    animId: number | null;
    noteIdCounter: number;
}

type OverlayState = "idle" | "playing" | "gameover" | "win";

// ─── Constants ────────────────────────────────────────────────────────────────

const SONGS: Song[] = [
    {
        name: "Billie Jean",
        bpm: 118,
        color: "#ff5078",
        accent: "#ff8fab",
        emoji: "🕺",
        pattern: [
            [0, 1],[1, 2],[2, 3],[3, 2],[0, 1],[2, 3],[1, 0],[3, 2],
            [0, 3],[1, 2],[2, 1],[0, 3],[1, 2],[3, 0],[2, 1],[0, 3],
            [0, 2],[1, 3],[2, 0],[3, 1],[0, 2],[3, 1],[1, 3],[2, 0],
            [0, 1],[2, 3],[1, 0],[3, 2],[0, 1],[2, 3],[1, 0],[3, 2],
        ],
    },
    {
        name: "Thriller",
        bpm: 104,
        color: "#a855f7",
        accent: "#d8b4fe",
        emoji: "🧟",
        pattern: [
            [0, 3],[1, 2],[0, 3],[2, 1],[3, 0],[1, 2],[0, 3],[2, 1],
            [0, 2],[1, 3],[3, 2],[1, 0],[0, 3],[2, 1],[0, 1],[3, 2],
            [0],[1],[2],[3],[0, 2],[1, 3],[0, 1, 3],[2],
            [0, 3],[1, 2],[0],[3],[1],[2, 3],[0, 1],[2, 3],
        ],
    },
    {
        name: "Beat It",
        bpm: 138,
        color: "#3b82f6",
        accent: "#93c5fd",
        emoji: "🎸",
        pattern: [
            [0],[2],[1],[3],[0, 2],[1, 3],[0],[2],
            [1],[3],[0, 1],[2, 3],[0],[2],[1],[3],
            [0, 3],[1, 2],[2, 1],[3, 0],[0, 1],[2, 3],[0, 3],[1, 2],
            [0],[1],[2],[3],[0, 2],[1, 3],[0, 1, 2],[3],
        ],
    },
    {
        name: "Smooth Criminal",
        bpm: 126,
        color: "#10b981",
        accent: "#6ee7b7",
        emoji: "🎩",
        pattern: [
            [0, 1],[2, 3],[0, 2],[1, 3],[0, 3],[1, 2],[0, 1],[2, 3],
            [0, 2],[1, 3],[0, 1, 2],[3],[0, 3],[1, 2],[0],[1, 2, 3],
            [0],[1],[2],[3],[0, 1],[2, 3],[0, 2],[1, 3],
            [0, 1, 2, 3],[0],[1, 2],[0, 3],[2, 1],[3, 0],[0, 1, 3],[2],
        ],
    },
];

const LANE_COLORS = ["#ff5078", "#3b82f6", "#fbbf24", "#10b981"];
const LANE_KEYS = ["D", "F", "J", "K"];
const KEY_TO_LANE: Record<string, number> = { d: 0, f: 1, j: 2, k: 3 };
const LANE_HEIGHT = 340;
const HIT_ZONE_Y = LANE_HEIGHT - 48;
const NOTE_H = 22;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFallMs(song: Song): number {
    return 1600 * (100 / song.bpm);
}

function getBeatInterval(song: Song): number {
    return 60000 / song.bpm;
}

function getRank(acc: number): string {
    if (acc >= 95) return "SSS";
    if (acc >= 85) return "S";
    if (acc >= 70) return "A";
    if (acc >= 50) return "B";
    return "C";
}

function getBestScores(): Record<string, number> {
    try {
        return JSON.parse(localStorage.getItem("mj_best_scores") || "{}");
    } catch {
        return {};
    }
}

function saveBestScore(songName: string, score: number) {
    const bests = getBestScores();
    if (!bests[songName] || score > bests[songName]) {
        bests[songName] = score;
        localStorage.setItem("mj_best_scores", JSON.stringify(bests));
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

const GamePage = () => {
    const navigate = useNavigate();

    const [songIdx, setSongIdx] = useState(0);
    const [overlayState, setOverlayState] = useState<OverlayState>("idle");
    const [displayScore, setDisplayScore] = useState(0);
    const [displayCombo, setDisplayCombo] = useState(0);
    const [displayHp, setDisplayHp] = useState(100);
    const [displayAcc, setDisplayAcc] = useState(100);
    const [progress, setProgress] = useState(0);
    const [feedback, setFeedback] = useState<{ text: string; color: string; key: number } | null>(null);
    const [laneActive, setLaneActive] = useState([false, false, false, false]);
    const [endResult, setEndResult] = useState<{ score: number; acc: number; won: boolean } | null>(null);
    const [bestScores, setBestScores] = useState<Record<string, number>>(getBestScores());
    const [notePositions, setNotePositions] = useState<{ id: number; lane: number; y: number }[]>([]);

    const gameRef = useRef<GameState>({
        running: false, score: 0, combo: 0, hp: 100,
        hits: 0, total: 0, notes: [], patternStep: 0,
        nextNoteTime: 0, startTime: 0, animId: null, noteIdCounter: 0,
    });

    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const laneTimersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>([null, null, null, null]);

    const song = SONGS[songIdx];

    // ─── Flash lane ─────────────────────────────────────────────────────────────
    const flashLane = useCallback((laneIdx: number) => {
        setLaneActive((prev) => {
            const next = [...prev];
            next[laneIdx] = true;
            return next;
        });
        if (laneTimersRef.current[laneIdx]) clearTimeout(laneTimersRef.current[laneIdx]!);
        laneTimersRef.current[laneIdx] = setTimeout(() => {
            setLaneActive((prev) => {
                const next = [...prev];
                next[laneIdx] = false;
                return next;
            });
        }, 100);
    }, []);

    // ─── Show feedback ──────────────────────────────────────────────────────────
    const showFeedback = useCallback((text: string, color: string) => {
        setFeedback({ text, color, key: Date.now() });
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 500);
    }, []);

    // ─── End game ───────────────────────────────────────────────────────────────
    const endGame = useCallback((won: boolean) => {
        const g = gameRef.current;
        g.running = false;
        if (g.animId) cancelAnimationFrame(g.animId);
        g.notes = [];
        setNotePositions([]);

        const acc = g.total > 0 ? Math.round((g.hits / g.total) * 100) : 0;
        setEndResult({ score: g.score, acc, won });
        setOverlayState(won ? "win" : "gameover");

        if (won) {
            saveBestScore(song.name, g.score);
            setBestScores(getBestScores());
        }
    }, [song.name]);

    // ─── Game loop ──────────────────────────────────────────────────────────────
    const tick = useCallback((now: number) => {
        const g = gameRef.current;
        if (!g.running) return;

        const s = SONGS[songIdx];
        const fallMs = getFallMs(s);
        const beatInterval = getBeatInterval(s);
        const elapsed = now - g.startTime;

        // Spawn notes
        if (elapsed >= g.nextNoteTime && g.patternStep < s.pattern.length) {
            const lanes = s.pattern[g.patternStep];
            lanes.forEach((laneIdx) => {
                g.noteIdCounter++;
                g.notes.push({
                    id: g.noteIdCounter,
                    el: null,
                    lane: laneIdx,
                    startTime: now,
                    hit: false,
                    missed: false,
                });
                g.total += 1;
            });
            g.patternStep++;
            g.nextNoteTime += beatInterval * (g.patternStep % 3 === 0 ? 2 : 1);
        }

        // Move notes & detect misses
        const positions: { id: number; lane: number; y: number }[] = [];
        let missed = false;
        for (let i = g.notes.length - 1; i >= 0; i--) {
            const n = g.notes[i];
            if (n.hit || n.missed) {
                g.notes.splice(i, 1);
                continue;
            }
            const age = now - n.startTime;
            const y = -NOTE_H + (age / fallMs) * (LANE_HEIGHT + NOTE_H);
            if (y > LANE_HEIGHT + 10) {
                n.missed = true;
                missed = true;
                g.combo = 0;
                g.hp = Math.max(0, g.hp - 12);
                showFeedback("MISS", "#ef4444");
                g.notes.splice(i, 1);
                continue;
            }
            positions.push({ id: n.id, lane: n.lane, y: Math.round(y) });
        }

        setNotePositions(positions);
        if (missed) {
            setDisplayCombo(0);
            setDisplayHp(g.hp);
            if (g.hp <= 0) { endGame(false); return; }
        }

        setProgress(Math.min(1, g.patternStep / s.pattern.length));

        if (g.patternStep >= s.pattern.length && g.notes.length === 0) {
            setTimeout(() => endGame(true), 600);
            return;
        }

        g.animId = requestAnimationFrame(tick);
    }, [songIdx, showFeedback, endGame]);

    // ─── Start game ─────────────────────────────────────────────────────────────
    const startGame = useCallback(() => {
        const g = gameRef.current;
        const s = SONGS[songIdx];
        Object.assign(g, {
            running: true, score: 0, combo: 0, hp: 100, hits: 0, total: 0,
            notes: [], patternStep: 0, noteIdCounter: 0,
            nextNoteTime: getBeatInterval(s) * 2,
            startTime: performance.now(), animId: null,
        });

        setDisplayScore(0); setDisplayCombo(0); setDisplayHp(100);
        setDisplayAcc(100); setProgress(0); setNotePositions([]);
        setFeedback(null); setEndResult(null);
        setOverlayState("playing");

        g.animId = requestAnimationFrame(tick);
    }, [songIdx, tick]);

    // ─── Hit handler ────────────────────────────────────────────────────────────
    const tryHit = useCallback((laneIdx: number) => {
        const g = gameRef.current;
        if (!g.running) return;
        flashLane(laneIdx);

        const s = SONGS[songIdx];
        const fallMs = getFallMs(s);
        const PERFECT = fallMs * 0.09;
        const GOOD = fallMs * 0.18;
        const now = performance.now();

        let best: NoteObj | null = null;
        let bestDist = Infinity;
        for (const n of g.notes) {
            if (n.hit || n.missed || n.lane !== laneIdx) continue;
            const age = now - n.startTime;
            const y = -NOTE_H + (age / fallMs) * (LANE_HEIGHT + NOTE_H);
            const dist = Math.abs(y - HIT_ZONE_Y);
            if (dist < bestDist) { bestDist = dist; best = n; }
        }

        if (!best) return;

        if (bestDist < PERFECT) {
            best.hit = true;
            g.hits++;
            g.combo++;
            const mult = g.combo >= 10 ? 3 : g.combo >= 5 ? 2 : 1;
            g.score += 300 * mult;
            showFeedback("PERFECT!", "#fbbf24");
        } else if (bestDist < GOOD) {
            best.hit = true;
            g.hits++;
            g.combo++;
            g.score += 100;
            showFeedback("GOOD", "#60a5fa");
        } else {
            g.combo = 0;
            g.hp = Math.max(0, g.hp - 6);
            showFeedback("EARLY", "#6b7280");
            setDisplayHp(g.hp);
            return;
        }

        setDisplayScore(g.score);
        setDisplayCombo(g.combo);
        setDisplayHp(g.hp);
        const acc = g.total > 0 ? Math.round((g.hits / g.total) * 100) : 100;
        setDisplayAcc(acc);
    }, [songIdx, flashLane, showFeedback]);

    // ─── Keyboard listener ──────────────────────────────────────────────────────
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const lane = KEY_TO_LANE[e.key.toLowerCase()];
            if (lane !== undefined) tryHit(lane);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [tryHit]);

    // ─── Cleanup on unmount ─────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            const g = gameRef.current;
            g.running = false;
            if (g.animId) cancelAnimationFrame(g.animId);
        };
    }, []);

    // ─── HP color ───────────────────────────────────────────────────────────────
    const hpColor = displayHp < 40 ? "#ef4444" : displayHp < 70 ? "#f97316" : "#fbbf24";

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                minHeight: "100vh",
                fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
            }}
        >
            {/* Google Fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');
        @keyframes noteGlow { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes feedbackPop { 0%{transform:translateX(-50%) scale(0.7);opacity:0} 20%{transform:translateX(-50%) scale(1.15);opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateX(-50%) translateY(-12px)} }
        @keyframes laneFlash { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hpPulse { 0%,100%{filter:none} 50%{filter:brightness(1.4)} }
        .note-elem { animation: noteGlow 0.6s infinite; }
        .lane-flash-anim { animation: laneFlash 0.12s ease-out forwards; }
        .slide-in { animation: slideIn 0.4s ease-out both; }
      `}</style>

            {/* Back button */}
            <div style={{ width: "100%", maxWidth: 420, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.6)",
                        borderRadius: 8,
                        padding: "6px 14px",
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: 1,
                    }}
                >
                    ← Retour
                </button>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, letterSpacing: 2 }}>
          MOONWALK BEAT
        </span>
            </div>

            {/* Game Card */}
            <div
                className="slide-in"
                style={{
                    width: "100%",
                    maxWidth: 420,
                    background: "#111118",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.07)",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: `0 0 60px ${song.color}22`,
                }}
            >
                {/* MJ Silhouette watermark */}
                <svg
                    aria-hidden="true"
                    viewBox="0 0 200 340"
                    style={{ position: "absolute", right: 10, bottom: 0, width: 160, height: 270, opacity: 0.05, pointerEvents: "none" }}
                >
                    <ellipse cx="100" cy="42" rx="28" ry="32" fill="#fff" />
                    <rect x="76" y="74" width="48" height="90" rx="8" fill="#fff" />
                    <rect x="56" y="76" width="22" height="72" rx="8" fill="#fff" transform="rotate(-18 67 112)" />
                    <rect x="122" y="76" width="22" height="72" rx="8" fill="#fff" transform="rotate(18 133 112)" />
                    <rect x="82" y="160" width="20" height="90" rx="8" fill="#fff" transform="rotate(-8 92 205)" />
                    <rect x="98" y="160" width="20" height="90" rx="8" fill="#fff" transform="rotate(14 108 205)" />
                    <rect x="84" y="244" width="22" height="60" rx="6" fill="#fff" transform="rotate(-5 95 274)" />
                    <rect x="102" y="244" width="22" height="60" rx="6" fill="#fff" transform="rotate(28 113 274)" />
                </svg>

                {/* Header */}
                <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 4, color: "#fff", lineHeight: 1 }}>
                            MOONWALK BEAT
                        </div>
                        <div style={{ fontSize: 11, color: song.accent, letterSpacing: 2, marginTop: 2 }}>
                            ♪ {song.name.toUpperCase()}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        {[
                            { val: displayScore, label: "Score" },
                            { val: displayCombo > 1 ? `${displayCombo}x` : displayCombo, label: "Combo" },
                            { val: `${displayAcc}%`, label: "Précision" },
                        ].map(({ val, label }) => (
                            <div key={label} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fbbf24", lineHeight: 1 }}>{val}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Song selector */}
                <div style={{ display: "flex", gap: 6, padding: "8px 18px 6px", flexWrap: "wrap" }}>
                    {SONGS.map((s, i) => (
                        <button
                            key={s.name}
                            onClick={() => { if (!gameRef.current.running) setSongIdx(i); }}
                            style={{
                                background: i === songIdx ? `${s.color}22` : "rgba(255,255,255,0.04)",
                                border: `1px solid ${i === songIdx ? s.color : "rgba(255,255,255,0.1)"}`,
                                color: i === songIdx ? s.accent : "rgba(255,255,255,0.5)",
                                borderRadius: 20,
                                padding: "4px 12px",
                                fontSize: 11,
                                cursor: gameRef.current.running ? "default" : "pointer",
                                fontFamily: "inherit",
                                letterSpacing: 1,
                                transition: "all 0.15s",
                            }}
                        >
                            {s.emoji} {s.name}
                        </button>
                    ))}
                </div>

                {/* HP bar */}
                <div style={{ padding: "2px 18px 6px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>HP</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${displayHp}%`,
                                height: "100%",
                                background: hpColor,
                                borderRadius: 2,
                                transition: "width 0.3s, background 0.3s",
                                animation: displayHp < 30 ? "hpPulse 0.6s infinite" : "none",
                            }}
                        />
                    </div>
                    <span style={{ fontSize: 10, color: hpColor, letterSpacing: 1, minWidth: 28 }}>{displayHp}</span>
                </div>

                {/* Lanes */}
                <div style={{ display: "flex", gap: 4, padding: "6px 18px", justifyContent: "center", position: "relative" }}>
                    {[0, 1, 2, 3].map((laneIdx) => (
                        <div
                            key={laneIdx}
                            onClick={() => tryHit(laneIdx)}
                            style={{
                                width: 80,
                                height: LANE_HEIGHT,
                                background: laneActive[laneIdx]
                                    ? `${LANE_COLORS[laneIdx]}18`
                                    : "rgba(255,255,255,0.02)",
                                border: `1px solid ${laneActive[laneIdx] ? LANE_COLORS[laneIdx] + "55" : "rgba(255,255,255,0.05)"}`,
                                borderRadius: 10,
                                position: "relative",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "background 0.08s, border-color 0.08s",
                            }}
                        >
                            {/* Hit zone */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 36,
                                    left: 8,
                                    right: 8,
                                    height: 14,
                                    borderRadius: 7,
                                    background: `${LANE_COLORS[laneIdx]}30`,
                                    border: `1px solid ${LANE_COLORS[laneIdx]}60`,
                                    zIndex: 4,
                                }}
                            />
                            {/* Key label */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    fontSize: 18,
                                    color: laneActive[laneIdx] ? LANE_COLORS[laneIdx] : "rgba(255,255,255,0.2)",
                                    transition: "color 0.08s",
                                    zIndex: 5,
                                }}
                            >
                                {LANE_KEYS[laneIdx]}
                            </div>
                            {/* Lane glow when active */}
                            {laneActive[laneIdx] && (
                                <div
                                    className="lane-flash-anim"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: 10,
                                        background: `${LANE_COLORS[laneIdx]}15`,
                                        pointerEvents: "none",
                                        zIndex: 3,
                                    }}
                                />
                            )}
                            {/* Notes */}
                            {notePositions
                                .filter((n) => n.lane === laneIdx)
                                .map((n) => (
                                    <div
                                        key={n.id}
                                        className="note-elem"
                                        style={{
                                            position: "absolute",
                                            left: 8,
                                            right: 8,
                                            top: n.y,
                                            height: NOTE_H,
                                            borderRadius: 6,
                                            background: LANE_COLORS[laneIdx],
                                            boxShadow: `0 0 12px ${LANE_COLORS[laneIdx]}99`,
                                            zIndex: 6,
                                        }}
                                    />
                                ))}
                        </div>
                    ))}

                    {/* Feedback text */}
                    {feedback && (
                        <div
                            key={feedback.key}
                            style={{
                                position: "absolute",
                                bottom: 50,
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: 28,
                                letterSpacing: 3,
                                color: feedback.color,
                                pointerEvents: "none",
                                zIndex: 20,
                                whiteSpace: "nowrap",
                                animation: "feedbackPop 0.5s ease-out forwards",
                            }}
                        >
                            {feedback.text}
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div style={{ padding: "0 18px 8px" }}>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${progress * 100}%`,
                                height: "100%",
                                background: `${song.color}99`,
                                borderRadius: 2,
                                transition: "width 0.3s",
                            }}
                        />
                    </div>
                </div>

                {/* Best scores */}
                <div style={{ padding: "4px 18px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SONGS.map((s) => (
                        <div key={s.name} style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>
                            <span style={{ color: s.accent }}>{s.emoji}</span>{" "}
                            {bestScores[s.name] ? bestScores[s.name].toLocaleString() : "—"}
                        </div>
                    ))}
                </div>

                {/* Overlay */}
                {overlayState !== "playing" && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.92)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 50,
                            borderRadius: 20,
                            gap: 8,
                        }}
                    >
                        {overlayState === "idle" && (
                            <>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 6, color: "#fbbf24", lineHeight: 1 }}>
                                    MOONWALK BEAT
                                </div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 16 }}>
                                    MICHAEL JACKSON RHYTHM GAME
                                </div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
                                    {SONGS.map((s, i) => (
                                        <button
                                            key={`overlay-${s.name}`}
                                            onClick={() => setSongIdx(i)}
                                            style={{
                                                background: i === songIdx ? `${s.color}22` : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${i === songIdx ? s.color : "rgba(255,255,255,0.15)"}`,
                                                color: i === songIdx ? s.accent : "rgba(255,255,255,0.65)",
                                                borderRadius: 20,
                                                padding: "4px 12px",
                                                fontSize: 11,
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                letterSpacing: 1,
                                            }}
                                        >
                                            {s.emoji} {s.name}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={startGame} style={startBtnStyle(song.color)}>
                                    JOUER
                                </button>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 10, letterSpacing: 2 }}>
                                    Clavier : D · F · J · K &nbsp;|&nbsp; Mobile : toucher les lanes
                                </div>
                            </>
                        )}

                        {(overlayState === "win" || overlayState === "gameover") && endResult && (
                            <>
                                <div
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: 46,
                                        letterSpacing: 5,
                                        color: overlayState === "win" ? "#fbbf24" : "#ef4444",
                                        lineHeight: 1,
                                    }}
                                >
                                    {overlayState === "win" ? "BRAVO !" : "GAME OVER"}
                                </div>
                                {overlayState === "win" && (
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>
                                        Rang : {getRank(endResult.acc)} &nbsp;·&nbsp; Précision : {endResult.acc}%
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: 56,
                                        color: "#fff",
                                        margin: "8px 0 16px",
                                        lineHeight: 1,
                                    }}
                                >
                                    {endResult.score.toLocaleString()}
                                </div>
                                {bestScores[song.name] && endResult.score >= bestScores[song.name] && overlayState === "win" && (
                                    <div style={{ fontSize: 12, color: "#fbbf24", letterSpacing: 2, marginBottom: 8 }}>
                                        🏆 NOUVEAU RECORD !
                                    </div>
                                )}
                                <button onClick={startGame} style={startBtnStyle(song.color)}>
                                    REJOUER
                                </button>
                                <button
                                    onClick={() => setOverlayState("idle")}
                                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 24px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", letterSpacing: 2, marginTop: 8 }}
                                >
                                    MENU
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Instructions card */}
            <div
                className="slide-in"
                style={{
                    width: "100%",
                    maxWidth: 420,
                    marginTop: 12,
                    background: "rgba(0,0,0, 1)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    padding: "12px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    animationDelay: "0.1s",
                }}
            >
                {[
                    { icon: "🎯", label: "PERFECT", pts: "300 pts × combo" },
                    { icon: "✅", label: "GOOD", pts: "100 pts" },
                    { icon: "💀", label: "MISS", pts: "-12 HP" },
                    { icon: "🔥", label: "×3 COMBO", pts: "dès 10 en suite" },
                ].map(({ icon, label, pts }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18 }}>{icon}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{pts}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function startBtnStyle(color: string): React.CSSProperties {
    return {
        background: color,
        color: "#000",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 20,
        letterSpacing: 3,
        border: "none",
        borderRadius: 10,
        padding: "12px 40px",
        cursor: "pointer",
        transition: "transform 0.1s, filter 0.15s",
    };
}

export default GamePage;
