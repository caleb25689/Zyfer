import { useEffect, useRef, useState } from 'react'
import './styles.css'

const API = 'https://api.jamendo.com/v3.0/tracks/'
const clientId = import.meta.env.VITE_JAMENDO_CLIENT_ID

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor" stroke="none"/></>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
    music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const time = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

export default function App() {
  const [tracks, setTracks] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [favorites, setFavorites] = useState(() => new Set())
  const [downloaded, setDownloaded] = useState(() => new Set())
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audio = useRef(null)

  async function loadTracks(search = '') {
    if (!clientId) {
      setError('Add your Jamendo API client ID in .env.local to load the music feed.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: '30',
        order: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32',
      })
      if (search.trim()) params.set('search', search.trim())
      const response = await fetch(`${API}?${params}`)
      if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`)
      const data = await response.json()
      if (data.headers?.status === 'failed') throw new Error(data.headers.error_message || 'Catalog request failed.')
      setTracks(data.results || [])
      if (!data.results?.length) setError('No tracks found. Try a different search.')
    } catch (e) {
      setError(`${e.message} Check the API client ID and try again.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTracks() }, [])
  useEffect(() => {
    if (!audio.current) return
    if (playing) audio.current.play().catch(() => setPlaying(false))
    else audio.current.pause()
  }, [playing, current])

  function playTrack(track) {
    if (!track.audio) return
    setCurrent(track)
    setProgress(0)
    setDuration(Number(track.duration) || 0)
    setPlaying(true)
  }

  function toggleFavorite(id) {
    setFavorites(old => {
      const next = new Set(old)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function downloadTrack(track) {
    // Only show download for tracks whose catalog response explicitly supplies a download URL.
    if (!track.audiodownload || track.audiodownload_allowed === false) return
    const link = document.createElement('a')
    link.href = track.audiodownload
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = `${track.artist_name} - ${track.name}.mp3`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setDownloaded(old => new Set(old).add(track.id))
  }

  function submitSearch(event) {
    event.preventDefault()
    loadTracks(query)
  }

  return <div className="zyfer-app">
    {current && <audio ref={audio} src={current.audio} onTimeUpdate={e => setProgress(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration || current.duration || 0)} onEnded={() => setPlaying(false)} />}
    <header className="zyfer-header">
      <a className="zyfer-brand" href="#top"><span className="zyfer-mark">z</span>Zyfer</a>
      <span className="adfree-pill">✦ &nbsp; MUSIC WITHOUT ADS</span>
      <form className="feed-search" onSubmit={submitSearch}><Icon name="search" size={18}/><input aria-label="Search tracks" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tracks or artists"/><button type="submit">Search</button></form>
    </header>

    <main id="top" className="zyfer-content">
      <section className="feed-hero"><div className="hero-glow"/><p className="feed-kicker">DISCOVER SOMETHING NEW</p><h1>Your music, in a new light.</h1><p>Explore independent music, stream a track, and download it when the artist allows it.</p><button className="refresh-feed" onClick={() => loadTracks(query)} disabled={loading}>{loading ? 'Loading…' : 'Refresh feed'}</button></section>

      <section className="feed-section">
        <div className="feed-heading"><div><span className="feed-kicker">THE ZYFER FEED</span><h2>{query ? `Results for “${query}”` : 'Popular right now'}</h2></div><span className="catalog-label">Powered by Jamendo</span></div>
        {error && <div className="feed-notice"><strong>{clientId ? 'Feed unavailable' : 'One setup step needed'}</strong><span>{error}</span>{!clientId && <code>VITE_JAMENDO_CLIENT_ID=your_client_id</code>}</div>}
        {loading && <div className="feed-loading">Finding your next favorite track…</div>}
        {!loading && tracks.length > 0 && <div className="feed-grid">{tracks.map(track => {
          const isPlaying = current?.id === track.id && playing
          const canDownload = Boolean(track.audiodownload) && track.audiodownload_allowed !== false
          return <article className="feed-card" key={track.id}>
            <div className="feed-art" style={{ backgroundImage: `linear-gradient(145deg,rgba(30,10,49,.05),rgba(8,8,12,.5)),url("${track.album_image || track.image || ''}")` }}>
              {!track.album_image && !track.image && <span className="art-placeholder"><Icon name="music" size={38}/></span>}
              <button className="art-play" onClick={() => isPlaying ? setPlaying(false) : playTrack(track)} aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.name}`}><Icon name={isPlaying ? 'pause' : 'play'} size={21}/></button>
            </div>
            <div className="feed-track-title"><div><h3 title={track.name}>{track.name}</h3><p title={track.artist_name}>{track.artist_name}</p></div><button className={favorites.has(track.id) ? 'favorite-button is-favorite' : 'favorite-button'} onClick={() => toggleFavorite(track.id)} aria-label="Toggle favorite"><Icon name="heart" size={17}/></button></div>
            <div className="feed-track-meta"><span>{time(Number(track.duration))}</span><span>{track.musicinfo?.tags?.genres?.slice(0, 2).join(' · ') || 'Independent music'}</span></div>
            <div className="feed-actions">{canDownload ? <button className={downloaded.has(track.id) ? 'download-action done' : 'download-action'} onClick={() => downloadTrack(track)}><Icon name="download" size={16}/>{downloaded.has(track.id) ? 'Downloaded' : 'Download'}</button> : <span className="download-unavailable">Streaming only</span>}<a href={track.shareurl} target="_blank" rel="noreferrer">Track &amp; artist ↗</a></div>
            {track.license_ccurl && <a className="license-link" href={track.license_ccurl} target="_blank" rel="noreferrer">View track license ↗</a>}
          </article>
        })}</div>}
      </section>
      <p className="catalog-footnote">Track availability, licensing, and download permissions are set by the catalog and artists. Zyfer only offers a download when the API provides a download URL. Review Jamendo’s API and licensing terms before public or commercial launch.</p>
    </main>

    <footer className="zyfer-player">
      <div className="player-track">{current ? <><div className="player-thumb" style={{backgroundImage:`url("${current.album_image || current.image || ''}")`}}/><div><strong>{current.name}</strong><span>{current.artist_name}</span></div></> : <><div className="player-thumb empty"><Icon name="music"/></div><div><strong>Choose a track</strong><span>Your next discovery awaits</span></div></>}</div>
      <div className="player-controls"><div className="player-buttons"><button aria-label="Previous" disabled>◀</button><button className="main-play" onClick={() => current && setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}><Icon name={playing ? 'pause' : 'play'} size={19}/></button><button aria-label="Next" disabled>▶</button></div><div className="player-progress"><span>{time(progress)}</span><input aria-label="Playback position" type="range" min="0" max={duration || 1} value={Math.min(progress, duration || 1)} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value); setProgress(Number(e.target.value)) }}/><span>{time(duration)}</span></div></div>
      <span className="player-brand-note">FEEL EVERY BEAT</span>
    </footer>
  </div>
}
