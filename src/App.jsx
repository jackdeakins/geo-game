import { useState, useEffect, useRef } from 'react';
import GameMap from './components/GameMap';
import GameOverlay from './components/GameOverlay';
import Menu from './components/Menu';
import LandingPage from './components/LandingPage';

const TOTAL_ROUNDS = 10;
const GEOJSON_URL = '/countries.geojson';

function centroid(feature) {
    const geom = feature.geometry;
    let ring = [];
    if (geom.type === 'Polygon') {
        ring = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
            if (poly[0].length > ring.length) ring = poly[0];
        }
    }
    if (!ring.length) return [0, 0];
    return [
        ring.reduce((s, c) => s + c[1], 0) / ring.length,
        ring.reduce((s, c) => s + c[0], 0) / ring.length,
    ];
}

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const r = x => (x * Math.PI) / 180;
    const a =
        Math.sin(r(lat2 - lat1) / 2) ** 2 +
        Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcScore(timeMs, distKm, correct) {
    const timeSec = timeMs / 1000;
    const correctBonus = correct ? 1000 : 0;
    const distScore = Math.round(2500 * Math.exp(-distKm / 1500));
    const timeScore = Math.max(0, Math.round(1000 - timeSec * 33));
    return { correctBonus, timeScore, distScore, total: correctBonus + timeScore + distScore };
}

export default function App() {
    const [geoData, setGeoData] = useState(null);
    const [countries, setCountries] = useState([]);
    const [phase, setPhase] = useState('loading');
    const [round, setRound] = useState(0);
    const [target, setTarget] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [scores, setScores] = useState([]);
    const [result, setResult] = useState(null);
    const [showHighlight, setShowHighlight] = useState(false);
    const [hardMode, setHardMode] = useState(false);
    const [satellite, setSatellite] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const pendingRef = useRef(false);
    const countriesRef = useRef([]);
    const timerIdsRef = useRef([]);
    const pendingScoresRef = useRef([]);

    useEffect(() => {
        fetch(GEOJSON_URL)
            .then(r => r.json())
            .then(data => {
                const iso3Count = {};
                data.features.forEach(f => {
                    const iso3 = f.properties['ISO3166-1-Alpha-3'];
                    if (iso3) iso3Count[iso3] = (iso3Count[iso3] || 0) + 1;
                });
                const list = data.features
                    .filter(f => {
                        const iso3 = f.properties['ISO3166-1-Alpha-3'];
                        return /^[A-Z]{3}$/.test(iso3) && iso3Count[iso3] === 1;
                    })
                    .map(f => ({
                        name: f.properties.name,
                        iso3: f.properties['ISO3166-1-Alpha-3'],
                        centroid: centroid(f),
                    }));
                countriesRef.current = list;
                setGeoData(data);
                setCountries(list);
                setPhase('home');
            })
            .catch(() => setPhase('error'));
    }, []);

    function beginRound(n, prev, list) {
        const country = list[n];
        setTarget(country);
        setRound(n);
        setScores(prev);
        setResult(null);
        setShowHighlight(false);
        setShowResult(false);
        setStartTime(Date.now());
        setPhase('playing');
    }

    function startGame() {
        pendingRef.current = false;
        const shuffled = [...countries].sort(() => Math.random() - 0.5);
        countriesRef.current = shuffled;
        beginRound(0, [], shuffled);
    }

    function handleClick(latlng, iso3) {
        if (phase !== 'playing' || pendingRef.current || !target) return;
        pendingRef.current = true;

        const timeMs = Date.now() - startTime;
        const correct = iso3 === target.iso3;
        const distKm = correct
            ? 0
            : haversineKm(latlng[0], latlng[1], target.centroid[0], target.centroid[1]);
        const { correctBonus, timeScore, distScore, total } = calcScore(timeMs, distKm, correct);

        const roundResult = { latlng, distKm, timeMs, correctBonus, timeScore, distScore, total, correct, name: target.name };
        const newScores = [...scores, roundResult];
        pendingScoresRef.current = newScores;

        setResult(roundResult);
        setShowHighlight(false);
        setShowResult(false);
        setPhase('result');

        const isCorrect = roundResult.correct;
        timerIdsRef.current = [
            setTimeout(() => setShowHighlight(true), isCorrect ? 300 : 1400),
            setTimeout(() => setShowResult(true),    isCorrect ? 600 : 2000),
        ];
    }

    function handleNext() {
        timerIdsRef.current.forEach(clearTimeout);
        timerIdsRef.current = [];
        pendingRef.current = false;
        const next = round + 1;
        if (next >= TOTAL_ROUNDS) {
            setScores(pendingScoresRef.current);
            setPhase('done');
        } else {
            beginRound(next, pendingScoresRef.current, countriesRef.current);
        }
    }

    if (phase === 'home') {
        return <LandingPage onPlay={() => setPhase('start')} />;
    }

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
            <Menu />
            <GameMap
                geoData={geoData}
                target={target}
                result={result}
                showHighlight={showHighlight}
                showResult={showResult}
                onMapClick={handleClick}
                hardMode={hardMode}
                satellite={satellite}
            />
            <div style={{
                position: 'fixed',
                top: 16,
                right: 16,
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
            }}>
                {[
                    { label: 'Hard Mode', value: hardMode, set: setHardMode, activeColor: '#c0392b' },
                    { label: 'Topography', value: satellite, set: setSatellite, activeColor: '#2980b9' },
                ].map(({ label, value, set, activeColor }) => (
                    <button
                        key={label}
                        onClick={() => set(v => !v)}
                        style={{
                            background: 'rgba(20,20,40,0.88)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            border: '1px solid #444',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 13,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: 160,
                        }}
                    >
                        <span style={{ fontWeight: 'bold', letterSpacing: '0.04em' }}>{label}</span>
                        <span style={{
                            width: 36,
                            height: 20,
                            borderRadius: 10,
                            background: value ? activeColor : '#444',
                            position: 'relative',
                            transition: 'background 0.2s',
                            flexShrink: 0,
                        }}>
                            <span style={{
                                position: 'absolute',
                                top: 3,
                                left: value ? 19 : 3,
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                background: 'white',
                                transition: 'left 0.2s',
                            }} />
                        </span>
                    </button>
                ))}
            </div>
            <GameOverlay
                phase={phase}
                target={target}
                result={result}
                showResult={showResult}
                round={round}
                totalRounds={TOTAL_ROUNDS}
                scores={scores}
                onStart={startGame}
                onNext={handleNext}
            />
        </div>
    );
}
