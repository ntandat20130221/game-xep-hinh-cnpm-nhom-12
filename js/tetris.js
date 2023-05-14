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

        gameLoop();
    } else {
        gameState = 2;
    }
}