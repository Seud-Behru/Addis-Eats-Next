import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

// Only ever imported by components/Providers.jsx, so it runs in the browser.
function ThemeProvider({ children }) {
    // The server cannot see localStorage or the OS setting, so the first
    // render is always "light". The real choice is loaded just after mount.
    const [theme, setTheme] = useState("light");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("addis-eats-theme");

        if (savedTheme === "dark" || savedTheme === "light") {
            setTheme(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }

        setReady(true);
    }, []);

    useEffect(() => {
        // Do not overwrite the saved choice before it has been read.
        if (!ready) return;

        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("addis-eats-theme", theme);
    }, [theme, ready]);

    function toggleTheme() {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
