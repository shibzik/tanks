"use strict";

var Field = function(args) {
    var _defaults = {
        container: '#field',
        width: 10,
        height: 10
    };
    args = $.extend({}, _defaults, args);
    this.container = args.container;
    this.W = args.width;
    this.H = args.height;
    this.createGrid();
};

Field.prototype = {
    constructor: Field,
    createGrid: function() {
        this.grid = createArray(this.W, this.H);

        // and fulfill this grid with cells
        for (var i = 0; i < this.W; i++) {
            for (var j = 0; j < this.H; j++) {
                this.grid[i][j] = new Cell({X: i, Y: j, field: this.grid});
            }
        }
    },
    // populate cells with random numbers 1-26
    populateGrid: function() {
        for (var i = 0; i < this.W; i++) {
            for (var j = 0; j < this.H; j++) {
                this.grid[i][j].randomlyChangeContent();
            }
        }
    },
    displayGrid: function() {
        for (var i = 0; i < this.W; i++) {
            for (var j = 0; j < this.H; j++) {
                $(this.container).append("<div class='cell row" + i + " col" + j + "' data-coord='" + CoordToStr(i, j) + "'></div>");
            }
        }
    },
    buildWall: function(args) {
        var coord;
        this.wall = new Array(args.nrStones);
        for (var i = 0; i < args.nrStones; i++) {
            coord = Cell.prototype.generateDistinctCoordinates(this.wall, this.W, this.H);
            this.wall[i] = CoordToStr(coord.x, coord.y);
            this.grid[coord.x][coord.y].turnToStone();
        }
    },
    addTank: function(tankType) {
        var coord = Cell.prototype.generateDistinctCoordinates(this.wall, this.W, this.H);
        if (!this.grid[coord.x][coord.y].isTank())
            this.grid[coord.x][coord.y].turnToTank(tankType);
        else
            this.addTank(tankType);

        return this.grid[coord.x][coord.y];
    }
};

var Cell = function(args) {
    // a cell is determined by a field and its 2 coordinates on that field
    var _defaults = {
        X: -1,
        Y: -1,
        content: '',
        field: null
    };
    args = $.extend({}, _defaults, args);

    this.field = args.field;
    this.X = args.X;
    this.Y = args.Y;
    if (this.X === -1 || this.Y === -1) {
        this.X = getRandInt(0, this.field.W);
        this.Y = getRandInt(0, this.field.H);
    }
    this.content = args.content;
};

Cell.prototype = {
    constructor: Cell,
    turnToStone: function() {
        if (!this.isStone()) {
            this.updateType('stone');
            this.updateContent('');
        }
    },
    turnToTank: function(tankType) {
        if (!this.isTank()) {
            this.updateType('tank', tankType);
        }
    },
    CSSid: function() {
        return '.row' + this.X + '.col' + this.Y;
    },
    randomlyChangeContent: function() {
        var cont = this.generateDistinctValue(this.content);
        this.updateContent(cont);
    },
    updateType: function(type, subtype) {
        $(this.CSSid()).addClass(type);
        $(this.CSSid()).attr('data-type', type);
        if (typeof subtype != 'undefined') {
            $(this.CSSid()).addClass(subtype);
            $(this.CSSid()).attr('data-subtype', subtype);
        }
    },
    updateContent: function(cont) {
        this.content = cont;
        // change the value on display
        $(this.CSSid()).text(numToChar(cont));
        $(this.CSSid()).attr('data-content', numToChar(cont));
        $(this.CSSid()).attr('data-ascii', cont);
        // change the value in the grid
        this.field[this.X][this.Y].content = cont;
    },
    generateDistinctValue: function(a) {
        var val = getRandInt(97, 122);

        if (this.isNeighbour(val) || (typeof a != 'undefined' && val == a)) {
            val = this.generateDistinctValue();
        }

        return val;
    },
    generateDistinctCoordinates: function(arrCoord, maxX, maxY) {
        var x = getRandInt(0, maxX - 1), y = getRandInt(0, maxY - 1), newCoord;
        newCoord = CoordToStr(x, y);

        if (inArray(arrCoord, newCoord)) {
            newCoord = Cell.prototype.generateDistinctCoordinates(arrCoord, maxX, maxY);
            return newCoord;
        }

        return StrToCoord(newCoord);
    },
    getNeighbours: function(eliminateTanks, eliminateStones) {
        var arr = new Array(), i = 0, X = this.X, Y = this.Y, field = this.field;

        if (typeof field[X - 1] != 'undefined') {
            arr[i] = field[X - 1][Y];
            i++;
        }
        if (typeof field[X][Y - 1] != 'undefined') {
            arr[i] = field[X][Y - 1];
            i++;
        }
        if (typeof field[X + 1] != 'undefined') {
            arr[i] = field[X + 1][Y];
            i++;
        }
        if (typeof field[X][Y + 1] != 'undefined') {
            arr[i] = field[X][Y + 1];
            i++;
        }

        if (typeof eliminateTanks != 'undefined' && eliminateTanks) {
            this.eliminateTanks(arr);
        }

        if (typeof eliminateStones != 'undefined' && eliminateStones) {
            this.eliminateStones(arr);
        }

        return arr;
    },
    eliminateTanks: function(arr) {
        $.each(arr, function(index, item) {
            if (typeof item != 'undefined' && item.isTank()) {
                arr.splice(index, 1);
            }
        });

        return arr;
    },
    eliminateStones: function(arr) {
        $.each(arr, function(index, item) {
            if (typeof item != 'undefined' && item.isStone()) {
                arr.splice(index, 1);
            }
        });

        return arr;
    },
    isNeighbour: function(cont) {
        var nbs = this.getNeighbours(), isN = false;

        $.each(nbs, function(index, nb) {
            if (nb.content === cont
                    && !nb.isTank()
                    && !nb.isStone())
                isN = nb;
        });

        return isN;
    },
    isCell: function() {
        return this instanceof Cell;
    },
    isStone: function() {
        if (!this.isCell())
            return false;
        return $(this.CSSid()).hasClass('stone');
    },
    isTank: function() {
        if (!this.isCell())
            return false;
        return $(this.CSSid()).hasClass('tank');
    },
    controlledMove: function() {
        var self = this;
        $("body").bind("keypress", function(e) {
            var nb = self.isNeighbour(e.charCode);

            if (nb) {
                $(nb.CSSid()).html(self.getDirrection(nb, true));
                self.randomlyChangeContent();
                self.moveToCell(nb);
            }
        });
    },
    timerMove: function() {
        var self = this;
        this.timer = setInterval(function() {
            self.randomMove();
        }, 1000);
    },
    stopTimer: function() {
        clearInterval(this.timer);
    },
    randomMove: function() {
        var nbs = this.getNeighbours(true, true);

        // if there are some neighbours
        if (nbs.length > 0) {
            this.moveToCell(getRandElem(nbs));
        }
    },
    moveToCell: function(targetCell) {
        var _type = $(this.CSSid()).attr('data-type'),
                _subtype = $(this.CSSid()).attr('data-subtype');

        $(this.CSSid()).removeClass(_type).removeClass(_subtype);
        targetCell.updateType(_type, _subtype);
        this.updateType('', '');
        this.content = targetCell.content;
        this.X = targetCell.X;
        this.Y = targetCell.Y;
    },
    getDirrection: function(targetCell, returnArrow) {
        var dir;
        if (this.X === targetCell.X) {
            if (this.Y === targetCell.Y - 1) {
                dir = 'r';
            }
            else if (this.Y === targetCell.Y + 1) {
                dir = 'l';
            }

        } else if (this.Y === targetCell.Y) {
            if (this.X === targetCell.X - 1) {
                dir = 'd';
            }
            else if (this.X === targetCell.X + 1) {
                dir = 'u';
            }
        }
        if (returnArrow)
            return '&' + dir + 'arr;';
        return dir;
    }
};

var Game = function(field) {
    this.field = field;
    this.init();
};
Game.prototype = {
    constructor: Game,
    init: function() {
        this.field.displayGrid();
        _d('Field displayed');
        this.field.populateGrid();
        _d('Field populated');
        this.field.buildWall({nrStones: 30});
        _d('Wall built');

        this.myTank = this.field.addTank('friend');
        _d('My tank created');
        this.myTank.controlledMove();
        _d('My tank is moving');

        this.enemies = new Array();
        this.enemies[0] = this.field.addTank('enemy');
        _d('Enemy created');
        this.enemies[0].timerMove();
        _d('My enemy is moving');
    },
    addEnemy: function() {
        var nrEnemies = this.enemies.length;
        this.enemies[nrEnemies] = this.field.addTank('enemy');
        _d('New enemy created');
        this.enemies[nrEnemies].timerMove();
        _d('The new enemy is moving');
    }
};

var Debug = true;

$(document).ready(function() {
    var game = new Game(new Field());

    $('#enemyCreator').click(function() {
        game.addEnemy();
    });
});