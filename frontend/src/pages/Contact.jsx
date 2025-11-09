import React from 'react';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ 
        fontSize: '2.5em',
        marginBottom: '24px',
        color: 'var(--accent)',
        textAlign: 'center'
      }}>Contact Us</h1>

      <div style={{ 
        display: 'grid',
        gap: '32px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))'
      }}>
        {/* Contact Information */}
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.8em', marginBottom: '24px', color: '#333' }}>Get in Touch</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2em', marginBottom: '8px', color: 'var(--accent)' }}>Office Location</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              123 Innovation Way<br />
              Silicon Valley<br />
              California, 94025<br />
              United States
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2em', marginBottom: '8px', color: 'var(--accent)' }}>Contact Details</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Email: support@together.com<br />
              Phone: +1 (555) 123-4567<br />
              Hours: Mon-Fri, 9AM-6PM PST
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2em', marginBottom: '8px', color: 'var(--accent)' }}>Social Media</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Twitter</a>
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>LinkedIn</a>
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Facebook</a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.8em', marginBottom: '24px', color: '#333' }}>Send us a Message</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="name"
                style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#444',
                  fontWeight: 500
                }}
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="email"
                style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#444',
                  fontWeight: 500
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Your email"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="message"
                style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#444',
                  fontWeight: 500
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                placeholder="Your message"
                rows="5"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              style={{ 
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}