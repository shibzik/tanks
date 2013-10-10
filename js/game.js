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
        field: null,
        speed: 2000
    };
    args = $.extend({}, _defaults, args);

    this.field = args.field;
    this.X = args.X;
    this.Y = args.Y;
    this.speed = args.speed;
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
        this.type = type;
        $(this.CSSid()).addClass(type);
        $(this.CSSid()).attr('data-type', type);
        if (typeof subtype != 'undefined') {
            this.subtype = subtype;
            $(this.CSSid()).addClass(subtype);
            $(this.CSSid()).attr('data-subtype', subtype);
        }
    },
    updateContent: function(cont) {
        this.content = cont;
        // change the value on display
        $(this.CSSid()).text(String.fromCharCode(cont));
        $(this.CSSid()).attr('data-content', String.fromCharCode(cont));
        $(this.CSSid()).attr('data-ascii', cont);
        // change the value in the grid
        this.field[this.X][this.Y].content = cont;
    },
    generateDistinctValue: function(a) {
        var val = getRandInt(65, 90);

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
    getNeighbours: function() {
        var arr = new Array(), index = 0, X = this.X, Y = this.Y, field = this.field;

        for (var i = -2; i <= 2; i++) {
            for (var j = -2; j <= 2; j++) {
                if (typeof field[X + i] != 'undefined' && typeof field[X + i][Y + j] != 'undefined') {
                    arr[index] = field[X + i][Y + j];
                    index++;
                }
            }
        }

        return arr;
    },
    getDirectNeighbours: function() {
        var arr = new Array(), index = 0, X = this.X, Y = this.Y, field = this.field;

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (Math.abs(i + j) === 1
                        && typeof field[X + i] != 'undefined'
                        && typeof field[X + i][Y + j] != 'undefined'
                        && !field[X + i][Y + j].isStone()
                        && !field[X + i][Y + j].isTank()) {
                    arr[index] = field[X + i][Y + j];
                    index++;
                }
            }
        }

        return arr;

    },
    isNeighbour: function(cont, direct) {
        var nbs, isN = false;
        if (typeof direct != 'undefined' && direct)
            nbs = this.getDirectNeighbours();
        else
            nbs = this.getNeighbours();

        $.each(nbs, function(index, nb) {
            if (nb.content === cont)
                isN = nb;
        });

        return isN;
    },
    isDirectNeighbour: function(cont) {
        return this.isNeighbour(cont, true);
    },
    isCell: function() {
        return this instanceof Cell;
    },
    isStone: function() {
        if (!this.isCell())
            return false;
        return this.type == 'stone';
    },
    isTank: function() {
        if (!this.isCell())
            return false;
        return this.type == 'tank';
    },
    controlledMove: function() {
        var self = this;
        $("body").bind("keydown", function(e) {
            if ($.inArray(e.keyCode, [37, 38, 39, 40]) != -1) {
                self.controlledTurn(e.keyCode);
                return false;
            } else {
                var nb = self.isDirectNeighbour(e.keyCode);

                if (nb) {
                    $(nb.CSSid()).html(self.getDirrection(nb, true));
                    self.randomlyChangeContent();
                    self.moveToCell(nb);
                }
            }
        });
    },
    controlledTurn: function(arrowCode) {
        var dirs = ['d', 'l', 'u', 'r'];

        this.direction = dirs[arrowCode % 4];
        $(this.CSSid()).html('&' + dirs[arrowCode % 4] + 'arr;');
    },
    timerMove: function() {
        var self = this;
        this.timer = setInterval(function() {
            self.randomMove();
        }, this.speed);
    },
    stopTimer: function() {
        clearInterval(this.timer);
    },
    randomMove: function() {
        // we need direct neighbours with no stones and tanks
        var nbs = this.getDirectNeighbours();

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