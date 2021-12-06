type Coords = [number, number];

type CellValue = string | number | boolean;

type SheetData = CellValue[][];

type FormatSheetData = FormatData[][];

type FormatData = {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;
};

type CellDataMap = {
  [key: string]: CellData;
};

type CellData = {
  rawExpression: string;
  compiledExpression?: Expr;
  formatData: FormatData;
  value: CellValue;
  error?: Error;
};

interface Expr {
  execute(sheet: SheetData): CellValue;
}
