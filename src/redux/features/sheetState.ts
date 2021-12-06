import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DependencyTree } from "../../utilities/dependencyTree";
import { Compiler, Tokenizer } from "../../utilities/parser";
import { FormatOption } from "../../types";
import { RootState } from "../store";

export const coordKeyAsCoords = (coordKey: string): Coords => {
  const coordTokens = coordKey.split(",");
  if (coordTokens.length !== 2) {
    throw Error("Coords contain only 2 numbers");
  }
  return coordTokens.map((coord) => Number(coord)) as Coords;
};

export type SpreadSheetState = {
  dependencyTree: DependencyTree;
  selectedExpression: Coords;
  cellDataMap: CellDataMap;
  height: number;
  width: number;
};

const DEFAULT_WIDTH = 59;
const DEFAULT_HEIGHT = 59;

const defaultFormatData: FormatData = {
  font: "Open Sans",
  size: 15,
  bold: false,
  italic: false,
  color: "#000000",
};

export const initCell = (): CellData => {
  return {
    rawExpression: "",
    formatData: { ...defaultFormatData },
    value: "",
  };
};

const initialState: SpreadSheetState = {
  dependencyTree: new DependencyTree(),
  selectedExpression: [0, 0],
  cellDataMap: {},
  height: DEFAULT_HEIGHT,
  width: DEFAULT_WIDTH,
};

type EditActionPayload = string;

const getCellDataAndFillDefault = (
  state: SpreadSheetState,
  coords: Coords
): CellData => {
  const coordKey = coords.toString();
  const [row, col] = coords;
  if (row + 1 > state.width) {
    state.width = row + 1;
  }
  if (col + 1 > state.height) {
    state.height = col + 1;
  }
  if (!state.cellDataMap.hasOwnProperty(coordKey)) {
    state.cellDataMap[coordKey] = initCell();
  }
  return state.cellDataMap[coordKey];
};

export const getCellDataDefaultValue = (
  state: SpreadSheetState,
  coords: Coords
): CellData => {
  const coordKey = coords.toString();
  return !state.cellDataMap.hasOwnProperty(coordKey)
    ? initCell()
    : state.cellDataMap[coordKey];
};

const collectSheetValues = (state: SpreadSheetState): SheetData => {
  let sheetValues: SheetData = [];
  for (let i = 0; i < state.height; i++) {
    sheetValues[i] = [];
    for (let j = 0; j < state.width; j++) {
      sheetValues[i][j] = getCellDataDefaultValue(state, [i, j]).value;
    }
  }
  return sheetValues;
};

const editCellCoordKey = (coordKey: string, dRow: number, dCol: number) => {
  let [row, col] = coordKeyAsCoords(coordKey);
  return [row + dRow, col + dCol].toString();
};

// i'm sorry
const addCol = (state: SpreadSheetState, after: boolean): void => {
  const shouldMove = (cell: Coords): boolean =>
    cell[1] >
    (after ? state.selectedExpression[1] : state.selectedExpression[1] - 1);

  let cellsToMove: string[] = Object.keys(state.cellDataMap).filter(
    (coordKey) => shouldMove(coordKeyAsCoords(coordKey))
  );
  // move cells starting from right
  // todo make sure this does descending order
  cellsToMove.sort(
    (coordKey1, coordKey2) =>
      coordKeyAsCoords(coordKey2)[1] - coordKeyAsCoords(coordKey1)[1]
  );
  console.log("CELLS TO MOVE", JSON.stringify(cellsToMove));
  // remap cell data and dependencies. because we've sorted the
  // transformations from right to left, we won't overwrite any data
  for (let start of cellsToMove) {
    const end = editCellCoordKey(start, 0, 1);
    console.log(start, end);
    const cellData = state.cellDataMap[start];
    delete state.cellDataMap[start];
    state.cellDataMap[end] = cellData;
    // adjust the expressions that depend on this cell
    if (!state.dependencyTree.getGraph().has(start)) {
      continue;
    }

    state.dependencyTree.remapNodeCoordinates(
      coordKeyAsCoords(start),
      coordKeyAsCoords(end)
    );

    const dependentCells = state.dependencyTree.getGraph().get(end);
    const cellDependents =
      dependentCells === undefined ? [] : Array.from(dependentCells.values());
    console.log("DEPENDENTS POST", cellDependents);
    for (const dependentCoord of cellDependents) {
      console.log(`Changing ${start} -> ${end} for ${dependentCoord}`);
      const dependentCellData = state.cellDataMap[dependentCoord];
      if (dependentCellData?.compiledExpression === undefined) {
        continue;
      }
      // edit raw string based on serialized edited expression data
      changeCell(
        state,
        coordKeyAsCoords(dependentCoord),
        `=${dependentCellData?.compiledExpression
          .editCellRef(start, end)
          .serialize()}`
      );
    }
  }
};

// const replaceCellRef = (raw: string, start: string, end: string) => {
//   // must start w/ =
//   if (!raw.startsWith("=")) {
//     throw new Error(
//       "Unexpectedly trying to replace cell ref for cell w/ no expression"
//     );
//   }
//   // // if preceded by odd number of quotes, we're inside a string
//   // let inString: boolean = false;
//   // // if preceded by #, the cell ref is a constant, so don't change it
//   // let inConstant: boolean = false;
//   // let newRawExpr = "";
//   // let cellRefBuffer = "";
//   // for (let c of raw) {
//   //   let strToAdd: string = c;
//   //   if (c === '"') {
//   //     inString = !inString;
//   //   }
//   //   if (c === "#") {
//   //     inConstant = true;
//   //   }
//   //   if (c === " " && inConstant) {
//   //     inConstant = false;
//   //   }
//   }
// };

const changeCell = (
  state: SpreadSheetState,
  cell: Coords,
  newValue: string
) => {
  const isFormulaExpr = (exprString: string) => {
    return exprString.startsWith("=");
  };

  const evaluateCell = (cell: Coords) => {
    const cellData = getCellDataAndFillDefault(state, cell);

    if (!cellData.hasOwnProperty("compiledExpression")) {
      return;
    }
    // wHaT iF tHe VaLuE iS uNdEfInEd
    cellData.value = (cellData.compiledExpression as Expr).execute(
      collectSheetValues(state)
    );
  };

  const updateCellAndChildren = (cell: Coords) => {
    evaluateCell(cell);
    let updateQueue: Array<string> = state.dependencyTree.topologicalSort(cell);
    for (let dependent of updateQueue) {
      evaluateCell(dependent.split(",").map((s) => Number(s)) as Coords);
    }
  };

  const cellData = getCellDataAndFillDefault(state, cell);

  try {
    if (isFormulaExpr(newValue)) {
      const deps = new Set<Coords>();
      cellData.compiledExpression = new Compiler().compileWithDependencies(
        Tokenizer.tokenize(newValue.substr(isFormulaExpr(newValue) ? 1 : 0)),
        deps
      );
      cellData.rawExpression = `=${cellData.compiledExpression.serialize()}`; // autoformat user input
      state.dependencyTree.remove(cell);
      state.dependencyTree.addDependencies(cell, deps);
    } else {
      cellData.rawExpression = newValue;
      delete cellData.compiledExpression;
      state.dependencyTree.remove(cell);
      // try to convert non formula value into num, otherwise treat as str
      cellData.value =
        newValue === "" || isNaN(Number(newValue))
          ? newValue
          : Number(newValue);
    }
    updateCellAndChildren(cell);
    // todo reevaluate children to see if their errors can be removed as well.
    //  e.g. A1 is circular reference, set B1 = A1, should get error. But then
    //  if A1 is set to 1, the error on B1 should be removed automatically w/o
    //  having to hit enter to reevaluate B1
    if (cellData.hasOwnProperty("error")) {
      delete cellData.error;
    }
  } catch (err) {
    cellData.error = err as Error;
  }
};

export const sheetState = createSlice({
  name: "sheetdata",
  initialState,
  reducers: {
    setRawExpr: (state, action: PayloadAction<EditActionPayload>) => {
      const coords = state.selectedExpression;
      const cellData = getCellDataAndFillDefault(
        state as SpreadSheetState,
        coords
      );
      cellData.rawExpression = action.payload;
    },
    editCell: (state, action: PayloadAction<EditActionPayload>) => {
      const newValue = action.payload;
      const cell: Coords = state.selectedExpression;
      changeCell(state as SpreadSheetState, cell, newValue);
    },
    selectExpression: (state, action: PayloadAction<Coords>) => {
      const coords = state.selectedExpression;
      const rawExpr = getCellDataAndFillDefault(
        state as SpreadSheetState,
        coords
      ).rawExpression;
      changeCell(state as SpreadSheetState, coords, rawExpr);

      state.selectedExpression = action.payload;
    },

    editFormatData: (state, action: PayloadAction<Partial<FormatData>>) => {
      const coords = state.selectedExpression;
      const cellData = getCellDataAndFillDefault(
        state as SpreadSheetState,
        coords
      );
      cellData.formatData = {
        ...cellData.formatData,
        ...action.payload,
      };
    },

    addColumn: (state, action: PayloadAction<boolean>) => {
      addCol(state as SpreadSheetState, action.payload);
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
  addColumn,
  // addRowAbove,
  // addRowBelow,
  // addColumnLeft,
  // addColumnRight,
  // deleteRow,
  // deleteColumn,
} = actions;
export default reducer;
