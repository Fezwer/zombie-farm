// App.jsx (фрагмент)

import { useRef, useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FarmGame } from './FarmGame';
import Login from './Login';
import Dashboard from './Dashboard';
import { getScrfToken, apiGetPlayer } from './request';
import { useMemo } from 'react';

function AppGame() {
  const [showGradientLine, setShowGradientLine] = useState(true);
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [startScene, setStartScene] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isGameScene, setIsGameScene] = useState(false);   // ⚡ новая
  const [isShopOpen, setIsShopOpen] = useState(false);     // ⚡ новая
  const phaserRef = useRef();

  const loadPlayer = useCallback(async () => {
    const playerRes = await apiGetPlayer();
    if (playerRes.ok) {
      setPlayer(playerRes.player);
    } else {
      console.error('Не удалось получить игрока', playerRes.error || playerRes.raw);
    }
  }, []);

  const farmsCount = useMemo(() => {
    if (!player || !player.houses) return 0;
    return player.houses.filter(h => h.type === 'FARM').length;
  }, [player]);
  const meatPerSecond = farmsCount * 5;

  useEffect(() => {
    (async () => {
      const res = await getScrfToken();
      if (!res.ok) {
        console.error('Не удалось получить CSRF-токен', res);
      }
      // ⚡ первая загрузка игрока
      await loadPlayer();
    })();
    const params = new URLSearchParams(window.location.search);
    const start = params.get('start');
    if (start) {
      setStartScene(start);
    }
  }, [loadPlayer]);

  useEffect(() => {
    const id = setInterval(() => {
      loadPlayer();
    }, 2000);
    return () => clearInterval(id);
  }, [loadPlayer]);

  useEffect(() => {
    const id = setInterval(() => {
      postAuthRefresh().catch((e) =>
        console.error('Ошибка при postAuthRefresh()', e)
      );
    }, 10 * 60 * 1000); // 10 минут
    return () => clearInterval(id);
  }, []);

  const currentScene = (scene) => {
    const key = scene.scene.key;
    setCanMoveSprite(key !== 'MainMenu');
    setShowSidebar(key === 'Game');
    setShowGradientLine(key !== 'Game');
    const isGame = key === 'Game';
    setIsGameScene(isGame);
    if (!isGame) {
      setIsShopOpen(false);
    }
    // авто-переход по ?start=...
    if (startScene && key !== startScene) {
      scene.scene.start(startScene);
      setStartScene(null);
      const params = new URLSearchParams(window.location.search);
      params.delete('start');
      const newQuery = params.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Установка конфигурации постройки в сцену Game
  const setBuildConfig = (config) => {
    if (phaserRef.current?.scene?.setBuildConfig) {
      phaserRef.current.scene.setBuildConfig(config);
    }
  };

  return (
    <div id="app" style={{ position: 'relative' }}>
      {showSidebar && (
        <aside className="sidebar">
          <div className="sidebarTitle">HZF</div>
          <div className="rectangles-container">
            {/* brains */}
            <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
              <div className="top-left">brains</div>
              <div className="top-right">9999+ max count</div>
              <div className="bottom-left">
                <img
                  src="/assets/pink_brain.png"
                  alt="icon"
                  style={{ width: '38px', height: 'auto', verticalAlign: 'bottom' }}
                />
                <div className="text">
                  {player ? player.brain : '—'}
                </div>
              </div>
              <img src="/assets/brain.png" alt='icon-2' className="bottom-right-image" />
            </div>

            {/* meat */}
            <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
              <div className="top-left">meat</div>
              <div className="top-right">
                {player ? `${meatPerSecond} meat/sec` : '—'}
              </div>
              <div className="bottom-left">
                <img
                  src="/assets/pink_brain.png"
                  alt="icon"
                  style={{ width: '38px', height: 'auto', verticalAlign: 'bottom' }}
                />
                <div className="text-1">
                  {player ? player.meat : '—'}
                </div>
              </div>
            </div>

            {/* gold */}
            <div className="rectangle" style={{ '--bottom-color': '#e8a851' }}>
              <div className="top-left">gold</div>
              <div className="top-right">BUY</div>
              <div className="bottom-left">
                <img
                  src="/assets/coin.png"
                  alt="icon"
                  style={{ width: '35px', height: 'auto', verticalAlign: 'bottom' }}
                />
                <div className="text-1">
                  {player ? player.gold : '—'}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      <header className='header'>
        <nav className='nav'>
          <button
            className='nav-button'
            onClick={(e) => {
              e.preventDefault();
              phaserRef.current.scene.scene.start('MainMenu');
              setShowSidebar(false);
            }}
          >
            home
          </button>
          {/* ⚡ shop */}
          <button
            className={`nav-button ${!isGameScene ? 'nav-button--disabled' : ''}`}
            disabled={!isGameScene}
            onClick={(e) => {
              e.preventDefault();
              if (!isGameScene) return;
              setIsShopOpen(prev => !prev);
            }}
          >
            shop
          </button>
          <button
            className='nav-button'
            onClick={(e) => {
              e.preventDefault();
              window.location.assign('https://t.me/hzfarm_bot');
            }}
          >
            telegram
          </button>
        </nav>
        {showGradientLine && <div className="gradient-line"></div>}
      </header>
      {/* ⚡ окно магазина поверх игры */}
      {isShopOpen && isGameScene && (
        <Shop
          onClose={() => setIsShopOpen(false)}
          onSelectBuild={(config) => {
            setBuildConfig(config);   // передаём в Game сцену
            setIsShopOpen(false);     // по желанию — сразу закрываем
          }}
        />
      )}
      <FarmGame
        ref={phaserRef}
        currentActiveScene={currentScene}
        onHouseBuilt={loadPlayer}   // ⚡ сюда
      />
    </div>
  );
}

// Простой магазин с 3 карточками
function Shop({ onClose, onSelectBuild }) {
  return (
    <div className="shop-overlay">
      <div className="shop-window">
        <div className="shop-header">
          <span>shop</span>
          <button className="shop-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="shop-tabs">
          <button className="shop-tab active">main</button>
          <button className="shop-tab">decor</button>
          <button className="shop-tab">skins</button>
          <button className="shop-tab">barter</button>
        </div>

        <div className="shop-grid">
          {/* FARM */}
          <div
            className="shop-card"
            onClick={() => onSelectBuild({ type: 'FARM', skin: 'basic' })}
          >
            <div className="shop-card-image">
              <img src="/assets/field.png" alt="farm" />
            </div>
            <div className="shop-card-title">farm</div>
            <div className="shop-card-price">free</div>
            <button className="shop-card-buy">select</button>
          </div>

          {/* STORAGE */}
          <div
            className="shop-card"
            onClick={() => onSelectBuild({ type: 'STORAGE', skin: 'basic' })}
          >
            <div className="shop-card-image">
              <img src="/assets/simpleHouse.png" alt="storage" />
            </div>
            <div className="shop-card-title">storage</div>
            <div className="shop-card-price">free</div>
            <button className="shop-card-buy">select</button>
          </div>

          {/* DECOR */}
          <div
            className="shop-card"
            onClick={() => onSelectBuild({ type: 'DECOR', skin: 'tree' })}
          >
            <div className="shop-card-image">
              <img src="/assets/house.png" alt="decor" />
            </div>
            <div className="shop-card-title">decor</div>
            <div className="shop-card-price">free</div>
            <button className="shop-card-buy">select</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppGame />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}


export default App