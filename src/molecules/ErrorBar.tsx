import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";

import "./FormulaBar.css";

export type FormulaBarProps = {};

const FormulaBar: React.FC<FormulaBarProps> = () => {
  const rawExpr: string = useSelector(
    (state: RootState) =>
      state.data.rawExpressions.get(state.data.selectedExpression.toString()) ??
      ""
  );
  const selectedExprCoords = useSelector(
    (state: RootState) => state.data.selectedExpression
  );
  const [textValue, setTextValue] = useState(rawExpr);

  useEffect(() => setTextValue(rawExpr), [rawExpr, selectedExprCoords]);
  const dispatch = useDispatch();
  return (
    <div className="formula-bar-container">
      <input
        className="formula-bar"
        type="text"
        value={textValue}
        onChange={(e) => {
          setTextValue(e.target.value);
        }}
        onKeyPress={(e) => e.key === "Enter" && dispatch(editCell(textValue))}
      />
    </div>
  );
};

export default FormulaBar;
