import { useRef, useState, useEffect } from 'react';

import Phaser from 'phaser';
import { FarmGame } from './FarmGame';

function App() {
    const [showGradientLine, setShowGradientLine] = useState(true);
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const phaserRef = useRef();
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    
    const [showSidebar, setShowSidebar] = useState(false);

    const changeScene = () => {
        const scene = phaserRef.current.scene;
        if (scene) {
            scene.changeScene();
        }
    };

    const moveSprite = () => {
        const scene = phaserRef.current.scene;
        if (scene && scene.scene.key === 'MainMenu') {
            scene.moveLogo(({ x, y }) => {
                setSpritePosition({ x, y });
            });
        }
    };

    const addSprite = () => {
        const scene = phaserRef.current.scene;
        if (scene) {
            const x = Phaser.Math.Between(64, scene.scale.width - 64);
            const y = Phaser.Math.Between(64, scene.scale.height - 64);
            const star = scene.add.sprite(x, y, 'star');
            scene.add.tween({ targets: star, duration: 500 + Math.random() * 1000, alpha: 0, yoyo: true, repeat: -1 });
        }
    };

    const currentScene = (scene) => {
        const key = scene.scene.key;
        setCanMoveSprite(key !== 'MainMenu');
        
        setShowSidebar(key === 'Game');
        setShowGradientLine(key !== 'Game');
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
                        <img src="/assets/pink_brain.png" alt='icon' style={{ width: '38px', height: 'auto', verticalAlign: 'bottom'}}/>
                        <div class="text">23092</div>
                    </div>
                    <img src="/assets/brain.png" alt='icon-2' className="bottom-right-image"/>
                </div>
                <div className="rectangle" style={{ '--bottom-color': '#945e77' }}>
                    <div className="top-left">meat</div>
                    <div className="top-right">10 meat/sec</div>
                    <div className="bottom-left">
                        <img src="/assets/pink_brain.png" alt='icon' style={{ width: '38px', height: 'auto', verticalAlign: 'bottom'}}/>
                        <div className="text-1">9999999+</div>
                    </div>
                </div>
                <div className="rectangle" style={{ '--bottom-color': '#e8a851' }}>
                    <div className="top-left">gold</div>
                    <div className="top-right">BUY</div>
                    <div className="bottom-left">
                        <img src="/assets/coin.png" alt='icon' style={{ width: '35px', height: 'auto', verticalAlign: 'bottom'}}/>
                        <div className="text-1">10002</div>
                    </div>
                </div>
                </div>
             </aside>
            )}

            <header className='header'>
                <nav className='nav'>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); /* логика для перехода */ }}>home</button>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); /* логика */ }}>shop</button>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); /* логика */ }}>discord</button>
                    <button className='nav-button' onClick={(e) => { e.preventDefault(); /* логика */ }}>telegram</button>
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

export default App
