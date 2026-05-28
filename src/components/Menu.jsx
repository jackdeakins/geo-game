import { useState } from 'react';
import Africa from '../assets/af.png';
import NA from '../assets/na.png';
import Europe from '../assets/eu.png';
import Oceania from '../assets/au.png';

const menuItemStyle = {
  height: '80px',
  backgroundSize: '110%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  border: 'none',
  borderRadius: '6px',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px 20px',
  textAlign: 'center',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  width: '100%',
  letterSpacing: '0.05em',
};

const items = [
  { label: 'Home',        img: Africa,  size: '120%', pos: '95% 15%' },
  { label: 'Play',        img: NA,      size: '200%', pos: '65% 70%' },
  { label: 'Leaderboard', img: Europe,  size: '110%', pos: '60% 60%' },
  { label: 'Settings',    img: Oceania, size: '200%', pos: '33% 40%' },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{ position: 'fixed', top: 16, left: 16, zIndex: 10000, width: 'fit-content' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        style={{
          background: 'rgba(20,20,40,0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #444',
          borderRadius: 8,
          padding: '8px 14px',
          cursor: 'pointer',
          color: 'white',
          fontSize: 20,
        }}
      >
        {open ? '✕' : '☰'}
      </button>

      <div
        style={{
          marginTop: 4,
          background: 'rgba(20,20,40,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8,
          padding: '4px',
          display: 'flex',
          gap: 4,
          flexDirection: 'column',
          minWidth: 180,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          border: '1px solid #333',
          overflow: 'hidden',
          maxHeight: open ? 900 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
        }}
      >
        {items.map(({ label, img, size, pos }) => (
          <button
            key={label}
            style={{
              ...menuItemStyle,
              backgroundImage: `url(${img})`,
              backgroundSize: size,
              backgroundPosition: pos,
              boxShadow: hovered === label
                ? 'inset 0 0 0 1000px rgba(0,0,0,0.55)'
                : 'inset 0 0 0 1000px rgba(0,0,0,0.38)',
            }}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
