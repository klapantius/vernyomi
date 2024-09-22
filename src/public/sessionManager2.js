function startSession() {
    // create new row at the top of the table
    const newRow = document.createElement('tr');
    const table = document.querySelector('table');
    table.insertBefore(newRow, table.firstChild);

    // create input field for session comment
    const commentInput = document.createElement('input');
    commentInput.id = 'session-comment';
    commentInput.type = 'text';
    commentInput.placeholder = 'megjegyzések - ha kész: enter';
    newRow.insertCell().appendChild(commentInput);

    // define the event handler
    const handleKeydown = (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            commentInput.removeEventListener('keydown', handleKeydown);
            storeSession(commentInput.value);
        } else if (event.key === 'Escape') {
            commentInput.removeEventListener('keydown', handleKeydown);
            table.removeChild(newRow);
        }
    };

    // specify event handlers for enter, tab and esc
    commentInput.addEventListener('keydown', handleKeydown);

    // we could specify and event handler for focusout ==> stop editing and remove input row
    // commentInput.addEventListener('focusout', () => { table.removeChild(newRow); });
    // However, skipping this makes possible copying content from another field or switching
    // to another browser tab or window without losing the entered data

    // set the focus to the input field
    commentInput.focus();
}

function handleDoubleClick(event) {
    // return if we are already editing
    if (document.querySelector('input')) { return; }
    // dblclick on a measurement cell triggers editing
    if (event.target.classList.contains('number')) {
        turnMeasurementToInputForUpdate(event.target);
        return;
    }
}

function getNameFromClasses(classes) {
    // transform the input to an array of strings (it is either a DOMTokenList or already an array of strings)
    const input = Array.isArray(classes) ? classes : Array.from(classes);
    return input
        .find((className) => className === 'sys' || className === 'dia' || className === 'puls');
}

async function storeSession(comment) {
    // create new session in the database as in sessionManager.js
    const response = await fetch('/start-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            comment: document.getElementById('session-comment').value
        })
    });
    // then store sessionId from reponse
    const data = await response.json();
    localStorage.setItem('sessionId', data.sessionId);
    const session = { startedAt: new Date().toISOString(), comment: document.getElementById('session-comment').value };
    // find the table cell with the input field (session-comment)
    const sessionCell = document.getElementById('session-comment').parentElement;
    const row = sessionCell.parentElement;
    // notice the session id in an attribute of the row
    row.setAttribute('data-session-id', data.sessionId);
    // find the next row and determine the background class
    const nextRow = row.previousElementSibling;
    const bgClass = nextRow ? (parseInt(nextRow.cells[0].classList[2].slice(2)) + 1) % 2 : 0;
    // replace the input field with the session information
    sessionCell.removeChild(document.getElementById('session-comment'));
    fillSessionCell(sessionCell, session, bgClass);

    createMeasurementInputs(row);

}

function createMeasurementInputs(row) {
    // create input fields for the first measurement in the next Inputs of the same row
    const sysInput = createInputCell({
        row: row,
        name: 'sys',
        eventListeners: [
            { event: 'keydown', callback: handleKeyDownInMeasurementFieldWhileEnteringData }
        ]
    });
    createInputCell({
        row: row,
        name: 'dia',
        eventListeners: [
            { event: 'keydown', callback: handleKeyDownInMeasurementFieldWhileEnteringData }
        ]
    });
    createInputCell({
        row: row,
        name: 'puls',
        eventListeners: [
            // todo: implement a different event handler for puls which saves the measurements and creates a new row
            { event: 'keydown', callback: handleKeyDownInMeasurementFieldWhileEnteringData }
        ]
    });
    // set focus to the input field for sys
    sysInput.focus();
}

async function saveMeasurementsAndContinueInNewRow(event) {
    const measurementId = await saveMeasurements();

    // store the measurement id in the row as an attribute
    const inputRow = getRowOfInputField(event.target.id);
    inputRow.setAttribute('data-measurement-id', measurementId);

    continueEnteringDataInNewRow(event);
}

function continueEnteringDataInNewRow(event) {
    // notice the old input row
    var oldInputRow = getRowOfInputField(event.target.id);
    // find rows with input fields and replace them with the values
    turnInputToMeasurement('sys');
    turnInputToMeasurement('dia');
    turnInputToMeasurement('puls');
    // add new row below the old input row
    const newRow = document.createElement('tr');
    oldInputRow.insertAdjacentElement('afterend', newRow);
    // take over the session id attribute
    newRow.setAttribute('data-session-id', oldInputRow.getAttribute('data-session-id'));
    // increase the row span of the session info cell in the first row of the session
    const sessionFirstRow = getFirstRowOfSession(newRow);
    ++sessionFirstRow.cells[0].rowSpan;

    createMeasurementInputs(newRow);
}

function getMeasurementFromInputField(inputId) {
    const value = document.getElementById(inputId).value;
    if (value === '' || isNaN(value)) {
        throw new Error(`Invalid value: ${value}`);
    }
    return value;
}

async function saveMeasurements() {
    const [sys, dia, puls] = ['sys', 'dia', 'puls'].map(getMeasurementFromInputField);
    const response = await fetch('/measurement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: localStorage.getItem('sessionId'),
            sys: sys,
            dia: dia,
            puls: puls,
            comment: document.getElementById('comment')?.value ?? ""
        })
    });
    // return the measurement id from the response
    const data = await response.json();
    return data.measurementId;
}

async function updateMeasurements(inputRow) {
    const measurementId = inputRow.getAttribute('data-measurement-id');
    const firstRow = getFirstRowOfSession(inputRow);
    const sessionId = firstRow.getAttribute('data-session-id');
    return await fetch('/measurement', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: sessionId,
            measurementId: measurementId,
            sys: getMeasurementValueFromRow(inputRow, 'sys'),
            dia: getMeasurementValueFromRow(inputRow, 'dia'),
            puls: getMeasurementValueFromRow(inputRow, 'puls')
        })
    });
}

/**
 * This function transforms an input field to a measurement visualisation cell.
 * @param {string} name - the name of the measurement
 */
function turnInputToMeasurement(name) {
    const oldInput = document.querySelector(`#${name}`);
    const cell = oldInput.parentElement;
    const value = oldInput.value;
    cell.removeChild(oldInput);
    createMeasurementCell(cell, name, value);
}

function turnMeasurementToInputForUpdate(cell) {
    if (cell === undefined) { return; }
    const name = getNameFromClasses(cell.classList);
    const value = cell.innerHTML;
    const row = cell.parentElement;
    const idx = Array.from(row.cells).indexOf(cell);
    row.deleteCell(idx);
    const input = createInputCell({
        row: row, idx: idx, name: name, eventListeners: [
            {
                event: 'keydown', callback: handleKeyDownForWhileUpdatingMeasurement
            }]
    });
    input.value = value;
    input.focus();
}

function handleKeyDownForWhileUpdatingMeasurement(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        const row = event.target.parentElement.parentElement;
        updateMeasurements(row).then(() => {
            const inputField = event.target;
            // todo: throw exception if inputField is undefined
            // todo: handle error when inputField is not an input element
            // to be on the safe side, remove the event listener
            inputField.removeEventListener('keydown', handleKeyDownForWhileUpdatingMeasurement);
            turnInputToMeasurement(inputField.id);
        });
    }
}

function getMeasurementValueFromRow(row, name) {
    // try to find the cell with the given name as class
    const cell = row.querySelector(`.${name}`);
    // if the cell is found, return its value
    if (cell) {
        return cell.innerHTML;
    }
    // if the cell is not found, then try to find the input field with the given name as id
    const input = row.querySelector(`#${name}`);
    // if the input field is found, return its value
    if (input) {
        return input.value;
    }
    // if neither the cell nor the input field is found, return undefined
    return undefined;
}

function createLastInputCell(row, name) {
    createInputCell({
        row: row,
        name: name,
        eventListeners: [
            // { event: 'focusout', callback: stopEditingAndRemoveInputRow }, // focusout is already registered at window level
            // define callback function for enter-pressed event
            { event: 'keydown', callback: saveMeasurementsAndContinueInNewRow }]
    });
}

function handleKeyDownInMeasurementFieldWhileEnteringData(event) {
    console.log(`handleKeyDownInMeasurementFieldWhileEnteringData - event.key: ${event.key}`);
    let reacted = false;
    switch (event.key) {
        case 'Enter':
        case 'Tab':
            const nextInput = event.target.parentElement.nextElementSibling?.querySelector('input');
            if (event.target.id !== 'puls') {
                nextInput.focus();
            } else {
                saveMeasurementsAndContinueInNewRow(event);
            }
            reacted = true;
            break;
        case 'Escape':
            reacted = true;
            stopEditingAndRemoveInputRow(event);
            break;
    }
    if (reacted) {
        event.preventDefault();
        event.stopPropagation();
    }
}

function createInputCell(row, name, eventListeners) {
    return createInputCell({ row: row, name: name, eventListeners: eventListeners });
}

function createInputCell(options = { row: undefined, idx: -1, name: 'n/a', eventListeners: [] }) {
    let { row, idx, name, eventListeners } = options;
    if (row === undefined) { throw new Error('row is not defined'); }
    if (name === undefined) { throw new Error('name is not defined'); }
    if (idx === undefined) { idx = -1; }
    if (!eventListeners || eventListeners.length === 0) { // default value for backward compatibility 
        eventListeners = [{
            event: 'keydown',
            callback: stopEditingAndRemoveInputRow
        }]
    }
    const cell = row.insertCell(idx);
    const input = document.createElement('input');
    input.type = 'number';
    input.id = name;
    input.placeholder = name;
    cell.appendChild(input);
    eventListeners.forEach((listener) => {
        input.addEventListener(listener.event, listener.callback);
    });
    return input;
}

function stopEditingAndRemoveInputRow(event) {
    console.log(`stopEditingAndRemoveInputRow - event: ${event.type}; key: ${event.key}; target: ${event.target?.id}`);
    const executionFilters = [
        { fName: 'EscPressed', check: (event) => event.type === 'keydown' && event.key === 'Escape' },
        { fName: 'ContinueInNextInput', check: (event) => event.type === 'focusout' && event.relatedTarget && event.relatedTarget.tagName !== 'INPUT' },
        //{ fName: 'LeavingSessionComment', check: (event) => event.type === 'focusout' && event.target?.id === 'session-comment' },
    ];
    const filterResults = executionFilters.map((filter) => ({ fName: filter.fName, result: filter.check(event) }));
    if (!filterResults.some((check) => check.result === true)) {
        console.log('skip stopEditingAndRemoveInputRow');
        return;
    }
    // log the name of the first filter that returned true
    console.log(`'${filterResults.find((check) => check.result === true).fName}' event detected.`);
    const filteringResult = executionFilters.find((filter) => filter.check(event));
    console.log(`stopEditingAndRemoveInputRow detects '${filteringResult.fName}' event`);

    console.log('stop editing...');
    const inputRow = getRowOfInputField('sys');
    if (!inputRow) { return; }
    // if inputRow has no sub-element with class 'session-info'
    if (!inputRow.querySelector('.session-info')) {
        // then find the nearest row above this one which has such a child
        const sessionFirstRow = getFirstRowOfSession(inputRow);
        --sessionFirstRow.cells[0].rowSpan;
    }
    const table = document.querySelector('table');
    table.removeChild(inputRow);

    window.removeEventListener('focusout', stopEditingAndRemoveInputRow);
    console.log('stop editing is done.')
}

function getFirstRowOfSession(row) {
    let currentRow = row;
    if (currentRow.querySelector('.session-info')) {
        return currentRow;
    }
    do {
        const rowAbove = currentRow.previousElementSibling;
        if (rowAbove.querySelector('.session-info')) {
            // and decrease its row span by one
            return rowAbove;
            break;
        }
        currentRow = rowAbove;
    } while (currentRow);
}

function getRowOfInputField(inputId) {
    return document.querySelector(`#${inputId}`).parentElement.parentElement;
}