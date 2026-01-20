// App.jsx (фрагмент)

import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FarmGame } from './FarmGame';
import Login from './Login';
import Dashboard from './Dashboard';
import { getScrfToken, apiGetPlayer } from './request';

function AppGame() {
    const [showGradientLine, setShowGradientLine] = useState(true);
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [startScene, setStartScene] = useState(null);
    const [player, setPlayer] = useState(null);

    const [isShopOpen, setIsShopOpen] = useState(false);

    const phaserRef = useRef();

    useEffect(() => {
        (async () => {
            const res = await getScrfToken();
            if (!res.ok) {
                console.error("Не удалось получить CSRF-токен", res);
            }

            // Загружаем игрока
            const playerRes = await apiGetPlayer();
            if (playerRes.ok) {
                setPlayer(playerRes.player);
            } else {
                console.error("Не удалось получить игрока", playerRes.error || playerRes.raw);
            }
        })();

        const params = new URLSearchParams(window.location.search);
        const start = params.get('start');
        if (start) {
            setStartScene(start);
        }
    }, []);

    const currentScene = (scene) => {
        const key = scene.scene.key;

        setCanMoveSprite(key !== 'MainMenu');
        setShowSidebar(key === 'Game');
        setShowGradientLine(key !== 'Game');

        // Авто-переход в Game по ?start=Game
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
                    <img src="/assets/brain.png" alt='icon-2' className="bottom-right-image"/>
                  </div>

                  {/* meat */}
                  <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
                    <div className="top-left">meat</div>
                    <div className="top-right">
                      {/* пример: можно потом подставить meat/sec из конфига */}
                      {player ? `${player.meat} total` : '—'}
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
                    <button
                      className='nav-button'
                      onClick={(e) => {
                        e.preventDefault();
                        // setIsShopOpen((prev) => !prev);
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

            {/* Магазин */}
            {isShopOpen && (
              <div className="shop-modal">
                <div className="shop-card">
                  <h3>shop</h3>
                  <button
                    onClick={() => {
                      setBuildConfig({ type: 'FARM', skin: 'field' });
                      setIsShopOpen(false);
                    }}
                  >
                    FARM (field)
                  </button>
                  <button
                    onClick={() => {
                      setBuildConfig({ type: 'DECOR', skin: 'housAnims' });
                      setIsShopOpen(false);
                    }}
                  >
                    DECOR (housAnims)
                  </button>
                  <button
                    onClick={() => {
                      setBuildConfig({ type: 'STORAGE', skin: 'simpleHouse' });
                      setIsShopOpen(false);
                    }}
                  >
                    STORAGE (simpleHouse)
                  </button>
                  <button onClick={() => setIsShopOpen(false)}>close</button>
                </div>
              </div>
            )}

            <FarmGame ref={phaserRef} currentActiveScene={currentScene} />
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