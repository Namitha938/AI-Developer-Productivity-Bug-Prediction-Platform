
import React, { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor, Range as MonacoRange } from 'monaco-editor';
import { useThemeStore } from '../../stores/themeStore';
import type { RiskyLine } from '../../types';
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

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const applyRiskDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) return;

    const lineCount = editor.getModel()?.getLineCount() ?? 0;

    const newDecorations = riskyLines
      .filter(
        (item) =>
          Number.isInteger(item.lineNumber) &&
          item.lineNumber >= 1 &&
          item.lineNumber <= lineCount,
      )
      .map((item) => {
        const isCritical = item.severity === 'critical';
        const isHigh = item.severity === 'high';

        const lineClass = isCritical
          ? 'risk-line-critical'
          : isHigh
            ? 'risk-line-high'
            : 'risk-line-medium';

        const glyphClass = isCritical
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

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations,
    );
  }, [riskyLines]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    applyRiskDecorations();
  };

  useEffect(() => {
    applyRiskDecorations();
  }, [applyRiskDecorations, code]);

useEffect(() => {
  return () => {
    const editor = editorRef.current;

    if (editor) {
      editor.deltaDecorations(decorationsRef.current, []);
    }

    decorationsRef.current = [];
    editorRef.current = null;
    monacoRef.current = null;
  };
}, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[#1e1e1e] shadow-sm">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme={isDark ? 'vs-dark' : 'light'}
        onChange={onChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading Monaco Editor...
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

export default CodeEditor;
