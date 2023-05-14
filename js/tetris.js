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