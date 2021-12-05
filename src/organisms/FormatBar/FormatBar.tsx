import React, {
  ChangeEvent,
  FunctionComponent,
  ReactComponentElement,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  editFormatData,
  addRowAbove,
  addColumnLeft,
  addColumnRight,
  addRowBelow,
  deleteColumn,
  deleteRow,
} from "../../redux/features/sheetState";
import FontPicker from "font-picker-react";
import { FormatOption } from "../../types";
import { Dropdown } from "react-bootstrap";
import "./FormatBar.css";

const fontsAPIKey = "AIzaSyAMo73RrEPCwV-zygT3ibodMsxelIm26Lw";

const selectFormatInfo = (formatKey: FormatOption) => (state: RootState) => {
  const [x, y] = state.data.selectedExpression;
  return state.data.formatSheetData[x][y][formatKey];
};

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
      key: "Row Above",
      function: () => dispatch(addRowAbove()),
    },
    {
      key: "Row Below",
      function: () => dispatch(addRowBelow()),
    },
    {
      key: "Column Right",
      function: () => dispatch(addColumnRight()),
    },
    {
      key: "Column Left",
      function: () => dispatch(addColumnLeft()),
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
  const font = useSelector(selectFormatInfo(FormatOption.FONT)) as string;
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
  const color = useSelector(selectFormatInfo(FormatOption.COLOR)) as string;
  return (
    <input
      type="color"
      value={color}
      className="format-color"
      onChange={(e) => {
        changeFormatInfo(FormatOption.COLOR, e.target.value);
      }}
    />
  );
};

const EditFontItalics: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const italic = useSelector(selectFormatInfo(FormatOption.ITALIC)) as boolean;
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
  const bold = useSelector(selectFormatInfo(FormatOption.BOLD)) as boolean;
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
  const fontSize = useSelector(selectFormatInfo(FormatOption.SIZE)) as number;
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

const Title: React.FC<Props> = ({}) => {
  return (
    <span className="title fw-bold fst-italic d-flex justify-content-center align-items-center">
      SheetSpread
    </span> 
  );
};
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
    { key: "title", component: Title },
    { key: "add", component: EditAdd },
    { key: "delete", component: EditDelete },
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
