import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserDatails from '../auth/UserDetails';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // state за управление на видимостта на мобилното меню

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen); // Обръщаме текущото състояние
  };
  
// Функцията isActiveLink се използва за определяне дали даден линк трябва да бъде отбелязан като активен в навигационното меню.
// Ако предоставеният 'path' е root path ("/"), се проверява дали текущата страница съвпада точно с този път.
// В противен случай, когато 'path' не е root path, се проверява дали текущият път включва 'path',
// което означава, че сме на текущата страница или подстраница.
  const isActiveLink = (path) => (path === '/' ? location.pathname === path : location.pathname.includes(path));
  const mobileLinkClasses = `text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium`;

  return (
    <>
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu} // Добавяме onClick handler, който ще показва/скрива мобилното меню
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img className="h-8 w-auto" src="logo.png" alt="Crypto project" />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <Link
                    to="/Home"
                    className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${isActiveLink('/Home') ? 'bg-gray-700' : ''}`}
                    aria-current="page"
                  >
                    Home
                  </Link>
                  <Link
                    to="/CryptoInfo"
                    className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${isActiveLink('/CryptoInfo') ? 'bg-gray-700' : ''}`}
                    aria-current="page"
                  >
                    Crypto Market
                  </Link>
                  {user ? (
                    <Link to="/MyWallet" className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${isActiveLink('/MyWallet') ? 'bg-gray-700' : ''}`}>
                      My Wallet
                    </Link>
                  ) : (
                    <>
                      <Link to="/SignIn" className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${isActiveLink('/SignIn') ? 'bg-gray-700' : ''}`}>
                        Sign in
                      </Link>
                      <Link to="/SignUp" className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${isActiveLink('/SignUp') ? 'bg-gray-700' : ''}`}>
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <div className="relative ml-3">
                <UserDatails />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобилно меню */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-800`} id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <Link
          to="/Home"
          className={`${mobileLinkClasses} ${isActiveLink('/Home') ? 'bg-gray-700' : ''}`}
          aria-current="page"
        >
          Home
        </Link>
        <Link
          to="/CryptoInfo"
          className={`${mobileLinkClasses} ${isActiveLink('/CryptoInfo') ? 'bg-gray-700' : ''}`}
          aria-current="page"
        >
          Crypto Market
        </Link>
        {user ? (
          <Link
            to="/MyWallet"
            className={`${mobileLinkClasses} ${isActiveLink('/MyWallet') ? 'bg-gray-700' : ''}`}
          >
            My Wallet
          </Link>
        ) : (
          <>
            <Link
              to="/SignIn"
              className={`${mobileLinkClasses} ${isActiveLink('/SignIn') ? 'bg-gray-700' : ''}`}
            >
              Sign in
            </Link>
            <Link
              to="/SignUp"
              className={`${mobileLinkClasses} ${isActiveLink('/SignUp') ? 'bg-gray-700' : ''}`}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
    </>
  );
}
