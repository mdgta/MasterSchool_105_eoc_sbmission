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
    console.log(data);
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
    // add rows to the table body
    // loop through all the tab data objects in the data array
    for (const tabName in data) {
        // current spreadsheet tab response data
        const tab = data[tabName];
        // go through all the rows in the tab's table
        tab.table.rows.forEach((row, i) => {
            // skip the first row for the names json, since the titles are also listed in the body
            if (i === 0 && tabName === "names") {
                return;
            }
            // add <tr> the first time (.names is the first tab)
            if (tabName === "names") {
                tbody.appendChild(tr.cloneNode());
            }
            // tab's table row index: -1 index for the names since the titles are also included as a row there
            const relevantIndex = i - (tabName === "names" ? 1 : 0);
            // go through all the cells in the current tab's current row
            row.c.reverse().map(cellContent => {
                // make a <td>
                const cell = td.cloneNode();
                if (relevantIndex === 0) {
                    cell.setAttribute("scope", "row");
                }
                // set text content based on what sort of data (i.e. from which stylesheet tab)
                switch(tabName) {
                    case "names":
                        // plain text
                        cell.textContent = cellContent.v;
                        break;
                    case "hire":
                        // in MMM DD YYYY format, e.g. (Feb 1 2022)
                        cell.textContent = new Date(cellContent.v.match(/[\d\,]+/)[0]).toString().substring(4, 15);
                        break;
                    case "salary":
                        // formatted as $1,000,000.00
                        // wasn't really sure how to combine toFixed and toLocaleString in an elegant way so... used an even LESS elegant method lol
                        // (not taken from stack overflow or anything, but on the verge of bleeding out of my eyes rn)
                        cell.textContent = "$" + cellContent.v.toFixed(2).replace(/(?<!\b)\d{3}(?=(?:\d{3})*\.)/g, m => ","+m);
                        break;
                }
                // append to respective row 
                tbody.children[relevantIndex].appendChild(cell);
            });
        });
    }

    // insert html
    thead.appendChild(theadTr);
    table.appendChild(thead);
    table.className = "table";
    table.appendChild(tbody);
});