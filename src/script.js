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
	const tableData = [];
	// not gonna need this, will be easier to shift and remove than having to keep track of the "relevant" position
	data.names.table.rows.shift();
	// construct table content array
	for (const tabName in data) {
		// current spreadsheet tab response data
		const tab = data[tabName];
		// go through all the rows in the tab's table
		tab.table.rows.forEach((row, i) => {
			// add a row array
			// go through all the cells in the current tab's current row
			row.c.map((cellContent, cellIndex) => {
				// set text content based on what sort of data (i.e. from which stylesheet tab)
				switch(tabName) {
					case "names":
						// names as plain text
						if (cellIndex === 0) {
							// create new row object
							tableData.push({});
							// first name
							tableData[i].first = cellContent.v;
						} else {
							// last name
							tableData[i].last = cellContent.v;
						}
						break;
					case "hire":
						// e.g. "Feb 1 2022"
						tableData[i].date = new Date(cellContent.f).toString().substring(4, 15);
						break;
					case "salary":
						// e.g. "$1,000,000.00"
						tableData[i].salary = new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: "USD"
						}).format(cellContent.v);
						break;
				}
			});
		});
	}
	// insert html
	$("#employees").bootstrapTable("destroy").bootstrapTable({
		columns: [
			{
				title: "Last",
				field: "last",
				sortable: true,
				sorter: lastNameSorter
			},
			{
				title: "First",
				field: "first",
				sortable: true
			},
			{
				title: "Hire Date",
				field: "date",
				sortable: true,
				sorter: dateSorter
			},
			{
				title: "Salary",
				field: "salary",
				sortable: true,
				sorter: salarySorter
			}
		],
		data: tableData
	});
});