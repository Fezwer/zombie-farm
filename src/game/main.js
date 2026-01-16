import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1920,
    height: 1080,

    scale: {
        parent: 'game-container',
        
        mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.CENTER_BOTH,

        // min: {
        //     width: 854,
        //     height: 480
        // },


        zoom: 1,
    },

    backgroundColor: '#FFFFFF',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game
    ]
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
