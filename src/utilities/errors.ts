import { CustomError } from "ts-custom-error";

export class CircularReferenceError extends CustomError {
  public constructor(public node1: Coords, public node2: Coords) {
    super(
      `Circular reference between cells (${node1.toString()}) and (${node2.toString()})`
    );
    Object.defineProperty(this, "name", { value: "CircularReferenceError" });
  }
}

export class InvalidFormError extends CustomError {
  public constructor(message: string) {
    super(message);
    Object.defineProperty(this, "name", { value: "InvalidFormError" });
  }
}

export class NArgsError extends CustomError {
  public constructor(op: string, nargs: number, expected: number) {
    super(`${op} expected ${expected} args but received ${nargs}`);
    Object.defineProperty(this, "name", { value: "NArgsError" });
  }
}

export class RuntimeTypeError extends CustomError {
  public constructor(value: CellValue | CellValue[], expected: string) {
    super(`Expected value ${value} to be of type ${expected}`);
    Object.defineProperty(this, "name", { value: "RuntimeTypeError" });
  }
}

export class TokenizerError extends CustomError {
  public constructor(message: string) {
    super(message);
    Object.defineProperty(this, "name", { value: "TokenizerError" });
  }
}

export class ParserError extends CustomError {
  public constructor(message: string) {
    super(message);
    Object.defineProperty(this, "name", { value: "ParserError" });
  }
}

export class UnsupportedOperationError extends CustomError {
  public constructor(public op: string) {
    super(`Operation "${op}" is not supported`);
    Object.defineProperty(this, "name", { value: "UnsupportedOperationError" });
  }
}

export class InvalidExpressionError extends CustomError {
  public constructor(message: string) {
    super(message);
    Object.defineProperty(this, "name", { value: "InvalidExpressionError" });
  }
}
