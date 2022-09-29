// DON'T EDIT THOSE LINES
const dataURLBase = "https://docs.google.com/spreadsheets/d/";
const dataURLEnd = "/gviz/tq?tqx=out:json&tq&gid=";
const id = "1C1-em4w0yHmd2N7__9cCSFzxBEf_8r74hQJBsR6qWnE";
const gids = ["0", "1574569648", "1605451198"];
// END OF DATA SETUP

// TODO your code here



async function fetchSpreadsheet(gidIndex) {
    const req = await fetch(dataURLBase + id + dataURLEnd + gids[gidIndex]);
    const text = await req.text();
    //JSON.parse(data.substring(47, data.length - 2))
    const json = JSON.parse(text.replace(/^[^\{}]+/, "").replace(/\);$/, ""));
    return json;
}
async function fetchAllpreadsheets() {
    const names = await fetchSpreadsheet(0),
        hire = await fetchSpreadsheet(1),
        salary = await fetchSpreadsheet(2);
    return {names, hire, salary};
}

fetchAllpreadsheets().then(data => {
    let tableData = [];
    const table = document.querySelector("#employees"),
        thead = document.createElement("thead"),
        tbody = document.createElement("tbody"),
        tr = document.createElement("tr"),
        theadTr = tr.cloneNode(),
        th = document.createElement("th"),
        td = document.createElement("td");
    // add titles to the table head
    ["Last", "First", "Hire Date", "Salary"].forEach(title => {
        const cell = th.cloneNode();
        cell.textContent = title;
        cell.setAttribute("scope", "col");
        theadTr.appendChild(cell);
    });
    // not gonna need this, will be easier to shift and remove than having to keep track of the "relevant" position
    data.names.table.rows.shift();
    console.log(data);
    // add rows to the table body
    // loop through all the tab data objects in the data array
    for (const tabName in data) {
        // current spreadsheet tab response data
        const tab = data[tabName];
        // go through all the rows in the tab's table
        tab.table.rows.forEach((row, i) => {
            // add a row array
            if (tabName === "names") {
                tableData.push([]);
            }
            // tab's table row index: -1 index for the names since the titles are also included as a row there
            const relevantIndex = i - (tabName === "names" ? 1 : 0);
            // go through all the cells in the current tab's current row
            row.c.reverse().map(cellContent => {
                // make a <td>
                let cell;
                // set text content based on what sort of data (i.e. from which stylesheet tab)
                switch(tabName) {
                    case "names":
                        // plain text
                        cell = cellContent.v;
                        break;
                    case "hire":
                        // in MMM DD YYYY format, e.g. (Feb 1 2022)
                        /*let dateString = cellContent.v.match(/[\d\,]+/)[0];
                        //dateString = dateString.replace(/\,\d+\,/g, n => "," + (Number(n) + 1) + ",")
                        console.log(dateString);
                        cell = new Date(dateString).toString().substring(4, 15);
                        */
                        cell = new Date(cellContent.f).toString().substring(4, 15);
                        break;
                    case "salary":
                        // formatted as $1,000,000.00
                        // wasn't really sure how to combine toFixed and toLocaleString in an elegant way so... used an even LESS elegant method lol
                        // (not taken from stack overflow or anything, but on the verge of bleeding out of my eyes rn)
                        //cell = "$" + cellContent.v.toFixed(2).replace(/(?<!\b)\d{3}(?=(?:\d{3})*\.)/g, m => ","+m);
                        cell = new Intl.NumberFormat('en-US', {style: "currency", currency: "USD"}).format(cellContent.v);
                        break;
                }
                // append to respective row 
                tableData[i].push(cell);
            });
        });
    }
    tableData.sort((a, b) => a[0] > b[0]).forEach(cellsArray => {
        const rowEl = tr.cloneNode();
        cellsArray.forEach(cellText => {
            const tdEl = td.cloneNode();
            tdEl.textContent = cellText;
            tdEl.setAttribute("sort", "row");
            rowEl.appendChild(tdEl);
        });
        tbody.appendChild(rowEl);
    });

    // insert html
    thead.appendChild(theadTr);
    table.appendChild(thead);
    table.className = "table sortable";
    table.dataset.toggle = "table";
    table.appendChild(tbody);
});