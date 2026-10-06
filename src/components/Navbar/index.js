import React, { useState, useEffect } from "react";
// 1. IMPORT useLocation
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthManager";
import { ImCross } from "react-icons/im";
import chota_logo from "./logo-03.png";
import './index.css';

const oldNavigation = [
  { name: "HOME", link: "/" },
  { name: "EVENTS", link: "/events" },
  { name: "PAST EVENTS", link: "/past-events" },
  // If you want the dropdown to appear, add:
  // { name: "REVENTS", link: "#" } 
];

const commonRightNavigation = [
   { name: "GALLERY", link: "/gallery" },
   { name: "TEAM", link: "/team" },
];
const guestNavigation = [
  { name: "LOGIN", link: "/login" },
   { name: "REGISTER", link: "/auth/register" },
 ];
const memberNavigation = [{ name: "LOGOUT", link: "/login", action: "logout" }];

const dropList = [
  { name: "List1", link: "/l1" },
  { name: "List2", link: "/l2" },
  { name: "List3", link: "/l3" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 725);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const rightNavigation = [
    ...commonRightNavigation,
    ...(user ? memberNavigation : guestNavigation),
  ];

  // 2. GET CURRENT LOCATION
  const location = useLocation();
  const isRegisterPage = ['/auth/register', '/register', '/login'].includes(location.pathname);

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
  const renderLink = (menuItem) =>
    menuItem.action === "logout" ? (
      <Link to={menuItem.link} onClick={(e) => { e.preventDefault(); logout(); }}>
        {menuItem.name}
      </Link>
    ) : (
      <NavLink to={menuItem.link} onClick={closeMenu} end={menuItem.link === "/"}>
        {menuItem.name}
      </NavLink>
    );

  // 3. (FIX) REMOVED 'e' and 'e.preventDefault()'
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const listItems = navigation.map((menuItem, index) => (
    <li key={index}>
      {menuItem.name === "REVENTS" ? (
        <div className="dropdown2-trigger">
          {/* 4. (FIX) CHANGED <a> to <button>
            - Added type="button"
            - Added className="nav-button-link" for styling
          */}
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
    /* Fixed wrapper — always on top of every page */
    <div className="navbar-wrapper">
      {/* Solid background strip — always present now */}
      <div className="navbar-background" />

      {/* Logo */}
      <div className="logo">
        <Link to="./" onClick={closeMenu}>
          <img src={chota_logo} alt="logo1" />
        </Link>
      </div>

      {/* Left / hamburger nav */}
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

      {/* Right side navbar only appears on larger screens */}
      {!isMobileView && (
        <nav className="right-nav">
          <ul>{rightNavItems}</ul>
        </nav>
      )}
    </div>
  );
}