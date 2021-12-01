import React from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";
import ErrorBar from "./molecules/ErrorBar";

function App() {
  return (
    <div className="main-container">
      <FormulaBar />
      <ErrorBar />
      <Sheet />
    </div>
  );
}

export default App;
