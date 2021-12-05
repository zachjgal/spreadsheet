import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DependencyTree } from "../../utilities/dependencyTree";
import { Compiler, Tokenizer } from "../../utilities/parser";
import { FormatOption } from "../../types";

export type SpreadSheetState = {
  dependencyTree: DependencyTree;
  expressions: Map<string, Expr>;
  rawExpressions: Map<string, string>;
  sheetData: SheetData;
  selectedExpression: Coords;
  errors: Map<string, Error>;
  formatSheetData: FormatSheetData;
};

const DEFAULT_WIDTH = 58;
const DEFAULT_HEIGHT = 58;

const initSheetData = (
  initWidth = DEFAULT_WIDTH,
  initHeight = DEFAULT_HEIGHT
) => {
  let newSheetData: SheetData = [];
  for (let i: number = 0; i < initHeight; i++) {
    newSheetData[i] = [];
    for (let j: number = 0; j < initWidth; j++) {
      newSheetData[i][j] = "";
    }
  }
  return newSheetData;
};

const defaultFormatData: FormatData = {
  font: "Open Sans",
  size: 15,
  bold: false,
  italic: false,
  color: "#000000",
};

const initSheetFormatData = (
  initWidth = DEFAULT_WIDTH,
  initHeight = DEFAULT_HEIGHT
) => {
  let newSheetData: FormatSheetData = [];
  for (let i = 0; i < initHeight; i++) {
    newSheetData[i] = [];
    for (let j = 0; j < initWidth; j++) {
      newSheetData[i][j] = { ...defaultFormatData };
    }
  }
  return newSheetData;
};

const initialState: SpreadSheetState = {
  dependencyTree: new DependencyTree(),
  expressions: new Map<string, Expr>(),
  rawExpressions: new Map<string, string>(),
  sheetData: initSheetData(),
  formatSheetData: initSheetFormatData(),
  selectedExpression: [0, 0],
  errors: new Map<string, Error>(),
};

type EditActionPayload = string;

const changeCell = (
  state: SpreadSheetState,
  cell: Coords,
  newValue: string
) => {
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
    let updateQueue: Array<string> = state.dependencyTree.topologicalSort(cell);
    for (let dependent of updateQueue) {
      evaluateCell(dependent.split(",").map((s) => Number(s)) as Coords);
    }
  };

  // track raw expr data
  state.rawExpressions.set(cell.toString(), newValue);
  try {
    if (isFormulaExpr(newValue)) {
      const deps = new Set<Coords>();
      const expr = new Compiler().compileWithDependencies(
        Tokenizer.tokenize(newValue.substr(isFormulaExpr(newValue) ? 1 : 0)),
        deps
      );
      state.expressions.set(cell.toString(), expr);
      state.dependencyTree.remove(cell);
      state.dependencyTree.addDependencies(cell, deps);
    } else {
      const [row, col] = cell;
      state.expressions.delete(cell.toString());
      state.dependencyTree.remove(cell);
      // try to convert non formula value into num, otherwise treat as str
      if (newValue === "" || isNaN(Number(newValue))) {
        state.sheetData[row][col] = newValue;
      } else {
        state.sheetData[row][col] = Number(newValue);
      }
    }
    updateCellAndChildren(cell);
    // todo reevaluate children to see if their errors can be removed as well.
    //  e.g. A1 is circular reference, set B1 = A1, should get error. But then
    //  if A1 is set to 1, the error on B1 should be removed automatically w/o
    //  having to hit enter to reevaluate B1
    if (state.errors.has(state.selectedExpression.toString())) {
      state.errors.delete(state.selectedExpression.toString());
    }
  } catch (err) {
    state.errors.set(state.selectedExpression.toString(), err as Error);
  }
};

export const sheetState = createSlice({
  name: "sheetdata",
  initialState,
  reducers: {
    setRawExpr: (state, action: PayloadAction<EditActionPayload>) => {
      const cell = state.selectedExpression;
      state.rawExpressions.set(cell.toString(), action.payload);
    },
    editCell: (state, action: PayloadAction<EditActionPayload>) => {
      const newValue = action.payload;
      const cell: Coords = state.selectedExpression;
      changeCell(state as SpreadSheetState, cell, newValue);
    },
    selectExpression: (state, action: PayloadAction<Coords>) => {
      const cell = state.selectedExpression;
      const rawExpr = state.rawExpressions.get(cell.toString()) ?? "";
      changeCell(state as SpreadSheetState, cell, rawExpr);

      state.selectedExpression = action.payload;
    },

    editFormatData: (state, action: PayloadAction<Partial<FormatData>>) => {
      const [row, col] = state.selectedExpression;
      state.formatSheetData[row][col] = {
        ...state.formatSheetData[row][col],
        ...action.payload,
      };
    },
  },
});

const { actions, reducer } = sheetState;
// Action creators are generated for each case reducer function
export const { selectExpression, editCell, editFormatData, setRawExpr } =
  actions;
export default reducer;
