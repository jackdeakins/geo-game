import { useState, useEffect } from 'react';

const overlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(10,10,20,0.75)',
  backdropFilter: 'blur(4px)',
};

const card = {
  background: '#1a1a2e',
  border: '1px solid #333',
  borderRadius: 16,
  padding: '40px 48px',
  textAlign: 'center',
  color: 'white',
  maxWidth: 420,
  width: '90%',
};

const btn = {
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '12px 32px',
  fontSize: 16,
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: 24,
};

export default function GameOverlay({ phase, target, result, showResult, round, totalRounds, scores, onStart, onNext }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== 'playing') { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 100);
    return () => clearInterval(id);
  }, [phase, round]);

  const totalScore = scores.reduce((s, r) => s + r.total, 0);

  if (phase === 'loading') {
    return (
      <div style={overlay}>
        <div style={card}>Loading map data...</div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={overlay}>
        <div style={card}>Failed to load map. Check your connection and refresh.</div>
      </div>
    );
  }

  if (phase === 'start') {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌍</div>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>GeoGame</h1>
          <p style={{ color: '#aaa', marginBottom: 4 }}>
            You'll be given a country name. Click it on the map as fast as you can.
          </p>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 0 }}>
            Score = speed + accuracy &nbsp;·&nbsp; {totalRounds} rounds
          </p>
          <button style={btn} onClick={onStart}>Start Game</button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const maxScore = totalRounds * 5000;
    const pct = Math.round((totalScore / maxScore) * 100);
    return (
      <div style={overlay}>
        <div style={{ ...card, maxWidth: 480 }}>
          <h2 style={{ fontSize: 26, marginBottom: 16 }}>Game Over!</h2>
          <div style={{ fontSize: 52, fontWeight: 'bold', color: '#4CAF50' }}>
            {totalScore.toLocaleString()}
          </div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
            {pct}% of {maxScore.toLocaleString()} possible
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 16 }}>
            {scores.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 0',
                  fontSize: 13,
                  color: '#ccc',
                  borderBottom: '1px solid #222',
                }}
              >
                <span style={{ color: s.correct ? '#4CAF50' : '#ff9800' }}>
                  {s.correct ? '✓' : '✗'} Round {i + 1}
                </span>
                <span style={{ color: '#888', fontSize: 12 }}>
                  {Math.round(s.distKm).toLocaleString()} km &nbsp;·&nbsp; {(s.timeMs / 1000).toFixed(1)}s
                </span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{s.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button style={btn} onClick={onStart}>Play Again</button>
        </div>
      </div>
    );
  }

  // playing or result — show HUD
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(20,20,40,0.88)',
          backdropFilter: 'blur(8px)',
          padding: '12px 28px',
          borderRadius: 12,
          color: 'white',
          display: 'flex',
          gap: 28,
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#ccc', fontSize: 15, fontWeight: 'bold' }}>
          {round + 1} / {totalRounds}
        </span>
        <span style={{ fontSize: 22, fontWeight: 'bold', minWidth: 180, textAlign: 'center' }}>
          {target?.name}
        </span>
        <span style={{ color: '#f0c040', fontSize: 15, fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{totalScore.toLocaleString()} pts</span>
      </div>

      {phase === 'playing' && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: elapsed >= 30 ? 'rgba(244,67,54,0.2)' : 'rgba(20,20,40,0.75)',
            border: `1px solid ${elapsed >= 30 ? '#f44336' : '#555'}`,
            borderRadius: 999,
            padding: '4px 0',
            width: 72,
            textAlign: 'center',
            color: elapsed >= 30 ? '#f44336' : '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            fontVariantNumeric: 'tabular-nums',
            transition: 'background 0.3s, border-color 0.3s, color 0.3s',
          }}
        >
          {elapsed}s
        </div>
      )}

      {phase === 'result' && result && showResult && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(20,20,40,0.92)',
            backdropFilter: 'blur(8px)',
            padding: '18px 36px',
            borderRadius: 12,
            color: 'white',
            textAlign: 'center',
            minWidth: 260,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 10,
              color: result.correct ? '#4CAF50' : '#ff9800',
            }}
          >
            {result.correct
              ? 'Correct!'
              : `${Math.round(result.distKm).toLocaleString()} km away`}
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', fontSize: 14, color: '#aaa', marginBottom: 14 }}>
            <span>Speed +{result.timeScore}</span>
            <span>Accuracy +{result.distScore}</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>=&nbsp;{result.total}</span>
          </div>
          <button
            onClick={onNext}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 28px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
