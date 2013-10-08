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