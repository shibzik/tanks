function _d(msg) {
    if (typeof Debug != undefined && Debug == true)
        console.log(msg);
}

// transform 2 numbers in cell ID
function CoordToStr(x, y) {
    var xstr = x.toString(), ystr = y.toString();
    if (xstr.length == 1)
        xstr = '0' + xstr;

    if (ystr.length == 1)
        ystr = '0' + ystr;

    return 'x' + xstr + 'y' + ystr;
}
// return 2 number coodinates from cell ID
function StrToCoord(ID) {
    var coord = new Array(2);
    ID = ID.substring(1, ID.length);
    coord = ID.split('y');
    return {x: parseInt(coord[0]), y: parseInt(coord[1])};
}
// return char A-Z according to num value 97-122
function numToChar(val) {
    var rez = '';
    if (val == 97)
        rez = 'A'
    else if (val == 98)
        rez = 'B'
    else if (val == 99)
        rez = 'C'
    else if (val == 100)
        rez = 'D'
    else if (val == 101)
        rez = 'E'
    else if (val == 102)
        rez = 'F'
    else if (val == 103)
        rez = 'G'
    else if (val == 104)
        rez = 'H'
    else if (val == 105)
        rez = 'I'
    else if (val == 106)
        rez = 'J'
    else if (val == 107)
        rez = 'K'
    else if (val == 108)
        rez = 'L'
    else if (val == 109)
        rez = 'M'
    else if (val == 110)
        rez = 'N'
    else if (val == 111)
        rez = 'O'
    else if (val == 112)
        rez = 'P'
    else if (val == 113)
        rez = 'Q'
    else if (val == 114)
        rez = 'R'
    else if (val == 115)
        rez = 'S'
    else if (val == 116)
        rez = 'T'
    else if (val == 117)
        rez = 'U'
    else if (val == 118)
        rez = 'V'
    else if (val == 119)
        rez = 'W'
    else if (val == 120)
        rez = 'X'
    else if (val == 121)
        rez = 'Y'
    else if (val == 122)
        rez = 'Z'
    return rez;
}
// return num 97-122 according to char value A-Z
function charToNum(val)
{
    var rez = 0;
    if (val == 'A')
        rez = 97
    else if (val == 'B')
        rez = 98
    else if (val == 'C')
        rez = 99
    else if (val == 'D')
        rez = 100
    else if (val == 'E')
        rez = 101
    else if (val == 'F')
        rez = 102
    else if (val == 'G')
        rez = 103
    else if (val == 'H')
        rez = 104
    else if (val == 'I')
        rez = 105
    else if (val == 'J')
        rez = 106
    else if (val == 'K')
        rez = 107
    else if (val == 'L')
        rez = 108
    else if (val == 'M')
        rez = 109
    else if (val == 'N')
        rez = 110
    else if (val == 'O')
        rez = 111
    else if (val == 'P')
        rez = 112
    else if (val == 'Q')
        rez = 113
    else if (val == 'R')
        rez = 114
    else if (val == 'S')
        rez = 115
    else if (val == 'T')
        rez = 116
    else if (val == 'U')
        rez = 117
    else if (val == 'V')
        rez = 118
    else if (val == 'W')
        rez = 119
    else if (val == 'X')
        rez = 120
    else if (val == 'Y')
        rez = 121
    else if (val == 'Z')
        rez = 122
}

// create an n-dimensional array
function createArray(length) {
    var arr = new Array(length || 0),
            i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--)
            arr[length - 1 - i] = this.createArray.apply(this, args);
    }

    return arr;
}

function inArray(arr, el) {
    var isInArray = false;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == el)
            isInArray = i;
    }

    return isInArray;
}

function getRandInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function getRandElem(arr) {
    var rd = Math.floor((Math.random() * arr.length));
    return arr[rd];
}