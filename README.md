MasterSchool's 105 EOC. [Empty template](https://github.com/danielrees8743/105-EOC) by Dan Rees

Credits: Dan Rees and Rahim Afful-Brown (providing empty workspace repo, help with refactoring for clearner code)

Sources:
* [Bootstrap- table options](https://bootstrap-table.com/docs/api/table-options/)
- [Bootstrap- Column Sorter](https://examples.bootstrap-table.com/#options/table-sortable.html)
- [Bootstrap- Column sorting options](https://examples.bootstrap-table.com/#column-options/sorter.html#view-source)
- [String sorting](https://stackoverflow.com/a/51169) by [Shog9](https://stackoverflow.com/users/811/shog9)- I was comparing the strings but returning the incorrect value (-1/0/1)

# Snippets
Pieces of code that I removed due to better alternatives, just putting them here so they become more accessible for potential later use.

## Number formatter
Formatter of currency (like acomibnation of `.toLocaleString("en-US")` and `.toFixed(2)`, using regex:

```js
"$" + cellContent.v.toFixed(2).replace(/(?<!\b)\d{3}(?=(?:\d{3})*\.)/g, m => ","+m);
```

## Date formatter
Regex-based date formatter:

```js
let dateString = cellContent.v.match(/[\d\,]+/)[0];
dateString = dateString.replace(/\,\d+\,/g, n => "," + (Number(n) + 1) + ",");
cell = new Date(dateString).toString().substring(4, 15);
```