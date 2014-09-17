function freehandTool(editor, toolbar) {
    "use strict";
    var currentColor, lastPoint, quickAccess;

    function createPalette(width, height) {
        var canvas, ctx, i;
        canvas = ElementHelper.create("canvas", {"width": width, "height": height, "style": {"cursor": "crosshair"}});
        ctx = canvas.getContext("2d");
        for (i = 0; i < 16; i += 1) {
            ctx.fillStyle = editor.getRGBAColorFor(i, 1);
            ctx.fillRect(
                (i % 8) * canvas.width / 8,
                (i < 8) ? canvas.height / 2 : 0,
                canvas.width / 8,
                canvas.height / 2
            );
        }
        return canvas;
    }

    quickAccess = createPalette(160, 40);

    function colorChange(col) {
        currentColor = col;
    }

    function quickAccessSelection(evt) {
        var pos, col;
        pos = evt.currentTarget.getBoundingClientRect();
        col = ((1 - Math.floor((evt.clientY - pos.top) / 20))) * 8 + Math.floor((evt.clientX - pos.left) / 20);
        editor.setCurrentColor(col);
        toolbar.giveFocus("freehand");
    }

    quickAccess.addEventListener("mousedown", quickAccessSelection, false);

    quickAccess.addEventListener("mousemove", function (evt) {
        var mouseButton;
        mouseButton = (evt.buttons !== undefined) ? evt.buttons : evt.which;
        if (mouseButton) {
            quickAccessSelection(evt);
        }
    }, false);

    function freehand(block, currentColorBias) {
        editor.setBlock(block, currentColor, currentColorBias, currentColor);
    }

    function blockLine(from, to, currentColorBias) {
        editor.blockLine(from, to, function (block, setBlockLineBlock) {
            setBlockLineBlock(block, currentColor);
        }, currentColorBias, currentColor);
    }

    function sampleBlock(block) {
        if (block.isBlocky) {
            if (block.isUpperHalf) {
                editor.setCurrentColor(block.upperBlockColor);
            } else {
                editor.setCurrentColor(block.lowerBlockColor);
            }
            return true;
        }
        return false;
    }

    function canvasDown(coord) {
        if (coord.ctrlKey) {
            toolbar.sampleBlock(coord);
        } else {
            if (coord.shiftKey && lastPoint) {
                editor.startOfChunk();
                blockLine(lastPoint, coord, !coord.altKey);
                editor.endOfChunk();
            } else {
                editor.startOfFreehand();
                freehand(coord, !coord.altKey);
            }
            lastPoint = coord;
        }
    }

    function canvasDrag(coord) {
        blockLine(lastPoint, coord, !coord.altKey);
        lastPoint = coord;
    }

    function init() {
        editor.addMouseDownListener(canvasDown);
        editor.addMouseDragListener(canvasDrag);
        editor.addColorChangeListener(colorChange);
        currentColor = editor.getCurrentColor();
        return true;
    }

    function remove() {
        editor.removeMouseDownListener(canvasDown);
        editor.removeMouseDragListener(canvasDrag);
        editor.removeColorChangeListener(colorChange);
    }

    function toString() {
        return "Freehand";
    }

    return {
        "init": init,
        "remove": remove,
        "toString": toString,
        "uid": "freehand",
        "quickAccess": quickAccess,
        "sampleBlock": sampleBlock,
        "autoselect": true
    };
}

AnsiEditController.addTool(freehandTool, "tools-right", 102);