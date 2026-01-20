import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getScrfToken } from './request';

import { FarmGame } from './FarmGame';
import Login from './Login';
import Dashboard from './Dashboard';


function AppGame() {
    const [showGradientLine, setShowGradientLine] = useState(true);
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const phaserRef = useRef();

    const [startScene, setStartScene] = useState(null);

    useEffect(() => {

        (async () => {
            const res = await getScrfToken();
            if (res.ok) {
                // Если все прошло, то гуд
            } else {
                console.error("Не удалось получить SCRF-токен", res);
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
        // Если есть указание начать с конкретной сцены и мы ещё не переключались
        if (startScene && key !== startScene) {
            // Переключаем Phaser на нужную сцену
            scene.scene.start(startScene);
            // Больше не пытаться переключать
            setStartScene(null);
            // Уберём параметр ?start=... из адресной строки
            const params = new URLSearchParams(window.location.search);
            params.delete('start');
            const newQuery = params.toString();
            const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    };

    return (
        <div id="app" style={{ position: 'relative' }}>
            {showSidebar && (
                <aside className="sidebar">
                    <div className="sidebarTitle">HZF</div>
                    <div className="rectangles-container">
                        <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
                            <div className="top-left">brains</div>
                            <div className="top-right">9999+ max count</div>
                            <div className="bottom-left">
                                <img src="/assets/pink_brain.png" alt='icon' style={{ width: '38px', height: 'auto', verticalAlign: 'bottom' }} />
                                <div className="text">23092</div>
                            </div>
                            <img src="/assets/brain.png" alt='icon-2' className="bottom-right-image" />
                        </div>
                        <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
                            <div className="top-left">meat</div>
                            <div className="top-right">10 meat/sec</div>
                            <div className="bottom-left">
                                <img src="/assets/pink_brain.png" alt='icon' style={{ width: '38px', height: 'auto', verticalAlign: 'bottom' }} />
                                <div className="text-1">9999999+</div>
                            </div>
                        </div>
                        <div className="rectangle" style={{ '--bottom-color': '#e8a851' }}>
                            <div className="top-left">gold</div>
                            <div className="top-right">BUY</div>
                            <div className="bottom-left">
                                <img src="/assets/coin.png" alt='icon' style={{ width: '35px', height: 'auto', verticalAlign: 'bottom' }} />
                                <div className="text-1">10002</div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            <header className='header'>
                <nav className='nav'>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); phaserRef.current.scene.scene.start('MainMenu'); setShowSidebar(false); }}>home</button>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); /* логика */ }}>shop</button>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); window.location.assign('https://t.me/hzfarm_bot'); }}>telegram</button>
                </nav>
                {showGradientLine && <div className="gradient-line"></div>}
            </header>

            <FarmGame ref={phaserRef} currentActiveScene={currentScene} />

        </div>
    )
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