import React from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";

function App() {
  return (
    <div className="main-container">
      <FormulaBar />
      <Sheet />
    </div>
  );
}

export default App;
