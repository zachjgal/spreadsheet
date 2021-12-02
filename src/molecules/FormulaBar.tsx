const Hey = () => {
  return <></>;
};
export default Hey;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../redux/store";
// import { editCell, setCurrentFormulaInput } from "../redux/features/sheetState";
//
// import "./FormulaBar.css";
//
// export type FormulaBarProps = {};
//
// const FormulaBar: React.FC<FormulaBarProps> = () => {
//   const rawExpr: string = useSelector(
//     (state: RootState) =>
//       state.data.rawExpressions.get(state.data.selectedExpression.toString()) ??
//       ""
//   );
//   // const selectedExprCoords = useSelector(
//   //   (state: RootState) => state.data.selectedExpression
//   // );
//   // const [textValue, setTextValue] = useState(rawExpr);
//   const dispatch = useDispatch();
//   useEffect(() => {
//     dispatch(setCurrentFormulaInput(rawExpr));
//   }, [rawExpr, dispatch]);
//
//   const currentValue = useSelector(
//     (state: RootState) => state.data.currentFormulaInput
//   );
//
//   return (
//     <div className="formula-bar-container">
//       <input
//         className="formula-bar"
//         type="text"
//         value={currentValue}
//         onChange={(e) => {
//           dispatch(setCurrentFormulaInput(e.target.value));
//         }}
//         onKeyPress={(e) =>
//           e.key === "Enter" && dispatch(editCell(currentValue))
//         }
//       />
//     </div>
//   );
// };
//
// export default FormulaBar;
