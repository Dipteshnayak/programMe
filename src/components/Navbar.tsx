import React from 'react';
import { Play, Share2, Sun, Moon, Maximize2 } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
    onRun: () => void;
    isRunning: boolean;
    filename: string;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    onFullscreen: () => void;
    onShare: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
    onRun,
    isRunning,
    filename,
    theme,
    onThemeToggle,
    onFullscreen,
    onShare
}) => {
    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="file-name">{filename}</span>
            </div>

            <div className="navbar-right">
                <button className="icon-btn" onClick={onFullscreen} title="Fullscreen">
                    <Maximize2 size={18} />
                </button>
                <button className="icon-btn" onClick={onThemeToggle} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="share-btn" onClick={onShare}>
                    <Share2 size={16} />
                    <span className="share-btn-text">Share</span>
                </button>
                <button className="run-btn" onClick={onRun} disabled={isRunning}>
                    {isRunning ? 'Running...' : (
                        <>
                            Run <Play size={16} style={{ marginLeft: '6px' }} fill="white" />
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Navbar;
