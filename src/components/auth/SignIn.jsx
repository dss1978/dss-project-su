import React from "react";
//import { Route, Link, Routes } from 'react-router-dom';

import { useState } from "react";
import { useNavigate } from 'react-router-dom';


import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase.js";

//import SignUp from './SignUp'


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const signIn = async (e) => {
    e.preventDefault();
    // Валидация на полетата, дали са празни
    if (!email || !password) {
      setError("Моля, попълнете всички полета.");
      return;
    }
    
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      // След успешен вход се пренасочва страницата към /
      navigate('/Home');

    } catch (error) {
      setError('log in failed');
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in</h2>
  </div>

  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
  {error && <div style={{ color: 'red' }}>{error}</div>}
    <form className="space-y-6" action="#" onSubmit={signIn}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
        <div className="mt-2">
          <input 
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
        <div className="mt-2">
          <input 
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <button 
        type="submit" 
        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >Sign in</button>
      </div>
      
    </form>

   {/* <p className="mt-10 text-center text-sm text-gray-500">
      <Link to="/signup">Регистрация</Link>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </p>
  */}
  </div>
</div>

   
  );
};

export default SignIn;