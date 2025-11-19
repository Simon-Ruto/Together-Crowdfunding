import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import API from '../api'

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(project.images || [])
  const [previewUrls, setPreviewUrls] = useState([])
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    goal: project.goal || '',
    region: project.region || '',
    callToAction: project.callToAction || ''
  })

  useEffect(() => {
    // Create preview URLs for uploaded files
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviewUrls(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [files])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Move image up in order (towards primary position)
  const moveUp = (index, isExisting) => {
    if (index === 0) return
    if (isExisting) {
      setImages(prev => {
        const newArr = [...prev]
        const temp = newArr[index]
        newArr[index] = newArr[index - 1]
        newArr[index - 1] = temp
        return newArr
      })
    } else {
      setFiles(prev => {
        const newArr = [...prev]
        const temp = newArr[index]
        newArr[index] = newArr[index - 1]
        newArr[index - 1] = temp
        return newArr
      })
    }
  }

  const handleSave = async () => {
    setUploading(true)
    try {
      const fd = new FormData()
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') fd.append(key, value)
      })
      // Add files
      files.forEach(f => fd.append('media', f))
      // Send updated image order
      fd.append('images', JSON.stringify(images))
      const res = await API.put(`/projects/${project._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSave(res.data)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to update project')
    }
    setUploading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 12,
        width: '90%',
        maxWidth: 800,
        maxHeight: '90vh',
        overflow: 'auto',
        padding: 24,
        position: 'relative'
      }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text)' }}>Edit Project</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Project Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)',
              minHeight: '100px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Location</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Funding Goal</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }}>$</span>
            <input
              type="number"
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px 8px 28px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text)'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Call to Action</label>
          <input
            type="text"
            name="callToAction"
            value={formData.callToAction}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Images</label>
          
          <div style={{ marginBottom: '20px' }}>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ marginBottom: 16 }} />
          </div>
        </div>

        <button onClick={onClose} style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 0,
          fontSize: 24,
          cursor: 'pointer',
          color: 'var(--muted)'
        }}>×</button>

        <div>
          <h4 style={{ marginBottom: 12 }}>Current Images</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', background: '#f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt="" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='data:image/png;base64,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'}} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                  {i > 0 && (
                    <button onClick={() => moveUp(i, true)} className="btn" style={{ padding: '4px 8px', fontSize: 12 }}>↑</button>
                  )}
                  <button onClick={() => removeExistingImage(i)} className="btn" style={{ padding: '4px 8px', fontSize: 12 }}>×</button>
                </div>
                {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', fontSize: 12 }}>Primary</div>}
              </div>
            ))}
          </div>

          <h4 style={{ marginBottom: 12 }}>Upload New Images</h4>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ marginBottom: 16 }} />

          {previewUrls.length > 0 && (
            <>
              <h4 style={{ marginBottom: 12 }}>New Images to Upload</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                {previewUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', background: '#f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={url} alt="" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='data:image/png;base64,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'}} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                      {i > 0 && (
                        <button onClick={() => moveUp(i, false)} className="btn" style={{ padding: '4px 8px', fontSize: 12 }}>↑</button>
                      )}
                      <button onClick={() => removeFile(i)} className="btn" style={{ padding: '4px 8px', fontSize: 12 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button onClick={handleSave} className="btn-gradient" disabled={uploading}>
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Profile(){
  const { id } = useParams()
  const { user: me, setUser: setMe } = useAuth()
  const [user, setUser] = useState(null)
  const [ownerProjects, setOwnerProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [editing, setEditing] = useState(false)

  const fetchProjects = async () => {
    if (!me) return
    if (me && id && me._id !== id) return
    try {
      const r = await API.get('/projects')
      const list = r.data || []
      const mine = list.filter(p => (p.owner && ((p.owner._id || p.owner) === me._id)))
      setOwnerProjects(mine)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setOwnerProjects([])
    }
  }

  useEffect(()=>{ if(id) API.get(`/users/${id}`).then(r=>setUser(r.data)) },[id])
  // when no id (viewing own profile), populate from auth context
  useEffect(() => {
    if (!id && me) setUser(me)
  }, [id, me])
  
  // load user's projects when viewing own profile
  useEffect(() => {
    fetchProjects()
  }, [me, id])
  if(!user) return <div>Loading...</div>

  const handleProjectSave = async (updatedProject) => {
    // Update local state immediately for better UX
    setOwnerProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p))
    // Refetch projects to ensure we have the latest data
    await fetchProjects()
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    try {
      await API.delete(`/projects/${projectId}`)
      // Remove from local state
      setOwnerProjects(prev => prev.filter(p => p._id !== projectId))
      alert('Project deleted successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to delete project')
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const submit = async (e)=>{
    e.preventDefault()
    const form = new FormData(e.target)
    const r = await API.put('/users/me', form)
    setUser(r.data)
    if(setMe) setMe(r.data)
    setEditing(false)
    setAvatarPreview(null)
  }

  const isMe = me && me._id === user._id
  const firstMedia = (p) => {
    if (p.media && p.media.length) return p.media[0]
    if (p.images && p.images.length) return p.images[0]
    return null
  }

  const handleEditFileChange = (e) => {
    setEditFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
  }

  const submitEdit = async (proj) => {
    if (!editFile) return alert('Select an image to upload')
    setEditLoading(true)
    try {
      const fd = new FormData()
      fd.append('media', editFile)
      const res = await API.put(`/projects/${proj._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const updated = res.data
      setOwnerProjects(prev => prev.map(p => p._id === updated._id ? updated : p))
      setEditingProjectId(null)
      setEditFile(null)
      setEditLoading(false)
    } catch (err) {
      console.error(err)
      setEditLoading(false)
      alert('Failed to update project')
    }
  }
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div className="card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '3px solid #007bff',
              margin: '0 auto 15px'
            }}>
              <img 
                src={user.avatar ? `http://localhost:5000${user.avatar}` : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAMAAABlASxnAAAAXVBMVEX///+zs7OwsLD29vbBwcG9vb3q6ur5+fnW1tb8/Py3t7fGxsbe3t7Z2dnz8/Pk5OTn5+fu7u7R0dHt7e3c3NzKysrNzc3g4ODU1NS6urrp6enw8PD7+/vDw8Pi4uJEqp1jAAAG+ElEQVR4nO2d65ajIAyAg4qiFrXeqvb9H3OltV5AAYkzsDvn5Pvb3bNl+BEgCYHQYhEEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRCErmRxnHn9iFfk8Wi73R6P+ahfsE0YKQngX7QuD8HoX7ETi3EF6VBxG436JRvxXQkr6Pxr3F5J5d4LmE4/9Fsm5d4JQuU/KPtWQPj4i0DpD/6S7fZPUkbMo1YcHhGS+kO/4lAupAmQQB2gP/QzYqh1gBnVvmU1QlJHmFEd0tRKEJI6wSxXRlbUvuWwYV5NQKXHlgV+uYrAFn1kSUXEJU0Hc/YPi/qQ0UQdhFcqkfVERb2UQT38n5S1caOiFqqyAu/XQr1JKZXQeYJeGx82B8h1AV4KnScGWemVQGf5Jg1hZSvBDUuO1Bn1WSo1Qv9IQLOVIsMVkXW82bmL0uV8PYr6Jd8KmeWr4K5txazOb/GR3TRke1oONHzLntC9E6qie3Ya6Mu1ILMcVjjsVYBwnVIVN4FriG7OBbauYLVGGSHUP0HJlfSiuX2wf1yFXL/OZ6eLt/rD5bR/ZCW2KTXUb4yKEkNfzshcmpWGkwWkXl2AdMnzPCVFHYBdmi9/HfR5MSOreXhgdoKg+Ocd1DVXX4ejC8OyDpDSXSEAPPR8WZWkKRQPH6WfF7Ky6mAP1mJLZYur+fYs2kXTEq2xN2bkCDuxsEl7YW2j9dZc9oBHFhvMi+9qo0eQ56lj0/HnBm4x+YHiO3zqT+D7vzlJWEwLX9YTWojcvVYF7aDGVlu7L1vU0tDWAfb6LzTc2VZHnX5ZqPyBsQ/RYvrjl31kHcBYIYGs7TMJ+8AiUZ4ssCOxZ+K12W49GTixg8T1Q9gHn6wUrtEQsaSORn5tLCz2VgNrGjgmVbcw+LCYQ2e6j3kqB1VhuyBvskttlsFhQQTcsgUQazpOdCJitNe3ZS33EPWDhjAGCMVrnawkS1h0ouGoRrDtRvkQ0OCFQHMrJ6xmdLoM9UuG+zEtZP46Ri5zPJOOX8Y1+GBR/B2+WeHRFySW5RXSMjpGcB8tA0OkOx1A+qiPEtLPTLJe4yE9KtfPrCOcamtL/cq2RCW/e9ePYXo7pC1MtIWH4O/mvY1njRQoLb+zXJSpzR2C6hIOZACyhbGKdWNa1UGdMaB+gTYR2Bm6WhBtYRrBBEu9B7R1/Ta6ioAn6XB0OwwRfQ0H7DIMJ3YIr7ukTOJ0T/LbAolHjnGTtF56bDucIpVF6hT9C5YewbL5wfnjPKxasLSeDqdYmNsSkauQxD+fy3uOcmsLW14nLLXXg27hHrC8InzgEP/Yr+MWCB8BjK4ZtE2Y9Ok8QJu2eYMWP4PlCLAjxVFt+Oeq7UoRkGkJ7sxlqMGi7Vm6ljNYzPCcYsEjbSoPkFlHoRF9z0niOosXvp5VLtRd+iKASOYsK7c9XtosqYKH2hErwTIH1YmHrEQ2dRBsbIzKyWkNQ6KXlTZHgEo5EVK0YrqHX5esWFxa0CWAAmgR5uxhm/Ozw/Q4zutqD+yGBpEixCV2yHHVVqEVNxtW40B4xiRqNG9bSI54T0/nXJqFZHtqVD2GI0JUiXqzviC8WgHiNxZfhp3qvKxeBSi8qyMr42fD37L+cE1cKz7//YUjjBllQ1A5NYl6nPOwXPpxw77/TEET9uWkYzK7JKtrUHLbQW+byN33OTmrKbLdfDopJnSaNu2V+nEVHa20YGLc+BEeYG7Hlr3ZElvFNNBpwiRNOBY4elB6KTLdTdRojhePL2sCtWEwzTgXxmx7GHLTE6ICkyeMbTKErHW51BXIiNHx4mCa0WjCuOkxpKqlFohDk56FoFxsGx0Y65ZtizCqHJ2U+W7+PVnR3beHh5k1gVr53TcyysrW6e4+L0RF1HzXenFgxbZkOYVJNMEMR8xpsFQvbMChPF//+ekIuzBZ11aPtQnBbLHvyQJf5DlC1PH47qBuvdSELazF8QSyUcuiwTjx1MuQaHPe+GxYQKQUaq7z+pRLX1dyG8/JfH24F+paE8BVNJwx4UzshUXtiFpbC/+rdI2KEqaAa0kAOPh8GNz5V80YNB8XYW/e6Sx2sl/S1AoZDzmwH/WCBc1vD7YxBJYsCNKGlZoU1Lgky6K1Z9I7+/q0jiRL0fvbP5dewaXVli5P2vhF+2PqreR1WGyBP4p1PLoOtsjk7kAEp0SHkVLJZIMv7G+reMwdt43RdyPIOF6Hhvh0kq9HuSmR0Wcu6jRtCTMaBE9VudEwPUv2Qv/8VnrXfyfhqkzNdsjaNLZB8g32+6jwTXr0zyMIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiAIgiBm5B+DpnKwAGzFaAAAAABJRU5ErkJggg=='} 
                alt="avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {isMe && !editing && (
              <button 
                className="btn" 
                onClick={()=>setEditing(true)}
                style={{ 
                  background: '#007bff',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '10px', fontSize: '24px' }}>{user.username}</h2>
            <p className="muted" style={{ marginBottom: '15px', color: '#666' }}>
              <span style={{ marginRight: '15px' }}>{user.region || 'No region set'}</span>
              {user.age && <span>• {user.age} years old</span>}
            </p>
            <p style={{ lineHeight: '1.6' }}>{user.bio || 'No bio yet'}</p>
          </div>
        </div>
      </div>

          {isMe && (
            <div style={{ display:'flex', justifyContent:'center', marginTop:20 }}>
              <div className="card" style={{ width:340, textAlign:'center', padding:18, borderRadius:12 }}>
                <div style={{ width:100, height:100, margin:'0 auto', borderRadius:999, overflow:'hidden', border:'6px solid #10b981' }}>
                  <img src={user.avatar ? `http://localhost:5000${user.avatar}` : 'data:image/png;base64,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'} alt={user.username} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <h3 style={{ marginTop:12 }}>{user.username}</h3>
                <div style={{ color:'var(--muted)', marginBottom:12 }}>{user.region || ''}</div>
                <div style={{ textAlign:'left' }}>
                  <h4 style={{ margin:'12px 0 6px 0' }}>Edit Projects</h4>
                  {ownerProjects.length === 0 && <div className="muted">You have no projects</div>}
                  {ownerProjects.map(p => (
                    <div key={p._id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ width:48, height:36, overflow:'hidden', borderRadius:6, background:'#f0f0f0' }}>
                        {(() => { const im = firstMedia(p); return im ? <img src={im.startsWith('http') ? im : `http://localhost:5000${im}`} alt="thumb" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='data:image/png;base64,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'}} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{width:'100%',height:'100%'}}/> })()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700 }}>{p.title}</div>
                        <div className="muted" style={{ fontSize:12 }}>{Math.min(100, Math.round((p.collected/p.goal||0)*100))}% funded</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn" onClick={() => setEditingProject(p)} style={{ padding:'6px 8px' }}>Edit</button>
                        <button className="btn" onClick={() => handleDeleteProject(p._id)} style={{ padding:'6px 8px', background: '#ef4444', color: 'white', border: 'none' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {editingProject && (
                  <EditProjectModal 
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSave={handleProjectSave}
                  />
                )}
              </div>
            </div>
          )}
      {editing && (
        <form onSubmit={submit} encType="multipart/form-data" className="card" style={{ marginTop: '20px', padding: '30px' }}>
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <input type="file" name="avatar" onChange={handleAvatarChange} accept="image/*" />
            {avatarPreview && (
              <div style={{ marginTop: '10px' }}>
                <img src={avatarPreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input name="username" defaultValue={user.username} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input name="age" type="number" defaultValue={user.age} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Region</label>
            <input name="region" defaultValue={user.region} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">About</label>
            <textarea name="bio" defaultValue={user.bio} className="form-textarea" />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary">Save Changes</button>
            <button onClick={(e)=>{ e.preventDefault(); setEditing(false); setAvatarPreview(null) }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
