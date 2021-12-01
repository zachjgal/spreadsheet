import React, { useState } from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";
import ErrorBar from "./molecules/ErrorBar";
import Navigator from "./organisms/Navigator";

function App() {
  const [navigator, setNavigator] = useState("edit");
  return (
    <div className="main-container">
      <Navigator navigator={navigator} setNavigator={setNavigator} />
      <FormulaBar />
      <ErrorBar />
      <Sheet />
    </div>
  );
}

export default App;
