import React from 'react';
import { Link } from 'react-router-dom';
import sampleProjects from '../sampleProjects';

export default function Home() {
  return (
    <main style={{ minHeight: '70vh', background: 'var(--surface)' }}>
      <section style={{ textAlign: 'center', padding: '60px 0 36px 0', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
          Have a vision? <span style={{ color: 'var(--accent)' }}>Let's make it real.</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--muted)', marginBottom: 32 }}>
          Together connects creators with supporters — simple, clear, and community-first.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 8 }}>
          <Link to="/create" style={{ background: 'var(--accent)', color: 'white', padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: '1.1em', boxShadow: '0 2px 8px rgba(2,6,23,0.10)' }}>Start a Project</Link>
          <Link to="/projects" style={{ border: '1.5px solid var(--accent)', color: 'var(--accent)', padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: '1.1em' }}>Explore Projects</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 60px 16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 24, textAlign: 'center' }}>Featured Projects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 28 }}>
          {sampleProjects.map(p => (
            <div key={p._id} style={{ background: 'var(--card)', borderRadius: 12, boxShadow: '0 4px 18px rgba(2,6,23,0.10)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 2 }}>{p.owner?.region || 'Unknown region'}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{p.title}</h3>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{p.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--muted)' }}>
                <span><strong style={{ color: 'var(--accent)' }}>${p.collected}</strong> / ${p.goal}</span>
                <span>by {p.owner?.username}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(5,150,105,0.10)', borderRadius: 6, overflow: 'hidden', margin: '8px 0 0 0' }}>
                <div style={{ width: `${Math.min(100, Math.round((p.collected/p.goal||0)*100))}%`, height: '100%', background: 'linear-gradient(90deg,#34d399,#06b6d4)', borderRadius: 6, transition: 'width .5s cubic-bezier(.2,.9,.2,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}