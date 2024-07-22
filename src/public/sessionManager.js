function startSession() {
    document.getElementById('start-session').disabled = true;
    document.getElementById('session').style.display = 'block';
    document.getElementById('measurements').style.display = 'none';
    document.getElementById('session-comment').focus();
}

function saveSession() {
    fetch('/start-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            comment: document.getElementById('session-comment').value
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('session').style.display = 'none';
            document.getElementById('measurements').style.display = 'block';
            localStorage.setItem('sessionId', data.sessionId);
            createInputRow();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function storeMeasurementAndContinueWith(next) {
    fetch('/save-measurement', {
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
    })
        .then(response => response.json())
        .then(data => next(data))
        .catch(error => {
            console.error('Error:', error);
        });
}

function saveMeasurement() {
    storeMeasurementAndContinueWith(data => {
        console.log(data);
        freezeLastRow();
        createInputRow();
    })
        .catch(error => {
            console.error('Error:', error);
        });
}

function createInputRow() {
    // Find the table element
    const table = document.querySelector('table');

    // Create a new row
    const newRow = table.insertRow();

    // Create cells for each property from the response
    const sysCell = newRow.insertCell();
    const diaCell = newRow.insertCell();
    const pulsCell = newRow.insertCell();
    // const commentCell = newRow.insertCell();

    // Set the values of the cells
    sysCell.innerHTML = '<input type="number" id="sys" placeholder="Sys">';
    diaCell.innerHTML = '<input type="number" id="dia" placeholder="Dia">';
    pulsCell.innerHTML = '<input type="number" id="puls" placeholder="puls"><button id="save-measurment" onclick="saveMeasurement()">next</button>';
    // commentCell.innerHTML = '<input type="text" id="comment" placeholder="Comment">';

    document.getElementById('sys').focus();
}

function freezeLastRow() {
    // Find the table element
    const table = document.querySelector('table');

    // Find last row
    const lastRow = table.rows[table.rows.length - 1];

    // freeze content: replace the input controls by their values
    lastRow.cells[0].innerHTML = document.getElementById('sys').value;
    lastRow.cells[1].innerHTML = document.getElementById('dia').value;
    lastRow.cells[2].innerHTML = document.getElementById('puls').value;
    // lastRow.cells[3].innerHTML= document.getElementById('comment').value;
}

function completeSession() {
    if (document.getElementById('sys').value
        || document.getElementById('dia').value
        || document.getElementById('puls').value) {
        storeMeasurementAndContinueWith(data => {
            console.log(data);
            clearSession();
        });
    }
    else { clearSession(); }

}

function clearSession() {
    freezeLastRow(); // this is not really neccessary

    // remove all rows except the header
    const table = document.querySelector('table');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // clear the session-comment field too
    document.getElementById('session-comment').value = '';

    // disappear the measurement editor and enable the start button again
    document.getElementById('measurements').style.display = 'none';
    document.getElementById('start-session').disabled = false;
}