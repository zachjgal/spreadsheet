import React from "react";
import "./SheetCell.css";
import { useDispatch, useSelector } from "react-redux";
import { PayloadAction } from "@reduxjs/toolkit";

export type SheetCellProps = {
  isSelected: boolean;
  value: CellValue;
  onSelect: () => PayloadAction<Coords>;
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
      onClick={() => dispatch(onSelect())}
    >
      {value}
    </td>
  );
};

export default SheetCell;
