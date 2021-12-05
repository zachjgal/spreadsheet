import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { editCell, setRawExpr } from "../redux/features/sheetState";

import "./FormulaBar.css";

export type FormulaBarProps = {};

const FormulaBar: React.FC<FormulaBarProps> = () => {
  const dispatch = useDispatch();
  const rawExpr: string = useSelector(
    (state: RootState) =>
      state.data.rawExpressions.get(state.data.selectedExpression.toString()) ??
      ""
  );

  return (
    <div className="formula-bar-container">
      <input
        className="formula-bar"
        type="text"
        value={rawExpr}
        onChange={(e) => dispatch(setRawExpr(e.target.value))}
        onKeyPress={(e) => e.key === "Enter" && dispatch(editCell(rawExpr))}
      />
    </div>
  );
};

export default FormulaBar;
