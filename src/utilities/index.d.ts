type Coords = [number, number];

type CellValue = string | number;

type SheetData = CellValue[][];

interface Expr {
  execute(sheet: SheetData): CellValue;
}
