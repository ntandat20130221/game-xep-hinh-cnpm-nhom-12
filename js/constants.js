//Get html elements.
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');
var statsTime = document.getElementById('time');
var statsLines = document.getElementById('line');
var statsPiece = document.getElementById('piece');
var h3 = document.getElementsByTagName('h3');
var set = document.getElementById('settings');

// Get canvases and contexts
var holdCanvas = document.getElementById('hold');
var bgStackCanvas = document.getElementById('bgStack');
var stackCanvas = document.getElementById('stack');
var activeCanvas = document.getElementById('active');
var previewCanvas = document.getElementById('preview');
var spriteCanvas = document.getElementById('sprite');

var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');

//Piece data

// NOTE y values are inverted since our matrix counts from top to bottom.
var kickData = [
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
];
var kickDataI = [
    [[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
    [[-1, 0], [0, 0], [0, 0], [0, -1], [0, 2]],
    [[-1, -1], [1, -1], [-2, -1], [1, 0], [-2, 0]],
    [[0, -1], [0, -1], [0, -1], [0, 1], [0, -2]],
];

var kickDataO = [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];

// Define shapes and spawns.
var PieceI = {
    index: 0,
    x: 2,
    y: -1,
    kickData: kickDataI,
    tetro: [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
    ],
};
var PieceJ = {
    index: 1,
    x: 3,
    y: 0,
    kickData: kickData,
    tetro: [[2, 2, 0], [0, 2, 0], [0, 2, 0]],
};
var PieceL = {
    index: 2,
    x: 3,
    y: 0,
    kickData: kickData,
    tetro: [[0, 3, 0], [0, 3, 0], [3, 3, 0]],
};
var PieceO = {
    index: 3,
    x: 4,
    y: 0,
    kickData: kickDataO,
    tetro: [[4, 4], [4, 4]],
};
var PieceS = {
    index: 4,
    x: 3,
    y: 0,
    kickData: kickData,
    tetro: [[0, 5, 0], [5, 5, 0], [5, 0, 0]],
};
var PieceT = {
    index: 5,
    x: 3,
    y: 0,
    kickData: kickData,
    tetro: [[0, 6, 0], [6, 6, 0], [0, 6, 0]],
};
var PieceZ = {
    index: 6,
    x: 3,
    y: 0,
    kickData: kickData,
    tetro: [[7, 0, 0], [7, 7, 0], [0, 7, 0]],
};

// Finesse data
// index x orientatio x column = finesse
// finesse[0][0][4] = 1
// TODO double check these.
var finesse = [
    [
        [1, 2, 1, 0, 1, 2, 1],
        [2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
        [1, 2, 1, 0, 1, 2, 1],
        [2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
    ],
    [
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2, 2],
    ],
    [
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2, 2],
    ],
    [
        [1, 2, 2, 1, 0, 1, 2, 2, 1],
        [1, 2, 2, 1, 0, 1, 2, 2, 1],
        [1, 2, 2, 1, 0, 1, 2, 2, 1],
        [1, 2, 2, 1, 0, 1, 2, 2, 1],
    ],
    [
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 3, 2, 2],
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 3, 2, 2],
    ],
    [
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2],
        [2, 3, 2, 1, 2, 3, 3, 2, 2],
    ],
    [
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 3, 2, 2],
        [1, 2, 1, 0, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 3, 2, 2],
    ],
];

var lineLimit = 30;
var gravityUnit = 0.00390625;