function createMeasurementCell(rowOrExistingCell, name, value) {
    // create a new cell if parameter row is of type tr, else take over the existing cell
    const elementType = rowOrExistingCell.tagName.toLowerCase();
    const cell = elementType === 'td' ? rowOrExistingCell : rowOrExistingCell.insertCell(-1);
    cell.innerHTML = value;
    switch (name) {
        case 'sys':
            cell.style.backgroundColor = getColorForValue(value, 90, 110, 130, 140, 160);
            break;
        case 'dia':
            cell.style.backgroundColor = getColorForValue(value, 50, 70, 80, 90, 110);
            break;
    }
    cell.classList.add('number');
    cell.classList.add(name);

    return cell;
}

function fillSessionCell(cell, session, bgClass) {
    const dayNames = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
    const date = new Date(session.startedAt);
    const formattedDate = `${dayNames[date.getDay()]}, ${date.toLocaleString('hu-HU', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\.\s/g, '.')}`;
    cell.innerHTML = `<span class='timestamp'>${formattedDate}</span><br><span class='comment'>${session.comment}</span>`;
    cell.classList.add('session-info', `day${date.getDay()}`, `bg${bgClass}`);
}