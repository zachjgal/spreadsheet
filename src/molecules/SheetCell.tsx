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
    return <i>{value}</i>;
  } else if (typeof value === "boolean") {
    return <React.Fragment>{`${value}`}</React.Fragment>;
  } else {
    return <React.Fragment>{value}</React.Fragment>;
  }
};

export type SheetCellProps = {
  isSelected: boolean;
  value: CellValue;
  onSelect: () => PayloadAction<Coords>;
  hasError: boolean;
};

const SheetCell: React.FC<SheetCellProps> = ({
  value,
  onSelect,
  isSelected,
  hasError,
}) => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [done, setDone] = useState(false);
  const [cellValue, setCellValue] = useState("");
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

  const onDefocusInputHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsEditMode(false);
      dispatch(editCell(cellValue));
      changeInputToLabel();
    }
  };

  // const currentValue = useSelector(
  //   (state: RootState) => state.data.currentFormulaInput
  // );

  return isEditMode ? (
    <td>
      <input
        className="cell-block"
        style={{ width: "100px" }}
        value={cellValue}
        ref={inputRef}
        onChange={(e) => {
          setCellValue(e.currentTarget.value);
          //dispatch(setCurrentFormulaInput(e.currentTarget.value));
        }}
        onKeyDown={onDefocusInputHandler}
      />
    </td>
  ) : (
    <td
      className={["table-cell", isSelected ? "selected-cell" : ""].join(" ")}
      // todo handle cells that have error w/ css
      onClick={() => {
        // todo get state from formula bar / handle update
        dispatch(onSelect());
        changeLabeltoInput();
      }}
    >
      <div style={{ width: "100px" }}>
        <CellDisplayValue value={hasError ? "ERROR" : value} />
      </div>
    </td>
  );
};

export default SheetCell;
