import React, {
  FunctionComponent,
  useState,
  useRef,
  ChangeEvent,
  useEffect,
  KeyboardEvent,
} from "react";
import "./SheetCell.css";
import { useDispatch, useSelector } from "react-redux";
import { PayloadAction } from "@reduxjs/toolkit";
//import { editCell, setCurrentFormulaInput } from "../redux/features/sheetState";
import { editCell } from "../redux/features/sheetState";
import { RootState } from "../redux/store";

type CellDisplayValueProps = {
  value: CellValue;
};

const CellDisplayValue: React.FC<CellDisplayValueProps> = ({ value }) => {
  if (typeof value === "string") {
    return <span>{value}</span>;
  } else if (typeof value === "boolean") {
    return <React.Fragment>{`${value}`}</React.Fragment>;
  } else {
    return <React.Fragment>{value}</React.Fragment>;
  }
};

export type SheetCellProps = {
  isSelected: boolean;
  setMonitor: (data: string) => void;
  setX: (data: number) => void;
  setY: (data: number) => void;
  value: CellValue;
  fontData: FontData;
  rowInd: number;
  colInd: number;
  onSelect: () => PayloadAction<Coords>;
  hasError: boolean;
};

type FontData = {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;
};

const SheetCell: React.FC<SheetCellProps> = ({
  value,
  rowInd,
  colInd,
  fontData,
  onSelect,
  setMonitor,
  setX,
  setY,
  isSelected,
  hasError,
}) => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  // const [cellValue, setCellValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const changeLabeltoInput = () => {
    setIsEditMode(true);
  };

  const changeInputToLabel = () => {
    setIsEditMode(false);
  };

  useEffect(() => {
    if (!isSelected) {
      setIsEditMode(false);
    }
  }, [setIsEditMode, isSelected]);

  const onClickOutsideInputHandler = (event: MouseEvent) => {
    if ((event.target as HTMLElement)?.id !== `${rowInd},${colInd}`) {
      changeInputToLabel();
    }
  };

  useEffect(() => {
    document.addEventListener("click", onClickOutsideInputHandler);
    return document.addEventListener("click", onClickOutsideInputHandler);
  }, []);

  const onDefocusInputHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsEditMode(false);
      changeInputToLabel();
      setMonitor("");
    }
  };

  const cellStyle = {
    width: "100px",
    fontWeight: fontData.bold == true ? 600 : 500,
    fontStyle: fontData.italic == true ? "italic" : "",
    fontFamily: `${fontData.font}`,
    fontSize: `${fontData.size}px`,
    color: fontData.color,
  };

  return isEditMode ? (
    <td id={`${rowInd},${colInd}`}>
      <input
        id={`${rowInd},${colInd}`}
        className="cell-block border-0"
        style={{ width: "100px" }}
        value={value as string}
        ref={inputRef}
        onChange={(e) => {
          setMonitor(e.currentTarget.value);
          dispatch(editCell(e.currentTarget.value));
        }}
        onKeyDown={onDefocusInputHandler}
      />
    </td>
  ) : (
    <td
      className={["table-cell", isSelected ? "selected-cell" : ""].join(" ")}
      id={`${rowInd},${colInd}`}
      // todo handle cells that have error w/ css
      onClick={(e) => {
        // todo get state from formula bar / handle update
        setMonitor(value as string);
        dispatch(onSelect());
        changeLabeltoInput();
        setX(rowInd);
        setY(colInd);
        console.log(value as string)
      }}
    >
      <div id={`${rowInd},${colInd}`} style={cellStyle} className="cell-data">
        <CellDisplayValue value={hasError ? "ERROR" : value} />
      </div>
    </td>
  );
};

export default SheetCell;
