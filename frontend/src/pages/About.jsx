import React from 'react';

export default function About() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ 
        fontSize: '2.5em',
        marginBottom: '24px',
        color: 'var(--accent)',
        textAlign: 'center'
      }}>About Together</h1>

      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8em', marginBottom: '16px', color: '#333' }}>Our Mission</h2>
          <p style={{ fontSize: '1.1em', lineHeight: '1.6', color: '#555' }}>
            Together is a platform that connects visionary creators with passionate supporters. 
            We believe in the power of community-driven projects and aim to make crowdfunding 
            accessible, transparent, and effective for everyone.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8em', marginBottom: '16px', color: '#333' }}>What We Do</h2>
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.2em', marginBottom: '12px', color: 'var(--accent)' }}>Connect</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                We bring creators and supporters together, fostering meaningful collaborations.
              </p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.2em', marginBottom: '12px', color: 'var(--accent)' }}>Support</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                We provide the tools and platform needed to bring creative projects to life.
              </p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.2em', marginBottom: '12px', color: 'var(--accent)' }}>Grow</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                We help projects reach their goals and create lasting impact.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.8em', marginBottom: '16px', color: '#333' }}>Our Values</h2>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gap: '16px'
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2em' }}>✦</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Transparency</strong>
                <p style={{ color: '#666', margin: 0 }}>Clear and open communication in all our operations</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2em' }}>✦</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Community</strong>
                <p style={{ color: '#666', margin: 0 }}>Building strong connections between creators and supporters</p>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '1.2em' }}>✦</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Innovation</strong>
                <p style={{ color: '#666', margin: 0 }}>Embracing new ideas and creative solutions</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}