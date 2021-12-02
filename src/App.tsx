import React, { useState } from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";
import ErrorBar from "./molecules/ErrorBar";
import Navigator from "./organisms/Navigator";

function App() {
  const [navigator, setNavigator] = useState("edit");
  const [monitor, setMonitor] = useState("");
  return (
    <div className="main-container">
      <Navigator navigator={navigator} setNavigator={setNavigator} />
      <FormulaBar />
      <div>{monitor}</div>
      <ErrorBar />
      <Sheet setMonitor={setMonitor}/>
    </div>
  );
}

export default App;
