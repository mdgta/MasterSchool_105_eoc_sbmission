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
	/*
	const names = await fetchSpreadsheet(0),
		hire = await fetchSpreadsheet(1),
		salary = await fetchSpreadsheet(2);
	return {names, hire, salary};
	*/
	
	return Promise.all([0, 1, 2].map(n => fetchSpreadsheet(n)));
}

fetchAllpreadsheets().then(data => {
	const tableData = [];
	// not gonna need this, will be easier to shift and remove than having to keep track of the "relevant" position
	data[0].table.rows.shift();
	// construct table content array
	data.forEach((tab, tabIndex) => {
		// go through all the rows in the tab's table
		tab.table.rows.forEach((row, i) => {
			// add a row array
			// go through all the cells in the current tab's current row
			row.c.map((cellContent, cellIndex) => {
				// set text content based on what sort of data (i.e. from which stylesheet tab)
				// create row if doesn't exist yet
				tableData[i] = tableData[i] || [];
				// order of rows in the json
				const fieldsOrderInData = [["first", "last"], ["date"], ["salary"]],
					fieldName = fieldsOrderInData[tabIndex][cellIndex];
				// for the date row, place directly a Date instance (easier to work with when using sorter and formatter)
				tableData[i][fieldName] = tabIndex === 1 ? new Date(cellContent.f) : cellContent.v;
			});
		});
	});
	// insert html
	$("#employees").bootstrapTable("destroy").bootstrapTable({
		columns: [
			{
				title: "Last",
				field: "last",
				sortable: true,
				sorter(a, b, rowA, rowB) {
					// compare the firstname row instead if both lastnames are identical
					if (a === b) {
						a = rowA.first;
						b = rowB.first;
					}
					if (a < b) {
						return -1;
					} else if (a > b) {
						return 1;
					}
					return 0;
				}
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
				sorter(a, b) {
					// return timestamp comparison
					return a.getTime() - b.getTime();
				},
				formatter(val) {
					return val.toString().substring(4, 15);
				}
			},
			{
				title: "Salary",
				field: "salary",
				sortable: true,
				sorter(a, b) {
					// return number comparison
					return a - b;
				},
				formatter(val) {
					return new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD"
					}).format(val);
				}
			}
		],
		data: tableData
	});
});