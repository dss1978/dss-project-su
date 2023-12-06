//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'
import React from "react";
import {Route, Routes } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";

import Home from './components/home/Home';
import Header from "./components/header/Header";
import GetAllCrypto from './components/getAllCrypto/GetAllCrypto'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import MyWallet from "./components/wallet/MyWallet";
import AuthGuard from "./components/auth/AuthGuard";
import Footer from "./components/footer/Footer";
import MyWalletItem from "./components/wallet/MyWalletItem";

function App() {
  return (
    <>
 <AuthProvider>
      <Header />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/CryptoInfo" element={<GetAllCrypto />} />
        <Route element={<AuthGuard />}>
           <Route path="/MyWallet" element={<MyWallet />} />
           <Route path="/MyWalletItem/:walletId" element={<MyWalletItem />} />
        </Route>
      </Routes>
           <div style={{height:'80px'}}></div> {/*Това е глупост, но решава проблем с изобрзяването на footer-a */}
      <Footer />
  </AuthProvider>
  </>
  )
}

export default App
