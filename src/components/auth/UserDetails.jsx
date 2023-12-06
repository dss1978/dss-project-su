import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from './UserDetails.module.css';

const UserDatails = () => {
    const { user, logout } = useAuth();

    useEffect(() => {
        // Можете да използвате user, ако е нужно
        console.log(user);
    }, [user]);

    return (
        <div className={styles.loginnameBlock}>
            {user ? 
                <>
                    <div className={styles.loginname}>User:<br />{`${user.email}`}</div>
                    <div className={styles.signout}>
                        <button onClick={logout} className="p-2 text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full">
                            Log out
                        </button>
                    </div>
                </>
                : 
                <div className={styles.loginname}>Not logged in</div>
            }
        </div>
    );
}

export default UserDatails;