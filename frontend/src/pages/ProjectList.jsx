import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link } from 'react-router-dom'
import sampleProjects from '../sampleProjects'
import { useAuth } from '../auth'

function Progress({ value, goal }){
  const pct = Math.min(100, Math.round((value/goal||0)*100))
  const tier = pct < 40 ? 'progress-low' : (pct < 75 ? 'progress-medium' : 'progress-high')
  return (
    <div style={{ marginTop:16 }}>
      <div className={`progress-track ${pct === 0 ? 'progress-empty' : ''}`}><div className={`progress-fill ${tier}`} style={{ width: `${pct}%` }} /></div>
      <div className="muted" style={{ fontSize:12 }}>{pct}% funded</div>
    </div>
  )
}

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  useEffect(() => {
    const MIN_LOADING_MS = 300
    setLoading(true)
    const start = Date.now()
    API.get('/projects').then(r => {
      const finish = () => { setProjects(r.data); setLoading(false) }
      const waited = Date.now() - start
      if (waited >= MIN_LOADING_MS) finish()
      else setTimeout(finish, MIN_LOADING_MS - waited)
    }).catch(() => {
      const finish = () => { setProjects([]); setLoading(false) }
      const waited = Date.now() - start
      if (waited >= MIN_LOADING_MS) finish()
      else setTimeout(finish, MIN_LOADING_MS - waited)
    })
  }, [])
  const list = projects.length ? projects : sampleProjects
  const finished = list.filter(p => (p.status === 'finished') || (typeof p.collected === 'number' && typeof p.goal === 'number' && p.collected >= p.goal))
  const funding = list.filter(p => !((p.status === 'finished') || (typeof p.collected === 'number' && typeof p.goal === 'number' && p.collected >= p.goal)))
  const firstMedia = (p) => {
    if (p.media && p.media.length) return p.media[0]
    if (p.images && p.images.length) return p.images[0]
    return null
  }

  // Edit Projects card state
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editFile, setEditFile] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const ownerProjects = list.filter(p => p.owner && user && ((p.owner._id || p.owner) === user._id))

  const handleEditFileChange = (e) => {
    setEditFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
  }

  const submitEdit = async (proj) => {
    if (!editFile) return alert('Select an image to upload')
    setEditLoading(true)
    try {
      const fd = new FormData()
      fd.append('media', editFile)
      // hit backend update route
      const res = await API.put(`/projects/${proj._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      // update local projects state
      const updated = res.data
      setProjects(prev => prev.map(p => p._id === updated._id ? updated : p))
      setEditingProjectId(null)
      setEditFile(null)
      setEditLoading(false)
    } catch (err) {
      console.error(err)
      setEditLoading(false)
      alert('Failed to update project')
    }
  }

  const renderSkeletons = (count = 3) => (
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className="project-card">
        <div className="project-image skeleton skeleton-image" />
        <div className="project-body">
          <div className="skeleton-line skeleton" style={{ width: '80%' }} />
          <div className="skeleton-line skeleton small" />
          <div className="skeleton-line skeleton xsmall" />
        </div>
      </div>
    ))
  )
  if (loading) {
    return (
      <div style={{ padding: '24px 12px', width: '100%' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>Projects Looking for Funding</h2>
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '36px', margin: '0', width: '100%' }}>
          {renderSkeletons(3)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 12px', width: '100%' }}>
      
      <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>Projects Looking for Funding</h2>
      <div className="grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '36px',
        margin: '0',
        width: '100%'
      }}>
        {funding.map(p => (
          <div key={p._id} className="project-card">
            {(() => {
              const img = firstMedia(p)
              return img ? (
                <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={p.title} className="project-image" />
              ) : (
                <div className="project-image" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>No image</div>
              )
            })()}
            <div className="project-body">
              <div className="project-location">
                <span className="loc-icon">📍</span>
                <span>{p.region || p.location || 'Unknown location'}</span>
              </div>
              <h3 className="project-title"><Link to={`/projects/${p._id}`} style={{ color:'inherit', textDecoration:'none' }}>{p.title}</Link></h3>
              <div className="project-desc">{p.shortDescription || p.description}</div>
              <div style={{ marginTop: 'auto' }}>
                <div className="funding-row">
                  <div className="funding-label">Funding Progress</div>
                  <div className="funding-percent">{Math.min(100, Math.round((p.collected/p.goal||0)*100))}%</div>
                </div>
                <div className="progress-wrap">
                  {(() => {
                    const pct = Math.min(100, Math.round((p.collected/p.goal||0)*100))
                    const tier = pct < 40 ? 'progress-low' : (pct < 75 ? 'progress-medium' : 'progress-high')
                    return (
                      <div className="progress-track"><div className={`progress-fill ${tier}`} style={{ width: `${pct}%` }} /></div>
                    )
                  })()}
                </div>
                <div className="stats-row">
                  <div className="stat-item"><span className="stat-icon">💲</span><div><strong style={{color:'var(--text)'}}>${p.collected}</strong><div className="muted" style={{fontSize:12}}>of ${p.goal}</div></div></div>
                  <div className="stat-item"><span className="stat-icon">👥</span><div><strong style={{color:'var(--text)'}}>{p.backers||0}</strong><div className="muted" style={{fontSize:12}}>backers</div></div></div>
                </div>
                <div style={{ marginTop:14 }}>
                  <Link to={`/projects/${p._id}`} className="btn-gradient">Support Project</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2 style={{ margin: '48px 0 24px 0', fontSize: '28px' }}>Finished Projects</h2>
      <div className="grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '36px',
        margin: '0',
        width: '100%'
      }}>
        {finished.map(p => (
          <div key={p._id} className="project-card">
            {(() => {
              const img = firstMedia(p)
              return img ? (
                <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={p.title} className="project-image" />
              ) : (
                <div className="project-image" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>No image</div>
              )
            })()}
            <div className="project-body">
              <div className="project-location">
                <span className="loc-icon">📍</span>
                <span>{p.region || p.location || 'Unknown location'}</span>
              </div>
              <h3 className="project-title"><Link to={`/projects/${p._id}`} style={{ color:'inherit', textDecoration:'none' }}>{p.title}</Link></h3>
              <div className="project-desc">{p.shortDescription || p.description}</div>
              <div style={{ marginTop: 'auto' }}>
                <div className="funding-row">
                  <div className="funding-label">Funding Progress</div>
                  <div className="funding-percent">100%</div>
                </div>
                <div className="progress-wrap">
                  <div className="progress-track"><div className="progress-fill progress-high" style={{ width: '100%' }} /></div>
                </div>
                <div className="stats-row">
                  <div className="stat-item"><span className="stat-icon">💲</span><div><strong style={{color:'var(--text)'}}>${p.collected}</strong><div className="muted" style={{fontSize:12}}>of ${p.goal}</div></div></div>
                  <div className="stat-item"><span className="stat-icon">👥</span><div><strong style={{color:'var(--text)'}}>{p.backers||0}</strong><div className="muted" style={{fontSize:12}}>backers</div></div></div>
                </div>
                <div style={{ marginTop:14 }}>
                  <span className="btn-gradient" style={{ opacity: 0.7, pointerEvents: 'none', filter: 'grayscale(0.5)' }}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
