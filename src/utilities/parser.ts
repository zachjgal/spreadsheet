import { range as lodashRange } from "lodash";
import {
  InvalidFormError,
  UnsupportedOperationError,
  NArgsError,
  ParserError,
  TokenizerError,
  InvalidExpressionError,
} from "./errors";

type TokensList = string | TokensList[];

enum OperationType {
  // Unary
  NOT = "NOT",
  // Binary
  ADD = "+",
  MULTIPLY = "*",
  DIVIDE = "/",
  SUBTRACT = "-",
  EXPONENT = "^",
  GREATER_THAN = ">",
  GREATER_THAN_OR_EQUAL_TO = ">=",
  LESS_THAN = "<",
  LESS_THAN_OR_EQUAL_TO = "<=",
  EQUALS = "=",
  AND = "AND",
  OR = "OR",
  XOR = "XOR",
  // Aggregate
  SUM = "SUM",
  PRODUCT = "PRODUCT",
  AVERAGE = "AVG",
  CONCATENATE = "CONCAT",
  ALL = "ALL",
  ANY = "ANY",
  MINIMUM = "MIN",
  MAXIMUM = "MAX",
}

const getOperationArgLengthAssertion = (
  op: OperationType
): ((args: any[]) => void) => {
  const unaryOperations = [OperationType.NOT];
  const binaryOperations = [
    OperationType.ADD,
    OperationType.MULTIPLY,
    OperationType.DIVIDE,
    OperationType.SUBTRACT,
    OperationType.EXPONENT,
    OperationType.GREATER_THAN,
    OperationType.GREATER_THAN_OR_EQUAL_TO,
    OperationType.LESS_THAN,
    OperationType.LESS_THAN_OR_EQUAL_TO,
    OperationType.EQUALS,
    OperationType.AND,
    OperationType.OR,
    OperationType.XOR,
  ];
  const nAryOperations = [
    OperationType.SUM,
    OperationType.PRODUCT,
    OperationType.AVERAGE,
    OperationType.CONCATENATE,
    OperationType.ALL,
    OperationType.ANY,
    OperationType.MINIMUM,
    OperationType.MAXIMUM,
  ];
  if (unaryOperations.includes(op)) {
    return (args) => {
      if (args.length !== 1) {
        throw new NArgsError("Unary operator", args.length, 1);
      }
    };
  } else if (binaryOperations.includes(op)) {
    return (args) => {
      if (args.length !== 2) {
        throw new NArgsError("Binary operator", args.length, 2);
      }
    };
  } else if (nAryOperations.includes(op)) {
    return (_) => {};
  } else {
    throw new UnsupportedOperationError(op);
  }
};

const operationTypeToFunction = (
  op: OperationType
): ((...args: CellValue[]) => CellValue) => {
  let operationMap = {
    [OperationType.NOT]: (arg: any) => !arg,
    [OperationType.ADD]: (a: any, b: any) => a + b,
    [OperationType.SUBTRACT]: (a: any, b: any) => a - b,
    [OperationType.MULTIPLY]: (a: any, b: any) => a * b,
    [OperationType.DIVIDE]: (a: any, b: any) => a / b,
    [OperationType.EXPONENT]: (a: any, b: any) => a ** b,
    [OperationType.GREATER_THAN]: (a: any, b: any) => a > b,
    [OperationType.GREATER_THAN_OR_EQUAL_TO]: (a: any, b: any) => a >= b,
    [OperationType.LESS_THAN]: (a: any, b: any) => a < b,
    [OperationType.LESS_THAN_OR_EQUAL_TO]: (a: any, b: any) => a <= b,
    [OperationType.EQUALS]: (a: any, b: any) => a === b,
    [OperationType.AND]: (a: any, b: any) => a && b,
    [OperationType.OR]: (a: any, b: any) => a || b,
    [OperationType.XOR]: (a: any, b: any) => a !== b,
    [OperationType.SUM]: (...args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, 0),
    [OperationType.PRODUCT]: (...args: any) =>
      args.reduce((prod: any, curr: any) => prod * curr, 1),
    [OperationType.AVERAGE]: (...args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, 0) / args.length,
    [OperationType.CONCATENATE]: (...args: any) =>
      args.reduce((sum: any, curr: any) => sum + curr, ""),
    [OperationType.ALL]: (...args: any) =>
      args.reduce((agg: any, curr: any) => agg && curr, true),
    [OperationType.ANY]: (...args: any) =>
      args.reduce((agg: any, curr: any) => agg || curr, false),
    [OperationType.MINIMUM]: (...args: any) =>
      args.reduce((agg: any, curr: any) => (agg <= curr ? agg : curr), args[0]),
    [OperationType.MAXIMUM]: (...args: any) =>
      args.reduce((agg: any, curr: any) => (agg >= curr ? agg : curr), args[0]),
  };
  return operationMap[op];
};

class LanguageOperation implements Expr {
  private readonly op: (...args: CellValue[]) => CellValue;
  private readonly args: Expr[];

  constructor(op: OperationType, args: Expr[]) {
    const assertArgLength = getOperationArgLengthAssertion(op);
    const operationFunction = operationTypeToFunction(op);
    this.op = (...args) => {
      assertArgLength(args);
      return operationFunction(...args);
    };
    this.args = args;
  }

  execute(sheet: SheetData): CellValue {
    return this.op(...this.args.map((e) => e.execute(sheet)));
  }
}

enum FormType {
  IF = "IF",
}

class IFLanguageForm implements Expr {
  private readonly args: Expr[];

  constructor(args: Expr[]) {
    if (args.length !== 3) {
      throw new NArgsError("IF clause", args.length, 3);
    }
    this.args = args;
  }

  execute(sheet: SheetData): CellValue {
    const predicate = this.args[0].execute(sheet);
    if (typeof predicate !== "boolean") {
      throw new InvalidFormError(
        `IF requires the first clause to be a boolean expression`
      );
    }
    return predicate
      ? this.args[1].execute(sheet)
      : this.args[2].execute(sheet);
  }
}

class LanguageFormFactory {
  static create(formType: FormType, args: Expr[]): Expr {
    const languageFormMap = {
      [FormType.IF]: IFLanguageForm,
    };
    return new languageFormMap[formType](args);
  }
}

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

  public static isCellRange(expr: string): boolean {
    let match = expr.match(CellRange.REGEX);
    return !!match;
  }

  constructor(expr: string) {
    if (!CellRange.isCellRange(expr)) {
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
        throw new TokenizerError(
          `List at depth ${i} is empty. Can't append list ${list} at depth ${depth}`
        );
      }
      if (!(currList[currList.length - 1] instanceof Array)) {
        throw new TokenizerError(
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
      throw new TokenizerError(
        `Input ${input} invalid: Top level operation needed`
      );
    }
    return tokens[0];
  }
}

export class Compiler {
  parseAsLangConstant(obj: string, _: Set<Coords>): Expr {
    if (!obj.startsWith("#")) {
      throw new Error(
        "Language constants like booleans should start with a '#'"
      );
    }
    const constStr = obj.substr(1).toLowerCase();
    if (constStr === "t" || constStr === "true") {
      return new PrimitiveExpr(true);
    } else if (constStr === "f" || constStr === "false") {
      return new PrimitiveExpr(false);
    } else {
      throw new ParserError(`Unrecognized constant: ${obj.substr(1)}`);
    }
  }

  parseAsNumber(obj: string, _: Set<Coords>): Expr {
    if (isNaN(Number(obj))) {
      throw new ParserError(`${obj} is not a number`);
    }
    return new PrimitiveExpr(Number(obj));
  }
  // just strips the quotes off the given string if necessary
  parseAsLangString(expr: string, _: Set<Coords>): Expr {
    if (!(expr.charAt(0) === '"' && expr.charAt(expr.length - 1))) {
      throw new ParserError(
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

  compileWithDependencies(expr: TokensList, dependencies: Set<Coords>): Expr {
    if (typeof expr === "string") {
      if (CellRange.isCellRange(expr)) {
        throw new InvalidExpressionError(
          "CellRange isn't a valid primitive and is only recognized" +
            " as the singular argument to an aggregate operation"
        );
      }
      /*
        1. Number
        2. String (Language String)
        3. Boolean (Language Constant)
        4. CellRef
      */
      let compiledExpression;
      for (let compilePrimitive of [
        this.parseAsNumber,
        this.parseAsLangString,
        this.parseAsLangConstant,
        this.parseAsCellRef,
      ]) {
        try {
          compiledExpression = compilePrimitive(expr, dependencies);
          break;
        } catch (err) {
          // Only expect to see ParserErrors
          if ((err as Error).name !== "ParserError") {
            throw err;
          }
        }
      }
      if (compiledExpression === undefined) {
        throw new InvalidExpressionError("Expression is undefined");
      }
      return compiledExpression;
    } else {
      /*
        1. [ <OperationType> <CellRange> | [<Expr>, <Expr>...] ]
        2. [ <FormType> <Expr>... ]
      */
      if (!expr.length) {
        throw new InvalidExpressionError(`Empty expression not allowed`);
      }
      let [action, ...args] = expr; // action can either be a language operation or language form

      if (Object.values(OperationType).includes(action as OperationType)) {
        let compiledArgs;
        if (
          args.length === 1 &&
          typeof args[0] === "string" &&
          CellRange.isCellRange(args[0])
        ) {
          // Cell Range
          // Only recognized and valid when on its own as the only argument
          const cellRefs = new CellRange(args[0]).asCells();
          for (let cellRef of cellRefs) {
            dependencies.add(cellRef.coords);
          }
          compiledArgs = cellRefs;
        } else {
          compiledArgs = args.map((arg) =>
            this.compileWithDependencies(arg, dependencies)
          );
        }
        return new LanguageOperation(action as OperationType, compiledArgs);
      } else if (Object.values(FormType).includes(action as FormType)) {
        return LanguageFormFactory.create(
          action as FormType,
          args.map((arg) => this.compileWithDependencies(arg, dependencies))
        );
      } else {
        // TODO we should never reach this case, right?
        throw new InvalidExpressionError(`Expression ${expr} is invalid`);
      }
    }
  }
}
