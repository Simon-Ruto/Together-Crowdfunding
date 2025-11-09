import React, { useState, useEffect } from 'react'
import API from '../api'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ResetPassword(){
  const [search] = useSearchParams()
  const token = search.get('token')
  const email = search.get('email')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const nav = useNavigate()
  useEffect(()=>{
    if(!token || !email) setStatus('Missing token or email in reset link')
  },[])
  const submit = async (e)=>{
    e.preventDefault()
    try{
      await API.post('/auth/reset', { token, email, password })
      setStatus('Password reset. You can now log in.')
      setTimeout(()=>nav('/login'),1500)
    }catch(err){
      setStatus(err.response?.data?.message || 'Error resetting password')
    }
  }
  return (
    <div className="card" style={{ maxWidth:420, margin:'20px auto' }}>
      <h2>Reset password</h2>
      <form onSubmit={submit}>
        {status && <div style={{ marginBottom:8 }}>{status}</div>}
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" type="password" style={{ width:'100%', padding:8, marginTop:8 }} />
        <button className="btn" style={{ marginTop:12 }}>Set new password</button>
      </form>
    </div>
  )
}
