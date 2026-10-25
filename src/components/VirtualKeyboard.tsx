'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES } from '@/lib/sound-profiles';

interface KeyDef {
  code: string;
  label: string;
  sub?: string;
  width?: string;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 1: Numbers
  [
    { code: 'Backquote', label: '`', sub: '~' },
    { code: 'Digit1', label: '1', sub: '!' },
    { code: 'Digit2', label: '2', sub: '@' },
    { code: 'Digit3', label: '3', sub: '#' },
    { code: 'Digit4', label: '4', sub: '$' },
    { code: 'Digit5', label: '5', sub: '%' },
    { code: 'Digit6', label: '6', sub: '^' },
    { code: 'Digit7', label: '7', sub: '&' },
    { code: 'Digit8', label: '8', sub: '*' },
    { code: 'Digit9', label: '9', sub: '(' },
    { code: 'Digit0', label: '0', sub: ')' },
    { code: 'Minus', label: '-', sub: '_' },
    { code: 'Equal', label: '=', sub: '+' },
    { code: 'Backspace', label: 'delete', width: 'w-20 sm:w-24' }
  ],
  // Row 2: QWERTY
  [
    { code: 'Tab', label: 'tab', width: 'w-14 sm:w-16' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[', sub: '{' },
    { code: 'BracketRight', label: ']', sub: '}' },
    { code: 'Backslash', label: '\\', sub: '|', width: 'w-14 sm:w-16' }
  ],
  // Row 3: Home Row
  [
    { code: 'CapsLock', label: 'caps', width: 'w-16 sm:w-20' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';', sub: ':' },
    { code: 'Quote', label: "'", sub: '"' },
    { code: 'Enter', label: 'return', width: 'w-20 sm:w-24' }
  ],
  // Row 4: Shift Row
  [
    { code: 'ShiftLeft', label: 'shift', width: 'w-20 sm:w-28' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',', sub: '<' },
    { code: 'Period', label: '.', sub: '>' },
    { code: 'Slash', label: '/', sub: '?' },
    { code: 'ShiftRight', label: 'shift', width: 'w-20 sm:w-28' }
  ],
  // Row 5: Spacebar & Modifiers
  [
    { code: 'ControlLeft', label: 'ctrl', width: 'w-12 sm:w-14' },
    { code: 'AltLeft', label: 'opt', width: 'w-12 sm:w-14' },
    { code: 'MetaLeft', label: 'cmd', width: 'w-14 sm:w-16' },
    { code: 'Space', label: '', width: 'flex-1 max-w-sm sm:max-w-md' },
    { code: 'MetaRight', label: 'cmd', width: 'w-14 sm:w-16' },
    { code: 'AltRight', label: 'opt', width: 'w-12 sm:w-14' },
    { code: 'ArrowLeft', label: '←', width: 'w-10 sm:w-12' },
    { code: 'ArrowUp', label: '↑', width: 'w-10 sm:w-12' },
    { code: 'ArrowDown', label: '↓', width: 'w-10 sm:w-12' },
    { code: 'ArrowRight', label: '→', width: 'w-10 sm:w-12' }
  ]
];

interface VirtualKeyboardProps {
  interactiveGlobal?: boolean;
}

function VirtualKeyboardComponent({ interactiveGlobal = true }: VirtualKeyboardProps) {
  const { activePack, playKey, releaseKey } = useSound();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const profile = SWITCH_PROFILES[activePack];

  const handleKeyDown = useCallback(
    (code: string) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });
      playKey(code);

      // Auto-release safeguard for mobile touch devices if pointerup is dropped
      setTimeout(() => {
        setActiveKeys((prev) => {
          if (!prev.has(code)) return prev;
          const next = new Set(prev);
          next.delete(code);
          return next;
        });
        releaseKey(code);
      }, 300);
    },
    [playKey, releaseKey]
  );

  const handleKeyUp = useCallback(
    (code: string) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
      releaseKey(code);
    },
    [releaseKey]
  );

  useEffect(() => {
    if (!interactiveGlobal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) {
        handleKeyDown(e.code);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      handleKeyUp(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [interactiveGlobal, handleKeyDown, handleKeyUp]);

  return (
    <div className="w-full max-w-full flex flex-col items-center select-none overflow-hidden">
      {/* Keyboard CNC Chassis */}
      <div className="w-full max-w-4xl p-2.5 xs:p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#18191f] via-[#141519] to-[#0f1013] border-2 border-neutral-700/60 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] relative overflow-hidden">
        
        {/* Recessed Plate / Switch Deck */}
        <div className="w-full max-w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
          <div className="min-w-[590px] sm:min-w-0 relative p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0b0c0f] border border-neutral-800/90 shadow-inner space-y-1.5 sm:space-y-2">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((key) => {
                  const isDown = activeKeys.has(key.code);
                  const isSpace = key.code === 'Space';

                  return (
                    <button
                      key={key.code}
                      type="button"
                      aria-label={key.label || key.code}
                      onPointerDown={() => handleKeyDown(key.code)}
                      onPointerUp={() => handleKeyUp(key.code)}
                      onPointerCancel={() => handleKeyUp(key.code)}
                      onPointerLeave={() => {
                        if (activeKeys.has(key.code)) {
                          handleKeyUp(key.code);
                        }
                      }}
                      style={{
                        borderColor: isDown ? profile?.color : undefined,
                        boxShadow: isDown
                          ? `0 0 16px ${profile?.color}50, inset 0 2px 4px rgba(0,0,0,0.85)`
                          : undefined
                      }}
                      className={`
                        relative group flex flex-col items-center justify-center
                        h-9 sm:h-12 text-[11px] sm:text-xs font-mono font-medium rounded-lg sm:rounded-xl
                        transition-all duration-75 select-none cursor-pointer
                        ${key.width || 'w-8 sm:w-11'}
                        ${
                          isDown
                            ? 'translate-y-[2px] sm:translate-y-[3.5px] bg-[#16171b] text-white border-b-0 shadow-none'
                            : 'bg-gradient-to-b from-[#24262d] to-[#1a1b20] hover:from-[#2a2c34] hover:to-[#1e1f26] text-neutral-200 border-b-2 sm:border-b-[4px] border-[#0a0a0d] shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                        }
                        border border-white/[0.08]
                      `}
                    >
                      {/* Key Sub-label */}
                      {key.sub && (
                        <span className="text-[9px] text-neutral-400 font-semibold leading-none -mb-0.5">
                          {key.sub}
                        </span>
                      )}
                      <span className={`${key.sub ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'} tracking-tight font-semibold`}>
                        {key.label}
                      </span>

                      {/* Mechanical Spacebar Stabilizer Bar */}
                      {isSpace && (
                        <div className="absolute inset-x-8 bottom-1.5 h-0.5 rounded-full bg-neutral-700/60 group-hover:bg-neutral-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="text-[10px] text-neutral-500 font-mono text-center mt-1 sm:hidden">
          Swipe keyboard horizontally or tap keys to audition
        </div>

        {/* Tactile Chassis Brand & Plate Badge */}
        <div className="mt-2.5 sm:mt-3 flex items-center justify-between px-2 text-[10px] text-neutral-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse shrink-0"
              style={{ backgroundColor: profile?.color }}
            />
            <span className="truncate text-neutral-400">ACOUSTIC PROFILE: <strong className="text-neutral-200">{profile?.name.toUpperCase()}</strong></span>
          </div>
          <span className="hidden sm:inline text-neutral-500">65% COMPACT • TACTILE MECHANICAL KEYCAPS</span>
        </div>

      </div>
    </div>
  );
}

export const VirtualKeyboard = React.memo(VirtualKeyboardComponent);
