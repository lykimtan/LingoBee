"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';

interface CurriculumModule {
  title: string;
  lessons: string[];
}

export const CourseCurriculum = ({ modules }: { modules: CurriculumModule[] }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-white text-left">{module.title}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isOpen && (
              <div className="p-4 bg-transparent border-t border-white/10">
                <ul className="space-y-3">
                  {module.lessons.map((lesson, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <PlayCircle className="w-5 h-5 text-[#1c7c78] mt-0.5 shrink-0" />
                      <span className="text-gray-300">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
