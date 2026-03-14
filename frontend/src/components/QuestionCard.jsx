import React from 'react';

const QuestionCard = ({ question, selectedOption, onSelect }) => {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Question</span>
                <span className="text-sm font-medium text-gray-400">{question.marks} Marks</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
                {question.questionText}
            </h2>

            <div className="space-y-4">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedOption === index
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedOption === index ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}>
                            {selectedOption === index && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-base ${selectedOption === index ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                            {option}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
