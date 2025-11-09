import React, { useState } from 'react'
import API from '../api'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const submit = async (e)=>{
    e.preventDefault()
    setStatus(null)
    try{
      await API.post('/auth/forgot', { email })
      setStatus('If that email exists we sent a reset link. Check your inbox.')
    }catch(err){
      setStatus('Error sending reset email')
    }
  }
  return (
    <div className="card" style={{ maxWidth:420, margin:'20px auto' }}>
      <h2>Forgot password</h2>
      <form onSubmit={submit}>
        {status && <div style={{ marginBottom:8 }}>{status}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ width:'100%', padding:8, marginTop:8 }} />
        <button className="btn" style={{ marginTop:12 }}>Send reset email</button>
      </form>
    </div>
  )
}
