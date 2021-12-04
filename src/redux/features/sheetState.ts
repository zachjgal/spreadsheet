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
        font: "Open Sans",
        size: 15,
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
  fontSheetData: initSheetFontData(),
  selectedExpression: [0, 0],
  errors: new Map<string, Error>(),
  currentFormulaInput: "",
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
    },


    addRowBelow: (state) => {
      console.log("Add Row Below")
      //update the SheetData
      const cell: Coords = state.selectedExpression;
      let newRow = new Array(state.sheetData.length).fill("")
      let fontData: FontData = {font: "Open Sans", size: 15, bold: false, italic: false,};
      let newFontRow = new Array(state.sheetData.length).fill(fontData)
      let x_pos = cell[0]
      state.sheetData.splice(x_pos+1, 0, newRow);
      state.fontSheetData.splice(x_pos+1,0, newFontRow);
      

      //get the list of outdated coords in the sheet
      let outdatedCoords:Coords[] = []
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0]
        const y= value.split(",").map(Number)[1]
        if (x > x_pos) {
          let c:Coords = [x,y]
          outdatedCoords.push(c)
        }
      });
      
      //update the Maps
      for (let x =0; x< outdatedCoords.length;x++){
        let updatedCoord:Coords = [outdatedCoords[x][0]+1, outdatedCoords[x][1]]

        //update the RawExpression Map
        let rawValue:string = state.rawExpressions.get(outdatedCoords[x].toString()) || ""
        state.rawExpressions.delete(outdatedCoords[x].toString())
        state.rawExpressions.set(updatedCoord.toString(),rawValue)

        //update the expression Map
        let expValue:Expr = state.expressions.get(outdatedCoords[x].toString())!;
        state.expressions.delete(outdatedCoords[x].toString())
        state.expressions.set(updatedCoord.toString(),expValue)
      
        //update the dependency Tree
        let deps:Set<string> = state.dependencyTree.getGraph().get(outdatedCoords[x].toString())!;
        let temp:Set<Coords> = new Set<Coords>();
        console.log(deps)
        if (deps!= undefined){
          var iterator = deps.values();

          for(let i = 0; i<deps.size; i++ ){
            let coord = iterator.next().value
            const x = coord.split(",").map(Number)[0]
            const y= coord.split(",").map(Number)[1]
            if (x> cell[0]) {
              const c:Coords = [x+1,y]
              temp.add(c)
            }
            else{
              const c:Coords = [x,y]
              temp.add(c)
            }
          }
          state.dependencyTree.remove(outdatedCoords[x])
          state.dependencyTree.addDependencies(updatedCoord, temp)
        }
      }



    },

    addRowAbove: (state) => {
      console.log("Add Row Above")
      const cell: Coords = state.selectedExpression;

      //update the SheetData
      let newRow = new Array(state.sheetData.length).fill("")
      let fontData: FontData = {font: "Open Sans", size: 15, bold: false, italic: false,};
      let newFontRow = new Array(state.sheetData.length).fill(fontData)
      let x_pos = cell[0]
      state.sheetData.splice(x_pos, 0, newRow);
      state.fontSheetData.splice(x_pos,0, newFontRow);

      //get the list of outdated coords in the sheet
      let outdatedCoords:Coords[] = []
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0]
        const y= value.split(",").map(Number)[1]
        if (x > x_pos-1) {
          let c:Coords = [x,y]
          outdatedCoords.push(c)
        }
      });
      
      //update the Maps
      for (let x =0; x< outdatedCoords.length;x++){
        const updatedCoord:Coords = [outdatedCoords[x][0]+1, outdatedCoords[x][1]]

        //update the RawExpression Map
        let rawValue:string = state.rawExpressions.get(outdatedCoords[x].toString()) || ""
        state.rawExpressions.delete(outdatedCoords[x].toString())
        state.rawExpressions.set(updatedCoord.toString(),rawValue)

        //update the expression Map
        let expValue:Expr = state.expressions.get(outdatedCoords[x].toString())!;
        state.expressions.delete(outdatedCoords[x].toString())
        state.expressions.set(updatedCoord.toString(),expValue)
      
        //update the dependency Tree
        let deps:Set<string> = state.dependencyTree.getGraph().get(outdatedCoords[x].toString())!;
        let temp:Set<Coords> = new Set<Coords>();
        console.log(deps)
        if (deps!= undefined){
          var iterator = deps.values();

          for(let i = 0; i<deps.size; i++ ){
            let coord = iterator.next().value
            const x = coord.split(",").map(Number)[0]
            const y= coord.split(",").map(Number)[1]
            if (x> cell[0]-1) {
              const c:Coords = [x+1,y]
              temp.add(c)
            }
            else{
              const c:Coords = [x,y]
              temp.add(c)
            }
          }
          state.dependencyTree.remove(outdatedCoords[x])
          state.dependencyTree.addDependencies(updatedCoord, temp)
        }
      }

    },

    addColumnRight: (state) => {
      console.log("Add Column Left")
      const cell: Coords = state.selectedExpression;
      let fontData: FontData = {font: "Open Sans", size: 15, bold: false, italic: false,};
      //Create new SheetData with extra column
      let y_pos = cell[1]
      for(let x =0; x< state.sheetData.length;x++){
        state.sheetData[x].splice(y_pos+1, 0, "");
        state.fontSheetData[x].splice(y_pos+1,0,fontData)
      } 


      //get the list of outdated coords in the sheet
      let outdatedCoords:Coords[] = []
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0]
        const y= value.split(",").map(Number)[1]
        if (y > y_pos) {
          let c:Coords = [x,y]
          outdatedCoords.push(c)
        }
      });


      //update the Maps
      for (let x =0; x< outdatedCoords.length;x++){
        const updatedCoord:Coords = [outdatedCoords[x][0], outdatedCoords[x][1]+1]

        //update the RawExpression Map
        let rawValue:string = state.rawExpressions.get(outdatedCoords[x].toString()) || ""
        state.rawExpressions.delete(outdatedCoords[x].toString())
        state.rawExpressions.set(updatedCoord.toString(),rawValue)

        //update the expression Map
        let expValue:Expr = state.expressions.get(outdatedCoords[x].toString())!;
        state.expressions.delete(outdatedCoords[x].toString())
        state.expressions.set(updatedCoord.toString(),expValue)
      
        //update the dependency Tree
        let deps:Set<string> = state.dependencyTree.getGraph().get(outdatedCoords[x].toString())!;
        let temp:Set<Coords> = new Set<Coords>();
        console.log(deps)
        if (deps!= undefined){
          var iterator = deps.values();

          for(let i = 0; i<deps.size; i++ ){
            let coord = iterator.next().value
            const x = coord.split(",").map(Number)[0]
            const y= coord.split(",").map(Number)[1]
            if (y> cell[1]) {
              const c:Coords = [x,y+1]
              temp.add(c)
            }
            else{
              const c:Coords = [x,y]
              temp.add(c)
            }
          }
          state.dependencyTree.remove(outdatedCoords[x])
          state.dependencyTree.addDependencies(updatedCoord, temp)
        }
      }
    },


    addColumnLeft:(state)=> {
      console.log("Add Column Left")
      const cell: Coords = state.selectedExpression;
      let fontData: FontData = {font: "Open Sans", size: 15, bold: false, italic: false,};
      //Create new SheetData and fontSheetData with extra column
      let y_pos = cell[1]
      
      for(let x =0; x< state.sheetData.length;x++){
        state.sheetData[x].splice(y_pos, 0, "");
        state.fontSheetData[x].splice(y_pos,0, fontData);
      } 
      
      //get the list of outdated coords in the sheet
      let outdatedCoords:Coords[] = []
      state.rawExpressions.forEach((value: string, key: string) => {
        const x = value.split(",").map(Number)[0]
        const y= value.split(",").map(Number)[1]
        if (x >= y_pos) {
          let c:Coords = [x,y]
          outdatedCoords.push(c)
        }
      });



      //update the Maps
      for (let x =0; x< outdatedCoords.length;x++){
        const updatedCoord:Coords = [outdatedCoords[x][0], outdatedCoords[x][1]+1]

        //update the RawExpression Map
        let rawValue:string = state.rawExpressions.get(outdatedCoords[x].toString()) || ""
        state.rawExpressions.delete(outdatedCoords[x].toString())
        state.rawExpressions.set(updatedCoord.toString(),rawValue)

        //update the expression Map
        let expValue:Expr = state.expressions.get(outdatedCoords[x].toString())!;
        state.expressions.delete(outdatedCoords[x].toString())
        state.expressions.set(updatedCoord.toString(),expValue)
      
        //update the dependency Tree
        let deps:Set<string> = state.dependencyTree.getGraph().get(outdatedCoords[x].toString())!;
        let temp:Set<Coords> = new Set<Coords>();
        console.log(deps)
        if (deps!= undefined){
          var iterator = deps.values();

          for(let i = 0; i<deps.size; i++ ){
            let coord = iterator.next().value
            const x = coord.split(",").map(Number)[0]
            const y= coord.split(",").map(Number)[1]
            if (y>= cell[1]) {
              const c:Coords = [x,y+1]
              temp.add(c)
            }
            else{
              const c:Coords = [x,y]
              temp.add(c)
            }
          }
          state.dependencyTree.remove(outdatedCoords[x])
          state.dependencyTree.addDependencies(updatedCoord, temp)
        }
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
      console.log(x);
      console.log(y);
      console.log(fontData);
    },

    editFontData: (state, action: PayloadAction<FontInput>) => {
      //To do, pass in the cell and get the font data associated with the cell
      // console.log("I am here")
      // let x = action.payload.coords[0];
      // let y = action.payload.coords[1];
      // state.fontSheetData[x][y].font = action.payload.data.font;
      // state.fontSheetData[x][y].size = action.payload.data.size;
      // state.fontSheetData[x][y].bold = action.payload.data.bold;
      // state.fontSheetData[x][y].italic = action.payload.data.italic;
    },

    editFonts: (state, action: PayloadAction<FontEdit>) => {
      console.log("Here to edit font");
      let x = action.payload.coords[0];
      let y = action.payload.coords[1];
      state.fontSheetData[x][y].font = action.payload.data;
    },

    editSize: (state, action: PayloadAction<SizeEdit>) => {
      console.log("Here to edit font");
      let x = action.payload.coords[0];
      let y = action.payload.coords[1];
      state.fontSheetData[x][y].size = action.payload.data;
    },

    editBold: (state, action: PayloadAction<TypeEdit>) => {
      console.log("Here to edit Bold");
      let x = action.payload.coords[0];
      let y = action.payload.coords[1];
      state.fontSheetData[x][y].bold = action.payload.data;
    },

    editItalic: (state, action: PayloadAction<TypeEdit>) => {
      console.log("Here to edit italic");
      let x = action.payload.coords[0];
      let y = action.payload.coords[1];
      state.fontSheetData[x][y].italic = action.payload.data;
    },
  },
});

const { actions, reducer } = sheetState;
// Action creators are generated for each case reducer function
export const {
  selectExpression,
  editCell,
  getFontData,
  editFontData,
  editFonts,
  editBold,
  editItalic,
  editSize,
  addRowBelow,
  addRowAbove,
   addColumnRight,
   addColumnLeft
} = actions;
export default reducer;



