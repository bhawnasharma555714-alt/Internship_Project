import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IdeaBuilderModal } from '../Components/IdeaBuilderModal';

export const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [membersRequired, setMembersRequired] = useState(2);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImportBlueprint = (blueprint: any[]) => {
    setAiAnalysis((prev: any) => ({
      ...(prev || {}),
      taskBlueprint: blueprint
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/projects',
        {
          title,
          desc,
          requiredSkills,
          membersRequired: Number(membersRequired),
          aiAnalysis
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/my-projects');
    } catch (err: any) {
      console.error("Create project error:", err);
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Create New Project</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-medium text-sm flex items-center gap-2"
        >
          ✨ AI Idea Builder & Feasibility Check
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            placeholder="e.g., AI Code Reviewer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
            rows={4}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Describe your project goals..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Required Skills / Tech Stack</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
              placeholder="e.g., React, Node.js, MongoDB"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Members Required</label>
            <input
              type="number"
              value={membersRequired}
              onChange={(e) => setMembersRequired(Number(e.target.value))}
              min={1}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {aiAnalysis?.taskBlueprint && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-bold text-green-800">✅ AI Task Blueprint Attached ({aiAnalysis.taskBlueprint.length} tasks)</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 font-medium"
          >
            {loading ? 'Publishing...' : 'Publish Project'}
          </button>
        </div>
      </form>

      <IdeaBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportBlueprint={handleImportBlueprint}
      />
    </div>
  );
};

export default CreateProject;