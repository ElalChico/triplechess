import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Maximize, Minimize, Bot, User, Skull, Crown, Target, RotateCcw, Play, Save, Swords, Monitor, ShieldAlert, Zap, Snail, Trophy, Handshake, AlertTriangle, ArrowRightLeft, RefreshCw, Sparkles, Github } from 'lucide-react';

// ===== AUDIO =====
let audioCtx: AudioContext | null = null;
function initAudio() {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    } else if (audioCtx.state === "suspended" && typeof audioCtx.resume === "function") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.warn("AudioContext failed safely:", e);
  }
}
function playTone(freq: number, dur: number, type: OscillatorType, vol: number) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol || 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}
const SFX = {
  move() { playTone(440, 0.06, 'sine', 0.15); },
  capture() { playTone(220, 0.1, 'square', 0.2); },
  check() { playTone(660, 0.12, 'sawtooth', 0.25); setTimeout(() => playTone(880, 0.12, 'sawtooth', 0.25), 100); },
  checkmate() { playTone(330, 0.2, 'square', 0.3); setTimeout(() => playTone(220, 0.2, 'square', 0.3), 150); setTimeout(() => playTone(110, 0.3, 'square', 0.3), 300); },
  start() { playTone(523, 0.08, 'sine', 0.15); setTimeout(() => playTone(659, 0.08, 'sine', 0.15), 80); }
};

// ===== SVG PIECES =====
const P_SVG: Record<string, string> = {
  wK: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>',
  wQ: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/></g></svg>',
  wR: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M14 29.5v-13h17v13H14z"/><path d="M14 16.5L11 14h23l-3 2.5H14z"/><path d="M12 35.5h21m-20-4h19m-18-2h17" fill="none"/></g></svg>',
  wB: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>',
  wN: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.99-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.99 2.5-3c1 0 1 3 1 3" fill="#fff"/><circle cx="14" cy="15.5" r="1" fill="#000" stroke="none"/></g></svg>',
  wP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5"/></svg>',
  bK: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.91 14 7 19.85c-2.5 5.65 4.85 9 4.85 9" stroke="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g></svg>',
  bQ: '<svg viewBox="0 0 45 45"><g stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" fill="#000"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="#000"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/></g></svg>',
  bR: '<svg viewBox="0 0 45 45"><g stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3.5-7l1.5-2.5h17l1.5 2.5h-20zm-.5 4v-4h21v4H12z" fill="#000"/><path d="M14 29.5v-13h17v13H14z" fill="#000"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" fill="#000"/><path d="M12 35.5h21m-20-4h19m-18-2h17" fill="none" stroke="#fff"/></g></svg>',
  bB: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff"/></g></svg>',
  bN: '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.99-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.99 2.5-3c1 0 1 3 1 3" fill="#000"/><circle cx="14" cy="15.5" r="1" fill="#fff" stroke="none"/><path d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34-2.37-4.49-5.79-6.64-9.19-7.16l-.51-.1z" fill="#fff" stroke="none"/></g></svg>',
  bP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5"/></svg>'
};

// ===== GAME ENGINE =====
const COLS = 24;
let ROWS = 8;
const FILES = 'abcdefghijklmnopqrstuvwx'.split('');

const SQ_TO_RC: Record<string, { r: number, c: number }> = {};
const RC_TO_SQ: string[][] = Array.from({ length: 100 }, () => []);

for (let r = 0; r < 100; r++) {
  for (let c = 0; c < 24; c++) {
    const sq = FILES[c] + (r + 1);
    SQ_TO_RC[sq] = { r, c };
    RC_TO_SQ[r][c] = sq;
  }
}

function sqToRC(sq: string): { r: number; c: number } {
  return SQ_TO_RC[sq] || { r: 0, c: 0 };
}
function rcToSq(r: number, c: number): string | null {
  if (r < 0 || r >= 100 || c < 0 || c >= COLS) return null;
  return RC_TO_SQ[r][c] || null;
}

interface Piece {
  type: string;
  color: string;
  hasMoved?: boolean;
}

interface Move {
  from: string;
  to: string;
  capture?: string;
  promotion?: string;
  doublePush?: boolean;
  isCastle?: string;
}

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

interface UndoState {
  move: Move;
  piece: Piece;
  captured: Piece | null;
  prevKings: {
    w: {r: number, c: number}[];
    b: {r: number, c: number}[];
  };
  prevScore: number;
  castleRookUndo?: {
    fr: {r: number, c: number};
    to: {r: number, c: number};
    piece: Piece;
  };
}

class ChessGame {
  board: (Piece | null)[][];
  turn: string;
  history: UndoState[];
  moveLog: { color: string; san: string }[];
  ruleMode: 'first-death' | 'all-death' | 'most-captures' = 'first-death';
  kings: {
    w: {r: number, c: number}[];
    b: {r: number, c: number}[];
  } = { w: [], b: [] };
  evaluationScore: number = 0;

  // Cache fields indexed by history depth
  _legalMovesCache: Record<string, Move[]>[] = [];
  _inCheckCache: Record<string, boolean>[] = [];
  _isGameOverCache: (any | null)[] = [];
  _isSquareAttackedCache: Record<number, boolean>[] = [];

  constructor() {
    this.board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    this.turn = 'w';
    this.history = [];
    this.moveLog = [];
    this.clearCache();
    this.init();
  }

  clearCache() {
    this._legalMovesCache = [];
    this._inCheckCache = [];
    this._isGameOverCache = [];
    this._isSquareAttackedCache = [];
  }

  toJSON() {
    return {
      board: this.board,
      turn: this.turn,
      history: this.history,
      moveLog: this.moveLog,
      ruleMode: this.ruleMode,
      kings: this.kings,
      evaluationScore: this.evaluationScore
    };
  }

  fromJSON(data: any) {
    this.board = data.board;
    this.turn = data.turn;
    this.history = data.history;
    this.moveLog = data.moveLog;
    this.ruleMode = data.ruleMode;
    this.kings = data.kings;
    this.evaluationScore = data.evaluationScore;
    this.clearCache();
  }

  init(ruleMode?: 'first-death' | 'all-death' | 'most-captures') {
    if (ruleMode) {
      this.ruleMode = ruleMode;
    }
    this.clearCache();
    this.board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    this.turn = 'w';
    this.history = [];
    this.moveLog = [];
    this.kings = { w: [], b: [] };
    const backRank = ['r','n','b','q','k','b','n','r'];
    for (let bd = 0; bd < 3; bd++) {
      for (let i = 0; i < 8; i++) {
        const c = bd * 8 + i;
        this.board[ROWS - 1][c] = { type: backRank[i], color: 'w' };
        this.board[ROWS - 2][c] = { type: 'p', color: 'w' };
        this.board[0][c] = { type: backRank[i], color: 'b' };
        this.board[1][c] = { type: 'p', color: 'b' };
        if (backRank[i] === 'k') {
          this.kings.w.push({ r: ROWS - 1, c });
          this.kings.b.push({ r: 0, c });
        }
      }
    }

    // Initialize evaluation score
    this.evaluationScore = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = this.board[r][c];
        if (!p) continue;
        let val = PIECE_VALUES[p.type] || 0;
        if (p.type === 'p') {
          val += (p.color === 'w' ? (ROWS - 2 - r) : (r - 1)) * 5;
        }
        val += (15 - Math.abs(c - 11.5) - Math.abs(r - (ROWS / 2 - 0.5))) * 2;
        this.evaluationScore += p.color === 'w' ? val : -val;
      }
    }
    this.evaluationScore += (this.getKings('w').length - this.getKings('b').length) * 15000;
  }

  get(sq: string): Piece | null {
    const {r, c} = sqToRC(sq);
    return this.board[r][c];
  }

  getKings(color: string) {
    return this.kings[color as 'w' | 'b'] || [];
  }

  pseudoMoves(r: number, c: number): Move[] {
    const piece = this.board[r][c];
    if (!piece) return [];
    const moves: Move[] = [];
    const color = piece.color;
    const opp = color === 'w' ? 'b' : 'w';
    
    const addSlide = (dr: number, dc: number) => {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        const target = this.board[nr][nc];
        const fromSq = rcToSq(r,c)!;
        const toSq = rcToSq(nr,nc)!;
        if (!target) {
          moves.push({from: fromSq, to: toSq});
        } else {
          if (target.color === opp) {
            moves.push({from: fromSq, to: toSq, capture: target.type});
          }
          break;
        }
        nr += dr; nc += dc;
      }
    };
    
    const addStep = (dr: number, dc: number) => {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
      const target = this.board[nr][nc];
      const fromSq = rcToSq(r,c)!;
      const toSq = rcToSq(nr,nc)!;
      if (!target) {
        moves.push({from: fromSq, to: toSq});
      } else if (target.color === opp) {
        moves.push({from: fromSq, to: toSq, capture: target.type});
      }
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? ROWS - 2 : 1;
        const promoRow = color === 'w' ? 0 : ROWS - 1;
        const nr = r + dir;
        const fromSq = rcToSq(r,c)!;
        if (nr >= 0 && nr < ROWS && !this.board[nr][c]) {
          const toSq = rcToSq(nr,c)!;
          if (nr === promoRow) {
            ['q','r','b','n'].forEach(p => moves.push({from: fromSq, to: toSq, promotion: p}));
          } else {
            moves.push({from: fromSq, to: toSq});
            if (r === startRow && !this.board[r + 2*dir][c]) {
              moves.push({from: fromSq, to: rcToSq(r + 2*dir, c)!, doublePush: true});
            }
          }
        }
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
          const target = this.board[nr][nc];
          if (target && target.color === opp) {
            const toSq = rcToSq(nr,nc)!;
            if (nr === promoRow) {
              ['q','r','b','n'].forEach(p => moves.push({from: fromSq, to: toSq, capture: target.type, promotion: p}));
            } else {
              moves.push({from: fromSq, to: toSq, capture: target.type});
            }
          }
        }
        break;
      }
      case 'n':
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => addStep(dr,dc));
        break;
      case 'b':
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => addSlide(dr,dc));
        break;
      case 'r':
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => addSlide(dr,dc));
        break;
      case 'q':
        [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => addSlide(dr,dc));
        break;
      case 'k':
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            if (dr !== 0 || dc !== 0) addStep(dr, dc);
        
        // Castling (Triple Chess style: each king with its two local rooks)
        if (!piece.hasMoved) {
          // Queenside local rook (c - 4)
          if (c >= 4) {
            const rookSq = c - 4;
            const rPiece = this.board[r][rookSq];
            if (rPiece && rPiece.type === 'r' && rPiece.color === color && !rPiece.hasMoved) {
              if (!this.board[r][c-1] && !this.board[r][c-2] && !this.board[r][c-3]) {
                moves.push({ from: rcToSq(r, c)!, to: rcToSq(r, c - 2)!, isCastle: rcToSq(r, rookSq)! });
              }
            }
          }
          // Kingside local rook (c + 3)
          if (c + 3 < COLS) {
            const rookSq = c + 3;
            const rPiece = this.board[r][rookSq];
            if (rPiece && rPiece.type === 'r' && rPiece.color === color && !rPiece.hasMoved) {
              if (!this.board[r][c+1] && !this.board[r][c+2]) {
                moves.push({ from: rcToSq(r, c)!, to: rcToSq(r, c + 2)!, isCastle: rcToSq(r, rookSq)! });
              }
            }
          }
        }
        break;
    }
    return moves;
  }

  isSquareAttacked(r: number, c: number, byColor: string) {
    const depth = this.history.length;
    if (!this._isSquareAttackedCache[depth]) {
      this._isSquareAttackedCache[depth] = {};
    }
    const key = (r << 6) | (c << 1) | (byColor === 'w' ? 1 : 0);
    if (this._isSquareAttackedCache[depth][key] !== undefined) {
      return this._isSquareAttackedCache[depth][key];
    }

    let result = false;
    const compute = () => {
      // 1. Pawns
      if (byColor === 'w') {
        const pr = r + 1;
        if (pr < ROWS) {
          for (const pc of [c - 1, c + 1]) {
            if (pc >= 0 && pc < COLS) {
              const piece = this.board[pr][pc];
              if (piece && piece.type === 'p' && piece.color === 'w') return true;
            }
          }
        }
      } else {
        const pr = r - 1;
        if (pr >= 0) {
          for (const pc of [c - 1, c + 1]) {
            if (pc >= 0 && pc < COLS) {
              const piece = this.board[pr][pc];
              if (piece && piece.type === 'p' && piece.color === 'b') return true;
            }
          }
        }
      }

      // 2. Knights
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const piece = this.board[nr][nc];
          if (piece && piece.type === 'n' && piece.color === byColor) return true;
        }
      }

      // 3. Kings
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const piece = this.board[nr][nc];
            if (piece && piece.type === 'k' && piece.color === byColor) return true;
          }
        }
      }

      // 4. Rooks / Queens (Orthogonals)
      const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of rookDirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const piece = this.board[nr][nc];
          if (piece) {
            if (piece.color === byColor && (piece.type === 'r' || piece.type === 'q')) {
              return true;
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }

      // 5. Bishops / Queens (Diagonals)
      const bishopDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of bishopDirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const piece = this.board[nr][nc];
          if (piece) {
            if (piece.color === byColor && (piece.type === 'b' || piece.type === 'q')) {
              return true;
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }

      return false;
    };

    result = compute();
    this._isSquareAttackedCache[depth][key] = result;
    return result;
  }

  inCheck(color: string) {
    const depth = this.history.length;
    if (!this._inCheckCache[depth]) {
      this._inCheckCache[depth] = {};
    }
    if (this._inCheckCache[depth][color] !== undefined) {
      return this._inCheckCache[depth][color];
    }
    const opp = color === 'w' ? 'b' : 'w';
    const kings = this.getKings(color);
    let result = false;
    if (this.ruleMode === 'all-death') {
      // Only in check if down to exactly 1 king and it's attacked
      result = kings.length === 1 && this.isSquareAttacked(kings[0].r, kings[0].c, opp);
    } else if (this.ruleMode === 'most-captures') {
      // No checks/mates in score mode, kings are just normal pieces
      result = false;
    } else {
      // 'first-death' (standard/default)
      result = kings.some(k => this.isSquareAttacked(k.r, k.c, opp));
    }
    this._inCheckCache[depth][color] = result;
    return result;
  }

  makeMove(move: Move) {
    const {r: fr, c: fc} = sqToRC(move.from);
    const {r: tr, c: tc} = sqToRC(move.to);
    const piece = this.board[fr][fc]!;
    const captured = this.board[tr][tc];

    // Deep copy kings state to restore on undo
    const prevKings = {
      w: this.kings.w.map(k => ({ r: k.r, c: k.c })),
      b: this.kings.b.map(k => ({ r: k.r, c: k.c }))
    };

    const prevScore = this.evaluationScore;

    const nextPiece = move.promotion ? { type: move.promotion, color: piece.color, hasMoved: true } : { ...piece, hasMoved: true };
    this.board[tr][tc] = nextPiece;
    this.board[fr][fc] = null;

    let castleRookUndo = undefined;
    if (move.isCastle) {
      const rookFrSq = move.isCastle;
      const {r: rr, c: rc} = sqToRC(rookFrSq);
      const rookPiece = this.board[rr][rc]!;
      const dir = Math.sign(tc - fc);
      const rookTc = tc - dir; // Rook lands next to the king on the opposite side
      this.board[rr][rookTc] = { ...rookPiece, hasMoved: true };
      this.board[rr][rc] = null;
      castleRookUndo = {
        fr: {r: rr, c: rc},
        to: {r: rr, c: rookTc},
        piece: rookPiece
      };
    }

    // Update tracked king positions
    if (piece.type === 'k') {
      const list = this.kings[piece.color as 'w' | 'b'];
      const idx = list.findIndex(k => k.r === fr && k.c === fc);
      if (idx !== -1) {
        list[idx] = { r: tr, c: tc };
      }
    }
    if (captured && captured.type === 'k') {
      const list = this.kings[captured.color as 'w' | 'b'];
      const idx = list.findIndex(k => k.r === tr && k.c === tc);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }

    // Incremental evaluation score update
    let scoreDiff = 0;
    const pieceVal = (p: Piece, r: number, c: number) => {
      let val = PIECE_VALUES[p.type] || 0;
      if (p.type === 'p') {
        val += (p.color === 'w' ? (ROWS - 2 - r) : (r - 1)) * 5;
      }
      val += (15 - Math.abs(c - 11.5) - Math.abs(r - (ROWS / 2 - 0.5))) * 2;
      return val;
    };

    // Subtract the piece's value at from square
    scoreDiff -= (piece.color === 'w' ? 1 : -1) * pieceVal(piece, fr, fc);

    // Subtract the captured piece's value at to square
    if (captured) {
      scoreDiff -= (captured.color === 'w' ? 1 : -1) * pieceVal(captured, tr, tc);
      if (captured.type === 'k') {
        scoreDiff -= (captured.color === 'w' ? 1 : -1) * 15000; // adjust for king lost bonus
      }
    }

    // Add the piece's value at to square (or promotion piece)
    scoreDiff += (nextPiece.color === 'w' ? 1 : -1) * pieceVal(nextPiece, tr, tc);

    this.evaluationScore += scoreDiff;

    const undo: UndoState = { move, piece, captured, prevKings, prevScore, castleRookUndo };
    this.history.push(undo);
    this.turn = this.turn === 'w' ? 'b' : 'w';

    // Clear caches at the depth we just entered
    const newDepth = this.history.length;
    this._legalMovesCache[newDepth] = {};
    this._inCheckCache[newDepth] = {};
    this._isGameOverCache[newDepth] = null;
    this._isSquareAttackedCache[newDepth] = {};

    return undo;
  }

  undoMove() {
    const undo = this.history.pop();
    if (!undo) return;
    const {r: fr, c: fc} = sqToRC(undo.move.from);
    const {r: tr, c: tc} = sqToRC(undo.move.to);
    this.board[fr][fc] = undo.piece;
    this.board[tr][tc] = undo.captured;
    if (undo.castleRookUndo) {
      const {fr: rFr, to: rTo, piece: rPiece} = undo.castleRookUndo;
      this.board[rFr.r][rFr.c] = rPiece;
      this.board[rTo.r][rTo.c] = null;
    }
    this.kings = undo.prevKings;
    this.turn = this.turn === 'w' ? 'b' : 'w';
    this.evaluationScore = undo.prevScore;
  }

  legalMoves(color?: string) {
    const activeColor = color || this.turn;
    const depth = this.history.length;
    if (!this._legalMovesCache[depth]) {
      this._legalMovesCache[depth] = {};
    }
    if (this._legalMovesCache[depth][activeColor]) {
      return this._legalMovesCache[depth][activeColor];
    }
    const allMoves: Move[] = [];
    const opp = activeColor === 'w' ? 'b' : 'w';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = this.board[r][c];
        if (!p || p.color !== activeColor) continue;
        const moves = this.pseudoMoves(r, c);

        if (this.ruleMode === 'most-captures') {
          allMoves.push(...moves);
          continue;
        }

        for (const m of moves) {
          if (m.isCastle) {
            if (this.isSquareAttacked(r, c, opp)) continue; // Can't castle out of check
            const dir = Math.sign(sqToRC(m.to).c - c);
            if (this.isSquareAttacked(r, c + dir, opp)) continue; // Can't castle through check
          }

          this.makeMove(m);
          const kings = this.getKings(activeColor);
          let safe = false;
          if (this.ruleMode === 'all-death') {
            if (kings.length > 1) {
              safe = true;
            } else if (kings.length === 1) {
              safe = !this.isSquareAttacked(kings[0].r, kings[0].c, opp);
            } else {
              safe = false;
            }
          } else {
            // standard 'first-death' mode
            safe = kings.length === 3 && !kings.some(k => this.isSquareAttacked(k.r, k.c, opp));
          }
          this.undoMove();
          if (safe) allMoves.push(m);
        }
      }
    }
    this._legalMovesCache[depth][activeColor] = allMoves;
    return allMoves;
  }

  legalMovesFrom(sq: string) {
    return this.legalMoves(this.turn).filter(m => m.from === sq);
  }

  moveToSAN(move: Move) {
    const piece = this.get(move.from);
    if (!piece) return move.from + move.to;
    let san = '';
    if (piece.type === 'k' && move.isCastle) {
      return move.to > move.from ? 'O-O' : 'O-O-O';
    }
    if (piece.type === 'p') {
      if (move.capture) san += move.from[0] + 'x';
      san += move.to;
      if (move.promotion) san += '=' + move.promotion.toUpperCase();
    } else {
      san += piece.type.toUpperCase();
      if (move.capture) san += 'x';
      san += move.to;
    }
    return san;
  }

  fen(): string {
    let fen = '';
    for (let r = 0; r < ROWS; r++) {
      let emptyCount = 0;
      for (let c = 0; c < COLS; c++) {
        const piece = this.board[r][c];
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (r < ROWS - 1) fen += '/';
    }
    fen += ` ${this.turn} - - 0 1`;
    return fen;
  }

  isGameOver() {
    const depth = this.history.length;
    if (this._isGameOverCache[depth] !== undefined && this._isGameOverCache[depth] !== null) {
      return this._isGameOverCache[depth];
    }
    let result: any;
    
    if (this.ruleMode === 'most-captures') {
      const wKingsCount = this.getKings('w').length;
      const bKingsCount = this.getKings('b').length;
      const wCaptures = 3 - bKingsCount;
      const bCaptures = 3 - wKingsCount;
      
      if (wKingsCount === 0 || bKingsCount === 0) {
        if (wCaptures > bCaptures) result = {over: true, result: 'white'};
        else if (bCaptures > wCaptures) result = {over: true, result: 'black'};
        else result = {over: true, result: 'draw'};
      } else {
        const moves = this.legalMoves();
        if (moves.length === 0) {
          if (wCaptures > bCaptures) result = {over: true, result: 'white'};
          else if (bCaptures > wCaptures) result = {over: true, result: 'black'};
          else result = {over: true, result: 'draw'};
        } else {
          result = {over: false, result: null};
        }
      }
    } else if (this.ruleMode === 'all-death') {
      const wKingsCount = this.getKings('w').length;
      const bKingsCount = this.getKings('b').length;
      
      if (wKingsCount === 0) {
        result = {over: true, result: 'black'};
      } else if (bKingsCount === 0) {
        result = {over: true, result: 'white'};
      } else {
        const moves = this.legalMoves();
        if (moves.length === 0) {
          if (this.inCheck(this.turn)) {
            result = {over: true, result: this.turn === 'w' ? 'black' : 'white'};
          } else {
            result = {over: true, result: 'draw'};
          }
        } else {
          result = {over: false, result: null};
        }
      }
    } else {
      // 'first-death' (default/standard)
      const wKingsCount = this.getKings('w').length;
      const bKingsCount = this.getKings('b').length;
      if (wKingsCount < 3) {
        result = {over: true, result: 'black'};
      } else if (bKingsCount < 3) {
        result = {over: true, result: 'white'};
      } else {
        const moves = this.legalMoves();
        if (moves.length === 0) {
          if (this.inCheck(this.turn)) {
            result = {over: true, result: this.turn === 'w' ? 'black' : 'white'};
          } else {
            result = {over: true, result: 'draw'};
          }
        } else {
          result = {over: false, result: null};
        }
      }
    }
    
    this._isGameOverCache[depth] = result;
    return result;
  }
}

// ===== AI EVALUATION =====

function evaluate(g: ChessGame) {
  return g.evaluationScore;
}

function minimax(g: ChessGame, depth: number, alpha: number, beta: number, maximizing: boolean, startTime: number, timeLimit: number): number {
  if (depth === 0 || (performance.now() - startTime > timeLimit)) return evaluate(g);

  const ov = g.isGameOver();
  if (ov.over) {
    if (ov.result === 'white') return 1000000 + depth;
    if (ov.result === 'black') return -1000000 - depth;
    return 0;
  }

  const moves = g.legalMoves();
  moves.sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      g.makeMove(m);
      const val = minimax(g, depth - 1, alpha, beta, false, startTime, timeLimit);
      g.undoMove();
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      g.makeMove(m);
      const val = minimax(g, depth - 1, alpha, beta, true, startTime, timeLimit);
      g.undoMove();
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export default function App() {
  const gameRef = useRef<ChessGame>(null as any);
  if (!gameRef.current) {
    gameRef.current = new ChessGame();
  }
  const timerRef = useRef<number | null>(null);
  
  // React mirror of internal game state
  const [board, setBoard] = useState<(Piece | null)[][]>(() => gameRef.current.board.map(row => [...row]));
  const [turn, setTurn] = useState<string>("w");
  const [moveLog, setMoveLog] = useState<{ color: string; san: string }[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  
  // Game settings states
  const [playerColor, setPlayerColor] = useState<string>("w");
  const [flipped, setFlipped] = useState<boolean>(false);
  const [engineLevelWhite, setEngineLevelWhite] = useState<number>(2);
  const [engineLevelBlack, setEngineLevelBlack] = useState<number>(2);
  const [gameMode, setGameMode] = useState<'pve' | 'eve'>('pve');
  const [ruleMode, setRuleMode] = useState<'first-death' | 'all-death' | 'most-captures'>('first-death');
  const [aiSpeed, setAiSpeed] = useState<number>(80);
  const [thinking, setThinking] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Tú");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("Tú");
  
  // UI toggles
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMoveIndicators, setShowMoveIndicators] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing'>('idle');
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tripleChessSavedGame');
      if (saved) {
        setHasSavedGame(true);
      }
    } catch (e) {
      console.warn("Could not read localStorage", e);
    }
  }, []);

  // Board rows state (declared early because save effect depends on it)
  const [boardRows, setBoardRows] = useState<number>(8);

  // Save to local storage automatically when playing
  useEffect(() => {
    if (gameStatus === 'playing') {
      try {
        localStorage.setItem('tripleChessSavedGame', JSON.stringify({
          gameData: gameRef.current.toJSON(),
          playerColor, engineLevelWhite, engineLevelBlack, gameMode, ruleMode, aiSpeed, boardRows
        }));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }
  }, [board, turn, playerColor, engineLevelWhite, engineLevelBlack, gameMode, ruleMode, aiSpeed, gameStatus, boardRows]);

  const loadSavedGame = () => {
    try {
      const saved = localStorage.getItem('tripleChessSavedGame');
      if (saved) {
        const parsed = JSON.parse(saved);
        gameRef.current.fromJSON(parsed.gameData);
        setPlayerColor(parsed.playerColor);
        setEngineLevelWhite(parsed.engineLevelWhite);
        setEngineLevelBlack(parsed.engineLevelBlack);
        setGameMode(parsed.gameMode);
        setRuleMode(parsed.ruleMode);
        setAiSpeed(parsed.aiSpeed);
        if (parsed.boardRows) setBoardRows(parsed.boardRows);
        ROWS = parsed.boardRows || 8;
        
        setFlipped(parsed.playerColor === 'b');
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        setThinking(false);
        syncGameState();
        setGameStatus('playing');
        initAudio();
        SFX.start();
      }
    } catch (e) {
      console.warn("Could not parse saved game", e);
      handleNewGame();
    }
  };

  const handleStartNewGame = () => {
    handleNewGame();
    setGameStatus('playing');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error al intentar modo pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleRuleModeChange = (mode: 'first-death' | 'all-death' | 'most-captures') => {
    initAudio();
    setRuleMode(mode);
    gameRef.current.ruleMode = mode;
    gameRef.current.clearCache();
    gameRef.current.init(mode);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setThinking(false);
    syncGameState();
    SFX.start();
  };

  const handleGameModeChange = (mode: 'pve' | 'eve') => {
    initAudio();
    setGameMode(mode);
    gameRef.current.ruleMode = ruleMode;
    gameRef.current.init(ruleMode);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setThinking(false);
    syncGameState();
    SFX.start();
  };
  
  // Promotion Overlay helper
  const [promoOverlayMoves, setPromoOverlayMoves] = useState<Move[] | null>(null);

  // Board scaling states
  const [fitToScreen, setFitToScreen] = useState<boolean>(true);
  const [boardWidthPx, setBoardWidthPx] = useState<number>(1100);

  const handleRowsChange = (newRows: number) => {
    initAudio();
    ROWS = newRows;
    setBoardRows(newRows);
    gameRef.current.init(ruleMode);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setThinking(false);
    syncGameState();
    SFX.start();
  };

  // Sync state on mount/init
  const syncGameState = () => {
    setBoard(gameRef.current.board.map(row => [...row]));
    setTurn(gameRef.current.turn);
    setMoveLog([...gameRef.current.moveLog]);
    setLastMove(
      gameRef.current.history.length > 0 
         ? { from: gameRef.current.history[gameRef.current.history.length - 1].move.from, to: gameRef.current.history[gameRef.current.history.length - 1].move.to } 
         : null
    );
  };

  // Initial render
  useEffect(() => {
    syncGameState();
  }, []);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Check and play AI moves
  useEffect(() => {
    if (thinking) return;
    const overObj = gameRef.current.isGameOver();
    if (overObj.over) return;

    const isAiTurn = gameMode === 'eve' || (gameMode === 'pve' && turn !== playerColor);
    if (isAiTurn) {
      setThinking(true);
      // Velocidad ajustada: 100% = 0ms (inmediato), 1% = ~1500ms
      const delay = aiSpeed === 100 ? 10 : (100 - aiSpeed) * 15 + 50;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        aiMove();
      }, delay);
    }
  }, [turn, playerColor, thinking, gameMode, aiSpeed]);

  // Execute actual move
  const executeMove = (move: Move) => {
    const game = gameRef.current;
    const san = game.moveToSAN(move);
    const wasCapture = !!move.capture;
    const currentTurn = game.turn;
    const nextTurn = currentTurn === 'w' ? 'b' : 'w';
    const willBeCheck = game.inCheck(nextTurn);

    game.makeMove(move);
    game.moveLog.push({ color: currentTurn, san });
    
    initAudio();
    if (wasCapture) SFX.capture();
    else SFX.move();

    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPromoOverlayMoves(null);
    syncGameState();

    const ov = game.isGameOver();
    if (ov.over) {
      SFX.checkmate();
      return;
    }
    if (willBeCheck) SFX.check();
  };

  // AI Move calculation
  const aiMove = async () => {
    const game = gameRef.current;
    const ov = game.isGameOver();
    if (ov.over) {
      setThinking(false);
      return;
    }

    const moves = game.legalMoves();
    if (moves.length === 0) {
      setThinking(false);
      syncGameState();
      return;
    }

    const currentEngineLevel = game.turn === 'w' ? engineLevelWhite : engineLevelBlack;

    let chosen: Move;
    if (currentEngineLevel === 1) {
      const captures = moves.filter(m => m.capture);
      if (captures.length > 0 && Math.random() > 0.4) {
        chosen = captures[Math.floor(Math.random() * captures.length)];
      } else {
        chosen = moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      const maximizing = game.turn === 'w';
      let best = moves[0];
      let bestVal = maximizing ? -Infinity : Infinity;

      // Sort moves so captures are evaluated first to find better alpha/beta values early
      const sortedMoves = [...moves].sort((a, b) => {
        const scoreA = (a.capture ? 10 : 0) + (a.promotion ? 5 : 0);
        const scoreB = (b.capture ? 10 : 0) + (b.promotion ? 5 : 0);
        return scoreB - scoreA;
      });

      let alpha = -Infinity;
      let beta = Infinity;
      const startTime = performance.now();
      const timeLimit = 500; // 500ms max thinking time so it doesn't freeze browser

      for (const m of sortedMoves) {
        if (performance.now() - startTime > timeLimit) break;
        
        game.makeMove(m);
        const val = minimax(game, currentEngineLevel - 1, alpha, beta, !maximizing, startTime, timeLimit);
        game.undoMove();

        if (maximizing) {
          if (val > bestVal) {
            bestVal = val;
            best = m;
          }
          alpha = Math.max(alpha, val);
        } else {
          if (val < bestVal) {
            bestVal = val;
            best = m;
          }
          beta = Math.min(beta, val);
        }
      }
      chosen = best;
    }

    const san = game.moveToSAN(chosen);
    const aiColor = game.turn;
    const wasCapture = !!chosen.capture;
    const nextTurn = aiColor === 'w' ? 'b' : 'w';
    const willBeCheck = game.inCheck(nextTurn);

    game.makeMove(chosen);
    game.moveLog.push({ color: aiColor, san });

    initAudio();
    if (wasCapture) SFX.capture();
    else SFX.move();

    setThinking(false);
    syncGameState();

    const ov2 = game.isGameOver();
    if (ov2.over) {
      SFX.checkmate();
      return;
    }
    if (willBeCheck) SFX.check();
  };

  // Pointer dragging implementation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, sq: string) => {
    initAudio();
    if (thinking) return;
    const ov = gameRef.current.isGameOver();
    if (ov.over) return;
    if (gameMode === 'eve') return;
    if (turn !== playerColor) return;

    const piece = gameRef.current.get(sq);

    // Click legal target square
    if (selectedSquare && legalMovesForSelected.some(m => m.to === sq)) {
      const moves = legalMovesForSelected.filter(m => m.to === sq);
      if (moves[0].promotion) {
        setPromoOverlayMoves(moves);
      } else {
        executeMove(moves[0]);
      }
      return;
    }

    // Drag start
    if (piece && piece.color === playerColor) {
      e.preventDefault();
      setSelectedSquare(sq);
      const moves = gameRef.current.legalMovesFrom(sq);
      setLegalMovesForSelected(moves);

      if (moves.length === 0) return;

      const dragInfo = { from: sq, piece, moves };
      let dragMoved = false;

      const ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.innerHTML = P_SVG[piece.color + piece.type.toUpperCase()];
      document.body.appendChild(ghost);

      const updateGhostPos = (clientX: number, clientY: number) => {
        ghost.style.left = clientX + 'px';
        ghost.style.top = clientY + 'px';
      };
      updateGhostPos(e.clientX, e.clientY);

      const onMove = (ev: PointerEvent) => {
        dragMoved = true;
        updateGhostPos(ev.clientX, ev.clientY);
        document.querySelectorAll('.sq.drag-target').forEach(el => el.classList.remove('drag-target'));
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (el) {
          const s = el.closest('.sq') as HTMLElement | null;
          if (s && s.dataset.sq && dragInfo.moves.some(m => m.to === s.dataset.sq)) {
            s.classList.add('drag-target');
          }
        }
      };

      const onUp = (ev: PointerEvent) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        ghost.remove();
        document.querySelectorAll('.sq.drag-target').forEach(el => el.classList.remove('drag-target'));

        if (dragMoved) {
          const el = document.elementFromPoint(ev.clientX, ev.clientY);
          if (el) {
            const s = el.closest('.sq') as HTMLElement | null;
            if (s && s.dataset.sq) {
              const toSq = s.dataset.sq;
              const matchingMoves = dragInfo.moves.filter(m => m.to === toSq);
              if (matchingMoves.length > 0) {
                if (matchingMoves[0].promotion) {
                  setPromoOverlayMoves(matchingMoves);
                } else {
                  executeMove(matchingMoves[0]);
                }
              }
            }
          }
        }
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      return;
    }

    setSelectedSquare(null);
    setLegalMovesForSelected([]);
  };

  // Switch play side (White / Black)
  const handleSetPlayerColor = (color: string) => {
    initAudio();
    if (playerColor === color && gameRef.current.history.length === 0) return;
    setPlayerColor(color);
    setFlipped(color === 'b');
    
    // Reset game completely
    gameRef.current.init(ruleMode);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setThinking(false);
    syncGameState();
    SFX.start();
  };

  // New Game Trigger
  const handleNewGame = () => {
    initAudio();
    gameRef.current.init(ruleMode);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setThinking(false);
    syncGameState();
    SFX.start();
  };

  // Undo implementation
  const handleUndo = () => {
    if (thinking) return;
    const game = gameRef.current;
    const movesToUndo = game.history.length >= 2 ? 2 : game.history.length;
    for (let i = 0; i < movesToUndo; i++) {
      if (game.history.length === 0) break;
      game.undoMove();
      game.moveLog.pop();
    }
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    syncGameState();
  };

  // Promotion choice click
  const handlePromoChoice = (pieceType: string) => {
    if (!promoOverlayMoves) return;
    const move = promoOverlayMoves.find(m => m.promotion === pieceType);
    if (move) {
      executeMove(move);
    }
  };

  // Name edit confirm
  const handleNameBlur = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setUserName(trimmed);
    } else {
      setUserName("Tú");
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
  };

  // Render status bar info
  const renderStatusText = () => {
    const ov = gameRef.current.isGameOver();
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';
    if (ov.over) {
      if (ov.result === 'white') return <><Trophy size={16} style={{marginRight: '6px'}}/> ¡Victoria del Blanco!</>;
      if (ov.result === 'black') return <><Trophy size={16} style={{marginRight: '6px'}}/> ¡Victoria del Negro!</>;
      return <><Handshake size={16} style={{marginRight: '6px'}}/> Tablas</>;
    }
    if (thinking) {
      if (gameMode === 'eve') {
        return turn === 'w' ? <><Bot size={16} style={{marginRight: '6px'}}/> Blanco pensando...</> : <><Bot size={16} style={{marginRight: '6px'}}/> Negro pensando...</>;
      }
      return <><Bot size={16} style={{marginRight: '6px'}}/> Motor pensando...</>;
    }
    if (ruleMode !== 'most-captures' && gameRef.current.inCheck(turn)) {
      return <><AlertTriangle size={16} style={{marginRight: '6px'}}/> {(turn === 'w' ? 'Blanco' : 'Negro')} en jaque</>;
    }
    if (gameMode === 'eve') {
      return turn === 'w' ? <><Bot size={16} style={{marginRight: '6px'}}/> Turno del Motor Blanco</> : <><Bot size={16} style={{marginRight: '6px'}}/> Turno del Motor Negro</>;
    }
    return turn === playerColor ? <><User size={16} style={{marginRight: '6px'}}/> Tu turno ({playerColorName})</> : <><Bot size={16} style={{marginRight: '6px'}}/> Turno de la IA</>;
  };

  const renderStatusClass = () => {
    const ov = gameRef.current.isGameOver();
    if (ov.over) return "status over";
    if (thinking) return "status thinking";
    if (ruleMode !== 'most-captures' && gameRef.current.inCheck(turn)) return "status check";
    return "status";
  };

  // Build grid components dynamically to handle board coordinates, lights/darks perfectly
  const gridCells: ReactNode[] = [];
  const rStart = flipped ? ROWS - 1 : 0;
  const rEnd = flipped ? -1 : ROWS;
  const rStep = flipped ? -1 : 1;

  for (let r = rStart; r !== rEnd; r += rStep) {
    for (let c = 0; c < COLS; c++) {
      const sq = rcToSq(r, c)!;
      const isLight = (r + c) % 2 === 0;
      const piece = board[r]?.[c] || null;
      const isSelected = selectedSquare === sq;
      const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
      const isLegalTarget = legalMovesForSelected.some(m => m.to === sq);
      const isCheckSq = ruleMode !== 'most-captures' && piece && piece.type === 'k' && piece.color === turn && gameRef.current.isSquareAttacked(r, c, turn === 'w' ? 'b' : 'w');

      gridCells.push(
        <div
          key={sq}
          className={`sq ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''} ${isCheckSq ? 'check-sq' : ''}`}
          data-sq={sq}
          onPointerDown={(e) => handlePointerDown(e, sq)}
        >
          {piece && (
            <div 
              className="pc" 
              dangerouslySetInnerHTML={{ __html: P_SVG[piece.color + piece.type.toUpperCase()] }} 
            />
          )}

          {isLegalTarget && showMoveIndicators && (
            piece ? <div className="ring" /> : <div className="dot" />
          )}

          {c === 0 && (
            <div className="coord rank">{r + 1}</div>
          )}
          {r === 0 && (
            <div className="coord file">{FILES[c]}</div>
          )}
        </div>
      );
    }
  }

  const whiteKings = gameRef.current.getKings('w').length;
  const blackKings = gameRef.current.getKings('b').length;

  const isGameOverObj = gameRef.current.isGameOver();
  
  // Top bar details (opponent/Black in default)
  const topActive = gameMode === 'eve' 
    ? (turn === 'b' && !isGameOverObj.over)
    : (turn !== playerColor && !isGameOverObj.over);
  const topIcon = gameMode === 'eve' ? '♚' : (playerColor === 'w' ? '♚' : '♔');
  const topName = gameMode === 'eve' 
    ? `Motor Negro (Nv. ${engineLevelBlack})` 
    : `Motor IA (Nv. ${playerColor === 'w' ? engineLevelBlack : engineLevelWhite})`;
  const topKingsCount = gameMode === 'eve' ? blackKings : (playerColor === 'w' ? blackKings : whiteKings);
  const topKingChar = gameMode === 'eve' ? '♚' : (playerColor === 'w' ? '♚' : '♔');
  const topKingsString = topKingChar.repeat(Math.max(0, topKingsCount));

  // Bottom bar details (player/White in default)
  const botActive = gameMode === 'eve' 
    ? (turn === 'w' && !isGameOverObj.over)
    : (turn === playerColor && !isGameOverObj.over);
  const botIcon = gameMode === 'eve' ? '♔' : (playerColor === 'w' ? '♔' : '♚');
  const botKingsCount = gameMode === 'eve' ? whiteKings : (playerColor === 'w' ? whiteKings : blackKings);
  const botKingChar = gameMode === 'eve' ? '♔' : (playerColor === 'w' ? '♔' : '♚');
  const botKingsString = botKingChar.repeat(Math.max(0, botKingsCount));

  return (
    <div className={`app ${!showSidebar ? 'no-sidebar' : ''}`}>
      {/* Start Screen Overlay */}
      {gameStatus === 'idle' && (
        <div className="start-screen">
          <div className="start-content">
            <img src="/logo.webp" alt="Triple Chess 24x8" style={{ width: '120px', height: 'auto', marginBottom: '16px' }} />
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}><Swords size={40} color="#d4af37" /> Triple Chess 24x8</h1>
            <p>Una variante extrema para mentes audaces.</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              {hasSavedGame && (
                <button className="btn primary" onClick={loadSavedGame}>
                  <Play size={18} /> Continuar Partida
                </button>
              )}
              <button className="btn secondary" onClick={handleStartNewGame}>
                <RefreshCw size={18} /> Nueva Partida
              </button>
            </div>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <div style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} color="#a0d468" /> Creado por Elal Chico
              </div>
              <a
                href="https://github.com/ElalChico"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '10px', color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a0d468')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
              >
                <Github size={11} /> github.com/ElalChico
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="board-area">
        {/* Top UI Actions */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', justifyContent: 'flex-end' }}>
          <button 
            style={{ flex: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: '#bababa', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <><EyeOff size={14}/> Ocultar Panel</> : <><Eye size={14}/> Mostrar Panel</>}
          </button>
          <button 
            style={{ flex: 'none', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: '#bababa', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <><Minimize size={14}/> Salir Pantalla Completa</> : <><Maximize size={14}/> Pantalla Completa</>}
          </button>
        </div>

        {/* Opponent top bar */}
        <div className={`player-bar ${topActive ? 'active' : ''}`} id="topBar">
          <div className="icon">
            {topIcon}
          </div>
          <div className="name" style={{ cursor: 'default' }}>
            {topName}
          </div>
          <div className="kings">
            {topKingsString}
          </div>
        </div>

        {/* Board wrap */}
        <div className="board-wrap">
          <div 
            className="board" 
            id="board"
            style={{ 
              width: fitToScreen ? "100%" : `${boardWidthPx}px`,
              minWidth: "auto",
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              aspectRatio: `${COLS} / ${ROWS}`
            }}
          >
            {gridCells}
          </div>
        </div>

        {/* Player bottom bar */}
        <div className={`player-bar ${botActive ? 'active' : ''}`} id="botBar">
          <div className="icon">
            {botIcon}
          </div>
          {isEditingName ? (
            <input
              type="text"
              className="name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              maxLength={15}
              autoFocus
            />
          ) : (
            <div 
              className="name" 
              onClick={() => {
                if (gameMode === 'eve') return; // Cannot edit computer name in EvE mode
                setNameInput(userName);
                setIsEditingName(true);
              }}
              title={gameMode === 'eve' ? "" : "Click para cambiar nombre"}
              style={{ cursor: gameMode === 'eve' ? 'default' : 'pointer' }}
            >
              {gameMode === 'eve' ? `Motor Blanco (Nv. ${engineLevelWhite})` : userName}
            </div>
          )}
          <div className="kings">
            {botKingsString}
          </div>
        </div>
      </div>

      {/* Sidebar controls panel */}
      <div className={`sidebar ${!showSidebar ? 'hidden' : ''}`}>
        {/* Status */}
        <div className="panel">
          <h3>Estado</h3>
          <div className={renderStatusClass()}>
            {renderStatusText()}
          </div>
        </div>

        {/* Play Side Selector - Only in PvE */}
        {gameMode === 'pve' && (
          <div className="panel">
            <h3>Tu color</h3>
            <div className="color-btns">
              <button 
                className={playerColor === 'w' ? 'active-btn' : ''} 
                onClick={() => handleSetPlayerColor('w')}
              >
                ♔ Blancas
              </button>
              <button 
                className={playerColor === 'b' ? 'active-btn' : ''} 
                onClick={() => handleSetPlayerColor('b')}
              >
                ♚ Negras
              </button>
            </div>
          </div>
        )}

        {/* Game Mode Selector */}
        <div className="panel">
          <h3>Modo de Juego</h3>
          <div className="color-btns">
            <button 
              className={gameMode === 'pve' ? 'active-btn' : ''} 
              onClick={() => handleGameModeChange('pve')}
              title="Juega contra el motor de IA"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <User size={14}/> Jugador vs IA
            </button>
            <button 
              className={gameMode === 'eve' ? 'active-btn' : ''} 
              onClick={() => handleGameModeChange('eve')}
              title="Pon a competir a dos motores de IA"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Bot size={14}/> IA vs IA
            </button>
          </div>
        </div>

        {/* Victory Rules Selector */}
        <div className="panel">
          <h3>Reglas de Victoria</h3>
          <div className="vertical-btns" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              className={ruleMode === 'first-death' ? 'active-btn' : ''} 
              onClick={() => handleRuleModeChange('first-death')}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}
            >
              <Skull size={20} color={ruleMode === 'first-death' ? '#d4af37' : '#888'} />
              <div>
                <div style={{ fontWeight: 600 }}>1er Rey Cae (Muerte Súbita)</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>El primer rey capturado pierde.</div>
              </div>
            </button>
            <button 
              className={ruleMode === 'all-death' ? 'active-btn' : ''} 
              onClick={() => handleRuleModeChange('all-death')}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}
            >
              <Crown size={20} color={ruleMode === 'all-death' ? '#d4af37' : '#888'} />
              <div>
                <div style={{ fontWeight: 600 }}>Todos los Reyes</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Debes capturar todos los reyes enemigos.</div>
              </div>
            </button>
            <button 
              className={ruleMode === 'most-captures' ? 'active-btn' : ''} 
              onClick={() => handleRuleModeChange('most-captures')}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}
            >
              <Target size={20} color={ruleMode === 'most-captures' ? '#d4af37' : '#888'} />
              <div>
                <div style={{ fontWeight: 600 }}>Caza de Reyes (Puntos)</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Sin jaques ni mates. Gana el de más reyes.</div>
              </div>
            </button>
          </div>
        </div>

        {/* Scoreboard panel for most-captures mode */}
        {ruleMode === 'most-captures' && (
          <div className="panel" style={{ background: 'linear-gradient(135deg, #2b2824 0%, #1e1d1b 100%)', border: '1px solid #d4af37' }}>
            <h3 style={{ color: '#d4af37', textShadow: '0 0 4px rgba(212,175,55,0.2)' }}>🏆 Marcador de Reyes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <div style={{ background: '#1c1a18', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#999' }}>Blanco</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>{3 - blackKings} <span style={{ fontSize: '12px', color: '#666' }}>/ 3</span></div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', fontSize: '12px' }}>
                  {Array.from({length: 3}).map((_, i) => (
                    <span key={i} style={{ opacity: i < (3 - blackKings) ? 1 : 0.2 }}>👑</span>
                  ))}
                </div>
              </div>
              <div style={{ background: '#1c1a18', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#999' }}>{gameMode === 'eve' ? 'Negro' : userName}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>{3 - whiteKings} <span style={{ fontSize: '12px', color: '#666' }}>/ 3</span></div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', fontSize: '12px' }}>
                  {Array.from({length: 3}).map((_, i) => (
                    <span key={i} style={{ opacity: i < (3 - whiteKings) ? 1 : 0.2 }}>👑</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tamaño del Tablero */}
        <div className="panel">
          <h3>Visualización del Tablero</h3>
          <div className="color-btns" style={{ marginBottom: '12px' }}>
            <button 
              className={fitToScreen ? 'active-btn' : ''} 
              onClick={() => setFitToScreen(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Monitor size={14}/> Ajustar
            </button>
            <button 
              className={!fitToScreen ? 'active-btn' : ''} 
              onClick={() => setFitToScreen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <ArrowRightLeft size={14}/> Desplazar
            </button>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '8px' }}>
            <input 
              type="checkbox" 
              checked={showMoveIndicators} 
              onChange={(e) => setShowMoveIndicators(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            Mostrar indicadores de movimiento legal
          </label>
          {!fitToScreen && (
            <div className="level-row">
              <label>Ancho:</label>
              <input 
                type="range" 
                min="800" 
                max="1800" 
                step="50"
                value={boardWidthPx} 
                onChange={(e) => setBoardWidthPx(parseInt(e.target.value))}
              />
              <div className="level-val" style={{ minWidth: '55px' }}>{boardWidthPx}px</div>
            </div>
          )}
        </div>

        {/* Filas del Tablero */}
        <div className="panel">
          <h3>Filas del Tablero</h3>
          <div className="level-row">
            <label>Filas:</label>
            <input 
              type="range" 
              min="8" 
              max="16" 
              step="2"
              value={boardRows} 
              onChange={(e) => handleRowsChange(parseInt(e.target.value))}
            />
            <div className="level-val" style={{ minWidth: '40px' }}>{boardRows}</div>
          </div>
        </div>

        {/* Controles */}
        <div className="panel">
          <h3>Controles de Partida</h3>
          <div className="controls">
            <button className="btn primary" onClick={handleStartNewGame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
              <RefreshCw size={14}/> Nueva partida
            </button>
            <button className="btn secondary" onClick={handleUndo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '6px' }}>
              <RotateCcw size={14}/> Deshacer
            </button>
          </div>

          {gameMode === 'pve' ? (
            <div className="level-row">
              <label>Dificultad:</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={playerColor === 'w' ? engineLevelBlack : engineLevelWhite} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (playerColor === 'w') {
                    setEngineLevelBlack(val);
                  } else {
                    setEngineLevelWhite(val);
                  }
                }}
              />
              <div className="level-val">{playerColor === 'w' ? engineLevelBlack : engineLevelWhite}</div>
            </div>
          ) : (
            <>
              <div className="level-row">
                <label>Blanco:</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={engineLevelWhite} 
                  onChange={(e) => setEngineLevelWhite(parseInt(e.target.value))}
                />
                <div className="level-val">{engineLevelWhite}</div>
              </div>
              <div className="level-row">
                <label>Negro:</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={engineLevelBlack} 
                  onChange={(e) => setEngineLevelBlack(parseInt(e.target.value))}
                />
                <div className="level-val">{engineLevelBlack}</div>
              </div>
            </>
          )}

          <div className="level-row">
            <label>Velocidad IA:</label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={aiSpeed} 
              onChange={(e) => setAiSpeed(parseInt(e.target.value))}
            />
              <div className="level-val" style={{ minWidth: '85px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
                {aiSpeed === 100 ? <><Zap size={12} style={{verticalAlign:'middle'}}/> Instante</> : aiSpeed === 1 ? <><Snail size={12} style={{verticalAlign:'middle'}}/> Lento</> : `${aiSpeed}%`}
              </div>
          </div>
        </div>

        {/* Move History log */}
        <div className="panel">
          <h3>Movimientos</h3>
          <div className="moves" id="moveList">
            {moveLog.reduce((acc: ReactNode[], log, idx) => {
              if (idx % 2 === 0) {
                const moveNum = Math.floor(idx / 2) + 1;
                const nextLog = moveLog[idx + 1];
                const isCurrentFirst = idx === moveLog.length - 1;
                const isCurrentSecond = idx + 1 === moveLog.length - 1;

                acc.push(
                  <div className="mr" key={idx}>
                    <span className="mn">{moveNum}.</span>
                    <span className={`mw ${isCurrentFirst ? 'mc' : ''}`}>{log.san}</span>
                    <span className={`mb ${isCurrentSecond ? 'mc' : ''}`}>{nextLog ? nextLog.san : ''}</span>
                  </div>
                );
              }
              return acc;
            }, [])}
          </div>
        </div>

        {/* Author Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', paddingBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#999', fontSize: '12px', fontWeight: 600 }}>
            <Sparkles size={14} color="#a0d468" />
            Creado por Elal Chico
          </div>
          <a
            href="https://github.com/ElalChico"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '11px', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a0d468')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
          >
            <Github size={13} />
            github.com/ElalChico
          </a>
        </div>
      </div>

      {/* Promotion Overlay modal dialog */}
      <div className={`promo-overlay ${promoOverlayMoves ? 'show' : ''}`}>
        <div className="promo-choices">
          {['q', 'r', 'b', 'n'].map(pieceType => (
            <div 
              className="promo-choice" 
              key={pieceType}
              onClick={() => handlePromoChoice(pieceType)}
              dangerouslySetInnerHTML={{ __html: P_SVG[playerColor + pieceType.toUpperCase()] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
