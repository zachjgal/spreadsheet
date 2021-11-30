import React from "react";
import "./SheetCell.css";
import { useDispatch, useSelector } from "react-redux";
import { PayloadAction } from "@reduxjs/toolkit";

type CellDisplayValueProps = {
  value: CellValue;
};

const CellDisplayValue: React.FC<CellDisplayValueProps> = ({ value }) => {
  if (typeof value === "string") {
    return <i>{value}</i>;
  } else if (typeof value === "boolean") {
    return <React.Fragment>{`${value}`}</React.Fragment>;
  } else {
    return <React.Fragment>{value}</React.Fragment>;
  }
};

export type SheetCellProps = {
  isSelected: boolean;
  value: CellValue;
  onSelect: () => PayloadAction<Coords>;
  hasError: boolean;
};

const SheetCell: React.FC<SheetCellProps> = ({
  value,
  onSelect,
  isSelected,
}) => {
  const dispatch = useDispatch();
  return (
    <td
      className={["table-cell", isSelected ? "selected-cell" : ""].join(" ")}
      // todo handle cells that have error w/ css
      onClick={() => dispatch(onSelect())}
    >
      <CellDisplayValue value={value} />
    </td>
  );
};

export default SheetCell;
