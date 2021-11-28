// the important spreadsheet data we wanna keep track of

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DependencyTree } from "../../utilities/dependencyTree";
import { Compiler, Tokenizer } from "../../utilities/parser";

export type SpreadSheetState = {
  dependencyTree: DependencyTree;
  expressions: Map<string, Expr>;
  rawExpressions: Map<string, string>;
  sheetData: SheetData;
  selectedExpression: Coords;
  errorLog: string;
};

// todo use Array type, not array` literal
const initSheetData = (initWidth = 58, initHeight = 58) => {
  let newSheetData: SheetData = [];
  for (let i: number = 0; i < initHeight; i++) {
    newSheetData[i] = [];
    for (let j: number = 0; j < initWidth; j++) {
      newSheetData[i][j] = "";
    }
  }
  return newSheetData;
};

const initialState: SpreadSheetState = {
  dependencyTree: new DependencyTree(),
  expressions: new Map<string, Expr>(),
  rawExpressions: new Map<string, string>(),
  sheetData: initSheetData(),
  selectedExpression: [0, 0],
  errorLog: "",
};

type EditActionPayload = string;

export const sheetState = createSlice({
  name: "sheetdata",
  initialState,
  reducers: {
    editCell: (state, action: PayloadAction<EditActionPayload>) => {
      const newValue = action.payload;

      const cell: Coords = state.selectedExpression;
      // const [row, col] = cell;

      const isFormulaExpr = (exprString: string) => {
        return exprString.startsWith("=");
      };

      const evaluateCell = (cell: Coords) => {
        const [row, col] = cell;
        if (!state.expressions.has(cell.toString())) {
          return;
        }
        let expr = state.expressions.get(cell.toString());
        if (!expr) {
          return;
        }
        state.sheetData[row][col] = expr.execute(state.sheetData);
      };

      const updateCellAndChildren = (cell: Coords) => {
        evaluateCell(cell);
        let updateQueue: Array<string> =
          state.dependencyTree.topologicalSort(cell);
        for (let dependent of updateQueue) {
          evaluateCell(dependent.split(",").map((s) => Number(s)) as Coords);
        }
      };
      // todo this can be simplified massively
      // if (isFormulaExpr(newValue)) {

      // track raw expr data
      state.rawExpressions.set(cell.toString(), newValue);
      // console.log(`NEW RAW EXPR: ${state.rawExpressions.get(cell)}`);
      const deps = new Set<Coords>();
      const expr = new Compiler().compileWithDependencies(
        Tokenizer.tokenize(newValue.substr(isFormulaExpr(newValue) ? 1 : 0)),
        deps
      );
      console.log("Edit: ", cell.toString(), expr);
      console.log("Deps: ", state.dependencyTree.toString());
      state.expressions.set(cell.toString(), expr);
      state.dependencyTree.remove(cell);
      state.dependencyTree.addDependencies(cell, deps);
      updateCellAndChildren(cell);
      // let val = expr.execute(state.sheetData);

      // }

      // } else {
      //   state.expressions.delete(cell);
      //   state.dependencyTree.remove(cell);
      //   // try to convert non formula value into num, otherwise treat as str
      //   if (isNaN(Number(newValue))) {
      //     state.sheetData[row][col] = newValue;
      //     state.expressions.set([row, col], new )
      //   } else {
      //     state.sheetData[row][col] = Number(newValue);
      //   }
      // }
      // if (state.dependencyTree.hasCell(cell)) {
      //   updateCellAndChildren(cell);
      // }
    },
    selectExpression: (state, action: PayloadAction<Coords>) => {
      state.selectedExpression = action.payload;
    },
    setErrorLog: (state, action: PayloadAction<string>) => {
      state.errorLog = action.payload;
    },
  },
});

const { actions, reducer } = sheetState;
// Action creators are generated for each case reducer function
export const { selectExpression, editCell, setErrorLog } = actions;
export default reducer;
