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
	function salarySorter(a, b) {
		// return non-formatted number comparison
		return a.replace(/[^\d\.]/g, "") - b.replace(/[^\d\.]/g, "");
	}
	function dateSorter(a, b) {
		// return timestamp comparison
		return new Date(a).getTime() - new Date(b).getTime();
	}
	function lastNameSorter(a, b, rowA, rowB) {
		// compare the firstname row instead if both lastnames are identical
		if (a === b) {
			a = rowA[1];
			b = rowB[1];
		}
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		}
		return 0;
	}
	const tableData = [],
		table = document.querySelector("#employees"),
		tbody = document.createElement("tbody"),
		tr = document.createElement("tr"),
		td = document.createElement("td");
	// not gonna need this, will be easier to shift and remove than having to keep track of the "relevant" position
	data.names.table.rows.shift();
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
			rowEl.appendChild(tdEl);
		});
		tbody.appendChild(rowEl);
	});

	// insert html
	table.className = "table sortable";
	table.dataset.toggle = "table";
	table.dataset.sortable = "true";
	table.appendChild(tbody);
	$(table).bootstrapTable("destroy").bootstrapTable({
		columns: [
			{
				title: "Last",
				sortable: true,
				sorter: lastNameSorter
			},
			{
				title: "First",
				sortable: true
			},
			{
				title: "Hire Date",
				sortable: true,
				sorter: dateSorter
			},
			{
				title: "Salary",
				sortable: true,
				sorter: salarySorter
			}
		]
	});
});

