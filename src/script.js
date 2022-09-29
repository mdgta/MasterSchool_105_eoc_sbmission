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
        /*if ("Salary" === title) {
            cell.dataset.sorter = "salarySorter";
        }
        if ("Hire Date" === title) {
            cell.dataset.sorter = "dateSorter";
        }*/
        switch (title) {
            case "Last":
                cell.dataset.sorter = "lastNameSorter";
                break;
            case "Hire Date":
                cell.dataset.sorter = "dateSorter";
                break;
            case "Salary":
                cell.dataset.sorter = "salarySorter";
                break;
        }
        
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
            // go through all the cells in the current tab's current row
            row.c.reverse().map(cellContent => {
                // make a <td>
                let cell;
                // set text content based on what sort of data (i.e. from which stylesheet tab)
                switch(tabName) {
                    case "names":
                        // plain text
                        cell = [cellContent.v, cellContent.v];
                        break;
                    case "hire":
                        // in MMM DD YYYY format, e.g. (Feb 1 2022)
                        /*let dateString = cellContent.v.match(/[\d\,]+/)[0];
                        //dateString = dateString.replace(/\,\d+\,/g, n => "," + (Number(n) + 1) + ",")
                        console.log(dateString);
                        cell = new Date(dateString).toString().substring(4, 15);
                        */
                        cell = [new Date(cellContent.f).toString().substring(4, 15), new Date(cellContent.f).toJSON()];
                        break;
                    case "salary":
                        // formatted as $1,000,000.00
                        // wasn't really sure how to combine toFixed and toLocaleString in an elegant way so... used an even LESS elegant method lol
                        // (not taken from stack overflow or anything, but on the verge of bleeding out of my eyes rn)
                        //cell = "$" + cellContent.v.toFixed(2).replace(/(?<!\b)\d{3}(?=(?:\d{3})*\.)/g, m => ","+m);
                        cell = [new Intl.NumberFormat('en-US', {style: "currency", currency: "USD"}).format(cellContent.v), cellContent.v];
                        break;
                }
                // append to respective row 
                tableData[i].push(cell);
            });
        });
    }
    tableData.sort((a, b) => a[0] > b[0]).forEach(cellsArray => {
        const rowEl = tr.cloneNode();
        cellsArray.forEach((cellText, i) => {
            const tdEl = td.cloneNode();
            tdEl.textContent = cellText[0];
            tdEl.dataset.sort = cellText[1];
            if (i === 0) {
                // add sort="row" to the first cell in each row
                tdEl.setAttribute("sort", "row");
            }
            rowEl.appendChild(tdEl);
        });
        tbody.appendChild(rowEl);
    });

    // insert html
    thead.appendChild(theadTr);
    table.appendChild(thead);
    table.className = "table sortable";
    table.dataset.toggle = "table";
    table.dataset.sortable = "true";
    table.appendChild(tbody);
    $(table).bootstrapTable("destroy").bootstrapTable({
        columns: [
            {
                title: "Last",
                sortable: true
            },
            {
                title: "First",
                sortable: true
            },
            {
                title: "Hire Date",
                sortable: true
            },
            {
                title: "Salary",
                sortable: true
            }
        ]
    });
});
/*
function dateSorter(a, b, c) {
    console.log(arguments);
    const aa = new Date(a).toJSON(),
        bb = new Date(b).toJSON();
    console.log(aa, bb);
    return aa < bb;
}
function numberSorter(a, b) {
    const aa = Number(a.replace(/[^\d\.]/g, "")),
        bb = Number(a.replace(/[^\d\.]/g, ""));
    console.log(a, b, aa, bb);
    return bb < aa;
}
*/
function salarySorter(a, b) {
    console.log("priceSorter");
    const aa = a.replace(/[^\d\.]/g, "");
    const bb = b.replace(/[^\d\.]/g, "");
    return aa - bb;
}
function dateSorter(a, b) {
    console.log("priceSorter");
    const aa = new Date(a).getTime();
    const bb = new Date(b).getTime();
    return aa - bb;
}
function lastNameSorter(a, b, rowA, rowB) {
    console.log("lastNameSorter");
    if (a === b) {
        a = rowA[1];
        b = rowB[1];
    }
    /*
    const aa = a;
    const bb = b;
    console.log(aa,bb);
    return aa !== bb ? aa > bb : rowA[1] > rowB[1];
    */
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    return 0;
}