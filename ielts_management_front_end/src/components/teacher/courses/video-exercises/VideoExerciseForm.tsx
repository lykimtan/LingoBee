"use client";

import { useState, type FormEvent } from "react";

interface VideoExerciseFormProps {
  videoTitle?: string;
  isDisabled?: boolean;
}

const SKILL_OPTIONS = [
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
];

const QUESTION_TYPES = [
  { value: "multipleChoice", label: "Multiple choice" },
  { value: "fillBlank", label: "Fill in the blank" },
  { value: "essay", label: "Essay" },
  { value: "speaking", label: "Speaking" },
];

export default function VideoExerciseForm({
  videoTitle,
  isDisabled = false,
}: VideoExerciseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("reading");
  const [questionType, setQuestionType] = useState("multipleChoice");
  const [note, setNote] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNote("Tinh nang luu bai tap se duoc ket noi sau.");
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-900">Tao bai tap</h2>
        <p className="text-sm font-medium text-gray-500">
          {videoTitle ? `Video: ${videoTitle}` : "Chon video de tao bai tap."}
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Tieu de bai tap
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isDisabled}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
            placeholder="Nhap tieu de bai tap..."
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Mo ta
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isDisabled}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
            rows={4}
            placeholder="Mo ta bai tap..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Ky nang
            </label>
            <select
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              disabled={isDisabled}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
            >
              {SKILL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Dang cau hoi
            </label>
            <select
              value={questionType}
              onChange={(event) => setQuestionType(event.target.value)}
              disabled={isDisabled}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
            >
              {QUESTION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {note && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-600">
            {note}
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled || !title.trim()}
          className="flex w-full items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Luu bai tap
        </button>
      </form>
    </section>
  );
}
