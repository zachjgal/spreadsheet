import React, { FunctionComponent, useState } from "react";
import FontPicker from "font-picker-react";

export type EditProps = {};
const Edit: FunctionComponent<EditProps> = (props) => {
  const [nav, setNav] = useState("");
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
      data: <FontsDropDown nav={nav} setNav={setNav} />,
    },
    {
      key: "size",
      data: <div className="col-xl-4">10</div>,
    },
    {
      key: "bold",
      data: <div className="col-xl-4">B</div>,
    },
    {
      key: "italic",
      data: <div className="col-xl-4">I</div>,
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
};

const FontsDropDown: FunctionComponent<FontsProps> = (props) => {
  const [font, setFont] = useState("Open Sans");
  return (
    <>
      <div>
        <FontPicker
          apiKey="AIzaSyAMo73RrEPCwV-zygT3ibodMsxelIm26Lw"
          activeFontFamily={font}
          limit={1000}
          variants={["regular", "italic", "600", "700", "700italic"]}
          onChange={(nextFont) => setFont(nextFont.family)}
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
