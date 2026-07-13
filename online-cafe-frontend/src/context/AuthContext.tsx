import { createContext, useContext, useEffect, useState } from "react";

type User = {
    name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => boolean;
    register: (name: string, email: string, password: string) => boolean;
    logout: () => void;
    isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("loggedInUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("loggedInUser");
        }
    }, [user]);

    const register = (name: string, email: string, password: string) => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        const exists = users.some((u: any) => u.email === email);

        if (exists) {
            return false;
        }

        const newUser = { name, email, password };
        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));
        setUser({ name, email });

        return true;
    };

    const login = (email: string, password: string) => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        const foundUser = users.find(
            (u: any) => u.email === email && u.password === password
        );

        if (!foundUser) {
            return false;
        }

        setUser({
            name: foundUser.name,
            email: foundUser.email,
        });

        return true;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isLoggedIn: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}