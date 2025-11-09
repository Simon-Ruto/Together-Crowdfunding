import React from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useState } from 'react'

export default function Register(){
  const nav = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const submit = async (e)=>{
    e.preventDefault()
    setError(null)
    const form = new FormData(e.target)
    const body = { username: form.get('username'), email: form.get('email'), password: form.get('password') }
    try{
      const r = await API.post('/auth/register', body)
      login(r.data.token)
      nav('/')
    }catch(err){
      setError(err.response?.data?.message || 'Registration failed')
    }
  }
  return (
    <div className="card" style={{ maxWidth:420, margin:'20px auto' }}>
      <h2>Create account</h2>
      <form onSubmit={submit}>
        {error && <div style={{ color:'crimson', marginBottom:8 }}>{error}</div>}
        <input name="username" placeholder="Username" style={{ width:'100%', padding:8, marginTop:8 }} />
        <input name="email" placeholder="Email" autoComplete="email" style={{ width:'100%', padding:8, marginTop:8 }} />
        <input name="password" placeholder="Password" type="password" autoComplete="new-password" style={{ width:'100%', padding:8, marginTop:8 }} />
        <button className="btn" style={{ marginTop:12 }}>Register</button>
      </form>
    </div>
  )
}
