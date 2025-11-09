import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import API from '../api'

export default function PaymentSuccess(){
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('Confirming...')
  const nav = useNavigate()
  useEffect(()=>{
    const session_id = searchParams.get('session_id')
    const project = searchParams.get('project')
    if(!session_id || !project){ setStatus('Missing session or project'); return }
    API.post('/payments/confirm',{ session_id, project }).then(r=>{
      setStatus('Payment confirmed!')
      setTimeout(()=>nav(`/projects/${project}`), 1500)
    }).catch(e=>{
      setStatus('Could not confirm payment')
    })
  },[])
  return <div><h2>{status}</h2></div>
}
