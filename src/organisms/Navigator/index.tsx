import React, { FunctionComponent } from "react";
import "./navigator.css";
import File from "./file";
import Edit from "./edit";
import Setting from "./setting";

export type NavigatorProps = {
  navigator: string;
  x: number,
  y: number,
  setNavigator: (arg: string) => void;
};

const Navigator: FunctionComponent<NavigatorProps> = (props) => {
  const navigationBar = [
    { key: "file", component: <File /> },
    { key: "edit", component: <Edit x={props.x} y={props.y} /> },
    { key: "settings", component: <Setting /> },
  ];
  return (
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
      <ul className="d-flex mb-0 ml-0 px-0">
        {navigationBar.map((nav, navIdx) => {
          return (
            <li className={props.navigator === nav.key ? "d-block" : "d-none"}>
              {nav.component}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navigator;
