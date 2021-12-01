import React, { FunctionComponent } from "react";
import "./navigator.css";
import File from "./file";
import Edit from "./edit";
import Setting from "./setting";

export type NavigatorProps = {
  navigator: string;
  setNavigator: (arg: string) => void;
};

const Navigator: FunctionComponent<NavigatorProps> = (props) => {
  const navigationBar = [
    { key: "file", component: <File /> },
    { key: "edit", component: <Edit /> },
    { key: "settings", component: <Setting /> },
  ];
  return (
    <div>
      <div>
        <ul className="nav nav-tabs">
          {navigationBar.map((nav, navIdx) => {
            return (
              <li
                className="nav-item cursor-pointer"
                onClick={() => {
                  props.setNavigator(nav.key);
                }}
              >
                <div
                  className={`nav-link ${
                    props.navigator == nav.key && "active"
                  } text-capitalize `}
                >
                  {" "}
                  {nav.key}
                </div>
              </li>
            );
          })}
        </ul>
        <ul className="d-flex">
          {navigationBar.map((nav, navIdx) => {
            return (
              <li
                className={props.navigator === nav.key ? "d-block" : "d-none"}
              >
                {nav.component}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Navigator;
