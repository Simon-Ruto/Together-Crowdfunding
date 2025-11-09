import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../api'
import sampleProjects from '../sampleProjects'

export default function ProjectDetail(){
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  useEffect(()=>{ API.get(`/projects/${id}`).then(r=>setData(r.data)).catch(()=>{
    // fallback to sample project
    const sp = sampleProjects.find(s=>s._id === id) || sampleProjects[0]
    setData({ project: sp, updates: [] })
  }) },[id])

  const fund = async ()=>{
    // validate amount
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) { alert('Please enter a valid amount'); return }

    // Try Stripe Checkout first
    try {
      const r = await API.post(`/payments/checkout/${id}`, { amount: amountNum })
      if (r.data?.url) {
        // redirect to Stripe-hosted Checkout
        window.location.href = r.data.url
        return
      }
    } catch (err) {
      console.warn('Stripe checkout failed, falling back to simple fund:', err.response?.data || err.message || err)
      alert(err.response?.data?.message || 'Stripe checkout failed, falling back to simple fund')
    }
    // fallback: simple fund endpoint
    try {
      await API.post(`/projects/${id}/fund`, { amount: amountNum })
      const r2 = await API.get(`/projects/${id}`)
      setData(r2.data)
      setAmount('')
    } catch (err) {
      console.error('Fallback funding failed', err)
      alert(err.response?.data?.message || 'Failed to process funding')
    }
  }

  const postUpdate = async (e)=>{
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      await API.post(`/projects/${id}/updates`, form)
      const r = await API.get(`/projects/${id}`)
      setData(r.data)
      setMessage('')
    } catch (err) {
      console.error('Post update failed', err)
      alert(err.response?.data?.message || 'Failed to post update')
    }
  }

  if(!data) return <div>Loading...</div>
  const { project, updates } = data
  const isRealProject = /^[0-9a-fA-F]{24}$/.test(project._id)
  const importSample = async () => {
    try {
      const r = await API.post('/projects/import-sample')
      // redirect to the newly created project
      window.location.href = `/projects/${r.data._id}`
    } catch (err) {
      console.error('Import sample failed', err)
      alert(err.response?.data?.message || 'Failed to import sample')
    }
  }
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 320px', 
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px 20px'
    }}>
      <div>
        <div className="card" style={{ 
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          {project.media && project.media.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <img 
                src={`http://localhost:5000${project.media[0]}`}
                alt={project.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              {project.media.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '15px',
                  overflowX: 'auto',
                  padding: '5px 0'
                }}>
                  {project.media.slice(1).map((img, index) => (
                    <img 
                      key={index}
                      src={`http://localhost:5000${img}`}
                      alt={`${project.title} - image ${index + 2}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        ':hover': {
                          border: '2px solid var(--accent)'
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ padding: '24px' }}>
            <h2 style={{ 
              fontSize: '28px',
              marginBottom: '16px',
              color: '#333'
            }}>{project.title}</h2>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {project.owner?.avatar && (
                <img 
                  src={`http://localhost:5000${project.owner.avatar}`}
                  alt={project.owner?.username}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div>
                <div style={{ fontWeight: 500 }}>by {project.owner?.username}</div>
                <div style={{ color: '#666', fontSize: '14px' }}>{project.owner?.region}</div>
              </div>
            </div>

            <div style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#444',
              marginBottom: '24px'
            }}>
              {project.description}
            </div>

            <div style={{ 
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
                    ${project.collected}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    of ${project.goal} goal
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {Math.round((project.collected/project.goal) * 100)}%
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    funded
                  </div>
                </div>
              </div>
              <div style={{ 
                height: '8px',
                background: '#e6eef8',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min(100, Math.round((project.collected/project.goal) * 100))}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ 
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333'
          }}>Updates</h3>
          
          {updates.length === 0 && (
            <div style={{ 
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              No updates yet.
            </div>
          )}
          
          {updates.map(u => (
            <div key={u._id} className="card" style={{ 
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              padding: '20px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {u.author?.avatar && (
                  <img 
                    src={`http://localhost:5000${u.author.avatar}`}
                    alt={u.author?.username}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 500 }}>{u.title}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>by {u.author?.username}</div>
                </div>
              </div>
              
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#444',
                marginBottom: '16px'
              }}>{u.message}</p>
              
              {u.images?.length > 0 && (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '10px',
                  marginTop: '16px'
                }}>
                  {u.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={`http://localhost:5000${img}`} 
                      alt="" 
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside>
        <div className="card" style={{ 
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)',
          position: 'sticky',
          top: '20px'
        }}>
          <h4 style={{ 
            fontSize: '20px',
            marginBottom: '16px',
            color: '#333'
          }}>Support this project</h4>
          {isRealProject ? (
            <>
              <input 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount (USD)"
                type="number"
                min="1"
                step="1"
                style={{ 
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
              
              <button 
                className="btn"
                onClick={fund}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                Fund with Card
              </button>
            </>
          ) : (
            <div style={{ padding: '12px', background: '#fff8e6', borderRadius: 6, color: '#7a5a00', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <div>This is a sample project (offline). Import it into the database to interact.</div>
              <button onClick={importSample} style={{ padding: '8px 12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Import Sample</button>
            </div>
          )}
        </div>

        <div className="card" style={{ 
          marginTop: '20px',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            fontSize: '20px',
            marginBottom: '16px',
            color: '#333'
          }}>Post update (owner only)</h4>
          
          {isRealProject ? (
            <form onSubmit={postUpdate} encType="multipart/form-data">
            <input 
              name="title"
              placeholder="Update title"
              style={{ 
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '15px'
              }}
            />
            
            <textarea 
              name="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Share your progress..."
              style={{ 
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '15px',
                minHeight: '120px',
                resize: 'vertical'
              }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontSize: '14px'
              }}>
                Add photos (optional)
              </label>
              <input 
                type="file"
                name="media"
                multiple
                accept="image/*"
                style={{ 
                  width: '100%'
                }}
              />
            </div>
            
            <button 
              type="submit"
              className="btn"
              style={{ 
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              Post Update
            </button>
            </form>
          ) : (
            <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: 6, color: '#555' }}>
              Updates are disabled for sample projects. Run the backend and use a real project to post updates.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
