import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';

export const FarmGame = forwardRef(function FarmGame(
  { currentActiveScene, onHouseBuilt },  // ⚡ добавили onHouseBuilt
  ref
) {
  const game = useRef();

  useLayoutEffect(() => {
    if (game.current === undefined) {
      game.current = StartGame('game-container');
      if (ref !== null) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = undefined;
      }
    };
  }, [ref]);

  useEffect(() => {
    const handleSceneReady = (currentScene) => {
      if (currentActiveScene instanceof Function) {
        currentActiveScene(currentScene);
      }
      if (ref.current) {
        ref.current.scene = currentScene;
      }
    };

    const handleHouseBuilt = (payload) => {
      if (onHouseBuilt) {
        onHouseBuilt(payload);
      }
    };

    EventBus.on('current-scene-ready', handleSceneReady);
    EventBus.on('house-built', handleHouseBuilt); // ⚡

    return () => {
      EventBus.removeListener('current-scene-ready', handleSceneReady);
      EventBus.removeListener('house-built', handleHouseBuilt);
    };
  }, [currentActiveScene, onHouseBuilt, ref]);

  return <div id="game-container"></div>;
});