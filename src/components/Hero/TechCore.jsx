import React from "react";
import logo from "../Navbar/logo-03.png";

export default function TechCore() {
  return <div className="tech-core core-scroll-controlled" aria-hidden="true">
    <div className="core-stage">
      <div className="core-shadow" />
      <div className="core-assembly"><div className="core-cube">
        <div className="core-face core-front"><img src={logo} alt="" /></div>
        <div className="core-face core-back" />
        <div className="core-face core-right"><span className="core-circuit" /></div>
        <div className="core-face core-left" />
        <div className="core-face core-top"><span>TZ</span></div>
        <div className="core-face core-bottom" />
      </div></div>
    </div>
  </div>;
}
