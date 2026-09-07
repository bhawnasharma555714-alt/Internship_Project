// Components/SkillBreakdownModal.tsx
import React from 'react';
import { X, GitCommit, FileCode, ShieldCheck, Cpu } from 'lucide-react';

interface Source {
  repoName: string;
  filePath: string;
  matchedBy: string;
}

interface EvidencedSkill {
  skillName: string;
  confidenceScore: number;
  sources: Source[];
}

interface SkillBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillData: EvidencedSkill | null;
}

export const SkillBreakdownModal: React.FC<SkillBreakdownModalProps> = ({
  isOpen,
  onClose,
  skillData,
}) => {
  if (!isOpen || !skillData) return null;

  const getMatchedByLabel = (type: string) => {
    switch (type) {
      case 'package_dep':
      case 'python_dep':
        return 'Declared Dependency';
      case 'import_regex':
        return 'Direct File Import';
      case 'inline_code_match':
        return 'Code Pattern Match';
      case 'gemini_ai_resolver':
        return 'AI Package Resolution';
      case 'extension':
        return 'File Extension Match';
      default:
        return 'Commit Evidence';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-sky-400" />
            <h3 className="text-xl font-bold">{skillData.skillName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Progress Meter */}
        <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Confidence Score
            </span>
            <span className="text-sky-400 font-mono text-base">{skillData.confidenceScore}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                skillData.confidenceScore > 75
                  ? 'bg-emerald-500'
                  : skillData.confidenceScore > 40
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${skillData.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Sources Breakdown List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-slate-400" />
            Detected Evidence Sources ({skillData.sources.length})
          </h4>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {skillData.sources.map((src, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs space-y-1"
              >
                <div className="flex justify-between items-center text-slate-200 font-mono">
                  <span className="font-semibold text-sky-300">{src.repoName}</span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                    {getMatchedByLabel(src.matchedBy)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  <span className="truncate">{src.filePath}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};