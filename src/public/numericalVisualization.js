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
    let bgClass = 0;

    sessions.reverse().forEach(session => {
        const firstRow = tbody.insertRow(0); // Insert a new row at the top of the tbody
        // store the session id as an attribute of the row
        firstRow.setAttribute('data-session-id', session.sessionId);

        const cell = firstRow.insertCell(0); // Insert the first cell for date/time and comment
        fillSessionCell(cell, session, bgClass++ % 2);

        // Insert the first measurement in the next cell of the same row
        if (session.measurements.length > 0) {
            cell.rowSpan = session.measurements.length;
            firstRow.setAttribute('data-measurement-id', session.measurements[0].measurementId);
            createMeasurementCells(firstRow, session.measurements[0]);
        }
        // Insert additional rows for remaining measurements
        session.measurements.slice(1).reverse().forEach(measurement => {
            const measurementRow = tbody.insertRow(firstRow.rowIndex); // Insert a new row for each additional measurement
            // store the measurement id as an attribute of the row
            measurementRow.setAttribute('data-measurement-id', measurement.measurementId);
            createMeasurementCells(measurementRow, measurement);
        });
    });

    window.addEventListener('dblclick', handleDoubleClick);

    let lastTap = 0;

    window.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) { return; } // Ignore multi-touch
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            event.preventDefault();
            handleDoubleClick(event);
        }    
        lastTap = currentTime;
    });
    window.addEventListener('touchend', function(event) {
        if (event.touches.length > 1) { return; } // Ignore multi-touch
        event.preventDefault();
    }); 
}    

function getColorForValue(value, foo, lowThreshold, idealValue, highThreshold, bar) {
    // Calculate ratio between 0 and 1
    const { ratio, lowColor, highColor } = getRatioAndBaseColorsForValue(value, foo, lowThreshold, idealValue, highThreshold, bar);

    // Convert ratio to a color between lowColor and highColor
    return selectColorGradientInRange(ratio, lowColor, highColor);
}

function getRatioAndBaseColorsForValue(value, foo, low, ideal, high, bar) {
    const limits = [foo, low, ideal, high, bar];
    const colors = ['#5ec4ff', '#9fffef', '#CCFFCC', '#fffe06', '#ff9999'];

    // Ensure value is within bounds
    value = Math.min(Math.max(value, foo), bar);

    // return ratio and colors for the given value
    for (let i = 0; i < limits.length - 1; i++) {
        if (value <= limits[i + 1]) {
            return {
                ratio: (value - limits[i]) / (limits[i + 1] - limits[i]),
                lowColor: colors[i],
                highColor: colors[i + 1]
            };
        }
    }
}

function selectColorGradientInRange(ratio, lowColorHex, highColorHex) {
    // Convert hex colors to RGB
    const lowRGB = lowColorHex.match(/[a-f\d]{2}/ig).map(color => parseInt(color, 16));
    const highRGB = highColorHex.match(/[a-f\d]{2}/ig).map(color => parseInt(color, 16));
    // Calculate the RGB values for the color at the given ratio
    const rgb = lowRGB.map((low, i) => Math.round(parseInt(low) + ratio * (parseInt(highRGB[i]) - parseInt(low))));
    // Return the RGB color as a string
    return `rgb(${rgb.join(',')})`;
}

function createMeasurementCells(row, measurement) {
    createMeasurementCell(row, 'sys', measurement.sys);
    createMeasurementCell(row, 'dia', measurement.dia);
    createMeasurementCell(row, 'puls', measurement.puls);
}
