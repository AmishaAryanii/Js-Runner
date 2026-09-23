# JS Runner (React)

A small Programiz-style online JavaScript compiler: write code on the left,
click Run, and see `console.log`/`console.error`/`console.warn` output on the
right.

## Setup

```bash
npm install
npm start
```

Opens at http://localhost:3000

## Build for production

```bash
npm run build
```

## How it works

- `src/App.jsx` — the whole app: editor textarea, output panel, and the
  `runCode()` function that executes user code with `new Function()` and
  captures console calls into an array.
- `src/index.css` — dark, terminal-style theme.
- `⌘/Ctrl + Enter` runs the code from the editor.

## ⚠️ Security note

`runCode()` uses `new Function()`, which executes the code directly in the
browser tab. That's fine for a personal tool where only you type code into
the editor. If you ever let **other users'** code run through this app
(e.g. a public website), don't use `new Function()` directly — instead run
the code inside a sandboxed `<iframe>` with a strict `sandbox` attribute, or
send it to a server-side sandboxed worker (like Docker/Firecracker), so
untrusted code can't touch the rest of your page or your users' data.
