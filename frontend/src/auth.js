import React, { createContext, useContext, useEffect, useState } from 'react'
import API from './api'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    API.get('/users/me').then(r=>{ setUser(r.data); setLoading(false) }).catch(()=>{ setLoading(false) })
  },[])

  const login = (token) => {
    localStorage.setItem('token', token)
    API.get('/users/me').then(r=> setUser(r.data)).catch(()=> setUser(null))
  }
  const logout = () => { localStorage.removeItem('token'); setUser(null) }
  return React.createElement(AuthContext.Provider, { value: { user, setUser, login, logout, loading } }, children)
}

export function useAuth(){ return useContext(AuthContext) }

export default AuthProvider
