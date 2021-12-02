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

  return (
    <div className="error-container">
     
        {error}
     
    </div>
  );
};

export default ErrorBar;
