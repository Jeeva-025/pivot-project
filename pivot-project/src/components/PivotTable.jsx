import React, { useEffect, useState } from "react";

const PivotTable = ({
  tableData,
  pivotRows,
  pivotCols,
  pivotValues,
  pivotAggregation = "count",
}) => {
  const [pivotTableData, setPivotTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [headerHierarchy, setHeaderHierarchy] = useState([]);

  const [mainHeaders, setMainHeaders] = useState([]);
  const [subHeaders, setSubHeaders] = useState([]);
  let completePivotTableData = [];
  console.log(pivotAggregation);

  useEffect(() => {
    if (!pivotValues.length) return;
    console.log("hello");

    const pivotMap = {};
    const countMap = {};
    const uniqueRowKeys = new Set();
    const uniqueColKeys = new Set();
    const totals = {};
    let grandTotal = 0;

    tableData.forEach((row) => {
      const rowKey =
        pivotRows.map((r) => row[r] || "Total").join("-") || "Total";
      const colKeyParts = pivotCols.map((c) => row[c] || "Total");
      const colKey =
        colKeyParts.join("-") || pivotAggregation + " of " + pivotValues[0];

      uniqueRowKeys.add(rowKey);
      uniqueColKeys.add(colKey);

      if (!pivotMap[rowKey]) pivotMap[rowKey] = {};
      if (!pivotMap[rowKey][colKey])
        pivotMap[rowKey][colKey] =
          pivotAggregation === "min"
            ? Infinity
            : pivotAggregation === "max"
            ? -Infinity
            : 0;
      if (!totals[colKey]) totals[colKey] = 0;
      if (pivotAggregation === "average") {
        if (!countMap[rowKey]) countMap[rowKey] = {};
        if (!countMap[rowKey][colKey]) countMap[rowKey][colKey] = 0;
      }

      pivotValues.forEach((val) => {
        const num = parseFloat(row[val]) || 0;
        if (pivotAggregation === "sum") {
          pivotMap[rowKey][colKey] += num;
          totals[colKey] += num;
          grandTotal += num;
        } else if (pivotAggregation === "min") {
          pivotMap[rowKey][colKey] = Math.min(pivotMap[rowKey][colKey], num);
        } else if (pivotAggregation === "max") {
          pivotMap[rowKey][colKey] = Math.max(pivotMap[rowKey][colKey], num);
        } else if (pivotAggregation === "count") {
          pivotMap[rowKey][colKey] += 1;
          totals[colKey] += 1;
          grandTotal += 1;
        } else if (pivotAggregation === "average") {
          pivotMap[rowKey][colKey] += num;
          countMap[rowKey][colKey] += 1;
        }
      });
    });

    const sortedRows = Array.from(uniqueRowKeys).sort();
    const sortedCols = Array.from(uniqueColKeys).sort();

    const buildHeaderHierarchy = (columns) => {
      const levels = [];
      columns.forEach((col) => {
        const parts = col.split("-");
        parts.forEach((part, level) => {
          console.log(part);
          console.log(level);
          if (!levels[level]) levels[level] = [];
          if (!levels[level].includes(part)) levels[level].push(part);
        });
      });
      return levels;
    };

    const finalPivotData = sortedRows.map((rowKey) => {
      const rowData = {
        [pivotRows.join("-") || "Row"]: rowKey.split("-").join(" - "),
      };
      console.log(rowData);
      sortedCols.forEach((colKey) => {
        let value = pivotMap[rowKey][colKey] || 0;
        if (
          pivotAggregation === "average" &&
          countMap[rowKey] &&
          countMap[rowKey][colKey]
        ) {
          value /= countMap[rowKey][colKey];
        }
        rowData[colKey] = value;
      });

      if (sortedCols.length > 1) {
        rowData["Grand Total"] = Object.values(rowData)
          .slice(1)
          .reduce((acc, val) => acc + val, 0);
      }
      return rowData;
    });
    console.log(finalPivotData);
    console.log(sortedCols);

    if (pivotAggregation !== "sum" && pivotAggregation !== "count") {
      sortedCols.forEach((cols) => {
        if (!totals[cols]) totals[cols] = 0;
        finalPivotData.forEach((each) => {
          totals[cols] += each[cols] || 0;
          grandTotal += each[cols];
        });
      });
    }

    const totalsRow = { [pivotRows.join("-") || "Row"]: "Grand Total" };
    sortedCols.forEach((colKey) => {
      totalsRow[colKey] = totals[colKey] || 0;
    });
    if (sortedCols.length > 1) totalsRow["Grand Total"] = grandTotal;

    finalPivotData.push(totalsRow);

    let headers = [];
    if (sortedCols.length > 1)
      headers = [pivotRows.join("-") || "Row", ...sortedCols, "Grand Total"];
    else headers = [pivotRows.join("-") || "Row", ...sortedCols];
    console.log(headers);
    setTableHeaders(headers);
    setPivotTableData(finalPivotData);

    setHeaderHierarchy(buildHeaderHierarchy(sortedCols));
  }, [tableData, pivotRows, pivotCols, pivotValues, pivotAggregation]);

  useEffect(() => {
    if (headerHierarchy.length > 1) {
      const allHeaders = [pivotRows.join("-") || "Row"];

      const buildCompleteHeaders = (hierarchy) => {
        const headers = [];
        const currentLevel = hierarchy[0];

        if (hierarchy.length === 1) {
          headers.push(...currentLevel);
        } else {
          currentLevel.forEach((parent) => {
            const childHeaders = buildCompleteHeaders(hierarchy.slice(1));
            childHeaders.forEach((child) => headers.push(`${parent}-${child}`));
          });
        }

        console.log(headers);
        return headers;
      };

      const completeHeaders = buildCompleteHeaders(headerHierarchy);
      completeHeaders.push("Grand Total");

      setTableHeaders([...allHeaders, ...completeHeaders]);
    }
  }, [headerHierarchy]);

  if (tableHeaders.length) console.log(tableHeaders);
  if (pivotTableData.length) console.log(pivotTableData);
  if (headerHierarchy.length) console.log(headerHierarchy);

  if (completePivotTableData.length) console.log(completePivotTableData);

  return (
    <table className="table-auto border-collapse w-full mt-4">
      <thead>
        {headerHierarchy.map((level, levelIndex) => {
          const repeatFactor = headerHierarchy
            .slice(0, levelIndex)
            .reduce((acc, lvl) => acc * lvl.length, 1);

          return (
            <tr key={levelIndex}>
              {levelIndex === 0 && (
                <th
                  rowSpan={headerHierarchy.length}
                  className="border p-2 bg-gray-200"
                >
                  {pivotRows.join("-") || "Row"}
                </th>
              )}

              {Array(repeatFactor)
                .fill(null)
                .flatMap(() =>
                  level.map((header, headerIndex) => {
                    const nextLevels = headerHierarchy.slice(levelIndex + 1);
                    const colSpan = nextLevels.length
                      ? nextLevels.reduce((acc, lvl) => acc * lvl.length, 1)
                      : 1;

                    return (
                      <th
                        key={`${levelIndex}-${headerIndex}`}
                        colSpan={colSpan}
                        rowSpan={
                          levelIndex === headerHierarchy.length - 1 ? 1 : 1
                        }
                        className="border p-2 bg-gray-200 capitalize"
                      >
                        {header}
                      </th>
                    );
                  })
                )}

              {levelIndex === 0 && headerHierarchy[0].length > 1 && (
                <th
                  rowSpan={headerHierarchy.length}
                  className="border p-2 bg-gray-200 capitalize"
                >
                  Grand Total
                </th>
              )}
            </tr>
          );
        })}
      </thead>

      <tbody>
        {pivotTableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {tableHeaders.map((header, colIndex) => (
              <td key={colIndex} className="border p-2">
                {row[header] !== undefined ? row[header] : 0}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PivotTable;
