import React, { ChangeEvent, FunctionComponent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  editFormatData,
  getCellDataDefaultValue,
} from "../../redux/features/sheetState";
import FontPicker from "font-picker-react";
import { FormatOption } from "../../types";
import "./FormatBar.css";
import { RootState } from "../../redux/store";
import { debounce } from "lodash";
import { Dropdown } from "react-bootstrap";

const fontsAPIKey = "AIzaSyAMo73RrEPCwV-zygT3ibodMsxelIm26Lw";

type EditFormatProps = {
  changeFormatInfo: (
    formatKey: FormatOption,
    payload?: boolean | number | string
  ) => void;
};

type Props = {};

const EditAdd: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const addDropDown = [
    {
      key: "Column Right",
      function: () => dispatch(addColumn(true)),
    },
    {
      key: "Column Left",
      function: () => dispatch(addColumn(false)),
    },
    {
      key: "Row Below",
      function: () => dispatch(addRow(true)),
    },
    {
      key: "Row Above",
      function: () => dispatch(addRow(false)),
    },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        Insert
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {addDropDown.map((elem) => {
          return (
            <Dropdown.Item onClick={elem.function}>{elem.key}</Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const EditDelete: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const deleteDropDown = [
    {
      key: "Delete Row",
      function: () => dispatch(deleteRow()),
    },
    {
      key: "Delete Column",
      function: () => dispatch(deleteColumn()),
    },
  ];
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-basic">
        Delete
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {deleteDropDown.map((elem) => {
          return (
            <Dropdown.Item onClick={elem.function}>{elem.key}</Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const EditFont: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const font = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .formatData.font
  );
  return (
    <FontPicker
      apiKey={fontsAPIKey}
      activeFontFamily={font}
      limit={1000}
      variants={["regular", "italic", "600", "700", "700italic"]}
      onChange={(newFont) => {
        changeFormatInfo(FormatOption.FONT, newFont.family);
      }}
    />
  );
};

const EditFontColor: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const color = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .formatData.color
  );
  // Font color edit re-rendering is slow, and it happens every time the color data changes,
  // so we debounce the data changing.
  const changeColor = debounce(
    (newColor: string) => changeFormatInfo(FormatOption.COLOR, newColor),
    100
  );
  return (
    <input
      type="color"
      value={color}
      className="format-color"
      onChange={(e) => changeColor(e.target.value)}
    />
  );
};

const EditFontItalics: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const italic = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .formatData.italic
  );
  return (
    <button
      className="format-option fst-italic"
      onClick={() => {
        changeFormatInfo(FormatOption.ITALIC, !italic);
      }}
    >
      I
    </button>
  );
};

const EditFontBold: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const bold = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .formatData.bold
  );
  return (
    <button
      className="format-option fw-bold"
      onClick={() => {
        console.log("Test", !bold);
        changeFormatInfo(FormatOption.BOLD, !bold);
      }}
    >
      B
    </button>
  );
};

const sizeArray = [...Array(100).keys()];

const FontSizeDropDown: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const fontSize = useSelector(
    (state: RootState) =>
      getCellDataDefaultValue(state.data, state.data.selectedExpression)
        .formatData.size
  );
  return (
    <select
      value={fontSize}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        changeFormatInfo(FormatOption.SIZE, e.target.value)
      }
    >
      {sizeArray.map((size) => (
        <option value={size}>{size}</option>
      ))}
    </select>
  );
};

// const Title: React.FC<Props> = ({}) => {
//   return (
//     <span className="title fw-bold fst-italic d-flex justify-content-center align-items-center">
//       SheetSpread
//     </span>
//   );
// };

const FormatBar: FunctionComponent = () => {
  const dispatch = useDispatch();

  const changeFormatInfo = (
    formatKey: FormatOption,
    payload?: boolean | number | string
  ) => {
    if (payload === undefined) return;
    dispatch(editFormatData({ [formatKey]: payload }));
  };

  const editNavigation = [
    {
      key: "font",
      component: EditFont,
    },
    {
      key: "size",
      component: FontSizeDropDown,
    },
    {
      key: "bold",
      component: EditFontBold,
    },
    {
      key: "italic",
      component: EditFontItalics,
    },
    {
      key: "color",
      component: EditFontColor,
    },
    {
      key: "addDataThing",
      component: EditAdd,
    },
    {
      key: "removeDataThing",
      component: EditDelete,
    },
  ];

  return (
    <div className="format-bar">
      {editNavigation.map((edit) => (
        <React.Fragment key={edit.key}>
          <edit.component changeFormatInfo={changeFormatInfo} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormatBar;
