import { useEffect, useRef, useState } from 'react';
import Samosa from '/samosa.png';
import Chutney from '/chutney.png';
import ChutneyPan from '/chutneypan.png';

import { db } from '/firebase';
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';

import './App.css';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [samosaCount, setSamosaCount] = useState(0);
  const [baseMultiplier, setBaseMultiplier] = useState(1);
  const [temporaryBoost, setTemporaryBoost] = useState(0);
  const [chutneyActive, setChutneyActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [unlocked, setUnlocked] = useState({
    double: false,
    extra: false,
    party: false,
  });

  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);

  const totalMultiplier = baseMultiplier + temporaryBoost;

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    fetch('/crunchh.mp3')
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) =>
        audioContextRef.current.decodeAudioData(arrayBuffer),
      )
      .then((audioBuffer) => {
        audioBufferRef.current = audioBuffer;
      });

    loadLeaderboard();
  }, []);

  useEffect(() => {
    setUnlocked({
      double: samosaCount >= 150,
      extra: samosaCount >= 500,
      party: samosaCount >= 1000,
    });
  }, [samosaCount]);

  const loadLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(10),
      );
      const querySnapshot = await getDocs(q);
      const scores = [];
      querySnapshot.forEach((doc) => {
        scores.push(doc.data());
      });
      setLeaderboard(scores);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const submitScore = async () => {
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'leaderboard'), {
        name: playerName.trim(),
        score: samosaCount,
        timestamp: new Date(),
      });

      setShowNameInput(false);
      setPlayerName('');
      await loadLeaderboard(); // Refresh leaderboard
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = () => {
    setSamosaCount((prev) => prev + totalMultiplier);

    const img = document.querySelector('.samosa');
    img.classList.remove('pop');
    void img.offsetWidth;
    img.classList.add('pop');

    if (audioContextRef.current && audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    }
  };

  return (
    <div className="container">
      <h1 className="press-start-2p-regular">Samosa Clicker</h1>
      <button className="btn" onClick={handleClick}>
        <div className="click-area">
          <div className="character-wrapper">
            <img
              src={samosaCount >= 100 ? ChutneyPan : Samosa}
              alt="Main Character"
              className={`samosa ${samosaCount >= 100 ? 'redpanda' : ''} pop`}
            />
          </div>
        </div>

        <span className="press-start-2p-regular">
          <span className="count">Count: {samosaCount}</span>
        </span>
      </button>

      <div className="leaderboard-controls">
        <button
          className="btn-small"
          onClick={() => {
            setShowLeaderboard(!showLeaderboard);
            if (!showLeaderboard) loadLeaderboard();
          }}
        >
          🏆 {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
        </button>

        {samosaCount > 0 && (
          <button className="btn-small" onClick={() => setShowNameInput(true)}>
            📝 Submit Score
          </button>
        )}
      </div>

      {showNameInput && (
        <div className="name-input-modal">
          <div className="modal-content">
            <h3>Submit Your Score: {samosaCount}</h3>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
            <div className="modal-buttons">
              <button
                onClick={submitScore}
                disabled={!playerName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button onClick={() => setShowNameInput(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="leaderboard">
          <h2 className="press-start-2p-regular">🏆 Leaderboard</h2>
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`leaderboard-entry ${index < 3 ? 'top-three' : ''}`}
              >
                <span className="rank">
                  {index === 0
                    ? '🥇'
                    : index === 1
                    ? '🥈'
                    : index === 2
                    ? '🥉'
                    : `${index + 1}.`}
                </span>
                <span className="name">{entry.name}</span>
                <span className="score">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upgrades">
        <h2 className="press-start-2p-regular">Upgrades</h2>
        <button
          className={`upgrade ${samosaCount >= 200 ? '' : 'locked'}`}
          onClick={() => {
            if (!chutneyActive) {
              setTemporaryBoost(10);
              setChutneyActive(true);
              setTimeout(() => {
                setTemporaryBoost(0);
                setChutneyActive(false);
              }, 10000);
            }
          }}
          disabled={chutneyActive || samosaCount < 200}
        >
          🟢 Green Chutney Boost (+10 for 10s)
        </button>

        <button
          className={`upgrade ${unlocked.double ? '' : 'locked'}`}
          onClick={() => unlocked.double && setBaseMultiplier(2)}
          disabled={!unlocked.double}
        >
          🍽️ Double Samosas (150 clicks)
        </button>

        <button
          className={`upgrade ${unlocked.extra ? '' : 'locked'}`}
          onClick={() => unlocked.extra && setBaseMultiplier(3)}
          disabled={!unlocked.extra}
        >
          🥟 Extra Filling (500 clicks)
        </button>

        <button
          className={`upgrade ${unlocked.party ? '' : 'locked'}`}
          onClick={() => {
            if (unlocked.party) {
              setBaseMultiplier(5);

              // 🪩 Party background FX
              document.body.classList.add('party-mode');
              setTimeout(() => {
                document.body.classList.remove('party-mode');
              }, 5000);
            }
          }}
          disabled={!unlocked.party}
        >
          🎉 Party Samosa (1000 clicks)
        </button>
      </div>
      <Analytics />
    </div>
  );
}

export default App;
