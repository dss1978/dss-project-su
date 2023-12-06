import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from "../firebase";

// Създаване на контекста
export const AuthContext = createContext();

// Създаване на компонента AuthProvider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Подписване за промените в аутентикацията
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    // Отписване при размонтиране на компонента
    return () => unsubscribe();
  }, []);

  // Функция за вход
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Функция за изход
  const logout = async () => {
    await signOut(auth);
  };

  // Предоставяне на стойности в контекста
  const contextValue = { user, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук за използване на стойностите от контекста
export const useAuth = () => {
  const authContext = useContext(AuthContext);

  // Проверка дали хука се използва в рамките на AuthProvider
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};