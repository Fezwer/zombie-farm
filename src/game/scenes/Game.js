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
        this.COLS = 4;
        this.ROWS = 4;
        this.totalCells = this.COLS * this.ROWS;
        this.cells = [];
        this.cellPlaceholders = [];
        this.houseSprites = new Map();
        // ⚡ выбранное строение из магазина
        this.currentBuildConfig = null;
        // флаг, чтобы не дёргать API параллельно
        this._buildingInProgress = false;
    }

    setBuildConfig(config) {
        // ожидаем { type: 'FARM' | 'STORAGE' | 'DECOR', skin: 'basic' }
        this.currentBuildConfig = config;
        console.log('Build config set from React shop:', config);
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

            const xInBorder = contentW / 3.2 + (col * this.cellW) / 2.2 + row * 140;
            const yInBorder = contentH / 1.75 + (row * this.cellH) / 2.7 - col * 120;

            const rect = this.add.rectangle(
                xInBorder,
                yInBorder,
                this.cellW,
                this.cellH,
                0x000000,
                0
            );
            rect.setStrokeStyle(1, 0x000000, 0);
            rect.setInteractive({ useHandCursor: true });
            rect.cellIndex = cellIndex;

            rect.on('pointerover', () => {
                rect.setStrokeStyle(2, 0xffff00, 0.6);
            });
            rect.on('pointerout', () => {
                rect.setStrokeStyle(1, 0x000000, 0);
            });

            // ⚡ клик по клетке
            rect.on('pointerup', () => {
                this.onCellClicked(cellIndex);
            });

            this.cellPlaceholders.push(rect);
        }

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
                frameRate: 12,
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
        if (!this.currentBuildConfig) {
            console.warn('Build config is not set. Open shop and choose a building.');
            return;
        }
        const { type, skin } = this.currentBuildConfig;
        this._buildingInProgress = true;
        try {
            const res = await apiBuildHouse({
                type: type || 'FARM',
                skin: skin || 'basic',
                cell: cellIndex
            });
            if (!res.ok) {
                console.error('Не удалось построить дом', res.error || res.raw);
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
                // ⚡ сообщаем React, что дом построен (ресурсы могли измениться)
                EventBus.emit('house-built', { house: newHouse });
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