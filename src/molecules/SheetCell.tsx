import React, { useEffect } from "react";
import "./SheetCell.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { selectExpression } from "../redux/features/sheetState";

type CellDisplayValueProps = {
  value: CellValue;
};

const CellDisplayValue: React.FC<CellDisplayValueProps> = ({ value }) => {
  value = typeof value === "boolean" ? `${value}` : value;
  return <span>{value}</span>;
};

export type SheetCellProps = {
  coords: Coords;
};

const SheetCell: React.FC<SheetCellProps> = ({ coords }) => {
  const [row, col] = coords;

  const dispatch = useDispatch();
  const value: CellValue = useSelector(
    (state: RootState) => state.data.sheetData[row][col]
  );
  const errorLookup = useSelector((state: RootState) => state.data.errors);

  const isSelected: boolean = useSelector(
    (state: RootState) =>
      state.data.selectedExpression.toString() === coords.toString()
  );

  const formatData = useSelector(
    (state: RootState) => state.data.formatSheetData[row][col]
  );
  const hasError = (cell: Coords): boolean => errorLookup.has(cell.toString());

  return (
    <td
      className={["table-cell", isSelected ? "selected-cell" : ""].join(" ")}
      onClick={() => dispatch(selectExpression(coords))}
    >
      <span
        style={
          {
            fontWeight: formatData.bold ? "bold" : "normal",
            fontStyle: formatData.italic ? "italic" : "",
            fontFamily: formatData.font,
            fontSize: `${formatData.size}px`,
            color: formatData.color
          } as React.CSSProperties
        }
      >
        <CellDisplayValue value={hasError(coords) ? "ERROR" : value} />
      </span>
    </td>
  );
};

export default SheetCell;
