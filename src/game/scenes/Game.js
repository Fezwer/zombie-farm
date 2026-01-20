// src/game/scenes/Game.js

import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { apiGetPlayerHouses, apiBuildHouse } from '../../request';
// apiGetPlayerHouses / apiBuildHouse — см. ранее как сделать поверх callGraphQL

export class Game extends Scene {
    constructor() {
        super('Game');

        // Размер клетки
        this.cellW = 300 * 0.9;
        this.cellH = 300 * 0.9;

        // Сетка 4x4 (16 ячеек)
        this.COLS = 4;
        this.ROWS = 4;
        this.totalCells = this.COLS * this.ROWS;

        // Логические данные по ячейкам (House или null)
        this.cells = [];

        // Плейсхолдеры (пустые объекты 300x300)
        this.cellPlaceholders = [];

        // Спрайты/картинки домов по ID
        this.houseSprites = new Map();
    }

    create() {
        const contentW = this.scale.width;
        const contentH = this.scale.height;

        // Фон можно добавить, если нужен:
        // this.add.image(contentW / 2, contentH / 2, 'brain').setAlpha(0.1);

        // Рисуем border (забор) по центру экрана
        this.border = this.add.image(contentW / 2, contentH / 2, 'border')
            .setOrigin(0.5)
            .setAngle(3)
            .setScale(0.9);
        // При необходимости — масштабируем
        // this.border.setScale(0.9);

        // Инициализация данных
        this.initBoardData();

        // Сначала рисуем поле (field) и пустые ячейки
        this.createBoard(contentW, contentH);

        // Анимации для housAnims (если ещё не созданы)
        this.ensureHouseAnimations();

        // Загружаем дома игрока с сервера и расставляем их по cell
        this.loadHousesFromServer();

        // Сообщаем React, что сцена готова
        EventBus.emit('current-scene-ready', this);
    }

    initBoardData() {
        this.cells = new Array(this.totalCells).fill(null);
        this.cellPlaceholders = [];
        this.houseSprites.clear();
    }

    createBoard(contentW, contentH) {
        for (let cellIndex = 0; cellIndex < this.totalCells; cellIndex++) {
            const col = cellIndex % this.COLS;
            const row = Math.floor(cellIndex / this.COLS);

            // Координаты "внутри" бордера по твоей формуле
            const xInBorder = contentW / 3.2 + (col * this.cellW) / 2.2 + row * 140;
            const yInBorder = contentH / 1.75 + (row * this.cellH) / 2.7 - col * 120;

            // 1) Подложка поля — картинка field под дом (или просто земля)
            // const field = this.add.image(xInBorder, yInBorder, 'field');
            // field.setDisplaySize(this.cellW, this.cellH);
            // field.setDepth(0); // под домами

            // 2) Пустой объект 300x300 — прозрачный прямоугольник, по которому кликаем
            const rect = this.add.rectangle(
                xInBorder,
                yInBorder,
                this.cellW,
                this.cellH,
                0x000000,
                0 // прозрачный
            );
            // Изначально рамка невидима
            rect.setStrokeStyle(1, 0x000000, 0);
            rect.setInteractive({ useHandCursor: true });
            rect.cellIndex = cellIndex;
            rect.on('pointerover', () => {
                rect.setStrokeStyle(2, 0xffff00, 0.6); // только при ховере видимая рамка
            });
            rect.on('pointerout', () => {
                rect.setStrokeStyle(1, 0x000000, 0); // снова полностью прозрачная
            });

            this.cellPlaceholders.push(rect);
        }

        // Чтобы дома были над border и field
        this.border.setDepth(-1);
    }

    ensureHouseAnimations() {
        // Простейшая анимация для housAnims; поправь start/end под свой спрайтшит
        const texture = this.textures.get('housAnims');
        const totalFrames = texture ? texture.frameTotal : 0;

        if (!this.anims.exists('housAnims_idle')) {
            this.anims.create({
                key: 'housAnims_idle',
                frames: this.anims.generateFrameNumbers('housAnims', {
                    start: 0,
                    end: totalFrames - 1 // или 0..N, если у idle несколько кадров
                }),
                frameRate: 31,
                repeat: -1
            });
        }
    }

    async loadHousesFromServer() {
        try {
            const res = await apiGetPlayerHouses();
            if (!res.ok) {
                console.error('Не удалось загрузить дома игрока', res.error || res.raw);
                return;
            }

            const houses = res.houses || [];

            houses.forEach((house) => {
                if (
                    typeof house.cell !== 'number' ||
                    house.cell < 0 ||
                    house.cell >= this.totalCells
                ) {
                    console.warn('Дом с некорректным cell:', house);
                    return;
                }

                this.cells[house.cell] = house;
                this.spawnHouseAtCell(house.cell, house);
            });
        } catch (e) {
            console.error('Ошибка при загрузке домов с сервера', e);
        }
    }

    cellToWorldPosition(cellIndex) {
        const col = cellIndex % this.COLS;
        const row = Math.floor(cellIndex / this.COLS);

        const contentW = this.scale.width;
        const contentH = this.scale.height;

        const xInBorder = contentW / 3.2 + (col * this.cellW) / 2.2 + row * 140;
        const yInBorder = contentH / 1.75 + (row * this.cellH) / 2.7 - col * 120;

        return { x: xInBorder, y: yInBorder };
    }

    spawnHouseAtCell(cellIndex, house) {
        const { x, y } = this.cellToWorldPosition(cellIndex);

        let obj;

        // housAnims -> спрайт с анимацией
        if (house.type === 'DECOR') {
            obj = this.add.sprite(x, y, 'housAnims');
            if (this.anims.exists('housAnims_idle')) {
                obj.play('housAnims_idle');
            }
        } else if (house.type === 'FARM') {
            // simpleHouse или другие скины -> просто картинка
            // Предполагаем, что skin = ключ загруженной текстуры
            obj = this.add.image(x, y, 'field');
        } else if (house.type === 'STORAGE') {
            obj = this.add.image(x, y, 'simpleHouse');
        }

        obj.setDisplaySize(this.cellW, this.cellH);
        obj.setDepth(0); // над полем

        obj.setInteractive({ useHandCursor: true });
        obj.houseData = house;

        this.houseSprites.set(house.id, obj);

        obj.on('pointerup', () => {
            this.onHouseClicked(house, obj);
        });
    }

    onCellClicked(cellIndex) {
        const existingHouse = this.cells[cellIndex];

        if (existingHouse) {
            const sprite = this.houseSprites.get(existingHouse.id);
            this.onHouseClicked(existingHouse, sprite);
            return;
        }

        // Пустая клетка — пробуем построить дом
        this.buildHouseAtCell(cellIndex);
    }

    onHouseClicked(house, sprite) {
        console.log('Клик по дому', house);

        if (!sprite) return;

        this.tweens.add({
            targets: sprite,
            scaleX: sprite.scaleX * 1.05,
            scaleY: sprite.scaleY * 1.05,
            yoyo: true,
            duration: 120,
            ease: 'Sine.easeInOut'
        });
    }

    async buildHouseAtCell(cellIndex) {
        if (this._buildingInProgress) return;
        this._buildingInProgress = true;

        try {
            const res = await apiBuildHouse({
                type: 'FARM',        // HouseType.FARM
                skin: 'basic', // либо 'housAnims', если хочешь анимированный дом
                cell: cellIndex
            });

            if (!res.ok) {
                console.error('Не удалось построить ферму', res.error || res.raw);
                return;
            }

            const newHouse = res.house;

            if (
                typeof newHouse.cell === 'number' &&
                newHouse.cell >= 0 &&
                newHouse.cell < this.totalCells
            ) {
                this.cells[newHouse.cell] = newHouse;
                this.spawnHouseAtCell(newHouse.cell, newHouse);
            } else {
                console.warn('Сервер вернул дом с некорректным cell', newHouse);
            }
        } catch (e) {
            console.error('Ошибка при вызове apiBuildHouse', e);
        } finally {
            this._buildingInProgress = false;
        }
    }
}