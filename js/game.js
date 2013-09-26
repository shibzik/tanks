var X = Y = 10;

var Field = function(options) {
    this.create(options);
};

Field.prototype = {
    constructor: Field,
    prop: {
        container: '#field',
        width: 10,
        height: 10
    },
    create: function(options) {
        this.prop = $.extend({}, this.prop, options);
        this.greed = createArray(this.prop.width, this.prop.height);
        for (var i = 0; i < this.prop.width; i++) {
            $(this.prop.container).append('<div class="row" id="row' + i + '"></div>');
            for (var j = 0; j < this.prop.height; j++) {
                this.greed[i][j] = new Cell({X: i, Y: j});
                this.greed[i][j].addOnField(this.greed);
                $('#row' + i).append(this.greed[i][j].createHtml());
            }
        }
    },
    getGreed: function() {
        return this.greed;
    },
    updateGreedCell: function(x, y, cellVal) {

    },
    // generate field X:Y with random numbers 1-26
    populate: function() {
        for (var i = 0; i < this.prop.width; i++) {
            for (var j = 0; j < this.prop.height; j++) {
                this.greed[i][j].randomlyChangeContent();
            }
        }
    },
    buildWall: function(args) {
        var coord;
        this.wall = new Array(args.nrStones);
        for (var i = 0; i < args.nrStones; i++) {
            coord = Cell.prototype.generateDistinctCoordinates(this.wall);
            this.wall[i] = numToID(coord[0], coord[1]);
            this.greed[coord[0]][coord[1]].turnToStone();
        }
    },
    addTank: function(tankType) {
        var coord = Cell.prototype.generateDistinctCoordinates(this.wall);
        if (!this.greed[coord[0]][coord[1]].isTank())
            this.greed[coord[0]][coord[1]].turnToTank(tankType);
        else
            this.addTank(tankType);

        return this.greed[coord[0]][coord[1]];
    }
};

var Cell = function(options) {
    this.create(options);
};

Cell.prototype = {
    constructor: Cell,
    prop: {X: -1, Y: -1, content: '', ID: '', type: '', subtype: '', field: null},
    create: function(options) {
        this.prop = $.extend({}, this.prop, options);

        if (this.prop.X == -1 || this.prop.Y == -1) {
            this.prop.X = Math.floor((Math.random() * (X - 1)));
            this.prop.Y = Math.floor((Math.random() * (Y - 1)));
        }

        this.prop.ID = numToID(this.prop.X, this.prop.Y);
    },
    addOnField: function(field) {
        this.prop.field = field;
        if (typeof field[this.prop.X][this.prop.Y].prop.type != 'undefined' && field[this.prop.X][this.prop.Y].prop.type != this.prop.type) {
            this.create({type: this.prop.type});
            this.addOnField(field);
        }
    },
    turnToStone: function() {
        if (!this.isStone()) {
            this.prop.type = 'stone';
            this.prop.content = '';
            $('#' + this.prop.ID).addClass('stone').text('');
        }
    },
    turnToTank: function(tankType) {
        if (!this.isTank()) {
            this.prop.type = 'tank';
            $('#' + this.prop.ID).addClass('tank');
            if (typeof tankType != 'undefined' && tankType != '') {
                $('#' + this.prop.ID).addClass(tankType);
                this.prop.subtype = tankType;
            }
        }
    },
    createHtml: function() {
        return "<div id='" + this.prop.ID + "' class='cell col" + this.prop.Y + "'></div>";
    },
    randomlyChangeContent: function(content) {
        this.prop.content = this.generateDistinctValue(this.prop.content);
        console.log(this.prop.content);

        if (typeof content == 'undefined')
            content = this.prop.content;

        $('#' + this.prop.ID).text(numToChar(content));

        this.prop.field[this.prop.X][this.prop.Y].prop.content = this.prop.content;
    },
    generateDistinctValue: function(a) {
        var val = Math.floor((Math.random() * 26) + 97);

        if (this.isNeighbour(val) || (typeof a != 'undefined' && val == a)) {
            val = this.generateDistinctValue();
        }

        return val;
    },
    generateDistinctCoordinates: function(arrCoord) {
        var x, y, newCoord;
        x = Math.floor((Math.random() * (X - 1)));
        y = Math.floor((Math.random() * (Y - 1)));
        newCoord = numToID(x, y);

        if (inArray(arrCoord, newCoord)) {
            newCoord = this.generateDistinctCoordinates(arrCoord);
            return newCoord;
        }

        return IDtoNum(newCoord);
    },
    getNeighbours: function() {
        var arr = new Array(), i = 0, X = this.prop.X, Y = this.prop.Y, field = this.prop.field;

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
            if (nbs[i] && nbs[i].prop.content == cont)
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
        return this.prop.type == 'stone';
    },
    isTank: function() {
        if (!this.isCell())
            return false;
        return this.prop.type == 'tank';
    },
    controlledMove: function() {
        var $this = this;
        $("body").bind("keypress", function(e) {
            var nb = $this.isNeighbour(e.keyCode);

            if (nb) {
                var direction = $this.getDirrection(nb);
                if (direction === 'u') {
                    $('#' + nb.prop.ID).text("^");
                } else if (direction === 'r') {
                    $('#' + nb.prop.ID).text(">");
                } else if (direction === 'd') {
                    $('#' + nb.prop.ID).text("v");
                } else if (direction === 'l') {
                    $('#' + nb.prop.ID).text("<");
                }

                $this.randomlyChangeContent();
                $this.moveToCell(nb);
            }
        });
    },
    moveToCell: function(targetCell) {
        $('#' + this.prop.ID).removeClass(this.prop.type + ' ' + this.prop.subtype);
        $('#' + targetCell.prop.ID).addClass(this.prop.type + ' ' + this.prop.subtype);
        this.prop.content = targetCell.prop.content;
        this.prop.ID = targetCell.prop.ID;
        this.prop.X = targetCell.prop.X;
        this.prop.Y = targetCell.prop.Y;
    },
    timerMove: function() {
        var $this = this;
        this.timer = setInterval(function() {
            $this.randomMove();
        }, 1000);
        this.prop.ID = $this.prop.ID;
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
        if (this.prop.X == targetCell.prop.X) {
            if (this.prop.Y == targetCell.prop.Y - 1)
                return 'r';
            else if (this.prop.Y == targetCell.prop.Y + 1)
                return 'l';

        } else if (this.prop.Y == targetCell.prop.Y) {
            if (this.prop.X == targetCell.prop.X - 1)
                return 'd';
            else if (this.prop.X == targetCell.prop.X + 1)
                return 'u';
        }
    }
};

var Game = function(options) {
    this.init(options);
};
Game.prototype = {
    constructor: Game,
    init: function(field, options) {
        this.field = field;
        console.log('Field created');
        this.field.populate();
        console.log('Field populated');
        this.field.buildWall({nrStones: 30});
        console.log('Wall built');

        this.myTank = this.field.addTank('friend');
        console.log(this.myTank.prop);
        console.log('My tank created');
        this.myTank.controlledMove();
        console.log('My tank is moving');

        this.enemies = new Array();
        this.enemies[0] = this.field.addTank('enemy');
        console.log(this.enemies[0].prop);
        console.log('Enemy created');
        this.enemies[0].timerMove();
        console.log('My enemy is moving');
    },
    addEnemy: function() {
        var nrEnemies = this.enemies.length;
        this.enemies[nrEnemies] = this.field.addTank('enemy');
        console.log(this.enemies[nrEnemies].prop);
        console.log('New enemy created');
        this.enemies[nrEnemies].timerMove();
        console.log('The new enemy is moving');
    }
};

$(document).ready(function() {
    var game = new Game(new Field());

    $('#enemyCreator').click(function() {
        game.addEnemy();
    });
});