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

    const storage = window.createSettings('fumen_settings', defaultFumenSettings);

    let fumenSettings = storage.load();


    /**
     * keep track of the state of the Auto Output button between sessions
     */
    const outputDataButton = document.getElementById('out');
    const autoOutputButton = document.getElementById('aout');
    const setAutoOutputButtonState = () => {
        if (!autoOutputButton.checked && fumenSettings.autoOutputCheckedByDefault) {
            autoOutputButton.checked = true;
        } else if (autoOutputButton.checked && !fumenSettings.autoOutputCheckedByDefault) {
            autoOutputButton.checked = false;
        }
        // click the output data button once on load if auto output is enabled for better UX
        setTimeout(() => {
            outputDataButton.click();
            fumenstringField.focus();
        }, 50);
    }
    setAutoOutputButtonState();
    autoOutputButton.addEventListener('click', () => {
        storage.save({autoOutputCheckedByDefault:!storage.load().autoOutputCheckedByDefault});
    });

    // the settings button at the bottom of the page
    const settingsTitle = document.createElement('input');
    settingsTitle.type = 'button';
    settingsTitle.style.width = 'fit-content';
    settingsTitle.value = "Settings";
    settingsTitle.addEventListener('click', () => {
        settingsContainer.style.display = settingsContainer.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('viewjmp').insertAdjacentElement('beforebegin',settingsTitle);

    // container for the whole settings menu
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'theme2';
    settingsContainer.style.border = '2px inset #767676';
    settingsContainer.style.width = 'fit-content';
    settingsContainer.style.padding = '0px 4px'
    settingsContainer.id = 'settingscontainer';
    settingsContainer.style.display = 'none';

    /**
     * Setting to prevent accidental closing of page. formerly known as onclose.js addon
     */
    const oncloseContainer = document.createElement('div');
    const oncloseCheckbox = document.createElement('input');
    oncloseCheckbox.type = 'checkbox';
    oncloseCheckbox.id = 'onclose';
    oncloseCheckbox.name = 'onclose';
    oncloseCheckbox.checked = fumenSettings.onclose;
    oncloseCheckbox.onclick = () => {
        storage.save({onclose:!storage.load().onclose})
    };
    const oncloseLabel = document.createElement('label');
    oncloseLabel.htmlFor = 'onclose';
    oncloseLabel.textContent = 'Prevent accidental closing of tab';
    oncloseLabel.title = 'Shows a confirm dialog when you attempt to close the tab';
    oncloseContainer.appendChild(oncloseCheckbox);
    oncloseContainer.appendChild(oncloseLabel);
    window.onbeforeunload = () => {
        if (!mini && updateflag && oncloseCheckbox.checked) {
            return STRING_DESTROY_CONFIRM;
        }
    };

    /**
     * Setting to always show addon UI
     * This removes the need to click on the addon button.
     * We forced this behaviour in previous update but some users 
     * preferred the smaller view so it should be a settings instead.
     */
    const alwaysShowAddonUiContainer = document.createElement('div');
    const alwaysShowAddonUiCheckbox = document.createElement('input');
    alwaysShowAddonUiCheckbox.type = 'checkbox';
    alwaysShowAddonUiCheckbox.id = 'alwaysShowAddonUi';
    alwaysShowAddonUiCheckbox.name = 'alwaysShowAddonUi';
    alwaysShowAddonUiCheckbox.checked = fumenSettings.alwaysShowAddonUI;
    alwaysShowAddonUiCheckbox.onclick = () => {
        storage.save({alwaysShowAddonUI:!storage.load().alwaysShowAddonUI});
    };
    const alwaysShowAddonUiLabel = document.createElement('label');
    alwaysShowAddonUiLabel.htmlFor = 'alwaysShowAddonUi';
    alwaysShowAddonUiLabel.textContent = 'Always show addon UI';
    alwaysShowAddonUiLabel.title = "Keep this checked if you don't want to click the add-on button every time";
    alwaysShowAddonUiContainer.appendChild(alwaysShowAddonUiCheckbox);
    alwaysShowAddonUiContainer.appendChild(alwaysShowAddonUiLabel);

    const hotkeysTitle = document.createElement('div');
    hotkeysTitle.style.fontWeight = 'bold';
    hotkeysTitle.style.margin = '4px 0px';
    hotkeysTitle.textContent = '-----Keyboard shortcuts-----';

    const colorButtons = Array.from(document.getElementsByName("fcl"), button =>
        button.querySelector('input[type="radio"]')
    );

    /**
     * Setting to show list view under editor
     * When enabled, the list view is rendered below the editor.
     */
    const showListViewUnderEditorContainer = document.createElement('div');
    const showListViewUnderEditorCheckbox = document.createElement('input');
    showListViewUnderEditorCheckbox.type = 'checkbox';
    showListViewUnderEditorCheckbox.id = 'showListViewUnderEditor';
    showListViewUnderEditorCheckbox.name = 'showListViewUnderEditor';
    showListViewUnderEditorCheckbox.checked = fumenSettings.showListViewUnderEditor;
    showListViewUnderEditorCheckbox.onclick = () => {
        const showListViewUnderEditor = !storage.load().showListViewUnderEditor
        storage.save({
            showListViewUnderEditor: showListViewUnderEditor
        });

        // settings is a global defined in index.html
        // ideally we'd avoid modifying that from here but refactoring to avoid this isn't worth the effort
        settings.showListViewUnderEditor = showListViewUnderEditor;
        
        if (showListViewUnderEditor){
            dumpstep = storage.load().dumpstep ?? 5;
            renderListViewForEditPage(1);
        } else {
            const existingListView = document.getElementById('listview');
            if (existingListView){
                existingListView.remove();
            }        
        }
    };
    const showListViewUnderEditorLabel = document.createElement('label');
    showListViewUnderEditorLabel.htmlFor = 'showListViewUnderEditor';
    showListViewUnderEditorLabel.textContent = 'Show list view under editor';
    showListViewUnderEditorLabel.title = 'Display the list view below the editor.';
    showListViewUnderEditorContainer.appendChild(showListViewUnderEditorCheckbox);
    showListViewUnderEditorContainer.appendChild(showListViewUnderEditorLabel);

    /**
     * Setting for frames per row in list view
     * Controls how many frames are shown per row.
     */
    const framesPerRowContainer = document.createElement('div');
    const framesPerRowInput = document.createElement('input');
    framesPerRowInput.type = 'number';
    framesPerRowInput.style.width = '42px';
    framesPerRowInput.style.marginLeft = '4px';
    framesPerRowInput.style.marginRight = '3px';
    framesPerRowInput.id = 'framesPerRow';
    framesPerRowInput.name = 'framesPerRow';
    framesPerRowInput.min = '1';
    framesPerRowInput.step = '1';
    framesPerRowInput.value = storage.load().dumpstep ?? 5;
    framesPerRowInput.onchange = () => {
        const value = parseInt(framesPerRowInput.value, 10);
        if (!isNaN(value) && value > 0) {
            storage.save({ dumpstep: value });
            settings.dumpstep = value;
            if (storage.load().showListViewUnderEditor){
                renderListViewForEditPage(1);
            }
        }
    };
    const framesPerRowLabel = document.createElement('label');
    framesPerRowLabel.htmlFor = 'framesPerRow';
    framesPerRowLabel.textContent = 'Frames per row in list view';
    framesPerRowLabel.title = 'Number of frames displayed per row in list view';
    framesPerRowContainer.appendChild(framesPerRowInput);
    framesPerRowContainer.appendChild(framesPerRowLabel);

    // variables are named by piece rather than color because guideline and arika has different colors
    const I_ColorButton = colorButtons[0];
    const L_ColorButton = colorButtons[1];
    const O_ColorButton = colorButtons[2];
    const Z_ColorButton = colorButtons[3];
    const T_ColorButton = colorButtons[4];
    const J_ColorButton = colorButtons[5];
    const S_ColorButton = colorButtons[6];
    const G_ColorButton = colorButtons[7];
    const autoColorButton = document.getElementById('autoColorButton');

    const pieceButtons = Array.from(document.getElementsByName("pcl"), button =>
        button.querySelector('input[type="radio"]')
    );

    // guideline spawn orientations
    const I_pieceButton = pieceButtons[2];
    const L_pieceButton = pieceButtons[6];
    const O_pieceButton = pieceButtons[10];
    const Z_pieceButton = pieceButtons[14];
    const T_pieceButton = pieceButtons[18];
    const J_pieceButton = pieceButtons[22];
    const S_pieceButton = pieceButtons[26];
    // arika spawn orientations
    const I_arsPieceButton = pieceButtons[0];
    const L_arsPieceButton = pieceButtons[4];
    const O_arsPieceButton = pieceButtons[8];
    const Z_arsPieceButton = pieceButtons[12];
    const T_arsPieceButton = pieceButtons[16];
    const J_arsPieceButton = pieceButtons[20];
    const S_arsPieceButton = pieceButtons[24];
    const autoPieceButton = document.getElementsByClassName('theme2')[1].querySelector('input[type="radio"]');
    // noPieceButton is the Mino button on the UI. it removes the selected piece hence called noPieceButton in the code
    const noPieceButton = document.getElementById('pp');

    const fillRowButton = document.getElementById('frow');

    const quizButton = document.getElementById('rqz');

    const loadDataButton = document.getElementById('loaddatabtn');

    const newDataButton = document.getElementById('newdatabtn');

    // frame navigation
    const firstFrameButton = document.getElementById('first');
    const prevFrameButton = document.getElementById('prev');
    const nextFrameButton = document.getElementById('nx');
    const lastFrameButton = document.getElementById('last');

    const clearToEndButton = document.getElementById('del');
    
    // frame.js buttons
    let deleteCurrentFrameButton = document.getElementById('delframe');
    let duplicateCurrentFrameButton = document.getElementById('duplframe');
    let clearPastFramesButton = document.getElementById('clearpastframes');
    let appendDataButton = document.getElementById('appenddata');

    let greyOutButton = document.getElementById('gout');
    let mirrorButton = document.getElementById('mirror'); 

    // focusable input fields
    const frameInputField = document.getElementById('pgnm');
    const captionField = document.getElementById('cm');
    const fumenstringField = document.getElementById('tx');
    let pfCodeField = document.getElementById('pfcode');

    const urlField = document.getElementById('url');
    const viewUrlField = document.getElementById('view');
    const listUrlField = document.getElementById('dump');

    const hotkeys = [
        // color selection
        { labelText: 'Select Block I', value: fumenSettings.selectBlockI || 'not set', settingName: 'selectBlockI', executeFunction: () => clickColorButton(I_ColorButton) },
        { labelText: 'Select Block L', value: fumenSettings.selectBlockL || 'not set', settingName: 'selectBlockL', executeFunction: () => clickColorButton(L_ColorButton) },
        { labelText: 'Select Block O', value: fumenSettings.selectBlockO || 'not set', settingName: 'selectBlockO', executeFunction: () => clickColorButton(O_ColorButton) },
        { labelText: 'Select Block Z', value: fumenSettings.selectBlockZ || 'not set', settingName: 'selectBlockZ', executeFunction: () => clickColorButton(Z_ColorButton) },
        { labelText: 'Select Block T', value: fumenSettings.selectBlockT || 'not set', settingName: 'selectBlockT', executeFunction: () => clickColorButton(T_ColorButton) },
        { labelText: 'Select Block J', value: fumenSettings.selectBlockJ || 'not set', settingName: 'selectBlockJ', executeFunction: () => clickColorButton(J_ColorButton) },
        { labelText: 'Select Block S', value: fumenSettings.selectBlockS || 'not set', settingName: 'selectBlockS', executeFunction: () => clickColorButton(S_ColorButton) },
        { labelText: 'Select Block G', value: fumenSettings.selectBlockG || 'not set', settingName: 'selectBlockG', executeFunction: () => clickColorButton(G_ColorButton) },
        { labelText: 'Toggle Block Auto Color', value: fumenSettings.autoColor || 'not set', settingName: 'autoColor', executeFunction: () => autoColorButton.click() },
        { labelText: 'Toggle Fill Row', value: fumenSettings.fillRow || 'not set', settingName: 'fillRow', executeFunction: () => fillRowButton.click() },

        // piece selection
        { labelText: 'Select Piece I', value: fumenSettings.selectPieceI || 'not set', settingName: 'selectPieceI', executeFunction: () => clickOnPiece('I') },
        { labelText: 'Select Piece L', value: fumenSettings.selectPieceL || 'not set', settingName: 'selectPieceL', executeFunction: () => clickOnPiece('L') },
        { labelText: 'Select Piece O', value: fumenSettings.selectPieceO || 'not set', settingName: 'selectPieceO', executeFunction: () => clickOnPiece('O') },
        { labelText: 'Select Piece Z', value: fumenSettings.selectPieceZ || 'not set', settingName: 'selectPieceZ', executeFunction: () => clickOnPiece('Z') },
        { labelText: 'Select Piece T', value: fumenSettings.selectPieceT || 'not set', settingName: 'selectPieceT', executeFunction: () => clickOnPiece('T') },
        { labelText: 'Select Piece J', value: fumenSettings.selectPieceJ || 'not set', settingName: 'selectPieceJ', executeFunction: () => clickOnPiece('J') },
        { labelText: 'Select Piece S', value: fumenSettings.selectPieceS || 'not set', settingName: 'selectPieceS', executeFunction: () => clickOnPiece('S') },
        { labelText: 'Select Auto Piece', value: fumenSettings.autoPiece || 'not set', settingName: 'autoPiece', executeFunction: () => autoPieceButton.click() },
        { labelText: 'Place Piece', value: fumenSettings.dropPiece || 'not set', settingName: 'dropPiece', executeFunction: () => {
            evbutton1();
            forceBoardRerender();
            evbutton0();
        }},
        { labelText: 'Unplace Placed Piece', value: fumenSettings.noPiece || 'not set', settingName: 'noPiece', executeFunction: () => noPieceButton.click() },
        { labelText: 'Place Piece & Next Frame', value: fumenSettings.dropPieceThenNextFrame || 'not set', settingName: 'dropPieceThenNextFrame', executeFunction: () => {
            evbutton1();
            forceBoardRerender();
            evbutton0();
            nextFrameButton.click();
            forceBoardRerender();
        }},
        { labelText: 'Rotate Piece CW', value: fumenSettings.rotatePieceCW || 'not set', settingName: 'rotatePieceCW', executeFunction: () => rotatePiece(3)},
        { labelText: 'Rotate Piece 180', value: fumenSettings.rotatePiece180 || 'not set', settingName: 'rotatePiece180', executeFunction: () => rotatePiece(2)},
        { labelText: 'Rotate Piece CCW', value: fumenSettings.rotatePieceCCW || 'not set', settingName: 'rotatePieceCCW', executeFunction: () => rotatePiece(1)},
        { labelText: 'Hold Piece', value: fumenSettings.holdPiece || 'not set', settingName: 'holdPiece', executeFunction: () => holdCurrentPiece() },
        
        { labelText: 'Make Board gray', value: fumenSettings.greyOut || 'not set', settingName: 'greyOut', executeFunction: () => greyOutButton.click() },
        { labelText: 'Mirror Board', value: fumenSettings.mirror || 'not set', settingName: 'mirror', executeFunction: () => mirrorButton.click() },

        { labelText: 'Quiz', value: fumenSettings.quiz || 'not set', settingName: 'quiz', executeFunction: () => quizButton.click() },

        // frame navigation
        { labelText: 'First Frame', value: fumenSettings.firstFrame || 'not set', settingName: 'firstFrame', executeFunction: () => firstFrameButton.click() },
        { labelText: 'Previous Frame', value: fumenSettings.prevFrame || 'not set', settingName: 'prevFrame', executeFunction: () => prevFrameButton.click() },
        { labelText: 'Previous Frame & Clear to end', value: fumenSettings.prevFrameAndClearToEnd || 'not set', settingName: 'prevFrameAndClearToEnd', executeFunction: () => {
            prevFrameButton.click();
            delpage(false);
        }},
        { labelText: 'Next Frame', value: fumenSettings.nextFrame || 'not set', settingName: 'nextFrame', executeFunction: () => nextFrameButton.click() },
        { labelText: 'Last Frame', value: fumenSettings.lastFrame || 'not set', settingName: 'lastFrame', executeFunction: () => lastFrameButton.click() },

        { labelText: 'Clear to end', value: fumenSettings.clearToEnd || 'not set', settingName: 'clearToEnd', executeFunction: () => clearToEndButton.click() },

        { labelText: 'Delete current frame', value: fumenSettings.deleteFrame || 'not set', settingName: 'deleteFrame', executeFunction: () => deleteCurrentFrameButton.click() },
        { labelText: 'Duplicate frame', value: fumenSettings.duplicateFrame || 'not set', settingName: 'duplicateFrame', executeFunction: () => duplicateCurrentFrameButton.click() },
        { labelText: 'Clear past frames', value: fumenSettings.clearPastFrames || 'not set', settingName: 'clearPastFrames', executeFunction: () => clearPastFramesButton.click() },
        { labelText: 'Load Data', value: fumenSettings.loadData || 'not set', settingName: 'loadData', executeFunction: () => loadDataButton.click() },
        { labelText: 'New Data', value: fumenSettings.newData || 'not set', settingName: 'newData', executeFunction: () => newDataButton.click() },
        { labelText: 'Append Data', value: fumenSettings.appendData || 'not set', settingName: 'appendData', executeFunction: () => appendDataButton.click() },
        { labelText: 'Output Data', value: fumenSettings.outputData || 'not set', settingName: 'outputData', executeFunction: () => outputDataButton.click() },
        
        // focus various input fields
        { labelText: 'Focus caption field', value: fumenSettings.focusCaptionField || 'not set', settingName: 'focusCaptionField', executeFunction: () => captionField.focus() },
        { labelText: 'Focus fumenstring field', value: fumenSettings.focusFumenstringField || 'not set', settingName: 'focusFumenstringField', executeFunction: () => fumenstringField.focus() },
        { labelText: 'Focus pfcode field', value: fumenSettings.focusPfcodeField || 'not set', settingName: 'focusPfcodeField', executeFunction: () => pfCodeField.focus() },
        { labelText: 'Focus frame field', value: fumenSettings.focusFrameField || 'not set', settingName: 'focusFrameField', executeFunction: () => frameInputField.focus() },

        // copy to clipboard
        { labelText: 'Copy fumenstring to clipboard', value: fumenSettings.copyFumenstringToClipboard || 'not set', settingName: 'copyFumenstringToClipboard', executeFunction: () => copyToClipboard(fumenstringField) },
        { labelText: 'Copy pfcode to clipboard', value: fumenSettings.copyPfcodeToClipboard || 'not set', settingName: 'copyPfcodeToClipboard', executeFunction: () => copyPfCodeToClipboard() },
        { labelText: 'Copy url to clipboard', value: fumenSettings.copyUrlToClipboard || 'not set', settingName: 'copyUrlToClipboard', executeFunction: () => copyToClipboard(urlField) },
        { labelText: 'Copy view url to clipboard', value: fumenSettings.copyViewUrlToClipboard || 'not set', settingName: 'copyViewUrlToClipboard', executeFunction: () => copyToClipboard(viewUrlField) },
        { labelText: 'Copy list url to clipboard', value: fumenSettings.copyListUrlToClipboard || 'not set', settingName: 'copyListUrlToClipboard', executeFunction: () => copyToClipboard(listUrlField) },
    ];

    /**
     * fumen only rerenders the board on mouse movement
     * this code keeps tract of cursor position in order to
     * simulate a mousemove event where our cursor is. 
     * that way we can force a rerender after having modified the active piece
     */
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    const forceBoardRerender = () => {
        const el = document.elementFromPoint(mouseX, mouseY);
        if (!el) return;

        const evt = new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            clientX: mouseX,
            clientY: mouseY,
            view: window
        });

        el.dispatchEvent(evt);
    };

    /**
     * clicks the color button then rerenders the board
     */
    const clickColorButton = (button) => {
        button.click();
        button.focus();
        forceBoardRerender();
    }

    /**
     * directions:
     * 3 = clockwise
     * 2 = rotate twice
     * 1 = counter clockwise
     */
    const rotatePiece = (direction) => {
        const currentIndex = pieceButtons.findIndex((pieceButton) => pieceButton.checked);  // For example, starting at the last index
        if (currentIndex === -1) return;
        const firstIndexOfSelectedPiece = Math.floor(currentIndex / 4) * 4;
        const newIndex = ((currentIndex + direction) % 4) + firstIndexOfSelectedPiece;
        pieceButtons[newIndex].click();
        pieceButtons[newIndex].focus();
        forceBoardRerender();
    };

    /**
     * helper function to get piece by name. 
     * used to extract which piece to hold from the captions field
     */
    const clickOnPiece = (pieceName) => {
        // if guideline colors
        if(clt.checked) {
            switch (pieceName) {
                case 'I':
                    I_pieceButton.click();
                    I_pieceButton.focus();
                    break;
                case 'L':
                    L_pieceButton.click();
                    L_pieceButton.focus();
                    break;
                case 'O':
                    O_pieceButton.click();
                    O_pieceButton.focus();
                    break;
                case 'Z':
                    Z_pieceButton.click();
                    Z_pieceButton.focus();
                    break;
                case 'T':
                    T_pieceButton.click();
                    T_pieceButton.focus();
                    break;
                case 'J':
                    J_pieceButton.click();
                    J_pieceButton.focus();
                    break;
                case 'S':
                    S_pieceButton.click();
                    S_pieceButton.focus();
                    break;
                default:
                    break;
            }
        } else { // if arika colors
            switch (pieceName) {
                case 'I':
                    I_arsPieceButton.click();
                    I_arsPieceButton.focus();
                    break;
                case 'L':
                    L_arsPieceButton.click();
                    L_arsPieceButton.focus();
                    break;
                case 'O':
                    O_arsPieceButton.click();
                    O_arsPieceButton.focus();
                    break;
                case 'Z':
                    Z_arsPieceButton.click();
                    Z_arsPieceButton.focus();
                    break;
                case 'T':
                    T_arsPieceButton.click();
                    T_arsPieceButton.focus();
                    break;
                case 'J':
                    J_arsPieceButton.click();
                    J_arsPieceButton.focus();
                    break;
                case 'S':
                    S_arsPieceButton.click();
                    S_arsPieceButton.focus();
                    break;
                default:
                    break;
            }
        }
        forceBoardRerender();
    };

    const holdCurrentPiece = () => {
        const str = captionField.value;
        // hold piece inside [ ]
        const held = str.match(/\[(.)\]/)?.[1];
        // next piece = first letter after the closing parenthesis
        const next = str.match(/\)([A-Z])/i)?.[1];

        const piece = held ?? next;
        if (!piece) return;

        clickOnPiece(piece);
    };

    /**
     * copies the value of an element to the clipboard.
     * briefly displays the text "Copied to clipboard" in the field that was copied for 1s
     */
    const copyToClipboard = (element) => {
        navigator.clipboard.writeText(element.value).then(() => {
            
            const originalValue = element.value;
            element.value = 'Copied to clipboard';
            setTimeout(() => {
                if (element.value === 'Copied to clipboard') {
                    element.value = originalValue;
                }
            }, 1000)

        }).catch(err => {
            element.select();
            // copy with execCommand as fallback for older browsers
            const success = document.execCommand("copy"); 
            if (!success) {
                console.warn(`failed to copy ${element} to clipboard`, err); 
            }
        });
    }

    const copyPfCodeToClipboard = () => {
        const pfcodeInput = document.getElementById("pfcode");
        if (!pfcodeInput) return;
        copyToClipboard(pfcodeInput);
    }


    const playmodeField = document.getElementById('kbd');

    const isFocusingTextInput = () => {
        const active = document.activeElement;
        return (
            frameInputField === active ||
            captionField === active ||
            fumenstringField === active  ||
            pfCodeField === active ||
            playmodeField === active ||
            urlField === active ||
            viewUrlField === active ||
            listUrlField === active
        )
    };

    /**
     * checks if the keyCode is registered as a hotkey
     */
    const isRegisteredHotkey = (keyCode) => {
        for (const settingName in fumenSettings) {
            const value = fumenSettings[settingName];
            if (typeof value === 'string' && value === keyCode) {
                return true;
            }
        }
        return false;
    };

    const executeHotkey = (keyCode) => {
        if (isFocusingTextInput()) return;
        // loop through every property in fumenSettings
        for (const settingName in fumenSettings) {
            const value = fumenSettings[settingName];

            // check if the property is a string and matches the keyCode
            if (typeof value === 'string' && value === keyCode) {

                // find the hotkey config that matches this setting name
                const hotkey = hotkeys.find(h => h.settingName === settingName);

                // if found, trigger the associated function
                if (hotkey?.executeFunction) {
                    hotkey.executeFunction();
                    return; // stop after first match
                }
            }
        }
    };

    /**
     * We have two eventlisteners for keydown, the first one triggers only when you rebind a key
     * the second one triggers on every keydown. We don't want to trigger the second one if the intent
     * of the keydown event was to rebind a key.
     */
    const keydownTriggeredByRebinding = () => {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.parentElement && activeElement.parentElement.parentElement) {
            const parentElementId = activeElement.parentElement.parentElement.id;
            return parentElementId === 'settingscontainer';
        }
        
        return false;
    };

    document.addEventListener('keydown', (e) => {
        if(keydownTriggeredByRebinding()) return;
        if (!isFocusingTextInput() && isRegisteredHotkey(e.code)) {
            e.preventDefault();
        }
        executeHotkey(e.code);
    });

    const createKeybindSettingsMenuItem = ({labelText, value, settingName, executeFunction}) => {

        if(fumenSettings[settingName] !== value) {
            storage.save({ [settingName]: value });
            fumenSettings = {...fumenSettings, [settingName]: value};
        }
    
        const menuItemContainer = document.createElement('div');

        const menuItemValue = document.createElement('input');
        menuItemValue.value = value.replace('Key','');
        menuItemValue.id = settingName;
        menuItemValue.style.width = '90px';
        menuItemValue.style.textAlign = 'center';
        menuItemValue.readOnly = true;

        const menuItemLabel = document.createElement('label');
        menuItemLabel.textContent = labelText + ': ';
        menuItemLabel.htmlFor = settingName;

        const menuItemDeleteButton = document.createElement('input');
        menuItemDeleteButton.type = 'button';
        menuItemDeleteButton.style.width = 'fit-content';
        menuItemDeleteButton.value = "x";
        menuItemDeleteButton.onclick = () => {
            menuItemValue.value = 'not set';
            storage.save({ [settingName]: 'not set' });
            fumenSettings = {...fumenSettings, [settingName]: 'not set'};
        };

        menuItemValue.addEventListener('keydown', (e) => {

            // make tab focus the next keybind instead of trying to bind a hotkey to tab
            if (e.key === 'Tab') {
                const inputs = Array.from(
                    settingsContainer.querySelectorAll('input')
                );
                const index = inputs.indexOf(menuItemValue);

                const nextIndex = e.shiftKey
                    ? index - 1
                    : index + 1;

                const nextInput = inputs[nextIndex];
                if (nextInput) {
                    nextInput.focus();
                }
                return;
            }
            e.preventDefault();
            menuItemValue.value = e.code.replace('Key','');
            storage.save({[settingName]: e.code });
            fumenSettings = {...fumenSettings, [settingName]: e.code};
        });

        menuItemValue.addEventListener('focus', () => {
            menuItemValue.select();
        });

        menuItemContainer.appendChild(menuItemLabel);
        menuItemContainer.appendChild(menuItemValue);
        menuItemContainer.appendChild(menuItemDeleteButton);
        settingsContainer.appendChild(menuItemContainer);
    };

    settingsContainer.appendChild(oncloseContainer);
    settingsContainer.appendChild(alwaysShowAddonUiContainer);
    settingsContainer.appendChild(showListViewUnderEditorContainer);
    settingsContainer.appendChild(framesPerRowContainer);
    settingsContainer.appendChild(hotkeysTitle);

    for (const hotkey of hotkeys) {
        createKeybindSettingsMenuItem(hotkey);
    }

    /**
     * if the "always show addon UI" setting is not checked,
     * the anndon UI will be hidden on load and we will fail to
     * get references to the buttons on the addon UI.
     * thus we need to update the references to the addon UI
     * when the user clicts the addon button
     */
    const refreshAddonUiReferences = () => {
        deleteCurrentFrameButton = document.getElementById('delframe');
        duplicateCurrentFrameButton = document.getElementById('duplframe');
        clearPastFramesButton = document.getElementById('clearpastframes');
        appendDataButton = document.getElementById('appenddata');
        greyOutButton = document.getElementById('gout');
        mirrorButton = document.getElementById('mirror'); 
        pfCodeField = document.getElementById('pfcode');
    };
    // the addon button only exists when fumenSettings.alwaysShowAddonUI was false on initial page load
    if (!fumenSettings.alwaysShowAddonUI) {
        const addonUiButton = document.getElementById('apb');
        addonUiButton.addEventListener('click', () => {
            refreshAddonUiReferences();
        });
    }

    document.getElementById('dump').insertAdjacentElement('afterend',settingsContainer);

})();