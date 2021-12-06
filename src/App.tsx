import React, { useState } from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";
import ErrorBar from "./molecules/ErrorBar";
import Navigator from "./organisms/Navigator";
import "./App.css";

function App() {
  return (
    <div className="main-container">
      <Navigator />
      <ErrorBar />
      <FormulaBar />
      {/*<div className="sheet-monitor">{monitor}</div>*/}
      <Sheet />
    </div>
  );
}

export default App;
