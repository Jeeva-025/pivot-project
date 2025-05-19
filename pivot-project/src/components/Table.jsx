import React from "react";

const Table = ({ tableData }) => {
  return (
    <div className=" max-w-5xl overflow-y-auto max-h-[500px] mt-5 custom-scrollbar">
      <table className="border-collapse   border border-gray-900 ">
        <thead>
          <tr className="bg-gray-100 border border-gary-900">
            {Object.keys(tableData[0]).map((key, index) => (
              <th
                className="py-3 px-4 text-orange-700 font-semibold"
                key={index}
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} className="even:bg-gray-50 hover:bg-gray-100">
              {Object.values(row).map((value, i) => (
                <td key={i} className="py-3 px-4 border-b border-gray-200">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
