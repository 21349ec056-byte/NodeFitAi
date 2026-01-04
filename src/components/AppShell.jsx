import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, ClipboardList, Camera, History,
    Heart, Settings, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/tasks', label: 'Tasks', icon: ClipboardList },
    { path: '/app/food', label: 'Food Scanner', icon: Camera },
    { path: '/app/history', label: 'Food History', icon: History },
];

export default function AppShell() {
    const { profile, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-shell">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-dot" />
                        <span>nodeFit <span className="light">AI</span></span>
                    </div>
                    <button className="close-sidebar" onClick={closeSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {profile?.gender === 'Female' && (
                        <NavLink
                            to="/app/cycle"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <Heart size={20} />
                            <span>Menstrual Cycle</span>
                        </NavLink>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <NavLink
                        to="/app/settings"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </NavLink>

                    <button className="nav-item theme-toggle-nav" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                {/* Mobile header */}
                <header className="mobile-header">
                    <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="mobile-brand">
                        <div className="brand-dot" />
                        <span>nodeFit</span>
                    </div>
                    <div style={{ width: 40 }} />
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
