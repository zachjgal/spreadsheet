import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import "./ErrorBar.css";
import { getCellDataDefaultValue } from "../redux/features/sheetState";

export type ErrorBarProps = {};

const ErrorBar: React.FC<ErrorBarProps> = () => {
  const error: string = useSelector((state: RootState) => {
    const selectedExpression = state.data.selectedExpression;
    let err: Error | undefined = getCellDataDefaultValue(
      state.data,
      selectedExpression
    ).error;
    return err === undefined
      ? ""
      : `${(err as Error).name}: ${(err as Error).message}`;
  });

  return !error ? (
    <div className="error-container-empty" />
  ) : (
    <div className="error-container">
      <div className="error-bar">{error}</div>
    </div>
  );
};

export default ErrorBar;
