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

    // specify event handlers for enter and esc
    commentInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            storeSession(commentInput.value);
        } else if (event.key === 'Escape') {
            table.removeChild(newRow);
        }
    });

    // set the focus to the input field
    commentInput.focus();

    window.addEventListener('focusout', stopEditingAndRemoveInputRow);
}

function handleDoubleClick(event) {
    // return if we are already editing
    if (document.querySelector('input')) { return; }
    // dblclick on a measurement cell triggers editing
    if (event.target.classList.contains('number')) {
        turnMeasurementToInput(event.target);
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
    // create input fields for the first measurement in the next cells of the same row
    const sysInput = createInputCell(row, 'sys');
    createInputCell(row, 'dia');
    createLastInputCell(row, 'puls');
    // set focus to the input field for sys
    sysInput.focus();
}

async function saveMeasurementAndContinueInNewRow(event) {
    console.log(`saveMeasurementAndContinueInNewRow - event.key: ${event.key}`);
    if (!(event.key === 'Enter' || event.key === 'Tab')) { return; }
    event.preventDefault();
    event.stopPropagation();

    const measurementId = await saveMeasurements();
    // store the measurement id in the row as an attribute
    const inputRow = getRowOfInputField('sys');
    inputRow.setAttribute('data-measurement-id', measurementId);

    continueEnteringDataInNewRow();
}

function continueEnteringDataInNewRow() {
    // notice the old input row
    var oldInputRow = getRowOfInputField('sys');
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
    const sysInput = createInputCell(newRow, 'sys');
    createInputCell(newRow, 'dia');
    createLastInputCell(newRow, 'puls');
    sysInput.focus();
}

async function saveMeasurements() {
    const response = await fetch('/measurement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: localStorage.getItem('sessionId'),
            sys: document.getElementById('sys').value,
            dia: document.getElementById('dia').value,
            puls: document.getElementById('puls').value,
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

function turnMeasurementToInput(cell) {
    if (cell === undefined) { return; }
    const name = getNameFromClasses(cell.classList);
    const value = cell.innerHTML;
    const row = cell.parentElement;
    const idx = Array.from(row.cells).indexOf(cell);
    row.deleteCell(idx);
    const input = createInputCell({row: row, idx: idx, name: name, eventListeners: [
        {
            event: 'keydown', callback: handleKeyDownForMeasurementInput
        }]});
    input.value = value;
    input.focus();
}

function handleKeyDownForMeasurementInput(event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        const row = event.target.parentElement.parentElement;
        updateMeasurements(row).then(() => {
            const inputField = event.target;
            // todo: throw exception if inputField is undefined
            // todo: handle error when inputField is not an input element
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
    createInputCell(row, name, [
        // { event: 'focusout', callback: stopEditingAndRemoveInputRow }, // focusout is already registered at window level
        // define callback function for enter-pressed event
        { event: 'keydown', callback: saveMeasurementAndContinueInNewRow }]
    );
}

function createInputCell(row, name, eventListeners) {
    return createInputCell({ row: row, name: name, eventListeners: eventListeners });
}

function createInputCell(options = { row: undefined, idx: -1, name: 'n/a', eventListeners: [] }) {
    const { row, idx, name, eventListeners } = options;
    if (row === undefined) { throw new Error('row is not defined'); }
    if (name === undefined) { throw new Error('name is not defined'); }
    if (idx === undefined) { idx = -1; }
    if (eventListeners === undefined) { // default value for backward compatibility 
        eventListeners = {
            event: 'keydown',
            callback: stopEditingAndRemoveInputRow
        }
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
    input.addEventListener('keydown', stopEditingAndRemoveInputRow);
    return input;
}

function stopEditingAndRemoveInputRow(event) {
    console.log(`stopEditingAndRemoveInputRow - event: ${event.type}; key: ${event.key}; target: ${event.target?.id}`);
    // stop reacting to the event if it is not... 
    if (!(
        // an escape key press
        (event.type === 'keydown' && event.key === 'Escape')
        // or a focusout event...
        || (event.type === 'focusout'
            && (
                // while leaving something else than an input field
                (event.relatedTarget && event.relatedTarget.tagName !== 'INPUT')
                // or while leaving the input field of the session comment
                || (event.target?.id === 'session-comment')))
    )) { return; }
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