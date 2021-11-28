import { range as lodashRange } from "lodash";

type TokensList = string[] | TokensList[] | string;

// export class SheetData {
//   public data: CellValue[][];
//
//   constructor(initialRows: number, initialCols: number) {
//     this.data = [];
//     this.data.fill([], 0, initialRows);
//     for (let i: number = 0; i < initialRows; i++) {
//       this.data[i].fill("", 0, initialCols);
//     }
//   }
//
//   get numRows(): number {
//     return this.data.length;
//   }
//
//   get numCols(): number {
//     return this.data[0].length;
//   }
//
//   insertRow(index?: number) {
//     index = index ?? this.numRows;
//     let newRow: CellValue[] = [];
//     newRow.fill("", 0, this.numCols);
//     this.data.splice(index, 0, newRow);
//   }
//
//   insertCol(index?: number) {
//     index = index ?? this.numCols;
//     for (let row of this.data) {
//       row.splice(index, 0, "");
//     }
//   }
// }

enum BinaryOpType {
  ADD = "+",
  MULTIPLY = "*",
  DIVIDE = "/",
  SUBTRACT = "-",
  EXPONENT = "^",
}

const binaryOpTypeToFunction = (
  op: BinaryOpType
): ((a: CellValue, b: CellValue) => CellValue) => {
  let binaryOpToFunctionMap = {
    [BinaryOpType.ADD]: (a: any, b: any) => a + b,
    [BinaryOpType.SUBTRACT]: (a: any, b: any) => a - b,
    [BinaryOpType.MULTIPLY]: (a: any, b: any) => a * b,
    [BinaryOpType.DIVIDE]: (a: any, b: any) => a / b,
    [BinaryOpType.EXPONENT]: (a: any, b: any) => a ** b,
  };
  return binaryOpToFunctionMap[op];
};

enum AggregateOpType {
  SUM = "SUM",
  PRODUCT = "PRODUCT",
  AVERAGE = "AVG",
  CONCATENATE = "CONCAT",
}

const aggregateOpTypeToFunction = (
  op: AggregateOpType
): ((args: CellValue[]) => CellValue) => {
  let aggregateOpToFunctionMap = {
    [AggregateOpType.SUM]: (args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, 0),
    [AggregateOpType.PRODUCT]: (args: any) =>
      args.reduce((prod: any, curr: any) => prod * curr, 1),
    [AggregateOpType.AVERAGE]: (args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, 0) / args.length,
    [AggregateOpType.CONCATENATE]: (args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, ""),
  };
  return aggregateOpToFunctionMap[op];
};

class PrimitiveExpr implements Expr {
  private readonly value: CellValue;

  constructor(value: CellValue) {
    this.value = value;
  }

  execute(sheet: SheetData): CellValue {
    return this.value;
  }
}

export class CellRef implements Expr {
  static readonly REGEX = /(?<col>[a-zA-Z]+)(?<row>\d+)/;

  readonly row: number;
  readonly col: number;

  constructor(expr: string) {
    const [row, col] = CellRef.parseCellRef(expr);
    this.row = row;
    this.col = col;
  }

  static getCol(colName: string): number {
    let colNum = 0;
    for (let char of colName) {
      colNum *= 26;
      colNum += char.charCodeAt(0) - "A".charCodeAt(0) + 1;
    }
    colNum -= 1; // Accounting for zero-indexing
    return colNum;
  }

  static makeCol(col: number): string {
    let colStr: string[] = [];
    let i = col + 1;
    while (i > 0) {
      let temp = i - 1;
      i = Math.floor(temp / 26);
      let rem = temp % 26;
      colStr.push(String.fromCharCode(rem + "A".charCodeAt(0)));
    }
    colStr.reverse();
    return colStr.join("");
  }

  static fromCoords(coords: Coords): CellRef {
    return new CellRef(`${CellRef.makeCol(coords[1])}${coords[0] + 1}`);
  }

  static parseCellRef(expr: string): Coords {
    let match = expr.match(CellRef.REGEX);
    if (!match?.groups) {
      throw Error(`Expression ${expr} is not a valid cell reference`);
    }
    return [
      parseInt(match.groups["row"]) - 1,
      CellRef.getCol(match.groups["col"]),
    ];
  }

  get coords(): Coords {
    return [this.row, this.col];
  }

  execute(sheet: SheetData): CellValue {
    return sheet[this.row][this.col];
  }
}

class CellRange {
  static readonly REGEX = /[a-zA-Z]+\d+:[a-zA-Z]+\d+/;
  private readonly topLeft: string;
  private readonly bottomRight: string;
  private readonly topLeftRow: number;
  private readonly topLeftCol: number;
  private readonly bottomRightRow: number;
  private readonly bottomRightCol: number;

  public isCellRange(expr: string): boolean {
    let match = expr.match(CellRange.REGEX);
    return !!match;
  }

  constructor(expr: string) {
    if (!this.isCellRange(expr)) {
      throw Error(`Expression ${expr} is not a valid cell range`);
    }
    let [topLeft, bottomRight] = expr.split(":");
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    let [topLeftRow, topLeftCol] = CellRef.parseCellRef(topLeft);
    this.topLeftRow = topLeftRow;
    this.topLeftCol = topLeftCol;
    let [bottomRightRow, bottomRightCol] = CellRef.parseCellRef(bottomRight);
    this.bottomRightRow = bottomRightRow;
    this.bottomRightCol = bottomRightCol;
  }

  get coords(): Coords[] {
    let coordsList: [number, number][] = [];
    for (let row of lodashRange(this.topLeftRow, this.bottomRightRow + 1)) {
      for (let col of lodashRange(this.topLeftCol, this.bottomRightCol + 1)) {
        coordsList.push([row, col]);
      }
    }
    return coordsList;
  }

  asCells(): CellRef[] {
    return this.coords.map((coord) => CellRef.fromCoords(coord));
  }
  //
  // execute(sheet: SheetData): CellValue[] {
  //   let sheetValues: CellValue[] = [];
  //   for (let coord of this.coords) {
  //     sheetValues.push(sheet.data[coord[0]][coord[1]]);
  //   }
  //   return sheetValues;
  // }
}

class BinaryOperation implements Expr {
  private readonly op: BinaryOpType;
  private readonly left: Expr;
  private readonly right: Expr;

  constructor(op: BinaryOpType, left: Expr, right: Expr) {
    this.op = op;
    this.left = left;
    this.right = right;
  }

  execute(sheet: SheetData): CellValue {
    return binaryOpTypeToFunction(this.op)(
      this.left.execute(sheet),
      this.right.execute(sheet)
    );
  }
}

class AggregateOperation implements Expr {
  private readonly op: AggregateOpType;
  private readonly exprs: Expr[];

  constructor(op: AggregateOpType, exprs: Expr[]) {
    if (!exprs) {
      throw Error(
        `Empty list of expressions passed to aggregate operation ${op}`
      );
    }
    this.op = op;
    this.exprs = exprs;
  }

  execute(sheet: SheetData): CellValue {
    let args: CellValue[] = this.exprs.map((e) => e.execute(sheet));
    return aggregateOpTypeToFunction(this.op)(args);
  }
}

export class Tokenizer {
  static appendNested(
    list: TokensList,
    value: string | TokensList,
    depth: number
  ) {
    let currList: string | TokensList = list;
    for (let i: number = 0; i < depth; i++) {
      if (currList.length === 0) {
        throw Error(
          `List at depth ${i} is empty. Can't append list ${list} at depth ${depth}`
        );
      }
      if (!(currList[currList.length - 1] instanceof Array)) {
        throw Error(
          `Depth of ${depth} is too great. Maximum possible depth given tokens is ${
            i - 1
          }`
        );
      }
      currList = currList[currList.length - 1];
    }
    // I apologize for my typing sins.
    (currList as any[]).push(value);
  }

  static tokenize(input: string): TokensList | string {
    let tokens: TokensList[] = []; // is this correct
    let currDepth: number = 0;
    let buffer: string[] = [];
    let insideStr: boolean = false;
    input.split("").forEach((c) => {
      if (c === "(") {
        Tokenizer.appendNested(tokens, [], currDepth);
        currDepth++;
      } else if (c === ")") {
        if (buffer.length > 0) {
          let word: string = buffer.join("");
          Tokenizer.appendNested(tokens, word, currDepth);
          buffer.length = 0; // weird way of doing this right? but you can
        }
        currDepth--;
      } else if (insideStr || c !== " ") {
        if (c === '"') {
          insideStr = !insideStr;
        }
        buffer.push(c);
      } else if (!insideStr && buffer.length > 0 && c === " ") {
        let word: string = buffer.join("");
        Tokenizer.appendNested(tokens, word, currDepth);
        buffer.length = 0;
      }
    });
    if (buffer.length > 0) {
      tokens.push(buffer.join(""));
    }
    if (tokens.length !== 1) {
      throw Error(`Input ${input} invalid: Top level operation needed`);
    }
    return tokens[0];
  }
}

export class Compiler {
  parseAsNumber(obj: string, dependencies: Set<Coords>): Expr {
    if (isNaN(Number(obj))) {
      throw new Error("not a number!!!!");
    }
    return new PrimitiveExpr(Number(obj));
  }
  // just strips the quotes off the given string if necessary
  parseAsLangString(expr: string, dependencies: Set<Coords>): Expr {
    if (!(expr.charAt(0) === '"' && expr.charAt(expr.length - 1))) {
      throw Error(
        `String literal ${expr} must be contained within double quotes`
      );
    }
    return new PrimitiveExpr(expr.substr(1, expr.length - 2));
  }
  parseAsCellRef(obj: string, dependencies: Set<Coords>): Expr {
    let ret = new CellRef(obj);
    dependencies.add(ret.coords);
    return ret;
  }

  compileWithDependencies(
    expr: TokensList | string,
    dependencies: Set<Coords>
  ): Expr {
    console.log(`EXPR: ${expr}`);
    if (typeof expr === "string") {
      /*
        1. Number
        2. String (Language String)
        3. CellRef
      */
      let compiledExpression;
      for (let compilePrimitive of [
        this.parseAsNumber,
        this.parseAsLangString,
        this.parseAsCellRef,
      ]) {
        try {
          compiledExpression = compilePrimitive(expr, dependencies);
          console.log(`COMPILED: ${compiledExpression}`);
          break;
        } catch {}
      }
      if (compiledExpression === undefined) {
        throw Error(`Invalid expression: ${expr}`);
      }
      return compiledExpression;
    } else {
      /*
        1. [ <BinOp> <Expr> <Expr> ]
        2. [ <AggregateOp> <CellRange> | [<Expr>, <Expr>, ...] ]
      */
      if (!expr.length) {
        throw Error(`empty operation ${expr}`);
      }
      let [operation, ...args] = expr;

      if (Object.values(BinaryOpType).includes(operation as BinaryOpType)) {
        // Binary Operation
        if (args.length !== 2) {
          throw Error(`binary operator takes two values, given ${args}`);
        }
        return new BinaryOperation(
          operation as BinaryOpType,
          this.compileWithDependencies(args[0], dependencies),
          this.compileWithDependencies(args[1], dependencies)
        );
      } else if (
        Object.values(AggregateOpType).includes(operation as AggregateOpType)
      ) {
        // Aggregate Operation
        if (args.length === 0) {
          throw Error(`Aggregate operation given no values: ${expr}`);
        } else if (args.length === 1 && typeof args[0] === "string") {
          // Cell Range
          const cellRefs = new CellRange(args[0]).asCells();
          for (let cellRef of cellRefs) {
            dependencies.add(cellRef.coords);
          }
          return new AggregateOperation(operation as AggregateOpType, cellRefs);
        } else {
          // Multiple Args Case
          return new AggregateOperation(
            operation as AggregateOpType,
            args.map((arg) => this.compileWithDependencies(arg, dependencies))
          );
        }
      } else {
        throw Error(`invalid operation ${expr}`);
      }
    }
  }
}
