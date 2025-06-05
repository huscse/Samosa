import { useEffect, useRef, useState } from 'react';
import Samosa from '/samosa.png';
import './App.css';

function App() {
  const [samosaCount, setSamosaCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [unlocked, setUnlocked] = useState({
    double: false,
    extra: false,
    party: false,
  });

  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);

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
  }, []);

  // Unlock upgrades
  useEffect(() => {
    setUnlocked({
      double: samosaCount >= 150,
      extra: samosaCount >= 500,
      party: samosaCount >= 1000,
    });
  }, [samosaCount]);

  const handleClick = () => {
    setSamosaCount((prev) => prev + multiplier);

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
        <img src={Samosa} alt="Samosa" className="samosa" />
        <span className="press-start-2p-regular">
          <span className="count">Count: {samosaCount}</span>
        </span>
      </button>

      <div className="upgrades">
        <h2 className="press-start-2p-regular">Upgrades</h2>

        <button
          className={`upgrade ${unlocked.double ? '' : 'locked'}`}
          onClick={() => unlocked.double && setMultiplier(2)}
          disabled={!unlocked.double}
        >
          🍽️ Double Samosas (150 clicks)
        </button>

        <button
          className={`upgrade ${unlocked.extra ? '' : 'locked'}`}
          onClick={() => unlocked.extra && setMultiplier(3)}
          disabled={!unlocked.extra}
        >
          🥟 Extra Filling (500 clicks)
        </button>

        <button
          className={`upgrade ${unlocked.party ? '' : 'locked'}`}
          onClick={() => unlocked.party && setMultiplier(5)}
          disabled={!unlocked.party}
        >
          🎉 Party Samosa (1000 clicks)
        </button>
      </div>
    </div>
  );
}

export default App;
