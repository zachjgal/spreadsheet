import React from "react";
import "./SheetCell.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  getCellDataDefaultValue,
  selectExpression,
} from "../redux/features/sheetState";
import { Form } from "react-bootstrap";

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
  const dispatch = useDispatch();

  const selectCellDataProp = (prop: keyof CellData) => (state: RootState) =>
    getCellDataDefaultValue(state.data, coords)[prop];

  const value = useSelector(selectCellDataProp("value")) as CellValue;

  const isSelected: boolean = useSelector(
    (state: RootState) =>
      state.data.selectedExpression.toString() === coords.toString()
  );

  const formatData: FormatData = {
    font: useSelector(
      (state: RootState) =>
        getCellDataDefaultValue(state.data, coords).formatData.font
    ),
    size: useSelector(
      (state: RootState) =>
        getCellDataDefaultValue(state.data, coords).formatData.size
    ),
    bold: useSelector(
      (state: RootState) =>
        getCellDataDefaultValue(state.data, coords).formatData.bold
    ),
    italic: useSelector(
      (state: RootState) =>
        getCellDataDefaultValue(state.data, coords).formatData.italic
    ),
    color: useSelector(
      (state: RootState) =>
        getCellDataDefaultValue(state.data, coords).formatData.color
    ),
  };

  const hasError = useSelector(
    (state: RootState) =>
      state.data.cellDataMap.hasOwnProperty(coords.toString()) &&
      state.data.cellDataMap[coords.toString()].error !== undefined
  );
  return (
    <td
      className={[
        "table-cell",
        isSelected && !hasError ? "selected-cell" : "",
        isSelected && hasError ? "error-cell" : "",
      ].join(" ")}
      onClick={() => dispatch(selectExpression(coords))}
    >
      <span
        style={
          {
            fontWeight: formatData.bold ? "bold" : "normal",
            fontStyle: formatData.italic ? "italic" : "",
            fontFamily: formatData.font,
            fontSize: `${formatData.size}px`,
            color: formatData.color,
          } as React.CSSProperties
        }
      >
        <CellDisplayValue value={hasError ? "ERROR" : value} />
      </span>
    </td>
  );
};

export default SheetCell;
