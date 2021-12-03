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
  errors: Map<string, Error>;
  currentFormulaInput: string;
  fontSheetData: FontSheetData;
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

const initSheetFontData = (initWidth = 58, initHeight = 58) => {
  let newSheetData: FontSheetData = [];
  for (let i: number = 0; i < initHeight; i++) {
    newSheetData[i] = [];
    for (let j: number = 0; j < initWidth; j++) {
      let fontData: FontData = {
        font: "string",
        size: 10,
        bold: false,
        italic: false,
      };
      newSheetData[i][j] = fontData;
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
  errors: new Map<string, Error>(),
  currentFormulaInput: "",
  fontSheetData: initSheetFontData(),
};

type EditActionPayload = string;

export const sheetState = createSlice({
  name: "sheetdata",
  initialState,
  reducers: {
    editCell: (state, action: PayloadAction<EditActionPayload>) => {
      const newValue = action.payload;

      const cell: Coords = state.selectedExpression;

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

      // track raw expr data
      state.rawExpressions.set(cell.toString(), newValue);
      try {
        if (isFormulaExpr(newValue)) {
          const deps = new Set<Coords>();
          const expr = new Compiler().compileWithDependencies(
            Tokenizer.tokenize(
              newValue.substr(isFormulaExpr(newValue) ? 1 : 0)
            ),
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
        if (state.errors.has(state.selectedExpression.toString())) {
          state.errors.delete(state.selectedExpression.toString());
        }
      } catch (err) {
        state.errors.set(state.selectedExpression.toString(), err as Error);
      }
    },

    selectExpression: (state, action: PayloadAction<Coords>) => {
      state.selectedExpression = action.payload;
    },

    getFontData: (state, action: PayloadAction<Coords>) => {
      
      //To do, pass in the cell and get the font data associated with the cell
      let x = action.payload[0];
      let y = action.payload[1];
      let fontData: FontData = {
        font: state.fontSheetData[x][y].font,
        size: state.fontSheetData[x][y].size,
        bold: state.fontSheetData[x][y].bold,
        italic: state.fontSheetData[x][y].italic,
      };
      console.log(x)
      console.log(y)
      console.log(fontData);
    },

    editFontData: (state, action: PayloadAction<FontInput>) => {
      //To do, pass in the cell and get the font data associated with the cell
      console.log("I am here")
      let x = action.payload.coords[0];
      let y = action.payload.coords[1];
      state.fontSheetData[x][y].font = action.payload.data.font;
      state.fontSheetData[x][y].size = action.payload.data.size;
      state.fontSheetData[x][y].bold = action.payload.data.bold;
      state.fontSheetData[x][y].italic = action.payload.data.italic;
    },

    // setCurrentFormulaInput: (state, action: PayloadAction<string>) => {
    //   state.currentFormulaInput = action.payload;
    // },
  },
});

const { actions, reducer } = sheetState;
// Action creators are generated for each case reducer function
export const { selectExpression, editCell, getFontData, editFontData } = actions;
export default reducer;
