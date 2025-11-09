import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login(){
  const nav = useNavigate()
  const { login, user } = useAuth()
  const [error, setError] = useState(null)

  // If already logged in, redirect to home using effect to avoid navigation during render
  useEffect(() => {
    if (user) {
      // navigate imperatively after render
      nav('/')
    }
  }, [user, nav])
  const submit = async (e)=>{
    e.preventDefault()
    setError(null)
    const form = new FormData(e.target)
    const body = { email: form.get('email'), password: form.get('password') }
    try{
      const r = await API.post('/auth/login', body)
      login(r.data.token)
      // navigation will be handled by effect when `user` updates
    }catch(err){
      setError(err.response?.data?.message || 'Login failed')
    }
  }
  return (
    <div className="card" style={{ maxWidth:420, margin:'20px auto' }}>
      <h2>Sign in</h2>
      <form onSubmit={submit}>
        {error && <div style={{ color:'crimson', marginBottom:8 }}>{error}</div>}
        <input name="email" placeholder="Email" autoComplete="email" style={{ width:'100%', padding:8, marginTop:8 }} />
        <input name="password" placeholder="Password" type="password" autoComplete="current-password" style={{ width:'100%', padding:8, marginTop:8 }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
          <button className="btn">Login</button>
          <a href="/forgot" style={{ fontSize:13 }}>Forgot password?</a>
        </div>
      </form>
    </div>
  )
}
