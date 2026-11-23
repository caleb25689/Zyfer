import { useEffect, useRef, useState } from 'react'

const Icon = ({ name, size = 20, filled = false }) => {
  const icons = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    library: <><path d="M4 4v16M9 4v16M14 7l6-2v12l-6 2z"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z"/>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor" stroke="none"/></>,
    next: <><path d="m6 5 10 7-10 7z" fill="currentColor"/><path d="M18 5v14"/></>,
    prev: <><path d="m18 5-10 7 10 7z" fill="currentColor"/><path d="M6 5v14"/></>,
    shuffle: <><path d="M3 7h3c4 0 5 10 9 10h6"/><path d="m18 14 3 3-3 3M3 17h3c1.5 0 2.5-1.5 3.5-3M18 4l3 3-3 3"/></>,
    repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>,
    volume: <><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

const tracks = [
  { id: 1, title: 'Midnight Echo', artist: 'The Blue Hour', album: 'Afterglow', duration: 285, cover: 'linear-gradient(135deg,#5b21b6,#a855f7,#fb7185)', colors: ['#24105e','#7138c7','#d3559d'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Golden Skyline', artist: 'Nova Avenue', album: 'Sunset Radio', duration: 248, cover: 'linear-gradient(135deg,#f59e0b,#fb7185,#7c3aed)', colors: ['#8c3d12','#df6d42','#39216f'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Ocean Between Us', artist: 'Luna & The Waves', album: 'Tidal Dreams', duration: 312, cover: 'linear-gradient(135deg,#0891b2,#60a5fa,#4338ca)', colors: ['#124467','#1977a7','#45358a'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Electric Hearts', artist: 'Neon Youth', album: 'Bright Again', duration: 221, cover: 'linear-gradient(135deg,#ec4899,#8b5cf6,#22d3ee)', colors: ['#7c1d53','#7332a1','#167b99'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, title: 'Slow Motion', artist: 'Juno Lane', album: 'Soft Focus', duration: 267, cover: 'linear-gradient(135deg,#1e3a8a,#06b6d4,#d946ef)', colors: ['#162856','#08779a','#8d3da5'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, title: 'Velvet Morning', artist: 'Milo West', album: 'Quiet Places', duration: 294, cover: 'linear-gradient(135deg,#78350f,#dc2626,#f59e0b)', colors: ['#63301c','#9e3f2b','#9c6a25'], audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
]

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export default function App() {
  const [current, setCurrent] = useState(tracks[0])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [favorites, setFavorites] = useState(new Set([1, 3]))
  const [downloaded, setDownloaded] = useState(new Set([2]))
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('Home')
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
      if (playing) audioRef.current.play().catch(() => setPlaying(false))
      else audioRef.current.pause()
    }
  }, [playing, current, volume])

  const toggleFavorite = (id) => setFavorites(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectTrack = (track) => {
    setCurrent(track)
    setProgress(0)
    setPlaying(true)
  }

  const downloadTrack = (track) => {
    setDownloaded(prev => new Set(prev).add(track.id))
    const anchor = document.createElement('a')
    anchor.href = track.audio
    anchor.download = `${track.artist} - ${track.title}.mp3`
    anchor.target = '_blank'
    anchor.click()
  }

  const changeTrack = (direction) => {
    const index = tracks.findIndex(track => track.id === current.id)
    selectTrack(tracks[(index + direction + tracks.length) % tracks.length])
  }

  const filtered = tracks.filter(track =>
    `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase())
  )

  const gradientStyle = {
    '--c1': current.colors[0], '--c2': current.colors[1], '--c3': current.colors[2]
  }

  return (
    <div className="app" style={gradientStyle}>
      <audio ref={audioRef} src={current.audio} onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)} onEnded={() => changeTrack(1)} />

      <aside className="sidebar">
        <button className="brand" onClick={() => setActiveNav('Home')} aria-label="Zyfer home">
          <span className="brand-mark"><span /></span>
          <span>Zyfer</span>
        </button>

        <nav>
          {[['Home','home'],['Search','search'],['Your Library','library']].map(([label, icon]) => (
            <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => setActiveNav(label)}>
              <Icon name={icon} size={21}/><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <button className="library-action"><span className="square-icon"><Icon name="plus" size={18}/></span><span>Create playlist</span></button>
        <button className="library-action"><span className="square-icon liked"><Icon name="heart" size={16} filled /></span><span>Liked Songs</span></button>

        <div className="playlist-links">
          <button>Daily Mix 01</button><button>Late Night Coding</button><button>Road Trip</button><button>Calm Vibes</button>
        </div>
        <button className="install"><Icon name="download" size={18}/><span>Install App</span></button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="history"><button aria-label="Back"><Icon name="chevron" size={18}/></button><button aria-label="Forward" className="forward"><Icon name="chevron" size={18}/></button></div>
          <div className="search-box"><Icon name="search" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="What do you want to play?" /></div>
          <button className="profile"><span>CY</span><Icon name="chevron" size={16}/></button>
        </header>

        <div className="content">
          <section className="hero">
            <div><p className="eyebrow">MADE FOR YOU</p><h1>Good evening</h1></div>
            <button className="hero-more" aria-label="More options"><Icon name="more" /></button>
          </section>

          <section className="quick-grid">
            {tracks.slice(0, 6).map(track => (
              <button className="quick-card" key={track.id} onClick={() => selectTrack(track)}>
                <span className="quick-cover" style={{ background: track.cover }}><span className="mini-wave">{[12,18,8,22,14].map((h,i)=><i key={i} style={{height:h}}/>)} </span></span>
                <span>{track.title}</span>
                <span className="quick-play"><Icon name="play" size={18}/></span>
              </button>
            ))}
          </section>

          <section className="section">
            <div className="section-heading"><div><p className="eyebrow">Zyfer picks</p><h2>Made for your mood</h2></div><button>Show all</button></div>
            <div className="cards">
              {filtered.map((track, index) => (
                <article className="music-card" key={track.id} onDoubleClick={() => selectTrack(track)}>
                  <div className="card-cover" style={{ background: track.cover }} onClick={() => selectTrack(track)}>
                    <span className="cover-orbit"><span /></span>
                    <button className="card-play" aria-label={`Play ${track.title}`}><Icon name={current.id === track.id && playing ? 'pause' : 'play'} size={20}/></button>
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.artist} · {track.album}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section track-list-section">
            <div className="section-heading"><div><p class="eyebrow">Recently played</p><h2>Your tracks</h2></div></div>
            <div className="track-list">
              {filtered.map((track, index) => (
                <div className="track-row" key={track.id}>
                  <button className="track-number" onClick={() => selectTrack(track)}>{current.id === track.id && playing ? <span className="playing-bars"><i/><i/><i/></span> : index + 1}</button>
                  <button className="track-main" onClick={() => selectTrack(track)}><span className="track-mini-cover" style={{background:track.cover}}/><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>
                  <span className="track-album">{track.album}</span>
                  <button className={favorites.has(track.id) ? 'row-heart liked-heart' : 'row-heart'} onClick={() => toggleFavorite(track.id)} aria-label="Favorite"><Icon name="heart" size={17} filled={favorites.has(track.id)}/></button>
                  <span className="track-duration">{formatTime(track.duration)}</span>
                  <button className={downloaded.has(track.id) ? 'download-btn downloaded' : 'download-btn'} onClick={() => downloadTrack(track)} aria-label="Download"><Icon name="download" size={17}/></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="player">
        <div className="now-playing">
          <div className="player-cover" style={{background: current.cover}}><span /></div>
          <div><strong>{current.title}</strong><span>{current.artist}</span></div>
          <button className={favorites.has(current.id) ? 'player-heart liked-heart' : 'player-heart'} onClick={() => toggleFavorite(current.id)}><Icon name="heart" size={17} filled={favorites.has(current.id)}/></button>
        </div>

        <div className="player-center">
          <div className="controls">
            <button aria-label="Shuffle"><Icon name="shuffle" size={17}/></button>
            <button aria-label="Previous" onClick={() => changeTrack(-1)}><Icon name="prev" size={18}/></button>
            <button className="play-button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play'} size={20}/></button>
            <button aria-label="Next" onClick={() => changeTrack(1)}><Icon name="next" size={18}/></button>
            <button aria-label="Repeat"><Icon name="repeat" size={17}/></button>
          </div>
          <div className="timeline"><span>{formatTime(progress)}</span><input aria-label="Track progress" type="range" min="0" max={current.duration} value={progress} onChange={e => {const value=Number(e.target.value); setProgress(value); if(audioRef.current) audioRef.current.currentTime=value}}/><span>{formatTime(current.duration)}</span></div>
        </div>

        <div className="volume"><Icon name="volume" size={19}/><input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))}/></div>
      </footer>
    </div>
  )
}
