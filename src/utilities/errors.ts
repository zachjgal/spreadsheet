// import { customErrorFactory } from "ts-custom-error";
import { CustomError } from "ts-custom-error";

export class CircularReferenceError extends CustomError {
  public constructor(public node1: Coords, public node2: Coords) {
    super(
      `Circular reference between cells (${node1.toString()}) and (${node2.toString()})`
    );
  }
}

export class InvalidExpressionError extends CustomError {
  public constructor(public cell: Coords, public exprString: string) {
    super(`Invalid expression "${exprString}" at cell (${cell.toString()})`);
  }
}

export class InvalidOperationError extends CustomError {
  public constructor(public op: string) {
    super(`Operation "${op} is not supported"`);
  }
}

// todo see what more we need after adding peg

// todo could use the more functional/modern approach, ts doesn't like it tho
// export const CircularReferenceError = customErrorFactory(
//   (node1: Coords, node2: Coords) => {
//     // @ts-ignore
//     this.message = `Circular reference between cells (${node1.toString()}) and (${node2.toString()})`;
//   }
// );
