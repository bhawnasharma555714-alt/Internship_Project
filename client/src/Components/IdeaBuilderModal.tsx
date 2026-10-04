import React, { useState } from 'react';
import axios from 'axios';

interface Task {
  taskName: string;
  description: string;
}

interface FeasibilityResult {
  compatibilityAnalysis: string;
  difficultyScore: number;
  architecturalBottlenecks: string[];
  taskBlueprint: Task[];
}

interface IdeaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBlueprint?: (blueprint: Task[]) => void;
}

export const IdeaBuilderModal: React.FC<IdeaBuilderModalProps> = ({ isOpen, onClose, onImportBlueprint }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [techStack, setTechStack] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<FeasibilityResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description || !techStack) {
      setError('Description and tech stack are required.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.post(
        'http://localhost:3000/api/projects/feasibility-check',
        { title, desc: description, techStack },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data.data);
    } catch (err: unknown) {
      console.error('Feasibility check failed:', err);
      if (axios.isAxiosError(err)) {
        const serverError = err.response?.data as { error?: string };
        setError(serverError?.error || 'Failed to analyze project idea. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">🚀 AI Pre-Idea Feasibility Check</h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI Code Reviewer"
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project Description *</label>
              <textarea 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your project does..."
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target Tech Stack / Skills *</label>
              <input 
                type="text" 
                value={techStack} 
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB, Gemini API"
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing Idea...' : 'Check Feasibility'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Difficulty Score</span>
                <p className="text-2xl font-bold text-indigo-900">{result.difficultyScore} / 10</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Tech Compatibility</span>
                <p className="text-sm text-indigo-800 mt-1">{result.compatibilityAnalysis}</p>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">⚠️ Potential Bottlenecks</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                {result.architecturalBottlenecks.map((bottleneck, index) => (
                  <li key={index}>{bottleneck}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">📋 Suggested Task Breakdown</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {result.taskBlueprint.map((task, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-sm font-bold text-gray-800">{task.taskName}</h4>
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-indigo-600 text-sm hover:underline font-medium"
              >
                ← Analyze Another Idea
              </button>
              <div className="space-x-3">
                {onImportBlueprint && (
                  <button
                    type="button"
                    onClick={() => {
                      onImportBlueprint(result.taskBlueprint);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Import Task Blueprint
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};