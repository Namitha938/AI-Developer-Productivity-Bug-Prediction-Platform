import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useThemeStore } from '../../stores/themeStore';
import { RiskyLine } from '../../types';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  riskyLines?: RiskyLine[];
  onLineClick?: (line: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  riskyLines = [],
}) => {
  const { isDark } = useThemeStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    applyRiskDecorations();
  };

  const applyRiskDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const newDecorations = riskyLines.map((item) => {
      const isCrit = item.severity === 'critical';
      const isHigh = item.severity === 'high';

      const lineClass = isCrit
        ? 'risk-line-critical'
        : isHigh
        ? 'risk-line-high'
        : 'risk-line-medium';

      const glyphClass = isCrit
        ? 'risk-glyph-critical'
        : 'risk-glyph-high';

      return {
        range: new monaco.Range(item.lineNumber, 1, item.lineNumber, 1),
        options: {
          isWholeLine: true,
          className: lineClass,
          glyphMarginClassName: glyphClass,
          glyphMarginHoverMessage: {
            value: `**[${item.severity.toUpperCase()} RISK]** ${item.bugType}\n\n${item.description}\n\n*Confidence: ${(item.confidence * 100).toFixed(0)}%*`,
          },
          hoverMessage: {
            value: `⚠️ **Bug Alert (${item.severity.toUpperCase()})**: ${item.description}`,
          },
        },
      };
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  useEffect(() => {
    applyRiskDecorations();
  }, [riskyLines, code]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border bg-[#1e1e1e] shadow-sm">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme={isDark ? 'vs-dark' : 'light'}
        onChange={onChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading Monaco Editor...
          </div>
        }
        options={{
          minimap: { enabled: true, maxColumn: 80 },
          fontSize: 13,
          fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
          lineNumbers: 'on',
          glyphMargin: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
};

