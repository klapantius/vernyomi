// Numeric Visualization: This module is designed to display numeric data directly.
// Note: For graphical representations of data, refer to the separate graph visualization module.

let bunchSize = 50;

async function fetchSessionData() {
    return fetch(`/session-data?limit=${bunchSize}`)
        .then(response => response.json())
        .then(data => data.sessions)
        .catch(error => {
            console.error('Error:', error);
        });
}

async function populateSessionDataTable() {
    const table = document.getElementById('session-data');
    const tbody = table.getElementsByTagName('tbody')[0]; // Get the tbody element
    const sessions = await fetchSessionData();

    sessions.reverse().forEach(session => {
        const row = tbody.insertRow(0); // Insert a new row at the top of the tbody
        const cell = row.insertCell(0); // Insert the first cell for date/time and comment
        cell.innerHTML = `${session.startedAt}<br>${session.comment}`;
        
        // Insert the first measurement in the next cell of the same row
        if (session.measurements.length > 0) {
            cell.rowSpan = session.measurements.length;
            createMeasurementCells(row, session.measurements[0]);
        }
        // Insert additional rows for remaining measurements
        session.measurements.slice(1).reverse().forEach(measurement => {
            const measurementRow = tbody.insertRow(row.rowIndex); // Insert a new row for each additional measurement
            createMeasurementCells(measurementRow, measurement);
        });
    });
}

function createMeasurementCells(row, measurement) {
    const sysCell = row.insertCell(-1);
    sysCell.innerHTML = measurement.sys;

    const diaCell = row.insertCell(-1);
    diaCell.innerHTML = measurement.dia;

    const pulsCell = row.insertCell(-1);
    pulsCell.innerHTML = measurement.puls;
}
