import React from "react";
import lodashRange from "lodash/range";
import "./Sheet.css";
import SheetCell from "../molecules/SheetCell";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { selectExpression } from "../redux/features/sheetState";
import { CellRef } from "../utilities/parser";

export type SheetProps = {
  setMonitor: (data: string) => void;
  setX: (data: number) => void;
  setY: (data: number) => void;
};

const Sheet: React.FC<SheetProps> = ({ setMonitor, setX, setY }) => {
  const data: SheetData = useSelector(
    (state: RootState) => state.data.sheetData
  );
  const selectedCell: Coords = useSelector(
    (state: RootState) => state.data.selectedExpression
  );
  const [height, width] = [data.length, data[0].length];
  const hasError: boolean[][] = useSelector((state: RootState) => {
    let ret: boolean[][] = [];
    for (let i: number = 0; i < height; i++) {
      ret[i] = [];
      for (let j: number = 0; j < width; j++) {
        ret[i][j] = state.data.errors.has([i, j].toString());
      }
    }
    return ret;
  });

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
                <SheetCell
                  isSelected={
                    [rowInd, colInd].toString() === selectedCell.toString()
                  }
                  setMonitor={setMonitor}
                  setX={setX}
                  setY={setY}
                  rowInd={rowInd}
                  colInd={colInd}
                  value={data[rowInd][colInd]}
                  onSelect={() => selectExpression([rowInd, colInd])}
                  hasError={hasError[rowInd][colInd]}
                />
              ) : (
                <td style={{ minWidth: "24px" }}>{rowInd + 1}</td>
              )
            )}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Sheet;
