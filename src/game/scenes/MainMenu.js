import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    logoTween;

    constructor() {
        super('MainMenu');
    }

    create() {
        EventBus.emit('current-scene-ready', this);

        const pw = (p) => this.scale.width * p / 100;
        const ph = (p) => this.scale.height * p / 100;

        const createPanel = () => {
            const rectRight = this.add.rectangle(0, ph(45), pw(100), ph(10), 0x000000)
                .setOrigin(0, 0);

            const rectBot = this.add.rectangle(0, ph(45), ph(10), ph(55), 0x000000)
                .setOrigin(0, 0);

            const panelLayer = this.add.layer([rectRight, rectBot]);

            return panelLayer;
        };

        const panel = createPanel();

        document.fonts.ready.then(() => {

            const titleText = this.add.text(pw(45), ph(35), 'happy zombie farm', {
                font: '633 128px "Bezier_Sans"',
                color: '#000000'
            })
                .setOrigin(0.5);

            const startText = this.add.text(pw(45), ph(50), 'play now', {
                font: '700 32px "Montserrat_Alternates"',
                color: '#ffffff'
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

                startText.on('pointerup', () => {
                    // Переход на страницу React логина
                    window.location.href = '/login';
                  });                  
                  
        });

        const createImage = (px, py, key, scale = 0.6) =>
            this.add.image(pw(px), ph(py), key).setScale(scale).setOrigin(0.5);

        const brainImg = createImage(40.5, 36, 'brain');
        const brainImg2 = createImage(52.8, 36, 'brain');




        // this.add.image(512, 384, 'background');

        // this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        // this.add.text(512, 460, 'У Fezwer а желание есть одно, линсея трахнуть дано ', {
        //     fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setDepth(100).setOrigin(0.5);

        // EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        // if (this.logoTween)
        // {
        //     this.logoTween.stop();
        //     this.logoTween = null;
        // }

        // this.scene.start('Game');
    }

}
