import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  editCell,
  getCellDataDefaultValue,
  setRawExpr,
} from "../redux/features/sheetState";

import "./FormulaBar.css";

export type FormulaBarProps = {};

const FormulaBar: React.FC<FormulaBarProps> = () => {
  const dispatch = useDispatch();
  const rawExpr: string = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .rawExpression
  );

  return (
    <div className="formula-bar-container">
      <input
        className="formula-bar"
        type="text"
        value={rawExpr}
        placeholder={"f(x) : Type your value here!!"}
        onChange={(e) => dispatch(setRawExpr(e.target.value))}
        onKeyPress={(e) => e.key === "Enter" && dispatch(editCell(rawExpr))}
      />
    </div>
  );
};

export default FormulaBar;
