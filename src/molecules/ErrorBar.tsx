import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import "./ErrorBar.css";

export type ErrorBarProps = {};

const ErrorBar: React.FC<ErrorBarProps> = () => {
  const error: string = useSelector((state: RootState) => {
    let err: Error | undefined = state.data.errors.get(
      state.data.selectedExpression.toString()
    );
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
