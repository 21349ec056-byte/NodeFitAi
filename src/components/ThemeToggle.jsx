import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className={`toggle-track ${theme}`}>
                <div className="toggle-thumb">
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                </div>
            </div>
        </button>
    );
}
