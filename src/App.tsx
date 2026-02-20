import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import OutputTerminal from './components/OutputTerminal';
import WebCompiler from './components/WebCompiler';
import SqlCompiler from './components/SqlCompiler';
import ReactCompiler from './components/ReactCompiler';
import type { OutputLine } from './components/OutputTerminal';
import type { TabId } from './components/Sidebar';
import './App.css';

// Declare standard Pyodide types implicitly
declare global {
  interface Window {
    loadPyodide: any;
  }
}

const DEFAULT_CODE: Record<TabId, string> = {
  python: `# Online Python compiler (interpreter) to run Python online.
# Write Python 3 code in this online editor and run it.
print("Try programMe")
print("Hello, World!")`,
  web: `<!-- Online HTML/CSS/JS compiler to run Web code online. -->
<!-- Write HTML, CSS, JS code in this online editor and run it. -->
<h1>Hello Web</h1>`,
  sql: `-- Online SQL compiler to run SQL online.
-- Write SQL queries in this online editor and run it.
SELECT 'Hello SQL';`,
  java: `// Online Java compiler to run Java online.
// Write Java code in this online editor and run it.
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}`,
  c: `// Online C compiler to run C online.
// Write C code in this online editor and run it.
#include <stdio.h>

int main() {
    printf("Hello C");
    return 0;
}`,
  cpp: `// Online C++ compiler to run C++ online.
// Write C++ code in this online editor and run it.
#include <iostream>

int main() {
    std::cout << "Hello C++";
    return 0;
}`,
  csharp: `// Online C# compiler to run C# online.
// Write C# code in this online editor and run it.
using System;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("Hello C#");
    }
}`,
  php: `<?php
// Online PHP compiler to run PHP online.
// Write PHP code in this online editor and run it.
echo "Hello PHP";
?>`,
  kotlin: `// Online Kotlin compiler to run Kotlin online.
// Write Kotlin code in this online editor and run it.
fun main() {
    println("Hello Kotlin")
}`,
  rust: `// Online Rust compiler to run Rust online.
// Write Rust code in this online editor and run it.
fn main() {
    println!("Hello Rust");
}`,
  r: `# Online R compiler to run R online.
# Write R code in this online editor and run it.
message <- "Hello R"
print(message)`,
  typescript: `// Online TypeScript compiler to run TypeScript online.
// Write TypeScript code in this online editor and run it.
const message: string = "Hello TypeScript";
console.log(message);`,
  oracle: `-- Online Oracle DB compiler to run Oracle SQL online.
-- Write Oracle SQL queries in this online editor and run it.
SELECT 'Hello Oracle' FROM DUAL;`,
  pypy: `# Online PyPy3 compiler (interpreter) to run Python online.
# Write PyPy3 code in this online editor and run it.
print("Hello PyPy3")`,
  go: `// Online Go compiler to run Go online.
// Write Go code in this online editor and run it.
package main
import "fmt"

func main() {
    fmt.Println("Hello Go")
}`,
  swift: `// Online Swift compiler to run Swift online.
// Write Swift code in this online editor and run it.
print("Hello Swift")`,
  dart: `// Online Dart compiler to run Dart online.
// Write Dart code in this online editor and run it.
void main() {
  print('Hello Dart');
}`,
  ruby: `# Online Ruby compiler to run Ruby online.
# Write Ruby code in this online editor and run it.
puts "Hello Ruby"`,
  react: `// Online React compiler to run React online.
// Write React code in this online editor and run it.
export default function App() {
  return <h1>Hello React</h1>;
}`,
  other: '// Coming soon'
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('python');
  const [code, setCode] = useState<string>(DEFAULT_CODE['python']);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoadingPyodide, setIsLoadingPyodide] = useState(true);
  const [mobileView, setMobileView] = useState<'editor' | 'output'>('editor');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Track window resizing for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update code when tab changes
  useEffect(() => {
    setCode(DEFAULT_CODE[activeTab]);
    setOutput([]); // Clear output on tab change
  }, [activeTab]);

  // Load Pyodide
  useEffect(() => {
    const loadEngine = async () => {
      try {
        if (!window.loadPyodide) {
          console.warn("Pyodide not found on window immediately");
          return;
        }

        const pyodideInstance = await window.loadPyodide({
          stdout: (text: string) => {
            setOutput((prev) => [...prev, { type: 'stdout', content: text }]);
          },
          stderr: (text: string) => {
            setOutput((prev) => [...prev, { type: 'stderr', content: text }]);
          }
        });
        setPyodide(pyodideInstance);
        setIsLoadingPyodide(false);
      } catch (e) {
        console.error("Failed to load Pyodide", e);
        setOutput([{ type: 'stderr', content: "Failed to load Python environment." }]);
      }
    };

    loadEngine();
  }, []);

  const handleRun = async () => {
    if (activeTab === 'python' || activeTab === 'pypy') {
      if (!pyodide) return;
      setIsRunning(true);
      setOutput([]);
      try {
        await pyodide.runPythonAsync(code);
      } catch (error: any) {
        setOutput((prev) => [...prev, { type: 'stderr', content: String(error) }]);
      } finally {
        setIsRunning(false);
      }
    } else {
      // Mock execution for compiled/other languages
      setIsRunning(true);
      setOutput([{ type: 'stdout', content: 'Compiling/Executing...' }]);

      setTimeout(() => {
        setIsRunning(false);
        const langName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

        let mockOutput = `Hello ${langName}\n[Program exited with code 0]`;

        if (activeTab === 'sql' || activeTab === 'oracle') {
          // Should not reach here because they use SqlCompiler component
          mockOutput = "Executed SQL.";
        } else if (activeTab === 'typescript') {
          mockOutput = "Hello TypeScript\n[Program exited with code 0]";
        }

        setOutput([{ type: 'stdout', content: mockOutput }]);
      }, 1000);
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  const getFilename = (tab: TabId) => {
    switch (tab) {
      case 'python': return 'main.py';
      case 'java': return 'Main.java';
      case 'c': return 'main.c';
      case 'cpp': return 'main.cpp';
      case 'csharp': return 'Program.cs';
      case 'php': return 'main.php';
      case 'kotlin': return 'Main.kt';
      case 'rust': return 'main.rs';
      case 'r': return 'main.r';
      case 'typescript': return 'main.ts';
      case 'oracle': return 'query.sql';
      case 'pypy': return 'main.py';
      case 'go': return 'main.go';
      case 'swift': return 'main.swift';
      case 'dart': return 'main.dart';
      case 'ruby': return 'main.rb';
      default: return 'file.txt';
    }
  };

  const getLanguage = (tab: TabId) => {
    switch (tab) {
      case 'python': return 'python';
      case 'pypy': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': return 'cpp';
      case 'sql': return 'sql';
      case 'oracle': return 'sql';
      case 'react': return 'javascript';
      case 'web': return 'html';
      case 'csharp': return 'csharp';
      case 'php': return 'php';
      case 'kotlin': return 'kotlin';
      case 'rust': return 'rust';
      case 'r': return 'r';
      case 'typescript': return 'typescript';
      case 'go': return 'go';
      case 'swift': return 'swift';
      case 'dart': return 'dart';
      case 'ruby': return 'ruby';
      default: return 'plaintext';
    }
  };

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Update theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'web':
        return <WebCompiler theme={theme} />;
      case 'sql':
      case 'oracle':
        return <SqlCompiler theme={theme} />;
      case 'react':
        return <ReactCompiler theme={theme} />;
      case 'other':
        return (
          <div className="placeholder-content">
            <h2>Other Compilers</h2>
            <p>More languages coming soon!</p>
          </div>
        );
      default:
        // Python, C, C++, Java use the standard editor interface
        return (
          <>
            <Navbar
              onRun={handleRun}
              isRunning={isRunning || ((activeTab === 'python' || activeTab === 'pypy') && isLoadingPyodide)}
              filename={getFilename(activeTab)}
              theme={theme}
              onThemeToggle={toggleTheme}
              onFullscreen={handleFullscreen}
              onShare={handleShare}
            />
            {isMobile && (
              <div className="mobile-view-toggle">
                <button
                  className={mobileView === 'editor' ? 'active' : ''}
                  onClick={() => setMobileView('editor')}
                >
                  ✏️ Editor
                </button>
                <button
                  className={mobileView === 'output' ? 'active' : ''}
                  onClick={() => setMobileView('output')}
                >
                  📋 Output
                </button>
              </div>
            )}
            <div className="editor-area">
              <div className={`editor-pane${isMobile && mobileView !== 'editor' ? ' mobile-hidden' : ''}`}>
                <CodeEditor
                  code={code}
                  language={getLanguage(activeTab)}
                  theme={theme}
                  onChange={(val) => setCode(val || '')}
                />
              </div>
              <div className={`output-pane${isMobile && mobileView !== 'output' ? ' mobile-hidden' : ''}`}>
                {(activeTab === 'python' || activeTab === 'pypy') && isLoadingPyodide && !pyodide && <div className="loading-overlay">Loading Python Environment...</div>}
                <OutputTerminal output={output} onClear={handleClear} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
