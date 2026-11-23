import { useEffect, useRef, useState } from 'react'
import './styles.css'

const tracks = [
  { id: 1, title: 'Midnight Echo', artist: 'The Blue Hour', album: 'Afterglow', duration: 285, colors: ['#24105e','#7138c7','#d3559d'], cover: 'linear-gradient(135deg,#5b21b6,#a855f7,#fb7185)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Golden Skyline', artist: 'Nova Avenue', album: 'Sunset Radio', duration: 248, colors: ['#8c3d12','#df6d42','#39216f'], cover: 'linear-gradient(135deg,#f59e0b,#fb7185,#7c3aed)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Ocean Between Us', artist: 'Luna & The Waves', album: 'Tidal Dreams', duration: 312, colors: ['#124467','#1977a7','#45358a'], cover: 'linear-gradient(135deg,#0891b2,#60a5fa,#4338ca)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Electric Hearts', artist: 'Neon Youth', album: 'Bright Again', duration: 221, colors: ['#7c1d53','#7332a1','#167b99'], cover: 'linear-gradient(135deg,#ec4899,#8b5cf6,#22d3ee)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, title: 'Slow Motion', artist: 'Juno Lane', album: 'Soft Focus', duration: 267, colors: ['#162856','#08779a','#8d3da5'], cover: 'linear-gradient(135deg,#1e3a8a,#06b6d4,#d946ef)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, title: 'Velvet Morning', artist: 'Milo West', album: 'Quiet Places', duration: 294, colors: ['#63301c','#9e3f2b','#9c6a25'], cover: 'linear-gradient(135deg,#78350f,#dc2626,#f59e0b)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
]

function Icon({ name, size = 20 }) {
  const shapes = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    home: <><path d="M3 11 12 3l9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
    library: <><path d="M4 4v16M9 4v16M14 7l6-2v12l-6 2z"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor" stroke="none"/></>,
    prev: <><path d="m18 5-10 7 10 7z" fill="currentColor"/><path d="M6 5v14"/></>,
    next: <><path d="m6 5 10 7-10 7z" fill="currentColor"/><path d="M18 5v14"/></>,
    volume: <><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

const formatTime = value => {
  if (!Number.isFinite(value)) return '0:00'
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`
}

export default function App() {
  const [current, setCurrent] = useState(tracks[0])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(tracks[0].duration)
  const [volume, setVolume] = useState(75)
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('Home')
  const [favorites, setFavorites] = useState(() => new Set(JSON.parse(localStorage.getItem('zyfer-favorites') || '[]')))
  const [downloaded, setDownloaded] = useState(() => new Set(JSON.parse(localStorage.getItem('zyfer-downloads') || '[]')))
  const [downloading, setDownloading] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => localStorage.setItem('zyfer-favorites', JSON.stringify([...favorites])), [favorites])
  useEffect(() => localStorage.setItem('zyfer-downloads', JSON.stringify([...downloaded])), [downloaded])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume / 100
    if (playing) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [playing, current, volume])

  const selectTrack = track => {
    setCurrent(track)
    setProgress(0)
    setDuration(track.duration)
    setPlaying(true)
  }

  const changeTrack = direction => {
    const index = tracks.findIndex(track => track.id === current.id)
    selectTrack(tracks[(index + direction + tracks.length) % tracks.length])
  }

  const toggleSet = (setter, id) => setter(old => {
    const next = new Set(old)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const downloadTrack = async track => {
    setDownloading(track.id)
    try {
      const response = await fetch(track.audio)
      if (!response.ok) throw new Error('Download unavailable')
      const blob = await response.blob()
      if ('caches' in window) {
        const cache = await caches.open('zyfer-offline-v1')
        await cache.put(track.audio, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }))
      }
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${track.artist} - ${track.title}.mp3`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      setDownloaded(old => new Set(old).add(track.id))
    } catch (error) {
      window.open(track.audio, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(null)
    }
  }

  const filtered = tracks.filter(track => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase()))
  const gradientStyle = { '--c1': current.colors[0], '--c2': current.colors[1], '--c3': current.colors[2] }

  return <div className="app" style={gradientStyle}>
    <audio ref={audioRef} src={current.audio} onTimeUpdate={event => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : current.duration)} onEnded={() => changeTrack(1)} />

    <aside className="sidebar">
      <button className="brand" onClick={() => setActiveNav('Home')}><span className="brand-mark">z</span><span>Zyfer</span></button>
      <nav>
        {[['Home','home'],['Search','search'],['Your Library','library']].map(([label, icon]) => <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => setActiveNav(label)}><Icon name={icon}/><span>{label}</span></button>)}
      </nav>
      <div className="divider"/><button className="nav-action"><span className="square">+</span>Create playlist</button>
      <button className="nav-action"><span className="square liked">♥</span>Liked Songs</button>
      <div className="playlists"><button>Daily Mix 01</button><button>Late Night Coding</button><button>Road Trip</button><button>Calm Vibes</button></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="search-box"><Icon name="search" size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="What do you want to play?"/></div>
        <button className="profile"><span>CY</span><b>⌄</b></button>
      </header>

      <div className="content">
        <section className="hero"><div><p className="eyebrow">MADE FOR YOU</p><h1>Good evening</h1></div></section>

        <section className="quick-grid">
          {tracks.slice(0,6).map(track => <button className="quick-card" key={track.id} onClick={() => selectTrack(track)}><span className="quick-cover" style={{background:track.cover}}/><span>{track.title}</span></button>)}
        </section>

        <section className="section">
          <div className="section-heading"><div><p className="eyebrow">ZYFER PICKS</p><h2>Made for your mood</h2></div></div>
          <div className="cards">
            {filtered.map(track => <article className="music-card" key={track.id}>
              <button className="card-cover" style={{background:track.cover}} onClick={() => selectTrack(track)} aria-label={`Play ${track.title}`}>
                <span className="cover-orbit"/><span className="card-play"><Icon name={current.id === track.id && playing ? 'pause' : 'play'} size={18}/></span>
              </button>
              <h3>{track.title}</h3><p>{track.artist} · {track.album}</p>
            </article>)}
          </div>
        </section>

        <section className="section">
          <div className="section-heading"><div><p className="eyebrow">RECENTLY PLAYED</p><h2>Your tracks</h2></div></div>
          <div className="track-list">
            {filtered.map((track, index) => <div className="track-row" key={track.id}>
              <button className="track-number" onClick={() => selectTrack(track)}>{index + 1}</button>
              <button className="track-main" onClick={() => selectTrack(track)}><span className="track-cover" style={{background:track.cover}}/><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>
              <span className="album">{track.album}</span>
              <button className={favorites.has(track.id) ? 'liked' : ''} onClick={() => toggleSet(setFavorites, track.id)} aria-label="Favorite"><Icon name="heart" size={17}/></button>
              <span>{formatTime(track.duration)}</span>
              <button className={downloaded.has(track.id) ? 'downloaded' : ''} onClick={() => downloadTrack(track)} disabled={downloading === track.id} aria-label="Download"><Icon name="download" size={17}/></button>
            </div>)}
          </div>
        </section>
      </div>
    </main>

    <footer className="player">
      <div className="now-playing"><div className="player-cover" style={{background:current.cover}}/><div><strong>{current.title}</strong><span>{current.artist}</span></div><button className={favorites.has(current.id) ? 'liked' : ''} onClick={() => toggleSet(setFavorites, current.id)}><Icon name="heart" size={17}/></button></div>
      <div className="player-center">
        <div className="controls"><button onClick={() => changeTrack(-1)} aria-label="Previous"><Icon name="prev"/></button><button className="play-button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}><Icon name={playing ? 'pause' : 'play'} size={19}/></button><button onClick={() => changeTrack(1)} aria-label="Next"><Icon name="next"/></button></div>
        <div className="timeline"><span>{formatTime(progress)}</span><input aria-label="Track progress" type="range" min="0" max={duration || 1} value={Math.min(progress, duration || 1)} onChange={event => {const value=Number(event.target.value); setProgress(value); if(audioRef.current) audioRef.current.currentTime=value}}/><span>{formatTime(duration)}</span></div>
      </div>
      <div className="volume"><Icon name="volume"/><input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={event => setVolume(Number(event.target.value))}/></div>
    </footer>
  </div>
}
