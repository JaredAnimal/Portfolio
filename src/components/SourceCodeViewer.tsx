import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sourceProjects } from '../sourceCode'
import type { SourceCodeId } from '../sourceCode'
import './SourceCodeViewer.css'

type Token = { text: string; kind?: string }

// Highlight text only: supplied source is never evaluated or inserted as HTML.
function highlight(source: string): Token[] {
  const pattern = /(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(async|await|bool|break|case|catch|char|class|const|constexpr|continue|default|double|else|false|finally|float|for|function|if|include|int|let|namespace|new|null|nullptr|pragma|private|public|return|sizeof|static|static_assert|struct|switch|template|throw|true|try|typedef|typename|typeof|undefined|unsigned|using|void|volatile|while|uint8_t|uint16_t|uint32_t|size_t)\b|(\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)[fFuUlL]*\b)/g
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

export default function SourceCodeViewer({ sourceId, onClose }: { sourceId: SourceCodeId; onClose: () => void }) {
  const project = sourceProjects[sourceId]
  const [activeFile, setActiveFile] = useState(0)
  const file = project.files[activeFile]
  const tokens = highlight(file.content)
  const lineCount = file.content.trimEnd().split('\n').length
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const mounted = useRef(false)
  const copyRequest = useRef(0)
  const titleId = useId()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  function selectFile(index: number) {
    ++copyRequest.current
    setActiveFile(index)
    setCopyState('idle')
    scrollRef.current?.scrollTo(0, 0)
  }

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
    const request = ++copyRequest.current
    try {
      await navigator.clipboard.writeText(file.content)
      if (mounted.current && request === copyRequest.current) setCopyState('copied')
    } catch {
      if (mounted.current && request === copyRequest.current) setCopyState('failed')
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
        <div className="source-code-file"><span className="source-code-file-icon" aria-hidden="true">{file.icon}</span><div><h2 id={titleId}>{file.name}</h2><p>{file.language} <span aria-hidden="true">/</span> {lineCount} lines</p></div></div>
        <button type="button" ref={closeRef} className="source-code-close" aria-label="Close source code" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      </header>
      <div className="source-code-toolbar"><span>{project.title} / Source code</span><button type="button" onClick={copyCode}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M16 8V3H3v13h5" /></svg>{copyState === 'copied' ? 'Copied' : 'Copy code'}</button></div>
      {project.files.length > 1 && <div className="source-code-files" role="group" aria-label="Source files">{project.files.map((sourceFile, index) => <button type="button" key={sourceFile.name} aria-pressed={index === activeFile} onClick={() => selectFile(index)}>{sourceFile.name}</button>)}</div>}
      <div ref={scrollRef} className="source-code-scroll" tabIndex={0} role="region" aria-label={`${file.language} source code`}>
        <div className="source-code-content"><pre className="source-code-gutter" aria-hidden="true">{lineNumbers}</pre><pre className="source-code-text"><code>{tokens.map((token, index) => token.kind ? <span className={`source-token-${token.kind}`} key={index}>{token.text}</span> : token.text)}</code></pre></div>
      </div>
      <footer className="source-code-footer"><span>Read-only source</span><span role="status" aria-live="polite">{copyState === 'failed' ? 'Copy unavailable. Select the code to copy it.' : copyState === 'copied' ? 'Source copied to clipboard.' : 'Esc to close'}</span></footer>
    </div>
  </dialog>, document.body)
}
