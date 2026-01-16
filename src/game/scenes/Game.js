import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const pw = (p) => this.scale.width * p / 100;
        const ph = (p) => this.scale.height * p / 100;

        const fieldLayer = this.add.layer();

        var gameField = [];

        for (let i = 1; i < 17; i++) {
            var gameObj = {
                player_id: null,
                type: 'HouseType',
                level: 'Int',
                skin: 'house',
                // houseId: i,
            };
            gameField.push(gameObj);
        }
        // console.log(gameField);
        gameField[0] = {
            houseId: 1,
            type: 'house',
            level: 3,
            skin: 'house',
        }

        const drawField = () => {
            let a = 0;
            let YOfField = 0;
            let XOfField = 0;

            for (let i = 0; i < 16; i++) {
                a++;

                var fieldImg = this.add.image(
                    XOfField,
                    YOfField,
                    gameField[i].skin
                )
                .setOrigin(0);
                fieldLayer.add(fieldImg);

                XOfField += 200;
                if (a % 4 == 0) {
                    YOfField += 225;
                    XOfField = 0;
                }
            }
        }

        drawField();

        

        // const fields = []
        // let a = 0;
        // let YOfField = 0
        // let xOfField = 300
        // for (let i = 0; i < 16; i++) {
        //     xOfField += 200
        //     if (a % 4 == 0) {
        //         YOfField += 225
        //         xOfField = 300
        //     }
        //     a++;
        //     var field = {
        //         FieldName: 'name',
        //         Price: 0,
        //         Texture: this.add.image(xOfField, YOfField, 'house')
        //     }
        //     // var field = this.add.image(xOfField, YOfField, 'house');
        //     fieldsArray.push(field);
        //     fieldLayer.add(field.Texture)
        // }
        // console.log(fieldsArray);


        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('MainMenu');
    }
}
