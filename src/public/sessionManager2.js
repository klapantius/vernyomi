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
        if (event.key === 'Enter') {
            storeSession(commentInput.value);
        } else if (event.key === 'Escape') {
            table.removeChild(newRow);
        }
    });

    // set the focus to the input field
    commentInput.focus();
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

async function saveMeasurementAndContinueInNewRow() {
    const response = await fetch('/save-measurement', {
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
    // const data = await response.json();
    // notice the old input row
    var oldInputRow = getRowOfInputField('sys');
    // find rows with input fields and replace them with the values
    turnInputToMeasurement('sys');
    turnInputToMeasurement('dia');
    turnInputToMeasurement('puls');
    // add new row below the old input row
    const newRow = document.createElement('tr');
    oldInputRow.insertAdjacentElement('afterend', newRow);
    const sessionFirstRow = getFirstRowOfSession(newRow);
    ++sessionFirstRow.cells[0].rowSpan;
    const sysInput = createInputCell(newRow, 'sys');
    createInputCell(newRow, 'dia');
    createLastInputCell(newRow, 'puls');
    sysInput.focus();
}

function turnInputToMeasurement(name) {
    const oldInput = document.querySelector(`#${name}`);
    const cell = oldInput.parentElement;
    const value = oldInput.value;
    cell.removeChild(oldInput);
    createMeasurementCell(cell, name, value);
}

function createLastInputCell(row, name) {
    const inputField = createInputCell(row, name);
    // define callback function for enter-pressed event
    inputField.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            // stop propagating this event
            event.stopPropagation();
            await saveMeasurementAndContinueInNewRow();
        }
    });

}

function createInputCell(row, name) {
    const cell = row.insertCell(-1);
    const input = document.createElement('input');
    input.type = 'number';
    input.id = name;
    input.placeholder = name;
    cell.appendChild(input);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            stopEditingAndRemoveInputRow();
        }
    });
    return input;
}

function stopEditingAndRemoveInputRow() {
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