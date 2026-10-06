import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ImCross } from "react-icons/im";
import chota_logo from "./logo-03.png";
import './index.css';

const oldNavigation = [
  { name: "HOME", link: "/" },
  { name: "EVENTS", link: "/events" },
  { name: "PAST EVENTS", link: "/past-events" },
];

const commonRightNavigation = [
  { name: "GALLERY", link: "/gallery" },
  { name: "TEAM", link: "/team" },
];

const guestNavigation = [
  { name: "REGISTER", link: "/register" },
];

const rightNavigation = [...commonRightNavigation, ...guestNavigation];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 725);

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 725);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navigation = isMobileView ? [...oldNavigation, ...rightNavigation] : oldNavigation;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const renderLink = (menuItem) => (
    <NavLink to={menuItem.link} onClick={closeMenu} end={menuItem.link === "/"}>
      {menuItem.name}
    </NavLink>
  );

  const listItems = navigation.map((menuItem, index) => (
    <li key={index}>
      {renderLink(menuItem)}
    </li>
  ));

  const rightNavItems = rightNavigation.map((menuItem, index) => (
    <li key={index}>
      {renderLink(menuItem)}
    </li>
  ));

  return (
    <>
      <div className="navbar-background"></div>

      {!menuOpen ? (
        <div className="logo">
          <Link to="./" onClick={closeMenu}>
            <img src={chota_logo} alt="logo1" />
          </Link>
        </div>
      ) : null}

      <nav className={menuOpen ? 'menu-open' : 'menu-closed'}>
        <div
          className="menu"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          {menuOpen ? (
            <ImCross className='cross' />
          ) : (
            <>
              <span className={menuOpen ? '' : 'ham'}></span>
              <span className={menuOpen ? '' : 'ham'}></span>
              <span className={menuOpen ? '' : 'ham'}></span>
            </>
          )}
        </div>
        <ul className={menuOpen ? "open" : ""}>{listItems}</ul>
      </nav>

      {!isMobileView && (
        <nav className="right-nav">
          <ul>{rightNavItems}</ul>
        </nav>
      )}
    </>
  );
}
