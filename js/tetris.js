'use strict';

/**
 * 2. Sau khi người chơi nhấn nút "Watch Replay", function này sẽ được gọi với tham số là `replay`.
 * Nó sẽ khởi tạo lại tất cả các biến cho việc replay và thực hiện vòng lặp.
 */
function init(gt) {
    if (gt === 'replay') {
        watchingReplay = true;
    } else {
        watchingReplay = false;
        replayKeys = {};
        replayKeys.seed = ~~(Math.random() * 2147483645) + 1;
        gametype = gt;
    }

    lineLimit = 30;

    column = 0;
    keysDown = 0;
    lastKeys = 0;
    released = 255;
    piece.shiftDir = 0;
    piece.shiftReleased = true;

    startPauseTime = 0;
    pauseTime = 0;
    paused = false;

    rng.seed = replayKeys.seed;
    toGreyRow = 21;
    frame = 0;
    lastPos = 'reset';
    stack.new(10, 22);
    hold.piece = void 0;
    if (settings.Gravity === 0) gravity = gravityUnit * 4;
    startTime = Date.now();

    preview.init();

    statsFinesse = 0;
    lines = 0;
    piecesSet = 0;

    statsPiece.innerHTML = piecesSet;
    statsLines.innerHTML = lineLimit - lines;
    statistics();
    clear(stackCtx);
    clear(activeCtx);
    clear(holdCtx);

    if (gametype === 3) {

        digLines = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

        statsLines.innerHTML = 10;
        statsLines.innerHTML = 10;
        var randomNums = [];
        for (var i = 0; i < 10; i++) {
            var random = ~~(rng.next() * 10);
            if (random !== randomNums[i - 1]) randomNums.push(random);
            else i--;
        }
        for (var y = 21; y > 11; y--) {
            for (var x = 0; x < 10; x++) {
                if (randomNums[y - 12] !== x) stack.grid[x][y] = 8;
            }
        }
        stack.draw();
    }

    // 3. Function này nằm trong file menu.js, được gọi với tham số là undefined, do đó
    // tất cả menu sẽ được ẩn đi.
    menu();

    if (gameState === 3) {
        gameState = 2;
        // 5. Thực hiện vòng lặp để lấy dữ liệu và cập nhật màn hình.
        gameLoop();
    } else {
        gameState = 2;
    }
}

function gameLoop() {
    requestAnimFrame(gameLoop);

    frame++;

    if (gameState === 0) {

        if (!paused) {
            // 6. Gọi phương thức update() để thực hiện lấy đữ liệu và cập nhật màn hình.
            update();
        }

        if (
            piece.x !== lastX ||
            Math.floor(piece.y) !== lastY ||
            piece.pos !== lastPos ||
            piece.dirty
        ) {
            clear(activeCtx);
            piece.drawGhost();
            piece.draw();
        }
        lastX = piece.x;
        lastY = Math.floor(piece.y);
        lastPos = piece.pos;
        piece.dirty = false;
    } else if (gameState === 2) {

        if (frame < 50) {
            if (msg.innerHTML !== 'READY') msg.innerHTML = 'READY';
        } else if (frame < 100) {
            if (msg.innerHTML !== 'GO!') msg.innerHTML = 'GO!';
        } else {
            msg.innerHTML = '';
            gameState = 0;
            startTime = Date.now();
            piece.new(preview.next());
        }

        if (lastKeys !== keysDown && !watchingReplay) {
            replayKeys[frame] = keysDown;
        } else if (frame in replayKeys) {
            keysDown = replayKeys[frame];
        }
        if (keysDown & flags.moveLeft) {
            lastKeys = keysDown;
            piece.shiftDelay = settings.DAS;
            piece.shiftReleased = false;
            piece.shiftDir = -1;
        } else if (keysDown & flags.moveRight) {
            lastKeys = keysDown;
            piece.shiftDelay = settings.DAS;
            piece.shiftReleased = false;
            piece.shiftDir = 1;
        }
    } else if (toGreyRow >= 2) {

        if (toGreyRow === 21) clear(activeCtx);
        if (frame % 2) {
            for (var x = 0; x < 10; x++) {
                if (stack.grid[x][toGreyRow]) stack.grid[x][toGreyRow] = gameState - 1;
            }
            stack.draw();
            toGreyRow--;
        }
    }
}



/**
 * Get html elements.
 */
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
/**
 * Setting
 */

<!-- Hửu Phước -->
var cellSize;
var gravityUnit = 0.00390625;
var gravity;
var gravityArr = (function() {
    var array = [];
    array.push(0);
    for (var i = 1; i < 64; i++) array.push(i / 64);
    for (var i = 1; i <= 20; i++) array.push(i);
    return array;
})();

var settings = {
    DAS: 10,
    ARR: 1,
    Gravity: 0,
    'Soft Drop': 31,
    'Lock Delay': 30,
    Size: 0,
    Sound: 0,
    Volume: 100,
    Block: 0,
    Ghost: 0,
    Grid: 0,
    Outline: 0,
};

var setting = {
    DAS: range(0, 31),
    ARR: range(0, 11),
    Gravity: (function() {
        var array = [];
        array.push('Auto');
        array.push('0G');
        for (var i = 1; i < 64; i++) array.push(i + '/64G');
        for (var i = 1; i <= 20; i++) array.push(i + 'G');
        return array;
    })(),
    'Soft Drop': (function() {
        var array = [];
        for (var i = 1; i < 64; i++) array.push(i + '/64G');
        for (var i = 1; i <= 20; i++) array.push(i + 'G');
        return array;
    })(),
    'Lock Delay': range(0, 101),
    Size: ['Auto', 'Small', 'Medium', 'Large'],
    Sound: ['Off', 'On'],
    Volume: range(0, 101),
    Block: ['Shaded', 'Solid', 'Glossy', 'Arika', 'World'],
    Ghost: ['Normal', 'Colored', 'Off'],
    Grid: ['Off', 'On'],
    Outline: ['Off', 'On'],
};
function resize() {
    var a = document.getElementById('a');
    var b = document.getElementById('b');
    var c = document.getElementById('c');
    var content = document.getElementById('content');

    // Aspect ratio: 1.024
    var screenHeight = window.innerHeight - 34;
    var screenWidth = ~~(screenHeight * 1.024);
    if (screenWidth > window.innerWidth)
        screenHeight = ~~(window.innerWidth / 1.024);

    if (settings.Size === 1 && screenHeight > 602) cellSize = 15;
    else if (settings.Size === 2 && screenHeight > 602) cellSize = 30;
    else if (settings.Size === 3 && screenHeight > 902) cellSize = 45;
    else cellSize = Math.max(~~(screenHeight / 20), 10);

    var pad = (window.innerHeight - (cellSize * 20 + 2)) / 2 + 'px';
    content.style.padding = pad + ' 0';
    stats.style.bottom = pad;

    // Size elements
    a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

    stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
    stackCanvas.height = activeCanvas.height = bgStackCanvas.height =
        cellSize * 20;
    b.style.width = stackCanvas.width + 'px';
    b.style.height = stackCanvas.height + 'px';

    holdCanvas.width = cellSize * 4;
    holdCanvas.height = cellSize * 2;
    a.style.width = holdCanvas.width + 'px';
    a.style.height = holdCanvas.height + 'px';

    previewCanvas.width = cellSize * 4;
    previewCanvas.height = stackCanvas.height;
    c.style.width = previewCanvas.width + 'px';
    c.style.height = b.style.height;


    msg.style.lineHeight = b.style.height;
    msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
    stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
    document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';

    stats.style.width = a.style.width;
    for (var i = 0, len = h3.length; i < len; i++) {
        h3[i].style.lineHeight = a.style.height;
        h3[i].style.fontSize = stats.style.fontSize;
    }

    // Redraw graphics
    makeSprite();

    if (settings.Grid === 1) bg(bgStackCtx);

    if (gameState === 0) {
        piece.drawGhost();
        piece.draw();
        stack.draw();
        preview.draw();
        if (hold.piece) {
            hold.draw();
        }
    }
}
addEventListener('resize', resize, false);





function makeSprite() {
    var shaded = [
        // 0         +10        -10        -20
        ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
        ['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
        ['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
        ['#e67e23', '#ff993f', '#c86400', '#a94b00'],
        ['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
        ['#9ccd38', '#b9e955', '#81b214', '#659700'],
        ['#9c5ab8', '#b873d4', '#81409d', '#672782'],
        ['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
        ['#898989', '#a3a3a3', '#6f6f6f', '#575757'],
    ];
    var glossy = [
        //25         37         52         -21        -45
        ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
        ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
        ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
        ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
        ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
        ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
        ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
        ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
        ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f'],
    ];
    var tgm = [
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
        ['#f08000', '#a00000', '#e86008', '#b00000'],
        ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
        ['#f8a800', '#b84000', '#e89800', '#c85800'],
        ['#e8e000', '#886800', '#d8c800', '#907800'],
        ['#f828f8', '#780078', '#e020e0', '#880088'],
        ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
        ['#78f800', '#007800', '#58e000', '#008800'],
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
    ];
    var world = [];
    world[0] = tgm[0];
    world[1] = tgm[6];
    world[2] = tgm[2];
    world[3] = tgm[3];
    world[4] = tgm[4];
    world[5] = tgm[7];
    world[6] = tgm[5];
    world[7] = tgm[1];
    world[8] = tgm[8];


    // Hửu Phước (613-699)
    spriteCanvas.width = cellSize * 9;
    spriteCanvas.height = cellSize;
    for (var i = 0; i < 9; i++) {
        var x = i * cellSize;
        if (settings.Block === 0) {
            // Shaded
            spriteCtx.fillStyle = shaded[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            spriteCtx.fillStyle = shaded[i][3];
            spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x, cellSize);
            spriteCtx.fill();

            spriteCtx.fillStyle = shaded[i][2];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x + cellSize, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x + cellSize, cellSize);
            spriteCtx.fill();
        } else if (settings.Block === 1) {
            // Flat
            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
        } else if (settings.Block === 2) {
            // Glossy
            var k = Math.max(~~(cellSize * 0.083), 1);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0.5, glossy[i][3]);
            grad.addColorStop(1, glossy[i][4]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0, glossy[i][2]);
            grad.addColorStop(0.5, glossy[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(
                x + k,
                k,
                x + cellSize - k,
                cellSize - k,
            );
            grad.addColorStop(0, shaded[i][0]);
            grad.addColorStop(0.5, glossy[i][0]);
            grad.addColorStop(0.5, shaded[i][0]);
            grad.addColorStop(1, glossy[i][0]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
        } else if (settings.Block === 3 || settings.Block === 4) {
            // Arika
            if (settings.Block === 4) tgm = world;
            var k = Math.max(~~(cellSize * 0.125), 1);

            spriteCtx.fillStyle = tgm[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
            spriteCtx.fillStyle = tgm[i][0];
            spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
            grad.addColorStop(0, tgm[i][0]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, k, k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
        }
    }
}function makeSprite() {
    var shaded = [
        // 0         +10        -10        -20
        ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
        ['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
        ['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
        ['#e67e23', '#ff993f', '#c86400', '#a94b00'],
        ['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
        ['#9ccd38', '#b9e955', '#81b214', '#659700'],
        ['#9c5ab8', '#b873d4', '#81409d', '#672782'],
        ['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
        ['#898989', '#a3a3a3', '#6f6f6f', '#575757'],
    ];
    var glossy = [
        //25         37         52         -21        -45
        ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
        ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
        ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
        ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
        ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
        ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
        ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
        ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
        ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f'],
    ];
    var tgm = [
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
        ['#f08000', '#a00000', '#e86008', '#b00000'],
        ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
        ['#f8a800', '#b84000', '#e89800', '#c85800'],
        ['#e8e000', '#886800', '#d8c800', '#907800'],
        ['#f828f8', '#780078', '#e020e0', '#880088'],
        ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
        ['#78f800', '#007800', '#58e000', '#008800'],
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
    ];
    var world = [];
    world[0] = tgm[0];
    world[1] = tgm[6];
    world[2] = tgm[2];
    world[3] = tgm[3];
    world[4] = tgm[4];
    world[5] = tgm[7];
    world[6] = tgm[5];
    world[7] = tgm[1];
    world[8] = tgm[8];


    // Hửu Phước (613-699)
    spriteCanvas.width = cellSize * 9;
    spriteCanvas.height = cellSize;
    for (var i = 0; i < 9; i++) {
        var x = i * cellSize;
        if (settings.Block === 0) {
            // Shaded
            spriteCtx.fillStyle = shaded[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            spriteCtx.fillStyle = shaded[i][3];
            spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x, cellSize);
            spriteCtx.fill();

            spriteCtx.fillStyle = shaded[i][2];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x + cellSize, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x + cellSize, cellSize);
            spriteCtx.fill();
        } else if (settings.Block === 1) {
            // Flat
            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
        } else if (settings.Block === 2) {
            // Glossy
            var k = Math.max(~~(cellSize * 0.083), 1);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0.5, glossy[i][3]);
            grad.addColorStop(1, glossy[i][4]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0, glossy[i][2]);
            grad.addColorStop(0.5, glossy[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(
                x + k,
                k,
                x + cellSize - k,
                cellSize - k,
            );
            grad.addColorStop(0, shaded[i][0]);
            grad.addColorStop(0.5, glossy[i][0]);
            grad.addColorStop(0.5, shaded[i][0]);
            grad.addColorStop(1, glossy[i][0]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
        } else if (settings.Block === 3 || settings.Block === 4) {
            // Arika
            if (settings.Block === 4) tgm = world;
            var k = Math.max(~~(cellSize * 0.125), 1);

            spriteCtx.fillStyle = tgm[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
            spriteCtx.fillStyle = tgm[i][0];
            spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

            var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
            grad.addColorStop(0, tgm[i][0]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, k, k, cellSize - k);

            var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
        }
    }
}

spriteCanvas.width = cellSize * 9;
spriteCanvas.height = cellSize;
for (var i = 0; i < 9; i++) {
    var x = i * cellSize;
    if (settings.Block === 0) {
        // Shaded
        spriteCtx.fillStyle = shaded[i][1];
        spriteCtx.fillRect(x, 0, cellSize, cellSize);

        spriteCtx.fillStyle = shaded[i][3];
        spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

        spriteCtx.fillStyle = shaded[i][0];
        spriteCtx.beginPath();
        spriteCtx.moveTo(x, 0);
        spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
        spriteCtx.lineTo(x, cellSize);
        spriteCtx.fill();

        spriteCtx.fillStyle = shaded[i][2];
        spriteCtx.beginPath();
        spriteCtx.moveTo(x + cellSize, 0);
        spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
        spriteCtx.lineTo(x + cellSize, cellSize);
        spriteCtx.fill();
    }
} else if (settings.Block === 1) {
    // Flat
    spriteCtx.fillStyle = shaded[i][0];
    spriteCtx.fillRect(x, 0, cellSize, cellSize);
} else if (settings.Block === 2) {
    // Glossy
    var k = Math.max(~~(cellSize * 0.083), 1);

    var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
    grad.addColorStop(0.5, glossy[i][3]);
    grad.addColorStop(1, glossy[i][4]);
    spriteCtx.fillStyle = grad;
    spriteCtx.fillRect(x, 0, cellSize, cellSize);

    var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
    grad.addColorStop(0, glossy[i][2]);
    grad.addColorStop(0.5, glossy[i][1]);
    spriteCtx.fillStyle = grad;
    spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

    var grad = spriteCtx.createLinearGradient(
        x + k,
        k,
        x + cellSize - k,
        cellSize - k,
    );
    grad.addColorStop(0, shaded[i][0]);
    grad.addColorStop(0.5, glossy[i][0]);
    grad.addColorStop(0.5, shaded[i][0]);
    grad.addColorStop(1, glossy[i][0]);
    spriteCtx.fillStyle = grad;
    spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
}
