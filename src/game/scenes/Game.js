import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        EventBus.emit('current-scene-ready', this);
        const pw = (p) => this.scale.width * p / 100;
        const ph = (p) => this.scale.height * p / 100;

        //Создаем анимации
        const texture = this.textures.get('housAnims');
        const totalFrames = texture ? texture.frameTotal : 0;
        if (totalFrames > 0) {
            this.anims.create({
                key: 'houseIdle',
                frames: this.anims.generateFrameNumbers('housAnims', { start: 0, end: totalFrames - 1 }),
                frameRate: 32,
                repeat: -1
            });
        } else {
            console.warn('Texture "housAnims" not loaded or has no frames');
        }

        const cols = 4;
        const rows = 4;
        const borderScale = 0.9;
        const innerPadding = 20; // отступ внутри бордера (пикселей)
        var depthCount = cols * rows + 1;

        // контейнер, который потом отцентрируем
        const fieldContainer = this.add.container(0, 0);

        // добавляем бордер в container и масштабируем его
        const borderImg = this.add.image(0, 0, 'border')
            .setOrigin(0)
            .setAngle(3);
        borderImg.setScale(borderScale);
        fieldContainer.add(borderImg);

        // важно: displayWidth/displayHeight корректно отражают размер после setScale
        const contentW = borderImg.displayWidth;
        const contentH = borderImg.displayHeight;

        const cellW = contentW / cols;
        const cellH = contentH / rows;

        // пример массива полей
        const gameField = Array.from({ length: 16 }, (_, i) => ({
            type: 'house', // Это брать с БД
            skin: 'housAnims', // Это тоже брать с БД
            level: 1,
            index: i
        }));

        // создаём дома и вписываем их в ячейки
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const i = row * cols + col;
                const xInBorder = contentW / 5.5 + col * cellW / 2.8 + row * 140;
                const yInBorder = contentH / 1.75 + row * cellH / 2.7 - col * 120;

                const house = this.add.sprite(xInBorder, yInBorder, gameField[i].skin)
                    .setOrigin(0.5);
                house.anims.timeScale = 0.4;
                house.play('houseIdle');

                house.setInteractive({ useHandCursor: true });

                // создаём тень — копию текстуры, но чёрную, плоская и под домом
                const shadow = this.add.sprite(house.x, house.y, gameField[i].skin)
                    .setOrigin(0.5)
                    .setTint(0x000000)
                    .setAlpha(0.2)
                    .setScale(0.92)
                    .setDepth(0);

                shadow.setVisible(false);
                // pointer события
                house.on('pointerover', () => {
                    shadow.setVisible(true);
                    shadow.x = house.x;
                    shadow.y = house.y;
                    this.tweens.killTweensOf(shadow);
                    this.tweens.add({
                        targets: shadow,
                        alpha: { from: 0, to: 0.45 },
                        duration: 120,
                        ease: 'Power1',
                    });
                    // поднимаем домик
                    this.tweens.add({
                        targets: house,
                        y: house.y - 6,
                        duration: 120,
                        ease: 'Power1'
                    });
                });
                house.on('pointerout', () => {
                    this.tweens.killTweensOf(shadow);
                    this.tweens.add({
                        targets: shadow,
                        alpha: 0,
                        duration: 120,
                        ease: 'Power1',
                        onComplete: () => shadow.setVisible(false)
                    });
                    this.tweens.add({
                        targets: house,
                        y: house.y + 6,
                        duration: 120,
                        ease: 'Power1'
                    });
                });

                // подгоняем размер дома под ячейку (сохраняем пропорции)

                house.setScale(0.9);

                // центрируем дом внутри ячейки: сдвинем по x,y так, чтобы дом был по центру ячейки
                const extraX = (cellW - house.displayWidth) / 2;
                const extraY = (cellH - house.displayHeight) / 2;
                house.x += extraX;
                house.y += extraY;

                fieldContainer.add(shadow);
                fieldContainer.add(house);
            }
        }

        // отцентрируем контейнер на экране
        const bounds = fieldContainer.getBounds();
        fieldContainer.setPosition(
            Math.round(this.scale.width / 2 - bounds.width / 2),
            Math.round(this.scale.height / 2 - bounds.height / 2)
        );

        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('MainMenu');
    }
}


// for (let i = gameField.length - 1; i >= 0; i--) {
//         const row = Math.floor(i / cols);
//         const col = i % cols;
//         const xInBorder = contentW / 5.5 + col * cellW / 2.8 + row * 140;
//         const yInBorder = contentH / 1.75 + row * cellH / 2.7 - col * 120;
//         const house = this.add.image(xInBorder, yInBorder, 'house')
//             .setOrigin(0.5);
//         house.setInteractive({ useHandCursor: true });
//         const shadow = this.add.image(house.x, house.y, 'house')
//             .setOrigin(0.5)
//             .setTint(0x000000)
//             .setAlpha(0.2)
//             .setScale(0.92);
//         shadow.setVisible(false);
//         house.on('pointerover', () => {
//             shadow.setVisible(true);
//             shadow.x = house.x;
//             shadow.y = house.y;
//             this.tweens.killTweensOf(shadow);
//             this.tweens.add({
//                 targets: shadow,
//                 alpha: { from: 0, to: 0.45 },
//                 duration: 120,
//                 ease: 'Power1',
//             });
//             this.tweens.add({
//                 targets: house,
//                 y: house.y - 6,
//                 duration: 120,
//                 ease: 'Power1'
//             });
//         });
//         house.on('pointerout', () => {
//             this.tweens.killTweensOf(shadow);
//             this.tweens.add({
//                 targets: shadow,
//                 alpha: 0,
//                 duration: 120,
//                 ease: 'Power1',
//                 onComplete: () => shadow.setVisible(false)
//             });
//             this.tweens.add({
//                 targets: house,
//                 y: house.y + 6,
//                 duration: 120,
//                 ease: 'Power1'
//             });
//         });
//         house.setScale(0.9);
//         const extraX = (cellW - house.displayWidth) / 2;
//         const extraY = (cellH - house.displayHeight) / 2;
//         house.x += extraX;
//         house.y += extraY;
//         fieldContainer.add(shadow);
//         fieldContainer.add(house);
//     }