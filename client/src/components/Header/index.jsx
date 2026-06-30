import { Link } from 'react-router-dom';
import DropdownUser from './DropdownUser';
import LogoIcon from '../../images/logo/logo-icon.svg';
import DarkModeSwitcher from './DarkModeSwitcher';

const Header = (props) => {
  return (
    <header className="sticky-top bg-white shadow-sm" style={{ zIndex: 1038 }}>
      <div className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3">

        <div className="d-flex align-items-center gap-2">

          {/* hamburger — hidden on large screens where sidebar is always visible */}
          <button
            aria-controls="sidebar"
            aria-label="Toggle sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="btn btn-light btn-sm p-2 border d-lg-none"
            style={{ lineHeight: 1 }}
          >
            {/* 3 lines = menu closed, X = menu open */}
            {!props.sidebarOpen ? (
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M0 1H20M0 8H20M0 15H20" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 1L17 17M17 1L1 17" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* logo only on small screens — sidebar already shows branding on large */}
          <Link to="/" className="d-flex d-lg-none flex-shrink-0 text-decoration-none">
            <img src={LogoIcon} alt="Logo" height="30" />
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <ul className="list-unstyled mb-0 d-flex align-items-center">
            <DarkModeSwitcher />
          </ul>
          <DropdownUser />
        </div>

      </div>
    </header>
  );
};

export default Header;