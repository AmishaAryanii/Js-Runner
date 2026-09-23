import React, { useState, useRef, useCallback } from 'react';
import './index.css';

const DEFAULT_CODE = `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

for (let i = 0; i < 8; i++) {
  console.log("fib(" + i + ") =", fib(i));
}`;

// Runs user code inside a Function scope and captures console output.
// NOTE: this uses new Function(), which executes in the current page context.
// It is fine for a personal dev tool, but do NOT expose this to untrusted
// users in production without running the code in a sandboxed iframe or a
// server-side worker instead.
function runCode(code) {
  const lines = [];
  const push = (type) => (...args) => {
    lines.push({
      type,
      text: args
        .map((a) => {
          if (typeof a === 'object' && a !== null) {
            try {
              return JSON.stringify(a, null, 2);
            } catch (e) {
              return String(a);
            }
          }
          return String(a);
        })
        .join(' '),
    });
  };
  const sandboxConsole = {
    log: push('log'),
    error: push('err'),
    warn: push('warn'),
    info: push('log'),
  };

  let error = null;
  try {
    const fn = new Function('console', '"use strict";\n' + code);
    fn(sandboxConsole);
  } catch (e) {
    error = e.message || String(e);
  }
  return { lines, error };
}

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState(null);
  const taRef = useRef(null);

  const handleRun = useCallback(() => {
    const { lines: out, error } = runCode(code);
    const finalLines = error
      ? [...out, { type: 'err', text: 'Uncaught: ' + error }]
      : out;
    setLines(finalLines);
    setStatus(error ? { ok: false } : { ok: true });
  }, [code]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = taRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + '  ' + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleRun();
    }
  };

  return (
    <>
      <header>
        <div className="brand">
          <span className="dot" />
          <div>
            <h1>JS Runner</h1>
            <p className="sub">Write JavaScript, run it, see the console output.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {status && (
            <span
              className={'status ' + (status.ok ? 'ok' : 'err')}
              style={{ marginRight: 10 }}
            >
              {status.ok ? '● ran cleanly' : '● error'}
            </span>
          )}
          <button
            className="clear"
            onClick={() => {
              setLines([]);
              setStatus(null);
            }}
          >
            Clear output
          </button>
          <button className="run" onClick={handleRun} style={{ marginLeft: 8 }}>
            ▶ Run  ⌘⏎
          </button>
        </div>
      </header>

      <main>
        <div className="pane">
          <div className="pane-label">
            <span>script.js</span>
          </div>
          <textarea
            ref={taRef}
            value={code}
            spellCheck={false}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="pane">
          <div className="pane-label">
            <span>Output</span>
          </div>
          <div className="output">
            {lines.length === 0 ? (
              <div className="placeholder">Press Run to execute your code.</div>
            ) : (
              lines.map((l, i) => (
                <div key={i} className={'line ' + l.type}>
                  {l.text}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
