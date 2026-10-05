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
  { name: "REGISTER", link: "/auth/register" },
];

const rightNavigation = [...commonRightNavigation, ...guestNavigation];

const dropList = [
  { name: "List1", link: "/l1" },
  { name: "List2", link: "/l2" },
  { name: "List3", link: "/l3" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 725);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const isRegisterPage = ['/auth/register', '/register'].includes(location.pathname);

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
    setShowDropdown(false);
  };

  const renderLink = (menuItem) => (
    <NavLink to={menuItem.link} onClick={closeMenu} end={menuItem.link === "/"}>
      {menuItem.name}
    </NavLink>
  );

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const listItems = navigation.map((menuItem, index) => (
    <li key={index}>
      {menuItem.name === "REVENTS" ? (
        <div className="dropdown2-trigger">
          <button
            onClick={toggleDropdown}
            className="nav-button-link"
            type="button"
          >
            {menuItem.name}
          </button>
          {showDropdown && (
            <ul className="dropdown2">
              {dropList.map((dropItem, idx) => (
                <li key={idx}>
                  <NavLink to={dropItem.link} onClick={closeMenu}>
                    {dropItem.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        renderLink(menuItem)
      )}
    </li>
  ));

  const rightNavItems = rightNavigation.map((menuItem, index) => (
    <li key={index}>
      {renderLink(menuItem)}
    </li>
  ));

  return (
    <>
      {!menuOpen && isRegisterPage && <div className="navbar-background"></div>}

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