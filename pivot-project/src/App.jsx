import { useState } from "react";
import { Upload, FilePlus2 } from "lucide-react";
import Papa from "papaparse";
import Table from "./components/Table";
import { IoIosClose } from "react-icons/io";
import PivotTable from "./components/PivotTable";

import "./App.css";

function App() {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pivotAggregation, setPivotAggregation] = useState("sum");
  const [pivotRows, setPivotRows] = useState([]);
  const [pivotCols, setPivotCols] = useState([]);
  const [pivotValues, setPivotValues] = useState([]);
  const [fileName, setFileName] = useState("");
  const [showTable, setShowTable] = useState(false);

  const aggregationArr = ["sum", "count", "min", "max", "average"];

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (result) => {
          setTableData(result.data);
          setColumns(Object.keys(result.data[0]));
        },
        header: true,
        skipEmptyLines: true,
      });
    } else {
      alert("Please upload a valid .csv file");
    }
  };

  const handleDrop = (item, target) => {
    setColumns((prev) => prev.filter((each) => each !== item));
    if (
      pivotRows.includes(item) ||
      pivotCols.includes(item) ||
      pivotValues.includes(item)
    )
      return;
    if (target === "rows" && !pivotRows.includes(item))
      setPivotRows([...pivotRows, item]);
    if (target === "cols" && !pivotCols.includes(item))
      setPivotCols([...pivotCols, item]);
    if (target === "values" && !pivotValues.includes(item))
      setPivotValues([...pivotValues, item]);
  };

  const handleRemove = (target, item) => {
    console.log("helloe welcome");
    setColumns((prev) => [...prev, item]);
    if (target === "rows")
      setPivotRows((prev) => prev.filter((each) => each !== item));
    else if (target === "cols")
      setPivotCols((prev) => prev.filter((each) => each !== item));
    else if (target === "values")
      setPivotValues((prev) => prev.filter((each) => each !== item));
  };

  console.log(pivotAggregation);

  return (
    <div className="flex flex-col justify-center items-center w-screen space-y-2 overflow-y-scroll overflow-x-hidden p-4 custom-scrollbar">
      <h2 className="text-2xl">Upload CSV File</h2>
      <div className="flex justify-center items-center space-x-1">
        <Upload size={40} className="text-blue-600" />

        <label
          htmlFor="fileInput"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-700"
        >
          Select CSV file
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleChange(e)}
        />
      </div>
      {fileName && <p>Uploaded File: {fileName}</p>}
      <div className="flex flex-row w-full space-x-5">
        {tableData.length > 0 && (
          <div className="grow flex justify-center items-center ">
            <Table tableData={tableData} />
          </div>
        )}

        {columns.length > 0 && (
          <div className="flex flex-col items-center w-[250px] h-full bg-gray-100 border  rounded-lg shadow-xl border-gray-400 pr-4">
            <div className="w-full bg-gray-100 border border-transparent rounded-xl py-4 px-4 ">
              <h3 className="text-lg font-semibold mb-2">Available Columns</h3>
              <div className="flex flex-col items-start max-h-[120px] w-full overflow-auto no-scrollbar">
                {columns.map((col) => (
                  <div
                    key={col}
                    className="p-2 bg-white w-full mb-2 rounded-lg shadow cursor-pointer text-xs "
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", col);
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>
            </div>

            <div className=" w-full flex-1 grid grid-cols-2 pb-4 px-1">
              <div
                className="bg-gray-100 pl-2 "
                onDrop={(e) =>
                  handleDrop(e.dataTransfer.getData("text/plain"), "rows")
                }
                onDragOver={(e) => e.preventDefault()}
              >
                <h3 className="text-lg font-semibold mb-2">Rows</h3>
                <div className="w-[100px]  h-[120px] bg-white border border-transparent rounded-lg overflow-auto no-scrollbar">
                  {pivotRows.map((row) => (
                    <div
                      key={row}
                      className="flex space-x-1 justify-center items-center p-2 bg-white mb-2 rounded-lg shadow"
                    >
                      {" "}
                      <div className="text-[10px]">{row}</div>{" "}
                      <IoIosClose
                        onClick={() => handleRemove("rows", row)}
                        size={24}
                      />{" "}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="bg-gray-100 pl-2  "
                onDrop={(e) =>
                  handleDrop(e.dataTransfer.getData("text/plain"), "cols")
                }
                onDragOver={(e) => e.preventDefault()}
              >
                <h3 className="text-lg font-semibold mb-2">Columns</h3>
                <div className="w-[100px]  h-[120px] bg-white border border-transparent rounded-lg overflow-auto no-scrollbar">
                  {pivotCols.map((col) => (
                    <div
                      key={col}
                      className="flex space-x-1 justify-center items-center p-2 bg-white mb-2 rounded-lg shadow"
                    >
                      <div className="text-[10px]">{col}</div>{" "}
                      <IoIosClose
                        onClick={() => handleRemove("cols", col)}
                        size={24}
                      />{" "}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="bg-gray-100 pl-2 "
                onDrop={(e) =>
                  handleDrop(e.dataTransfer.getData("text/plain"), "values")
                }
                onDragOver={(e) => e.preventDefault()}
              >
                <h3 className="text-lg font-semibold mb-2">Values</h3>
                <div className="w-[100px]  h-[120px] bg-white border border-transparent rounded-lg overflow-auto no-scrollbar">
                  {pivotValues.map((val) => (
                    <div className="flex space-x-1 justify-center items-center p-2 bg-white mb-2 rounded-lg shadow">
                      {" "}
                      <div key={val} className="text-[10px] ">
                        {val}
                      </div>{" "}
                      <IoIosClose
                        size={24}
                        onClick={() => handleRemove("values", val)}
                      />{" "}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-gray-100 px-2"
                onDrop={(e) =>
                  handleDrop(e.dataTransfer.getData("text/plain"), "values")
                }
                onDragOver={(e) => e.preventDefault()}
              >
                <h3 className="text-lg font-semibold mb-2">Aggregation</h3>
                <div className="w-[100px]  h-[120px] bg-white border border-transparent rounded-lg overflow-auto no-scrollbar px-2">
                  {aggregationArr.map((each, index) => (
                    <div
                      onClick={() => setPivotAggregation(each)}
                      className={`text-xs text-center ${
                        pivotAggregation === each ? "bg-gray-200" : "bg-white"
                      }  mb-2 p-1 rounded-lg shadow cursor-pointer capitalize`}
                    >
                      {each}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 w-full">
        <PivotTable
          tableData={tableData}
          pivotRows={pivotRows}
          pivotCols={pivotCols}
          pivotValues={pivotValues}
          pivotAggregation={pivotAggregation}
        />
      </div>
    </div>
  );
}

export default App;
