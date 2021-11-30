type Coords = [number, number];

type CellValue = string | number | boolean;

type SheetData = CellValue[][];

interface Expr {
  execute(sheet: SheetData): CellValue;
}
