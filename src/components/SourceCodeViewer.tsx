import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import picklebotSource from '../assets/source/picklebot.js?raw'
import './SourceCodeViewer.css'

type Token = { text: string; kind?: string }

// Highlight text only: the supplied JavaScript is never evaluated or inserted as HTML.
function highlight(source: string): Token[] {
  const pattern = /(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(async|await|break|catch|const|else|false|finally|for|function|if|let|new|null|return|throw|true|try|typeof|undefined|while)\b|(\b\d+(?:\.\d+)?\b)/g
  const tokens: Token[] = []
  let cursor = 0
  for (const match of source.matchAll(pattern)) {
    if (match.index > cursor) tokens.push({ text: source.slice(cursor, match.index) })
    tokens.push({ text: match[0], kind: match[1] ? 'comment' : match[2] ? 'string' : match[3] ? 'keyword' : 'number' })
    cursor = match.index + match[0].length
  }
  if (cursor < source.length) tokens.push({ text: source.slice(cursor) })
  return tokens
}

const tokens = highlight(picklebotSource)
const lineCount = picklebotSource.trimEnd().split('\n').length
const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')

export default function SourceCodeViewer({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const mounted = useRef(false)
  const titleId = useId()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    mounted.current = true
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    // A parent story dialog already owns its scroll lock. Leave that lock to its
    // owner so a route change can unmount both dialogs in either cleanup order.
    const ownsScrollLock = !document.querySelector('dialog[open]')
    if (ownsScrollLock) document.body.style.overflow = 'hidden'
    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      mounted.current = false
      dialog.close()
      if (ownsScrollLock) document.body.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : overflow
      if (origin?.isConnected) origin.focus({ preventScroll: true })
    }
  }, [])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(picklebotSource)
      if (mounted.current) setCopyState('copied')
    } catch {
      if (mounted.current) setCopyState('failed')
    }
  }

  return createPortal(<dialog
    ref={dialogRef}
    className="source-code-dialog"
    aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }}
    onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) onClose() }}
  >
    <div className="source-code-window">
      <header className="source-code-header">
        <div className="source-code-file"><span className="source-code-file-icon" aria-hidden="true">JS</span><div><h2 id={titleId}>picklebot.js</h2><p>JavaScript <span aria-hidden="true">/</span> {lineCount} lines</p></div></div>
        <button type="button" ref={closeRef} className="source-code-close" aria-label="Close source code" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      </header>
      <div className="source-code-toolbar"><span>Picklebot / Source code</span><button type="button" onClick={copyCode}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M16 8V3H3v13h5" /></svg>{copyState === 'copied' ? 'Copied' : 'Copy code'}</button></div>
      <div className="source-code-scroll" tabIndex={0} role="region" aria-label="JavaScript source code">
        <div className="source-code-content"><pre className="source-code-gutter" aria-hidden="true">{lineNumbers}</pre><pre className="source-code-text"><code>{tokens.map((token, index) => token.kind ? <span className={`source-token-${token.kind}`} key={index}>{token.text}</span> : token.text)}</code></pre></div>
      </div>
      <footer className="source-code-footer"><span>Read-only source</span><span role="status" aria-live="polite">{copyState === 'failed' ? 'Copy unavailable. Select the code to copy it.' : copyState === 'copied' ? 'Source copied to clipboard.' : 'Esc to close'}</span></footer>
    </div>
  </dialog>, document.body)
}
