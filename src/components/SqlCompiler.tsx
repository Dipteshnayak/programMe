import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { Play, Trash2 } from 'lucide-react';
import './SqlCompiler.css';

declare global {
    interface Window {
        initSqlJs: any;
    }
}

const DEFAULT_SQL = `
-- Create a table
CREATE TABLE users (id INT, name TEXT, age INT);

-- Insert some data
INSERT INTO users VALUES (1, 'Alice', 30);
INSERT INTO users VALUES (2, 'Bob', 25);
INSERT INTO users VALUES (3, 'Charlie', 35);

-- Select data
SELECT * FROM users;
`;

const SqlCompiler: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
    const [code, setCode] = useState(DEFAULT_SQL);
    const [db, setDb] = useState<any>(null);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSqlJs = async () => {
            try {
                if (!window.initSqlJs) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
                    script.async = true;
                    script.onload = async () => {
                        const SQL = await window.initSqlJs({
                            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                        });
                        setDb(new SQL.Database());
                        setIsLoading(false);
                    };
                    document.body.appendChild(script);
                } else {
                    const SQL = await window.initSqlJs({
                        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                    });
                    setDb(new SQL.Database());
                    setIsLoading(false);
                }
            } catch (err) {
                setError("Failed to load SQL engine");
                setIsLoading(false);
            }
        };

        loadSqlJs();
    }, []);

    const runQuery = () => {
        if (!db) return;
        setError(null);
        setResults([]);

        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const resultsPane = document.querySelector('.sql-results-pane');
                if (resultsPane) {
                    resultsPane.scrollIntoView({ behavior: 'smooth' });
                }
            }, 50);
        }

        try {
            const res = db.exec(code);
            setResults(res);
            if (res.length === 0) {
                // Check if it was a modification query that doesn't return rows
                // Logic to inform user or show generic success could be added
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const resetDb = () => {
        if (db) {
            db.close();
            // Re-init logic or just reload page, but simpler to just empty the current db if possible.
            // sql.js db is in memory. Re-creating:
            const reInit = async () => {
                setIsLoading(true);
                // Assuming SQL/initSqlJs is available from before
                const SQL = await window.initSqlJs({
                    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                });
                setDb(new SQL.Database());
                setIsLoading(false);
                setCode(DEFAULT_SQL);
                setResults([]);
                setError(null);
            };
            reInit();
        }
    }

    return (
        <div className="sql-compiler-container">
            <div className="sql-editor-pane">
                <div className="sql-toolbar">
                    <span className="toolbar-title">SQL Query</span>
                    <div className="toolbar-actions">
                        <button className="icon-btn" onClick={resetDb} title="Reset Database">
                            <Trash2 size={16} />
                        </button>
                        <button className="run-btn sm" onClick={runQuery} disabled={isLoading || !db}>
                            <Play size={16} style={{ marginRight: '6px' }} width="16" /> Run
                        </button>
                    </div>
                </div>
                <div className="editor-wrapper">
                    <CodeEditor code={code} language="sql" theme={theme} onChange={(val) => setCode(val || '')} />
                </div>
            </div>
            <div className="sql-results-pane">
                <div className="results-header">Results</div>
                <div className="results-content">
                    {isLoading && <div className="loading-msg">Loading SQL Engine...</div>}
                    {error && <div className="error-msg">{error}</div>}
                    {!isLoading && !error && results.length === 0 && (
                        <div className="empty-msg">Run a query to see results. Queries executed successfully but returning no data (INSERT, CREATE) won't show a table.</div>
                    )}
                    {results.map((res, i) => (
                        <div key={i} className="result-table-wrapper">
                            <table className="result-table">
                                <thead>
                                    <tr>
                                        {res.columns.map((col: string, j: number) => (
                                            <th key={j}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {res.values.map((row: any[], j: number) => (
                                        <tr key={j}>
                                            {row.map((val: any, k: number) => (
                                                <td key={k}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SqlCompiler;
