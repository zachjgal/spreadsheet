import React, { FunctionComponent, useState, useEffect } from "react";
import FontPicker from "font-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { editFontData, getFontData } from "../../redux/features/sheetState";
export type EditProps = {
  x: number;
  y: number;
};

type FontData = {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
};

type Coords = [number, number];

type FontInput = {
  coords: Coords;
  data: FontData;
};

const Edit: FunctionComponent<EditProps> = (props) => {
  const dispatch = useDispatch();
  const [nav, setNav] = useState("");
  const [font, setFont] = useState("Open Sans");
  const [size, setSize] = useState(10);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const sendFontData = () => {
    let fdata: FontData = {
      font: font,
      size: size,
      bold: bold,
      italic: italic,
    };
    let coord: Coords = [props.x, props.y];
    let data: FontInput = {
      coords: coord,
      data: fdata,
    };
    dispatch(editFontData(data));
  };

  const editNavigation = [
    {
      key: "insert",
      data: <InsertDropDown nav={nav} setNav={setNav} />,
    },
    {
      key: "delete",
      data: <DeleteDropDown nav={nav} setNav={setNav} />,
    },
    {
      key: "font",
      data: (
        <FontsDropDown
          font={font}
          setFont={setFont}
          nav={nav}
          setNav={setNav}
          sendFontData={sendFontData}
        />
      ),
    },
    {
      key: "size",
      data: <div className=" font-nav">10</div>,
    },
    {
      key: "bold",
      data: (
        <div
          className=" font-nav fw-bold"
          onClick={() => {
            setBold(!bold);
            sendFontData();
            dispatch(getFontData([props.x, props.y]));
          }}
        >
          B
        </div>
      ),
    },
    {
      key: "italic",
      data: (
        <div
          className="font-nav fst-italic"
          onClick={() => {
            setItalic(!italic);
            sendFontData();
            dispatch(getFontData([props.x, props.y]));
          }}
        >
          I
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex">
      {editNavigation.map((edit, editIdx) => {
        return edit.data;
      })}
    </div>
  );
};

export type FontsProps = {
  nav: string;
  font: string;
  setFont: (arg: string) => void;
  setNav: (arg: string) => void;
  sendFontData: () => void;
};

const FontsDropDown: FunctionComponent<FontsProps> = (props) => {
  return (
    <>
      <div>
        <FontPicker
          apiKey="AIzaSyAMo73RrEPCwV-zygT3ibodMsxelIm26Lw"
          activeFontFamily={props.font}
          limit={1000}
          variants={["regular", "italic", "600", "700", "700italic"]}
          onChange={(nextFont) => {
            props.setFont(nextFont.family);
            props.sendFontData();
          }}
        />
        {/* <p className="apply-font">The font will be applied to this text.</p> */}
      </div>
    </>
  );
};

export type InsertProps = {
  nav: string;
  setNav: (arg: string) => void;
};

const InsertDropDown: FunctionComponent<InsertProps> = (props) => {
  return (
    <>
      <div
        className="dropdown show"
        onClick={() => {
          if (props.nav === "insert") {
            props.setNav("");
          } else {
            props.setNav("insert");
          }
        }}
      >
        <a
          className="btn btn-secondary dropdown-toggle"
          href="#"
          role="button"
          id="dropdownMenuLink"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Insert
        </a>
        <div
          className={`dropdown-menu ${props.nav === "insert" && "show"}`}
          aria-labelledby="dropdownMenuLink"
        >
          <a className="dropdown-item" href="#">
            Row Above
          </a>
          <a className="dropdown-item" href="#">
            Row Below
          </a>
          <a className="dropdown-item" href="#">
            Column Left
          </a>
          <a className="dropdown-item" href="#">
            Column Right
          </a>
          <a className="dropdown-item" href="#">
            Function
          </a>
        </div>
      </div>
    </>
  );
};

export type DeleteProps = {
  nav: string;
  setNav: (arg: string) => void;
};

const DeleteDropDown: FunctionComponent<DeleteProps> = (props) => {
  return (
    <>
      <div
        className="dropdown show"
        onClick={() => {
          if (props.nav === "delete") {
            props.setNav("");
          } else {
            props.setNav("delete");
          }
        }}
      >
        <a
          className="btn btn-secondary dropdown-toggle"
          href="#"
          role="button"
          id="dropdownMenuLink"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Delete
        </a>
        <div
          className={`dropdown-menu ${props.nav === "delete" && "show"}`}
          aria-labelledby="dropdownMenuLink"
        >
          <a className="dropdown-item" href="#">
            Row Above
          </a>
          <a className="dropdown-item" href="#">
            Row Below
          </a>
          <a className="dropdown-item" href="#">
            Column Left
          </a>
          <a className="dropdown-item" href="#">
            Column Right
          </a>
        </div>
      </div>
    </>
  );
};

export default Edit;
