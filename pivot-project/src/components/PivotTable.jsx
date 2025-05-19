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
  const [rowHierarchy, setRowHierarchy] = useState([]);
  const [rowHeader, setRowHeader] = useState([]);

  const [mainHeaders, setMainHeaders] = useState([]);
  const [subHeaders, setSubHeaders] = useState([]);
  let completePivotTableData = [];
  console.log(pivotAggregation);

  useEffect(() => {
    if (
      !pivotValues.length ||
      (!pivotCols.length && !pivotRows.length) ||
      !pivotRows.length
    ) {
      setPivotTableData([]);
      setHeaderHierarchy([]);
      setTableHeaders([]);
      setRowHierarchy([]);
      return;
    }
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
    setRowHierarchy(buildHeaderHierarchy(sortedRows));
    console.log(pivotMap);
  }, [tableData, pivotRows, pivotCols, pivotValues, pivotAggregation]);

  useEffect(() => {
    if (headerHierarchy.length > 1 || rowHierarchy.length > 1) {
      const allHeaders = [pivotRows.join("-") || "Row"];

      const buildCompleteHeaders = (hierarchy) => {
        if (hierarchy.length === 0) return [];
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
      if (completeHeaders.length > 1) completeHeaders.push("Grand Total");

      const rows = buildCompleteHeaders(rowHierarchy);
      setRowHeader(rows);

      const finalHeaders = [...allHeaders, ...completeHeaders];
      setTableHeaders([...allHeaders, ...completeHeaders]);

      if (rowHierarchy.length > 1) {
        console.log("helleo");
        console.log(rowHeader);
        const updatedPivotData = [];
        console.log(finalHeaders[0]);

        rows.forEach((key) => {
          const rowKeyParts = key.split("-");
          const matchKey = rowKeyParts.join(" - ");
          console.log(key);

          const existingRow = pivotTableData.find(
            (row) => row[finalHeaders[0]] === matchKey
          );
          console.log(existingRow);

          if (!existingRow) {
            updatedPivotData.push({
              [finalHeaders[0]]: matchKey,
              ...Object.fromEntries(
                finalHeaders.slice(1).map((header) => [header, 0])
              ),
            });
          } else {
            updatedPivotData.push(existingRow);
          }
        });

        updatedPivotData.push(pivotTableData[pivotTableData.length - 1]);
        if (updatedPivotData.length) console.log(updatedPivotData);

        setPivotTableData(updatedPivotData);
      }
    }
  }, [headerHierarchy, rowHierarchy]);

  if (tableHeaders.length) console.log(tableHeaders);
  if (pivotTableData.length) console.log(pivotTableData);
  if (headerHierarchy.length) console.log(headerHierarchy);
  if (rowHierarchy.length) console.log(rowHierarchy);
  if (rowHeader.length) console.log(rowHeader);

  if (completePivotTableData.length) console.log(completePivotTableData);

  const getParent = (header, hierarchy) => {
    const parts = header.split(" - ");
    const parent = parts[0];
    for (let i = 0; i < hierarchy[0].length; i++) {
      if (hierarchy[0][i] === parent) return i;
    }
    return -1;
  };

  const calculateRowSpan = (level, rowHierarchy) => {
    if (level === rowHierarchy.length - 1) return 1;

    const remainingLevels = rowHierarchy.slice(level + 1);
    return remainingLevels.reduce((acc, lvl) => acc * lvl.length, 1);
  };
  let status = true;

  return (
    <div className=" overflow-auto no-scrollbar p-4">
      <table className="border-collapse w-full mt-4 overflow-x-hidden ">
        <thead>
          {headerHierarchy.map((level, levelIndex) => {
            const repeatFactor = headerHierarchy
              .slice(0, levelIndex)
              .reduce((acc, lvl) => acc * lvl.length, 1);

            return (
              <tr key={levelIndex}>
                {levelIndex === 0 &&
                  pivotRows.map((each) => (
                    <th
                      rowSpan={headerHierarchy.length}
                      colSpan={1}
                      className="border p-2 bg-gray-200"
                    >
                      {each || "Row"}
                    </th>
                  ))}

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
                          rowSpan={1}
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
          {pivotTableData.map((row, rowIndex) => {
            const rowKey = row[tableHeaders[0]];
            const parentIndex = getParent(rowKey, rowHierarchy);
            console.log(parentIndex);
            const parts = rowKey.split(" - ");

            return (
              <tr key={rowIndex}>
                {rowHierarchy.map((level, levelIndex) => {
                  const currentHeader = parts[levelIndex] || "";
                  const isFirstOccurrence =
                    (rowIndex === 0 ||
                      parts[levelIndex] !==
                        pivotTableData[rowIndex - 1][tableHeaders[0]].split(
                          " - "
                        )[levelIndex]) &&
                    rowKey !== "Grand Total";

                  if (isFirstOccurrence) {
                    console.log(currentHeader);
                    const rowSpan = calculateRowSpan(
                      levelIndex,

                      rowHierarchy
                    );
                    console.log(rowSpan);
                    return (
                      <td
                        key={`${rowIndex}-${levelIndex}`}
                        rowSpan={rowSpan}
                        colSpan={1}
                        className="border p-2 capitalize"
                      >
                        {currentHeader}
                      </td>
                    );
                  } else if (parentIndex === -1 && status) {
                    status = false;
                    console.log("hi", currentHeader);
                    return (
                      <td
                        key={`${rowIndex}-${levelIndex}`}
                        colSpan={rowHierarchy.length}
                        className="border p-2 capitalize"
                      >
                        Grand Total
                      </td>
                    );
                  }
                })}
                {tableHeaders.slice(1).map((header, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="border p-2">
                    {row[header] !== undefined ? row[header] : 0}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PivotTable;
