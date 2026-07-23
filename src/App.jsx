import { useState } from 'react'
import {
  Box, Check, Clipboard, ExternalLink, FileText, GitBranch,
  Menu, Play, X,
} from 'lucide-react'
import selectedCases from '../metadata/selected_cases.json'
import tfFtCases from '../metadata/tf_ft_cases.json'
import { ComparisonCase } from './components/ComparisonCase'
import { LazyVideo } from './components/LazyVideo'
import { ResultCard } from './components/ResultCard'
import { VariantVideo } from './components/VariantVideo'
import { siteConfig } from './config/siteConfig'
import './styles/site.css'

const durationOptions = [60, 120, 240]
const durationCopy = {
  60: 'The primary evaluation setting, with one-minute rollouts generated under a fixed KV cache budget.',
  120: 'Two-minute rollouts extend the same bounded-memory generation process to a longer temporal horizon.',
  240: 'Four-minute rollouts cover an increasingly long history while keeping the KV cache budget fixed.',
}
const oursVideo = (item) => item.videos.find((video) => video.method_family === 'FadeMem')

function LinkButton({ href, icon: Icon, children }) {
  const disabled = !href
  return (
    <a className={`link-button ${disabled ? 'link-button--disabled' : ''}`} href={href || undefined} aria-disabled={disabled}>
      <Icon size={17} />
      <span>{children}</span>
      {!disabled && href !== '#results' && <ExternalLink size={14} />}
    </a>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

function PlaybackSpeed({ value, onChange }) {
  return (
    <div className="speed-control" role="group" aria-label="Video playback speed">
      <span>Play speed:</span>
      {[1, 2].map((speed) => (
        <button
          key={speed}
          type="button"
          className={value === speed ? 'active' : ''}
          onClick={() => onChange(speed)}
          aria-pressed={value === speed}
        >
          {speed}x
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(2)
  const [copied, setCopied] = useState(false)

  const heroCase = selectedCases.find((item) => item.hero)
  const heroVideo = oursVideo(heroCase)
  const comparisons = selectedCases.filter((item) => item.display_type === 'comparison')
  const comparisonGroups = durationOptions
    .map((duration) => ({ duration, items: comparisons.filter((item) => item.duration === duration) }))
    .filter((group) => group.items.length > 0)
  const highlights = selectedCases.filter((item) => item.display_type === 'ours_only')

  const copyCitation = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(siteConfig.citation)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = siteConfig.citation
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copiedWithFallback = document.execCommand('copy')
      textarea.remove()
      if (!copiedWithFallback) throw new Error('Clipboard copy is unavailable')
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FadeMem home">FadeMem</a>
        <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? 'nav nav--open' : 'nav'} onClick={() => setMenuOpen(false)}>
          <a href="#method">Method</a>
          <a href="#results">Results</a>
          <a href="#comparison">Comparison</a>
          <a href="#citation">Citation</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <LazyVideo src={heroVideo.file} poster={heroVideo.poster} eager autoPlay background className="hero__media" />
          <div className="hero__shade" />
          <div className="hero__content">
            {siteConfig.venue && <span className="hero__venue">{siteConfig.venue}</span>}
            <h1>{siteConfig.methodName}</h1>
            <p className="hero__title">{siteConfig.title}</p>
            <p className="hero__tagline">{siteConfig.tagline}</p>
            {(siteConfig.authors.length > 0 || siteConfig.affiliation) && (
              <div className="hero__authors">
                {siteConfig.authors.length > 0 && <span>{siteConfig.authors.join(', ')}</span>}
                {siteConfig.affiliation && <span>{siteConfig.affiliation}</span>}
              </div>
            )}
            <div className="hero__links">
              <LinkButton href={siteConfig.links.paper} icon={FileText}>Paper</LinkButton>
              <LinkButton href={siteConfig.links.code} icon={GitBranch}>Code</LinkButton>
              <LinkButton href={siteConfig.links.model} icon={Box}>Model</LinkButton>
              <LinkButton href={siteConfig.links.demo} icon={Play}>Results</LinkButton>
            </div>
          </div>
          <div className="hero__caption">
            <span>Ours · 240 seconds</span>
            <p>{heroCase.prompt}</p>
          </div>
        </section>

        <section className="method-section" id="method">
          <div className="section-inner method-layout">
            <SectionHeading eyebrow="Method" title="Dense-near, sparse-far memory" />
            <div className="method-copy">
              {siteConfig.abstract.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="method-facts">
                <div><strong>Training-Free</strong><span>Inference-time memory organization</span></div>
                <div><strong>Light Fine-Tuning</strong><span>The same mechanism with LoRA updates</span></div>
                <div><strong>Long Video</strong><span>Fixed-budget autoregressive rollouts</span></div>
              </div>
            </div>
          </div>
          <div className="section-inner metrics-wrap">
            <p className="metrics-caption">{siteConfig.metrics.caption}</p>
            <div className="table-scroll">
              <table>
                <thead><tr>{siteConfig.metrics.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                <tbody>
                  {siteConfig.metrics.rows.map((row) => (
                    <tr className={row[0].startsWith('FadeMem') ? 'metric-row--ours' : ''} key={row[0]}>
                      {row.map((value) => <td key={value}>{value}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="results-section" id="results">
          <div className="section-inner">
            <SectionHeading eyebrow="Selected Results" title="Long-video consistency across selected cases" description="Examples at 60, 120, and 240 seconds show FadeMem across progressively longer autoregressive rollouts." />
            <div className="results-toolbar">
              <PlaybackSpeed value={playbackRate} onChange={setPlaybackRate} />
            </div>
            <div className="result-groups">
              {durationOptions.map((duration) => {
                const items = highlights.filter((item) => item.duration === duration)
                return (
                  <section className="result-duration" key={duration} aria-labelledby={`results-${duration}`}>
                    <div className="result-duration__heading">
                      <h3 id={`results-${duration}`}>{duration} seconds</h3>
                      <p>{durationCopy[duration]}</p>
                    </div>
                    <div className="result-grid" data-columns={items.length} style={{ '--result-columns': items.length }}>
                      {items.map((item) => <ResultCard item={item} playbackRate={playbackRate} key={item.case_id} />)}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </section>

        <section className="comparison-section" id="comparison">
          <div className="section-inner">
            <SectionHeading eyebrow="Comparison Results" title="Matched prompts and durations" description="Each row compares videos generated from the same prompt at the same duration." />
            <div className="comparison-list">
              {comparisonGroups.map(({ duration, items }) => (
                <section className="comparison-duration" key={duration} aria-labelledby={`comparison-${duration}`}>
                  <div className="comparison-duration__heading">
                    <h3 id={`comparison-${duration}`}>{duration}-second {items.length === 1 ? 'comparison' : 'comparisons'}</h3>
                    <p>{items.length} matched {items.length === 1 ? 'prompt' : 'prompts'}, with five methods shown in each row.</p>
                  </div>
                  <div className="comparison-duration__cases">
                    {items.map((item, index) => <ComparisonCase item={item} caseIndex={index + 1} playbackRate={playbackRate} key={item.case_id} />)}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="variants-section">
          <div className="section-inner">
            <SectionHeading eyebrow="Training-Free vs. Light Fine-Tuning" title="The same memory mechanism, with or without fine-tuning" description="FadeMem-TF changes inference-time memory organization without additional training; FadeMem-FT applies light fine-tuning with the same mechanism." />
            <div className="variant-list">
              {tfFtCases.map((item) => (
                <article className="variant-case" key={item.case_id}>
                  <div className="variant-case__text">
                    <span className="eyebrow">Prompt {String(item.prompt_id).padStart(3, '0')} · {item.duration} seconds</span>
                    <p>{item.prompt}</p>
                    <strong>{item.summary}</strong>
                  </div>
                  <div className="variant-grid">
                    {item.videos.map((video) => <VariantVideo video={video} playbackRate={playbackRate} key={video.method_variant} />)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="citation-section" id="citation">
          <div className="section-inner citation-layout">
            <SectionHeading eyebrow="Citation" title="BibTeX" />
            <div className="citation-block">
              <pre>{siteConfig.citation}</pre>
              <button type="button" onClick={copyCitation} aria-label={copied ? 'BibTeX copied' : 'Copy BibTeX'} title={copied ? 'Copied' : 'Copy BibTeX'}>
                {copied ? <Check size={18} /> : <Clipboard size={18} />}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="section-inner footer-inner">
          <span>FadeMem</span>
          <span>Distance-aware memory consolidation for autoregressive video diffusion</span>
          <a href="#top" aria-label="Back to top">Top</a>
        </div>
      </footer>
    </div>
  )
}
