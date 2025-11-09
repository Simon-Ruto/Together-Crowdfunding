import React from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateProject(){
  const nav = useNavigate()
  const [previews, setPreviews] = React.useState([])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setPreviews(files.map(file => URL.createObjectURL(file)))
  }

  const submit = async (e)=>{
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      await API.post('/projects', form)
      nav('/')
    } catch (err) {
      console.error('Create project failed', err)
      alert(err.response?.data?.message || 'Failed to create project')
    }
  }

  return (
    <div>
      <form onSubmit={submit} encType="multipart/form-data" className="create-card">
        <h2 className="create-heading">Start Your Climate Project</h2>

        <div className="form-group">
          <label className="form-label">Project Title</label>
          <input name="title" placeholder="e.g., Urban Forest Restoration in Downtown" className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" placeholder="Describe your project in detail" className="form-textarea" />
        </div>

        <div className="form-group">
          <label className="form-label">Project Location</label>
          <input name="region" placeholder="Enter project location" className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Funding Goal</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
            <input name="goal" type="number" placeholder="Enter amount needed" className="form-input" style={{ paddingLeft: '28px' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Call to Action</label>
          <input name="callToAction" placeholder="What do you want supporters to do?" className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Project Images</label>
          <input type="file" name="media" multiple onChange={handleImageChange} accept="image/*" className="file-input" />
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {previews.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn-submit">Submit Project</button>
      </form>
    </div>
  )
}
