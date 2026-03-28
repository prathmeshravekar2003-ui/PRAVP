import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, XCircle, Loader2, Terminal, Save, CloudCheck } from 'lucide-react';
import api from '../services/api';

const QuestionCard = ({ question, answer, onAnswer, onSaveNow }) => {
    const [executing, setExecuting] = useState(false);
    const [execResult, setExecResult] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const editorRef = useRef(null);
    const latestCodeRef = useRef(answer || question.templateCode);

    // Keep latestCodeRef in sync when answer changes from outside (e.g. navigating between questions)
    useEffect(() => {
        // Only update if the editor is not focused (user isn't typing)
        if (editorRef.current && !editorRef.current.hasTextFocus()) {
            const current = editorRef.current.getValue();
            const incoming = answer || question.templateCode;
            if (current !== incoming) {
                editorRef.current.setValue(incoming);
            }
        }
        latestCodeRef.current = answer || question.templateCode;
    }, [question.id]); // Reset when question changes

    const handleRunCode = async () => {
        setExecuting(true);
        setExecResult(null);
        try {
            // Support both isPublic (Jackson serialized) and public field names
            const allTestCases = question.testCases || [];
            const publicTestCases = allTestCases.filter(tc => tc.isPublic === true || tc['public'] === true);
            // Fall back to first test case if none marked public, or just run with no input
            const testCasesToRun = publicTestCases.length > 0 ? publicTestCases : (allTestCases.length > 0 ? [allTestCases[0]] : [{ input: '' }]);

            const results = [];
            for (const tc of testCasesToRun) {
                const currentCode = editorRef.current ? editorRef.current.getValue() : (answer || question.templateCode);
                const response = await api.post('/api/exam/run-code', {
                    code: currentCode,
                    input: tc.input || ''
                });
                const outputStr = String(response.output || '').trim();
                const expectedStr = String(tc.expectedOutput || '').trim();
                // Only compare if expectedOutput is defined and non-empty
                const hasExpected = expectedStr.length > 0;
                const isMatch = response.success && (!hasExpected || outputStr === expectedStr);
                results.push({
                    ...response,
                    testCase: tc,
                    hasExpected,
                    isMatch,
                    outputStr,
                    expectedStr
                });
            }

            setExecResult({ results, allPassed: results.every(r => r.isMatch) });
        } catch (err) {
            setExecResult({ results: [{ output: err.output || 'Error: ' + (err.message || 'Execution failed'), success: false, isMatch: false, hasExpected: false }], allPassed: false });
        } finally {
            setExecuting(false);
        }
    };

    const handleSaveCode = async () => {
        const currentCode = editorRef.current ? editorRef.current.getValue() : (answer || question.templateCode);
        setSaveStatus('saving');
        try {
            await onSaveNow(currentCode);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error('Save failed', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    if (question.type === 'CODE') {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">Coding Question</span>
                            <span className="text-xs font-medium text-gray-400">{question.marks} Marks</span>
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 leading-relaxed">
                        {question.questionText}
                    </h2>
                </div>

                {/* Main Content: Split Editor and Results */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Editor Side */}
                    <div className="flex-1 flex flex-col border-r border-gray-100 min-h-[400px]">
                        <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Terminal size={14} /> solution.c
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Save Code Button */}
                                {onSaveNow && (
                                    <button
                                        onClick={handleSaveCode}
                                        disabled={saveStatus === 'saving' || executing}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-60 ${
                                            saveStatus === 'saved'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : saveStatus === 'error'
                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                : saveStatus === 'saving'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                                        }`}
                                    >
                                        {saveStatus === 'saving' ? (
                                            <><Loader2 size={12} className="animate-spin" /> Saving...</>
                                        ) : saveStatus === 'saved' ? (
                                            <><CheckCircle2 size={12} /> Saved!</>
                                        ) : saveStatus === 'error' ? (
                                            <><XCircle size={12} /> Failed</>
                                        ) : (
                                            <><Save size={12} /> Save Code</>
                                        )}
                                    </button>
                                )}
                                {/* Run Code Button */}
                                <button
                                    onClick={handleRunCode}
                                    disabled={executing}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all disabled:bg-gray-400"
                                >
                                    {executing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                    Run Code (Alt + Enter)
                                </button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="c"
                                theme="vs-dark"
                                defaultValue={answer || question.templateCode}
                                onMount={(editor, monaco) => {
                                    editorRef.current = editor;
                                    latestCodeRef.current = editor.getValue();
                                    // Add Alt+Enter keyboard shortcut to run code
                                    editor.addCommand(
                                        monaco.KeyMod.Alt | monaco.KeyCode.Enter,
                                        () => handleRunCode()
                                    );
                                }}
                                onChange={(value) => {
                                    latestCodeRef.current = value;
                                    onAnswer(value);
                                }}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    formatOnPaste: true,
                                    formatOnType: true
                                }}
                            />
                        </div>
                    </div>

                    {/* Results / Test Cases Side */}
                    <div className="w-full lg:w-80 bg-gray-50 p-4 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Execution Results</h3>
                        
                        {execResult ? (
                            <div className="space-y-3">
                                {/* Summary badge */}
                                <div className={`flex items-center gap-2 p-3 rounded-xl border-2 ${execResult.allPassed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    {execResult.allPassed
                                        ? <CheckCircle2 size={18} className="text-green-600" />
                                        : <XCircle size={18} className="text-red-600" />}
                                    <span className={`text-sm font-bold ${execResult.allPassed ? 'text-green-700' : 'text-red-700'}`}>
                                        {execResult.allPassed
                                            ? `All ${execResult.results.length} Test Case(s) Passed`
                                            : `${execResult.results.filter(r => !r.isMatch).length} of ${execResult.results.length} Test Case(s) Failed`}
                                    </span>
                                </div>

                                {/* Per test case results */}
                                {execResult.results.map((res, idx) => (
                                    <div key={idx} className={`p-3 rounded-xl border ${res.isMatch ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            {res.isMatch
                                                ? <CheckCircle2 size={14} className="text-green-600" />
                                                : <XCircle size={14} className="text-red-600" />}
                                            <span className={`text-xs font-bold ${res.isMatch ? 'text-green-700' : 'text-red-700'}`}>
                                                Test Case {idx + 1}: {res.isMatch ? 'Passed' : (res.success ? 'Wrong Answer' : 'Error')}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Code Output</div>
                                                <pre className="p-2 bg-gray-900 text-gray-100 text-xs rounded-lg font-mono overflow-x-auto whitespace-pre-wrap">
                                                    {res.outputStr || res.output || 'No output'}
                                                </pre>
                                            </div>
                                            {res.hasExpected && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Expected Output</div>
                                                    <pre className={`p-2 text-xs rounded-lg font-mono overflow-x-auto whitespace-pre-wrap ${res.isMatch ? 'bg-green-900 text-green-100' : 'bg-gray-800 text-gray-100'}`}>
                                                        {res.expectedStr}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                                <Terminal size={32} className="text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Click "Run Code" to test your solution against public test cases.</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Public Test Cases</h3>
                            <div className="space-y-2">
                                {(() => {
                                    const allTc = question.testCases || [];
                                    const publicTc = allTc.filter(tc => tc.isPublic === true || tc['public'] === true);
                                    const displayTc = publicTc.length > 0 ? publicTc : allTc;
                                    return displayTc.map((tc, idx) => (
                                        <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl text-[10px]">
                                            <div className="font-bold text-gray-500 mb-1">Test Case {idx + 1}</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="opacity-50 mb-0.5">Input</div>
                                                    <div className="font-mono bg-gray-50 p-1 rounded">{tc.input || 'None'}</div>
                                                </div>
                                                <div>
                                                    <div className="opacity-50 mb-0.5">Expected</div>
                                                    <div className="font-mono bg-gray-50 p-1 rounded">{tc.expectedOutput || '—'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Multiple Choice</span>
                <span className="text-sm font-medium text-gray-400">{question.marks} Marks</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
                {question.questionText}
            </h2>

            <div className="space-y-4">
                {question.options?.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onAnswer(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${answer === index
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answer === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}>
                            {answer === index && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-base ${answer === index ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                            {option}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
