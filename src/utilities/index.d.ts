type Coords = [number, number];

type CellValue = string | number | boolean;

type SheetData = CellValue[][];

type FormatSheetData = FormatData[][];

type FormatData = {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
};

interface Expr {
  execute(sheet: SheetData): CellValue;
}
