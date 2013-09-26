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
            $(this.container).append('<div class="row" id="row' + i + '"></div>');
            for (var j = 0; j < this.H; j++) {
                $('#row' + i).append("<div class='cell col" + j + "' data-coord='" + CoordToStr(i, j) + "'></div>");
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
        type: '',
        subtype: '',
        field: null
    };
    args = $.extend({}, _defaults, args);

    this.field = args.field;
    this.X = args.X;
    this.Y = args.Y;
    if (this.X == -1 || this.Y == -1) {
        this.X = getRandInt(0, this.field.W);
        this.Y = getRandInt(0, this.field.H);
    }
    this.content = args.content;
    this.type = args.type;
    this.subtype = args.subtype;
};

Cell.prototype = {
    constructor: Cell,
    turnToStone: function() {
        if (!this.isStone()) {
            this.type = 'stone';
            this.updateContent('');
            $(this.CSSid()).addClass('stone');
        }
    },
    turnToTank: function(tankType) {
        if (!this.isTank()) {
            this.type = 'tank';
            $(this.CSSid()).addClass('tank');
            if (typeof tankType != 'undefined' && tankType != '') {
                $(this.CSSid()).addClass(tankType);
                this.subtype = tankType;
            }
        }
    },
    CSSid: function() {
        return '#row' + this.X + ' .col' + this.Y;
    },
    randomlyChangeContent: function() {
        var cont = this.generateDistinctValue(this.content);
        this.updateContent(cont);

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
    getNeighbours: function() {
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

        return arr;
    },
    isNeighbour: function(cont) {
        var nbs = this.getNeighbours(), isN = false;

        for (var i = 0; i < nbs.length; i++) {
            if (nbs[i] && nbs[i].content === cont)
                isN = nbs[i];
        }

        return isN;
    },
    isCell: function(obj) {
        if (typeof obj == 'undefined')
            obj = this;
        return obj instanceof Cell;
    },
    isStone: function() {
        if (!this.isCell())
            return false;
        return this.type === 'stone';
    },
    isTank: function() {
        if (!this.isCell())
            return false;
        return this.type === 'tank';
    },
    controlledMove: function() {
        var self = this;
        $("body").bind("keypress", function(e) {
            var nb = self.isNeighbour(e.charCode);

            if (nb) {
                var direction = self.getDirrection(nb);
                if (direction === 'u') {
                    $(nb.CSSid()).text("^");
                } else if (direction === 'r') {
                    $(nb.CSSid()).text(">");
                } else if (direction === 'd') {
                    $(nb.CSSid()).text("v");
                } else if (direction === 'l') {
                    $(nb.CSSid()).text("<");
                }

                self.randomlyChangeContent();
                self.moveToCell(nb);
            }
        });
    },
    moveToCell: function(targetCell) {
        $(this.CSSid()).removeClass(this.type + ' ' + this.subtype);
        $(targetCell.CSSid()).addClass(this.type + ' ' + this.subtype);
        this.content = targetCell.content;
        this.X = targetCell.X;
        this.Y = targetCell.Y;
    },
    timerMove: function() {
        var self = this;
        this.timer = setInterval(function() {
            self.randomMove();
        }, 1000);
    },
    randomMove: function() {
        var nbs = this.getNeighbours();
        var newCell = getRandElem(nbs);

        while (newCell.isStone() ||
                newCell.isTank()) {
            newCell = getRandElem(nbs);
        }

        this.moveToCell(newCell);
    },
    getDirrection: function(targetCell) {
        if (this.X == targetCell.X) {
            if (this.Y == targetCell.Y - 1)
                return 'r';
            else if (this.Y == targetCell.Y + 1)
                return 'l';

        } else if (this.Y == targetCell.Y) {
            if (this.X == targetCell.X - 1)
                return 'd';
            else if (this.X == targetCell.X + 1)
                return 'u';
        }
    }
};

var Game = function(options) {
    this.init(options);
};
Game.prototype = {
    constructor: Game,
    init: function(field) {
        this.field = field;
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
        _d(this.enemies[0].prop);
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