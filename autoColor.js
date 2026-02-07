/**
 * Auto Color addon by Zyphdoz
 * This addon creates a multicolored button next to the other color choices.
 * When checked it will detect which shapes you are drawing and change the color accordingly.
 */
(() => {
    /**
     * mini is a global variable defined in index.html
     * it tells us which "mode" we are on
     * the possible values are:
     * 0 - edit (full UI with editing controls)
     * 1 - view (simple view with next/prev frame controls only)
     * 2 - list (list view with all frames shown on screen at the same time)
     * 
     * this addon relies on things that only exist in edit mode
     * so we must return early if we are not in edit mode
     */
    if (mini !== 0) return;

    // get all the references we need to existing UI elements
    const colorButtonContainers = document.getElementsByName('fcl');
    const colorButtons = Array.from(colorButtonContainers, button =>
        button.querySelector('input[type="radio"]')
    );
    const fillRowButton = document.getElementById('frow');
    const guidelineButton = document.getElementById('clt');
    const boardCells = Array.from(document.getElementsByName('fld'));

    // background for the new button
    const guidelineColors = 'linear-gradient(to right, cyan, orange, yellow, red, magenta, blue, lightgreen, gray)';
    const arikaColors = 'linear-gradient(to right, red, orange, yellow, green, cyan, blue, magenta, gray)';
        
    // keep track of which color was originally checked so we can restore it
    let originalCheckedColor = colorButtons.findIndex(button => button.checked);
    let mouseIsDown = false;

    // lastFourCells represents the most recent four distinct cells the cursor passed through while drawing.
    const lastFourCells = [-1,-1,-1,-1];

    const resetLastFourCells = () => {
        for (let i = 0; i < lastFourCells.length; i++) {
            lastFourCells[i] = -1;
        }
    }

    /**
     * prevent auto color from triggering when we are erasing cells
     * by checking the last clicked cells background color
     */ 
    let lastClickedCell = -1;
    const isErasing = () => {
       // if (lastFourCells[lastFourCells.length-1] === -1) return false;
        if (lastClickedCell === -1) return false;
        //const clickedCellBgColor = boardCells[lastFourCells[lastFourCells.length-1]].style.backgroundColor;
        return boardCells[lastClickedCell].style.backgroundColor === 'rgb(0, 0, 0)' || boardCells[lastClickedCell].style.backgroundColor === 'rgb(51, 51, 51)';
    }

    /**
     * This prevents auto-coloring when erasing, filling rows, or when no color is selected, 
     * ensuring only intentional drawing triggers recoloring.
     * @returns true when it makes sense to auto update the colors, otherwise false
     */
    const shouldUpdate = () => {
        return mouseIsDown
            && rainbowButton.checked 
            && colorButtons.some(input => input.checked)
            && !isErasing()
            && !fillRowButton.checked;
    }

    /**
     * This function precomputes every valid board placement for each tetromino by sliding each shape across the grid one cell at a time.
     * @returns a map where the keys are all the possible positions a piece can be drawn.
     * one position is represented as a comma separated string of four cells in ascending order.
     * the value for each key is the piece color associated with those cells represented as a number.
     * the piece color number corresponds to the order the colors appear in the Place Blocks section of the fumen.
     * for example, looking up '0,1,2,3' would return 0 because the I piece is the only piece that can occupy those cells
     * and I is the first (0th) index of the piece colors.
     */
    const findAllCoordinates = () => {
        // these numbers represent the topleftmost cells that a piece can be drawn in.
        // the cells are expected to be in ascending order
        const I_Horizontal = [0,1,2,3];
        const I_Vertical = [0,10,20,30];

        const L_Spawn = [2,10,11,12]
        const L_CW = [0,10,20,21];
        const L_CCW = [0,1,11,21];
        const L_180 = [0,1,2,10];

        const O = [0,1,10,11];

        const Z_Horizontal = [0,1,11,12];
        const Z_Vertical = [1,10,11,20];

        const T_Spawn = [1,10,11,12];
        const T_CW = [0,10,11,20];
        const T_CCW = [1,10,11,21];
        const T_180 = [0,1,2,11];

        const J_Spawn = [0,10,11,12];
        const J_CW = [0,1,10,20];
        const J_CCW = [1,11,20,21];
        const J_180 = [0,1,2,12];

        const S_Horizontal = [1,2,10,11];
        const S_Vertical = [0,10,11,21];


        /**
         * a map where the key is the occupied cells in ascending order as a comma separated string
         * and the value is the color of the piece as a number 0 to 7, the number maps to the order the 
         * colors appear on the Place Blocks section at the top of the fumen. 
         * (e.g. looking up the key '0,1,2,3' should return 0 because only an I piece can occupy those cells and it is the leftmost color)
         */
        const pieceMap = new Map();

        /**
         * loops over the cells and increments each of them by one every iteration of the loop
         * so we end up with a map of all possible cells that piece can occupy.
         * @param pieceCoordinates an array of the topleftmost cells that the piece can occupy
         * @param pieceColor number 0 to 7, equivalent to the order the colors appear on the Place Blocks section at the top of the fumen.
         */
        const addToMap = (pieceCoordinates, pieceColor) => {
            const currentCoordinates = [...pieceCoordinates];
            let key = currentCoordinates.toString();
            pieceMap.set(key,pieceColor);

            for (let i = 0; i < boardCells.length; i++) {
                for (let j = 0; j < currentCoordinates.length; j++) {
                    currentCoordinates[j]++;
                    if (j === currentCoordinates.length -1) {
                        // we do not want to add invalid cases where a piece goes off the edges of the board
                        // e.g. 7,8,9,10 is invalid for an I piece because 9 is rightmost cell of row 1
                        // and 10 is leftmost cell of row 2
                        const isOnBothEdgesOfTheBoard = 
                            currentCoordinates.some(cell => cell % 10 === 0) && 
                            currentCoordinates.some(cell => cell % 10 === 9);
                        const hasReachedEndOfBoard = 
                            currentCoordinates.some(cell => cell >= boardCells.length)
                        
                        if (isOnBothEdgesOfTheBoard || hasReachedEndOfBoard) continue;

                        pieceMap.set(currentCoordinates.toString(),pieceColor);
                    }
                }
            }
        }

        addToMap(I_Horizontal,0);
        addToMap(I_Vertical,0);
        addToMap(L_Spawn,1);
        addToMap(L_CW,1);
        addToMap(L_CCW,1);
        addToMap(L_180,1);
        addToMap(O,2);
        addToMap(Z_Horizontal,3);
        addToMap(Z_Vertical,3);
        addToMap(T_Spawn,4);
        addToMap(T_CW,4);
        addToMap(T_CCW,4);
        addToMap(T_180,4);
        addToMap(J_Spawn,5);
        addToMap(J_CW,5);
        addToMap(J_CCW,5);
        addToMap(J_180,5);
        addToMap(S_Horizontal,6);
        addToMap(S_Vertical,6);

        return pieceMap;
    }

    const allCoordinatesMap = findAllCoordinates();

    /**
     * Tracks the most recent four distinct cells the cursor passed through while drawing.
     * Once a tetromino shape is detected, the color is switched and the last four cells 
     * are moused over to recolor them immediately.
     */
    const updateCells = (cellId) => {
        if (!shouldUpdate()) return;

        // don't update if we move over the same cell twice
        if (lastFourCells.some(cell => cell === cellId)) return;

        lastFourCells.push(cellId);
        lastFourCells.shift();
        
        const sortedLastFour = [...lastFourCells].sort((a, b) => a - b);
        const pieceColor = allCoordinatesMap.get(sortedLastFour.toString());

        if (pieceColor === undefined) return; // undefined when our last four cells do not match any piece shape
 
        // if our last four cells matches a piece shape, recolor those cells with that shapes color
        colorButtons[pieceColor].click();
        for (let i = 0; i < lastFourCells.length; i++) {
            boardCells[lastFourCells[i]].dispatchEvent(
                new MouseEvent("mousemove", {
                    bubbles: true,
                    cancelable: true,
                    clientX: 0,
                    clientY: 0
                })
            )
        }

        resetLastFourCells();
    }

    /**
     * Injects the auto draw button at the start of the color choice buttons
     * @returns a reference to the new rainbow button and container
     */
    const injectRainbowButton = () => {

        const firstButtonContainer = colorButtonContainers[0];

        const rainbowButtonContainer = document.createElement('td');

        rainbowButtonContainer.style.background = guidelineButton.checked === true ? guidelineColors : arikaColors;
        rainbowButtonContainer.title = 'Auto Color: when checked, automatically sets the color of the piece you are drawing';
        rainbowButtonContainer.id = 'rainbowButtonContainer';
        
        // we intentionally do not give this button the same name and id as the 
        // other color picker buttons because that breaks other features in fumen
        const rainbowButton = document.createElement('input');
        rainbowButton.style.margin = '3px 3px 0px 5px';
        rainbowButton.type = 'checkbox';
        rainbowButton.id = 'autoColorButton';
        
        rainbowButtonContainer.appendChild(rainbowButton);
        
        rainbowButtonContainer.addEventListener('click', (e) => {
            if (e.target !== rainbowButton) {
                rainbowButton.checked = !rainbowButton.checked;
                rainbowButton.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        firstButtonContainer.insertAdjacentElement('beforebegin', rainbowButtonContainer);

        return {rainbowButton, rainbowButtonContainer};

    }

    const {rainbowButton, rainbowButtonContainer} = injectRainbowButton();

    /**
     * Adds event listeners to track which board cells the user is drawing in
     * and to update the background color of the button if the guideline checkbox gets toggled
     */
    const addEventListeners = () => {
        for (let i = 0; i < boardCells.length; i++) {
            boardCells[i].addEventListener('mousedown', () => {
                originalCheckedColor = colorButtons.findIndex(button => button.checked);
                mouseIsDown = true;
                lastClickedCell = i;
                updateCells(i);
            });
            boardCells[i].addEventListener('mouseenter', () => {
                updateCells(i);
            });
        }
        guidelineButton.addEventListener('click', () => {
            rainbowButtonContainer.style.background = guidelineButton.checked === true ? guidelineColors : arikaColors;
        });
        document.addEventListener('mouseup', () => {
            lastClickedCell = -1;
            if(shouldUpdate()) {
                mouseIsDown = false;
                resetLastFourCells();
                if (originalCheckedColor !== -1) {
                    colorButtons[originalCheckedColor].click();
                }
            }
        });
    }

    addEventListeners();
})();
