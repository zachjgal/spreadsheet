import React, { ChangeEvent, FunctionComponent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { editFormatData } from "../../redux/features/sheetState";
import FontPicker from "font-picker-react";
import { FormatOption } from "../../types";
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

const EditFontItalics: React.FC<EditFormatProps> = ({ changeFormatInfo }) => {
  const italic = useSelector(selectFormatInfo(FormatOption.ITALIC)) as boolean;
  return (
    <button
      className="format-option"
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
      className="format-option"
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

// export type InsertProps = {
//   nav: string;
//   setNav: (arg: string) => void;
// };
//
// const InsertDropDown: FunctionComponent<InsertProps> = (props) => {
//   return (
//     <>
//       <div
//         className="dropdown show"
//         onClick={() => {
//           if (props.nav === "insert") {
//             props.setNav("");
//           } else {
//             props.setNav("insert");
//           }
//         }}
//       >
//         <a
//           className="btn btn-secondary dropdown-toggle"
//           href="#"
//           role="button"
//           id="dropdownMenuLink"
//           data-toggle="dropdown"
//           aria-haspopup="true"
//           aria-expanded="false"
//         >
//           Insert
//         </a>
//         <div
//           className={`dropdown-menu ${props.nav === "insert" && "show"}`}
//           aria-labelledby="dropdownMenuLink"
//         >
//           <a className="dropdown-item" href="#">
//             Row Above
//           </a>
//           <a className="dropdown-item" href="#">
//             Row Below
//           </a>
//           <a className="dropdown-item" href="#">
//             Column Left
//           </a>
//           <a className="dropdown-item" href="#">
//             Column Right
//           </a>
//           <a className="dropdown-item" href="#">
//             Function
//           </a>
//         </div>
//       </div>
//     </>
//   );
// };
//
// export type DeleteProps = {
//   nav: string;
//   setNav: (arg: string) => void;
// };
//
// const DeleteDropDown: FunctionComponent<DeleteProps> = (props) => {
//   return (
//     <>
//       <div
//         className="dropdown show"
//         onClick={() => {
//           if (props.nav === "delete") {
//             props.setNav("");
//           } else {
//             props.setNav("delete");
//           }
//         }}
//       >
//         <a
//           className="btn btn-secondary dropdown-toggle"
//           href="#"
//           role="button"
//           id="dropdownMenuLink"
//           data-toggle="dropdown"
//           aria-haspopup="true"
//           aria-expanded="false"
//         >
//           Delete
//         </a>
//         <div
//           className={`dropdown-menu ${props.nav === "delete" && "show"}`}
//           aria-labelledby="dropdownMenuLink"
//         >
//           <a className="dropdown-item" href="#">
//             Row Above
//           </a>
//           <a className="dropdown-item" href="#">
//             Row Below
//           </a>
//           <a className="dropdown-item" href="#">
//             Column Left
//           </a>
//           <a className="dropdown-item" href="#">
//             Column Right
//           </a>
//         </div>
//       </div>
//     </>
//   );
// };

export default FormatBar;
