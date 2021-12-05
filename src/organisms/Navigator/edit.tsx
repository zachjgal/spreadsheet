import React, { FunctionComponent, useState, useEffect } from "react";
import FontPicker from "font-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  editFonts,
  editItalic,
  editSize,
  editBold,
  editColor,
} from "../../redux/features/sheetState";
export type EditProps = {
  x: number;
  y: number;
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

const Edit: FunctionComponent<EditProps> = (props) => {
  const dispatch = useDispatch();
  const [nav, setNav] = useState("");

  const fontInfo = useSelector(
    (state: RootState) => state.data.fontSheetData[props.x][props.y]
  );

  const changeFontInfo = (arg: string, payload?: any) => {
    if (arg === "bold") {
      const changeBold: TypeEdit = {
        coords: [props.x, props.y],
        data: !fontInfo.bold,
      };
      dispatch(editBold(changeBold));
    } else if (arg === "italic") {
      const changeItalic: TypeEdit = {
        coords: [props.x, props.y],
        data: !fontInfo.italic,
      };
      dispatch(editItalic(changeItalic));
    } else if (arg === "size") {
      const changeSize: SizeEdit = {
        coords: [props.x, props.y],
        data: payload as number,
      };
      dispatch(editSize(changeSize));
    } else if (arg == "color") {
      const changeColor: FontEdit = {
        coords: [props.x, props.y],
        data: payload as string,
      };
      dispatch(editColor(changeColor));
    } else {
      const changeFont: FontEdit = {
        coords: [props.x, props.y],
        data: payload as string,
      };
      dispatch(editFonts(changeFont));
    }
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
          nav={nav}
          setNav={setNav}
          changeFontInfo={changeFontInfo}
          font={fontInfo.font}
        />
      ),
    },
    {
      key: "size",
      data: (
        <FontSizeDropDown
          nav={nav}
          setNav={setNav}
          changeFontInfo={changeFontInfo}
          fontSize={fontInfo.size}
        />
      ),
    },
    {
      key: "bold",
      data: (
        <div
          className=" font-nav fw-bold"
          onClick={() => {
            changeFontInfo("bold");
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
            changeFontInfo("italic");
          }}
        >
          I
        </div>
      ),
    },
    {
      key: "color",
      data: (
        <>
          <input
            type="color"
            id="favcolor"
            name="favcolor"
            value={fontInfo.color}
            onChange={(e) => {
              changeFontInfo("color", e.currentTarget.value);
            }}
          />
        </>
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
  setNav: (arg: string) => void;
  changeFontInfo: (arg: string, payload?: any) => void;
  font: string;
};

const FontsDropDown: FunctionComponent<FontsProps> = (props) => {
  return (
    <>
      <div
        onClick={() => {
          if (props.nav === "font") {
            props.setNav("");
          } else {
            props.setNav("font");
          }
        }}
      >
        <FontPicker
          apiKey="AIzaSyAMo73RrEPCwV-zygT3ibodMsxelIm26Lw"
          activeFontFamily={props.font}
          limit={1000}
          variants={["regular", "italic", "600", "700", "700italic"]}
          onChange={(nextFont) => {
            props.changeFontInfo("font", nextFont.family);
          }}
        />
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

export type FontSizeProps = {
  nav: string;
  setNav: (arg: string) => void;
  changeFontInfo: (arg: string, payload?: any) => void;
  fontSize: number;
};

const FontSizeDropDown: FunctionComponent<FontSizeProps> = (props) => {
  const range = (min: number, max: number) =>
    Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const sizeArray = range(10, 30);

  return (
    <>
      <div
        className="dropdown show"
        onClick={() => {
          if (props.nav === "fontsize") {
            props.setNav("");
          } else {
            props.setNav("fontsize");
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
          {props.fontSize}
        </a>
        <div
          className={`dropdown-menu ${props.nav === "fontsize" && "show"}`}
          aria-labelledby="dropdownMenuLink"
        >
          {sizeArray.map((elem) => {
            return (
              <a
                className="dropdown-item"
                href="#"
                onClick={() => {
                  props.changeFontInfo("size", elem);
                }}
              >
                {elem}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Edit;
