import { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import Phaser from 'phaser';
import { FarmGame } from './FarmGame';
import Login from './Login';
import Dashboard from './Dashboard';


function AppGameWrapper() {
    // обёртка чтобы использовать useLocation внутри
    return <AppGame />;
}
function AppGame() {
    const location = useLocation();
    const phaserRef = useRef(); // тот же ref, который передаёте в FarmGame
    // эффект — старт сцены если в query есть start=Game и phaser готов
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const startScene = params.get('start'); // ожидаем "Game"
        if (!startScene) return;
        // phaserRef.current инициализируется в FarmGame: ref.current = { game: game.current, scene: null }
        const startIfReady = () => {
            const r = phaserRef.current;
            if (r && r.game && r.game.scene) {
                try {
                    // Запускаем сцену по ключу
                    r.game.scene.start(startScene);
                    // Убираем параметр, чтобы не перезапускать сцену при навигации/рендеринге
                    const url = new URL(window.location.href);
                    url.searchParams.delete('start');
                    window.history.replaceState({}, '', url.toString());
                } catch (e) {
                    console.error('Не удалось запустить сцену:', e);
                }
            }
        };
        // Если phaser уже готов — запустить сразу
        startIfReady();
        // Если phaser ещё не инициализирован, можно подписаться на EventBus или сделать polling небольшими интервалами.
        // Здесь — простой polling в течение короткого времени:
        let tries = 0;
        const interval = setInterval(() => {
            tries += 1;
            startIfReady();
            if ((phaserRef.current && phaserRef.current.game && phaserRef.current.game.scene) || tries > 20) {
                clearInterval(interval);
            }
        }, 200);
        return () => clearInterval(interval);
    }, [location.search]);

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
                                <div class="text">23092</div>
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


            {/* Пример для себя 
            
            <div className="uiPanel">
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div> */}
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
