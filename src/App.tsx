import React, { useState } from "react";
import Sheet from "./organisms/Sheet";
import FormulaBar from "./molecules/FormulaBar";
import ErrorBar from "./molecules/ErrorBar";
import Navigator from "./organisms/Navigator";
import "./App.css";

function App() {
  const [navigator, setNavigator] = useState("edit");
  const [monitor, setMonitor] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  return (
    <div className="main-container">
      <Navigator navigator={navigator} setNavigator={setNavigator} x={x} y={y}/>
      <FormulaBar />
      <div className="sheet-monitor">{monitor}</div>
      <ErrorBar />
      <Sheet setMonitor={setMonitor} setX={setX} setY={setY} />
    </div>
  );
}

export default App;
