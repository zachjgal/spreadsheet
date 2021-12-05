import React from "react";
import lodashRange from "lodash/range";
import "./Sheet.css";
import SheetCell from "../molecules/SheetCell";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { CellRef } from "../utilities/parser";

export type SheetProps = {};

const Sheet: React.FC<SheetProps> = () => {
  const height: number = useSelector(
    (state: RootState) => state.data.sheetData.length
  );
  const width: number = useSelector(
    (state: RootState) => state.data.sheetData[0].length
  );
  return (
    <div className="spreadsheet-container">
      <table className="spreadsheet-table">
        <tr key={"topbar"}>
          {lodashRange(-1, width).map((colInd) =>
            colInd === -1 ? (
              <th>{"   "}</th>
            ) : (
              <th className="text-center">{CellRef.makeCol(colInd)}</th>
            )
          )}
        </tr>
        {lodashRange(0, height).map((rowInd) => (
          <tr key={`row${rowInd}`}>
            {lodashRange(-1, width).map((colInd) =>
              colInd !== -1 ? (
                <SheetCell coords={[rowInd, colInd]} />
              ) : (
                <td style={{ minWidth: "24px", textAlign:"center" }}>{rowInd + 1}</td>
              )
            )}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Sheet;
