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

const DEFAULT_WIDTH = 59;
const DEFAULT_HEIGHT = 59;

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
      
      console.log(`${cell[0]}:${cell[1]}`);
      console.log(state.rawExpressions.get(cell.toString()));

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

      console.log(`${cell[0]}:${cell[1]}`);
      console.log(state.rawExpressions.get(cell.toString()));
    },

    editFormatData: (state, action: PayloadAction<Partial<FormatData>>) => {
      const [row, col] = state.selectedExpression;
      state.formatSheetData[row][col] = {
        ...state.formatSheetData[row][col],
        ...action.payload,
      };
    },

    addRowBelow: (state) => {
      debugger
      console.log("Add Row Below");
      //update the SheetData
      const cell: Coords = state.selectedExpression;
      let newRow: CellValue[] = new Array(state.sheetData.length).fill("");
      let fontData: FormatData = {
        font: "Open Sans",
        size: 15,
        bold: false,
        italic: false,
        color: "#000000",
      };

      let newFontRow = new Array(state.sheetData.length).fill(fontData);
      let x_pos = cell[0];
      state.sheetData.splice(x_pos + 1, 0, newRow);
      state.formatSheetData.splice(x_pos + 1, 0, newFontRow);

      //get the list of outdated coords in the sheet
      let outdatedCoords: Coords[] = [];
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = key.split(",").map(Number)[0];
        const y = key.split(",").map(Number)[1];
        console.log(`key : ${key}`);
        if (x > x_pos) {
          let c: Coords = [x, y];
          outdatedCoords.push(c);
        }
      });

      //update the Maps
      for (let x = 0; x < outdatedCoords.length; x++) {
        let updatedCoord: Coords = [
          outdatedCoords[x][0] + 1,
          outdatedCoords[x][1],
        ];

        console.log(`outdatedCoords[x] : ${outdatedCoords[x]}`);
        console.log(
          `state.rawExpressions.get(outdatedCoords[x].toString())  : ${state.rawExpressions.get(
            outdatedCoords[x].toString()
          )}`
        );
        console.log(`updatedCoord.toString() : ${updatedCoord.toString()}`);
        //update the RawExpression Map
        let rawValue: string =
          state.rawExpressions.get(outdatedCoords[x].toString()) || "";
        let deleted = state.rawExpressions.delete(outdatedCoords[x].toString());
        console.log(deleted);
        state.rawExpressions.set(updatedCoord.toString(), rawValue);

        //update the expression Map
        let expValue: Expr = state.expressions.get(
          outdatedCoords[x].toString()
        )!;
        state.expressions.delete(outdatedCoords[x].toString());
        state.expressions.set(updatedCoord.toString(), expValue);

        //update the dependency Tree
        let deps: Set<string> = state.dependencyTree
          .getGraph()
          .get(outdatedCoords[x].toString())!;
        let temp: Set<Coords> = new Set<Coords>();
        console.log(deps);
        if (deps != undefined) {
          var iterator = deps.values();

          for (let i = 0; i < deps.size; i++) {
            let coord = iterator.next().value;
            const x = coord.split(",").map(Number)[0];
            const y = coord.split(",").map(Number)[1];
            if (x > cell[0]) {
              const c: Coords = [x + 1, y];
              temp.add(c);
            } else {
              const c: Coords = [x, y];
              temp.add(c);
            }
          }
          state.dependencyTree.remove(outdatedCoords[x]);
          state.dependencyTree.addDependencies(updatedCoord, temp);
        }
      }
    },

    addRowAbove: (state) => {
      console.log("Add Row Above");
      const cell: Coords = state.selectedExpression;

      //update the SheetData
      let newRow = new Array(state.sheetData.length).fill("");
      let fontData: FormatData = {
        font: "Open Sans",
        size: 15,
        bold: false,
        italic: false,
        color: "#000000",
      };
      let newFontRow = new Array(state.sheetData.length).fill(fontData);
      let x_pos = cell[0];
      state.sheetData.splice(x_pos, 0, newRow);
      state.formatSheetData.splice(x_pos, 0, newFontRow);

      //get the list of outdated coords in the sheet
      let outdatedCoords: Coords[] = [];
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0];
        const y = value.split(",").map(Number)[1];
        if (x >= x_pos) {
          let c: Coords = [x, y];
          outdatedCoords.push(c);
        }
      });

      //update the Maps
      for (let x = 0; x < outdatedCoords.length; x++) {
        const updatedCoord: Coords = [
          outdatedCoords[x][0] + 1,
          outdatedCoords[x][1],
        ];

        //update the RawExpression Map
        let rawValue: string =
          state.rawExpressions.get(outdatedCoords[x].toString()) || "";
        state.rawExpressions.delete(outdatedCoords[x].toString());
        state.rawExpressions.set(updatedCoord.toString(), rawValue);

        //update the expression Map
        let expValue: Expr = state.expressions.get(
          outdatedCoords[x].toString()
        )!;
        state.expressions.delete(outdatedCoords[x].toString());
        state.expressions.set(updatedCoord.toString(), expValue);

        //update the dependency Tree
        let deps: Set<string> = state.dependencyTree
          .getGraph()
          .get(outdatedCoords[x].toString())!;
        let temp: Set<Coords> = new Set<Coords>();
        if (deps != undefined) {
          var iterator = deps.values();

          for (let i = 0; i < deps.size; i++) {
            let coord = iterator.next().value;
            const x = coord.split(",").map(Number)[0];
            const y = coord.split(",").map(Number)[1];
            if (x > cell[0] - 1) {
              const c: Coords = [x + 1, y];
              temp.add(c);
            } else {
              const c: Coords = [x, y];
              temp.add(c);
            }
          }
          state.dependencyTree.remove(outdatedCoords[x]);
          state.dependencyTree.addDependencies(updatedCoord, temp);
        }
      }
    },

    addColumnRight: (state) => {
      console.log("Add Column Left");
      const cell: Coords = state.selectedExpression;
      let fontData: FormatData = {
        font: "Open Sans",
        size: 15,
        bold: false,
        italic: false,
        color: "#000000",
      };
      //Create new SheetData with extra column
      let y_pos = cell[1];
      for (let x = 0; x < state.sheetData.length; x++) {
        state.sheetData[x].splice(y_pos + 1, 0, "");
        state.formatSheetData[x].splice(y_pos + 1, 0, fontData);
      }

      //get the list of outdated coords in the sheet
      let outdatedCoords: Coords[] = [];
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0];
        const y = value.split(",").map(Number)[1];
        if (y > y_pos) {
          let c: Coords = [x, y];
          outdatedCoords.push(c);
        }
      });

      //update the Maps
      for (let x = 0; x < outdatedCoords.length; x++) {
        const updatedCoord: Coords = [
          outdatedCoords[x][0],
          outdatedCoords[x][1] + 1,
        ];

        //update the RawExpression Map
        let rawValue: string =
          state.rawExpressions.get(outdatedCoords[x].toString()) || "";
        state.rawExpressions.delete(outdatedCoords[x].toString());
        state.rawExpressions.set(updatedCoord.toString(), rawValue);

        //update the expression Map
        let expValue: Expr = state.expressions.get(
          outdatedCoords[x].toString()
        )!;
        state.expressions.delete(outdatedCoords[x].toString());
        state.expressions.set(updatedCoord.toString(), expValue);

        //update the dependency Tree
        let deps: Set<string> = state.dependencyTree
          .getGraph()
          .get(outdatedCoords[x].toString())!;
        let temp: Set<Coords> = new Set<Coords>();
        console.log(deps);
        if (deps != undefined) {
          var iterator = deps.values();

          for (let i = 0; i < deps.size; i++) {
            let coord = iterator.next().value;
            const x = coord.split(",").map(Number)[0];
            const y = coord.split(",").map(Number)[1];
            if (y > cell[1]) {
              const c: Coords = [x, y + 1];
              temp.add(c);
            } else {
              const c: Coords = [x, y];
              temp.add(c);
            }
          }
          state.dependencyTree.remove(outdatedCoords[x]);
          state.dependencyTree.addDependencies(updatedCoord, temp);
        }
      }
    },

    addColumnLeft: (state) => {
      console.log("Add Column Left");
      const cell: Coords = state.selectedExpression;
      let fontData: FormatData = {
        font: "Open Sans",
        size: 15,
        bold: false,
        italic: false,
        color: "#000000",
      };
      //Create new SheetData and fontSheetData with extra column
      let y_pos = cell[1];

      for (let x = 0; x < state.sheetData.length; x++) {
        state.sheetData[x].splice(y_pos - 1, 0, "");
        state.formatSheetData[x].splice(y_pos - 1, 0, fontData);
      }

      //get the list of outdated coords in the sheet
      let outdatedCoords: Coords[] = [];
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0];
        const y = value.split(",").map(Number)[1];
        if (y >= y_pos) {
          let c: Coords = [x, y];
          outdatedCoords.push(c);
        }
      });

      //update the Maps
      for (let x = 0; x < outdatedCoords.length; x++) {
        const updatedCoord: Coords = [
          outdatedCoords[x][0],
          outdatedCoords[x][1] + 1,
        ];

        //update the RawExpression Map
        let rawValue: string =
          state.rawExpressions.get(outdatedCoords[x].toString()) || "";
        state.rawExpressions.delete(outdatedCoords[x].toString());
        state.rawExpressions.set(updatedCoord.toString(), rawValue);

        //update the expression Map
        let expValue: Expr = state.expressions.get(
          outdatedCoords[x].toString()
        )!;
        state.expressions.delete(outdatedCoords[x].toString());
        state.expressions.set(updatedCoord.toString(), expValue);

        //update the dependency Tree
        let deps: Set<string> = state.dependencyTree
          .getGraph()
          .get(outdatedCoords[x].toString())!;
        let temp: Set<Coords> = new Set<Coords>();
        console.log(deps);
        if (deps != undefined) {
          var iterator = deps.values();

          for (let i = 0; i < deps.size; i++) {
            let coord = iterator.next().value;
            const x = coord.split(",").map(Number)[0];
            const y = coord.split(",").map(Number)[1];
            if (y >= cell[1]) {
              const c: Coords = [x, y + 1];
              temp.add(c);
            } else {
              const c: Coords = [x, y];
              temp.add(c);
            }
          }
          state.dependencyTree.remove(outdatedCoords[x]);
          state.dependencyTree.addDependencies(updatedCoord, temp);
        }
      }
    },

    deleteRow: (state) => {
      console.log("Delete Row");
      const cell: Coords = state.selectedExpression;
      let x_pos = cell[0];

      //remove rawExpressions for deleted row, also delete dependencies in the same row
      state.rawExpressions.forEach((value: string, key: string) => {
        console.log(key, value);
        const x = key.split(",").map(Number)[0];
        const y = key.split(",").map(Number)[1];
        if (x == x_pos) {
          state.rawExpressions.delete(key);
        }
        let coord: Coords = [x, y];
        state.dependencyTree.remove(coord);
      });

      state.expressions.forEach((value: Expr, key: string) => {
        console.log(key, value);
        const x = key.split(",").map(Number)[0];
        if (x == x_pos) {
          state.rawExpressions.delete(key);
        }
      });

      //update the dependency Tree
      let graph = state.dependencyTree.getGraph();
      graph.forEach((value: Set<string>, key: string) => {
        value.forEach((coord: string) => {
          const x = coord.split(",").map(Number)[0];
          if (x == x_pos) {
            value.delete(coord);
          }
        });
      });
      state.sheetData.splice(x_pos, 1);
      state.formatSheetData.splice(x_pos, 1);
    },

    deleteColumn: (state) => {
      console.log("Delete Column");
      const cell: Coords = state.selectedExpression;
      let y_pos = cell[1];

      //remove rawExpressions for deleted row, also delete dependencies in the same row
      state.rawExpressions.forEach((value: string, key: string) => {
        console.log(key, value);
        const x = key.split(",").map(Number)[0];
        const y = key.split(",").map(Number)[1];
        if (y == y_pos) {
          state.rawExpressions.delete(key);
        }
        let coord: Coords = [x, y];
        state.dependencyTree.remove(coord);
      });

      state.expressions.forEach((value: Expr, key: string) => {
        console.log(key, value);
        const y = key.split(",").map(Number)[1];
        if (y == y_pos) {
          state.rawExpressions.delete(key);
        }
      });

      //update the dependency Tree
      let graph = state.dependencyTree.getGraph();
      graph.forEach((value: Set<string>, key: string) => {
        value.forEach((coord: string) => {
          const y = coord.split(",").map(Number)[1];
          if (y == y_pos) {
            value.delete(coord);
          }
        });
      });
      for (let x = 0; x < state.sheetData.length; x++) {
        state.sheetData[x].splice(y_pos, 1);
        state.formatSheetData[x].splice(y_pos, 1);
      }
    },
  },
});

const { actions, reducer } = sheetState;
// Action creators are generated for each case reducer function
export const {
  selectExpression,
  editCell,
  editFormatData,
  setRawExpr,
  addRowAbove,
  addRowBelow,
  addColumnLeft,
  addColumnRight,
  deleteRow,
  deleteColumn,
} = actions;
export default reducer;
