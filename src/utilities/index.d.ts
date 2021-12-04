type Coords = [number, number];

type CellValue = string | number | boolean;

type SheetData = CellValue[][];

type FontSheetData = FontData[][];

type FontData = {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
};

type FontInput = {
  coords: Coords;
  data: FontData;
};

type FontEdit = {
  coords: Coords;
  data: string;
};

type SizeEdit = {
  coords: Coords;
  data: number;
};

type TypeEdit = {
  coords: Coords;
  data: boolean;
};

interface Expr {
  execute(sheet: SheetData): CellValue;
}
