"use client";

import { useEffect, useState, type FormEvent, type ReactNode, type ChangeEvent } from "react";
import { CircleDot, MessageSquareMore, Pencil, MessageCircle, Headphones } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/teacher/ConfirmModal";
import { uploadService } from "@/services/uploadService";
import { exerciseService, type ExerciseRecord } from "@/services/exerciseService";
import RichTextEditor from "@/components/teacher/RichTextEditor";

interface VideoExerciseFormProps {
  videoTitle?: string;
  courseId?: string;
  videoId?: string;
  isDisabled?: boolean;
  onSaved?: (exercise: ExerciseRecord) => void;
  onCancel?: () => void;
  initialExercise?: ExerciseRecord | null;
  questionMode?: "autoGraded" | "essayBased" | null;
}

type SkillValue = "reading" | "writing" | "listening" | "speaking";
type QuestionTypeValue =
  | "multipleChoice"
  | "fillBlank"
  | "essay"
  | "speaking";

interface AnswerOption {
  id: string;
  text: string;
}

interface QuestionItem {
  id: string;
  type: QuestionTypeValue;
  skill: SkillValue;
  prompt: string;
  explanation: string;
  options: AnswerOption[];
  correctOptionId: string | null;
  minWords: number;
  rubric: string;
  timeLimit: number;
  audioUrl: string;
  transcript: string;
  acceptedAnswers: AnswerOption[];
  isExactMatch: boolean;
}

const SKILL_OPTIONS: { value: SkillValue; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
];

const QUESTION_TYPES: {
  value: QuestionTypeValue;
  label: string;
  icon: LucideIcon;
  listening?: boolean;
}[] = [
    { value: "multipleChoice", label: "Multiple choice", icon: CircleDot },
    { value: "fillBlank", label: "Fill in the blank", icon: MessageSquareMore },
    { value: "essay", label: "Essay", icon: Pencil },
    { value: "speaking", label: "Speaking", icon: MessageCircle },
    {
      value: "multipleChoice",
      label: "Multiple choice listening",
      icon: Headphones,
      listening: true,
    },
    {
      value: "fillBlank",
      label: "Fill blank listening",
      icon: Headphones,
      listening: true,
    },
  ];

const QUESTION_LABELS: Record<QuestionTypeValue, string> = {
  multipleChoice: "Multiple choice",
  fillBlank: "Fill in the blank",
  essay: "Essay",
  speaking: "Speaking",
};

const createId = () => Math.random().toString(36).slice(2, 10);

const createQuestion = (
  type: QuestionTypeValue,
  skillOverride?: SkillValue
): QuestionItem => {
  const defaultSkill: SkillValue =
    skillOverride || (type === "speaking" ? "speaking" : type === "essay" ? "writing" : "reading");
  const base: QuestionItem = {
    id: createId(),
    type,
    skill: defaultSkill,
    prompt: "",
    explanation: "",
    options: [],
    correctOptionId: null,
    minWords: 250,
    rubric: "",
    timeLimit: 120,
    audioUrl: "",
    transcript: "",
    acceptedAnswers: [{ id: createId(), text: "" }],
    isExactMatch: false,
  };

  if (type === "multipleChoice") {
    const firstId = createId();
    const secondId = createId();
    base.options = [
      { id: firstId, text: "" },
      { id: secondId, text: "" },
    ];
    base.correctOptionId = firstId;
  }

  return base;
};

const mapExerciseToForm = (exercise: ExerciseRecord) => {
  const mappedQuestions: QuestionItem[] = (exercise.questions || []).map((question) => {
    const type = question.questionType as QuestionTypeValue;
    const skill = (question.skill as SkillValue) || "reading";
    const base: QuestionItem = {
      id: createId(),
      type,
      skill,
      prompt: question.questionText || "",
      explanation: question.explanation || "",
      options: [],
      correctOptionId: question.correctOptionId || null,
      minWords: question.minWords || 0,
      rubric: "",
      timeLimit: question.timeLimitSeconds || 0,
      audioUrl: question.audioUrl || question.audioPromptUrl || "",
      transcript: question.transcript || "",
      acceptedAnswers: [],
      isExactMatch: Boolean(question.isExactMatch),
    };

    if (type === "multipleChoice") {
      base.options = (question.options || []).map((option) => ({
        id: option.id || createId(),
        text: option.text || "",
      }));
      base.correctOptionId = question.correctOptionId || base.options[0]?.id || null;
    }

    if (type === "fillBlank") {
      const answers = question.correctAnswers || [];
      base.acceptedAnswers = answers.length
        ? answers.map((answer) => ({ id: createId(), text: answer }))
        : [{ id: createId(), text: "" }];
    }

    if (type === "essay") {
      base.minWords = question.minWords || 0;
    }

    if (type === "speaking") {
      base.timeLimit = question.timeLimitSeconds || 0;
      base.audioUrl = question.audioPromptUrl || "";
    }

    return base;
  });

  return {
    title: exercise.title || "",
    description: exercise.description || "",
    questions: mappedQuestions,
  };
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
      {label}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
      placeholder={placeholder}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
      rows={rows}
      placeholder={placeholder}
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function QuestionCard({
  index,
  typeLabel,
  onDelete,
  children,
  disabled,
}: {
  index: number;
  typeLabel: string;
  onDelete: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <circle cx="8" cy="7" r="1.5" fill="currentColor" />
            <circle cx="8" cy="12" r="1.5" fill="currentColor" />
            <circle cx="8" cy="17" r="1.5" fill="currentColor" />
            <circle cx="16" cy="7" r="1.5" fill="currentColor" />
            <circle cx="16" cy="12" r="1.5" fill="currentColor" />
            <circle cx="16" cy="17" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
          {typeLabel}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Câu hỏi {index + 1}
        </span>
        <div className="ml-auto">
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Xóa câu hỏi"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 14h10l1-14" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function MultipleChoiceEditor({
  question,
  onChange,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onSelectCorrect,
  onUploadAudio,
  isUploading,
  disabled,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
  onUpdateOption: (optionId: string, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onSelectCorrect: (optionId: string) => void;
  onUploadAudio: (file: File) => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
}) {
  const isListening = question.skill === "listening";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUploadAudio(file);
    event.target.value = "";
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <FieldLabel label="Question" />
          <TextInput
            value={question.prompt}
            onChange={(value) => onChange({ prompt: value })}
            placeholder="Enter question text..."
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel label="Ky nang muc tieu" />
          <SelectField
            value={question.skill}
            onChange={(value) => onChange({ skill: value as SkillValue })}
            options={SKILL_OPTIONS}
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <FieldLabel label="Cac phuong an tra loi" />
        <div className="mt-2 space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2"
            >
              <input
                type="radio"
                checked={question.correctOptionId === option.id}
                onChange={() => onSelectCorrect(option.id)}
                disabled={disabled}
                className="h-4 w-4"
              />
              <input
                value={option.text}
                onChange={(event) => onUpdateOption(option.id, event.target.value)}
                disabled={disabled}
                className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none"
                placeholder="Nhap phuong an tra loi"
              />
              <button
                type="button"
                onClick={() => onRemoveOption(option.id)}
                disabled={disabled || question.options.length <= 2}
                className="rounded-full border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xóa
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddOption}
            disabled={disabled}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500">
              +
            </span>
            Thêm phương án
          </button>
        </div>
      </div>
      {isListening && (
        <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <div>
            <FieldLabel label="Audio file" />
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="file"
                accept="audio/*,.mp3"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
              />
              <div className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-2 md:w-44">
                <audio controls className="h-8 w-full" src={question.audioUrl || undefined} />
              </div>
              {isUploading && <span className="text-xs font-semibold text-gray-500">Đang tải...</span>}
            </div>
          </div>
          <div>
            <FieldLabel label="Transcript (optional)" />
            <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
              <RichTextEditor
                value={question.transcript}
                onChange={(value) => onChange({ transcript: value })}
              />
            </div>
          </div>
        </div>
      )}
      <div>
        <FieldLabel label="Giải thích / Đáp án chi tiết" />
        <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
          <RichTextEditor
            value={question.explanation}
            onChange={(value) => onChange({ explanation: value })}
          />
        </div>
      </div>
    </>
  );
}

function EssayEditor({
  question,
  onChange,
  disabled,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div>
          <FieldLabel label="Đề bài tự luận" />
          <TextInput
            value={question.prompt}
            onChange={(value) => onChange({ prompt: value })}
            placeholder="Nhập đề bài"
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel label="So tu toi thieu" />
          <TextInput
            value={String(question.minWords)}
            onChange={(value) =>
              onChange({ minWords: Number(value.replace(/\D/g, "")) || 0 })
            }
            placeholder="250"
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <FieldLabel label="Huong dan cham bai (rubric)" />
        <TextArea
          value={question.rubric}
          onChange={(value) => onChange({ rubric: value })}
          placeholder="Ghi chu cac y chinh can co..."
          disabled={disabled}
          rows={3}
        />
      </div>
    </>
  );
}

function SpeakingEditor({
  question,
  onChange,
  disabled,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <div>
          <FieldLabel label="Câu hỏi Speaking" />
          <TextInput
            value={question.prompt}
            onChange={(value) => onChange({ prompt: value })}
            placeholder="Nhập câu hỏi"
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel label="Giới hạn thời gian (giây)" />
          <TextInput
            value={String(question.timeLimit)}
            onChange={(value) =>
              onChange({ timeLimit: Number(value.replace(/\D/g, "")) || 0 })
            }
            placeholder="120"
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <FieldLabel label="Audio prompt (optional)" />
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={question.audioUrl}
            onChange={(event) => onChange({ audioUrl: event.target.value })}
            disabled={disabled}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400 disabled:bg-gray-100"
            placeholder="https://"
          />
          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tai len
          </button>
        </div>
      </div>
    </>
  );
}

function FillBlankEditor({
  question,
  onChange,
  onUpdateAnswer,
  onAddAnswer,
  onRemoveAnswer,
  onUploadAudio,
  isUploading,
  disabled,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
  onUpdateAnswer: (answerId: string, value: string) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (answerId: string) => void;
  onUploadAudio: (file: File) => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
}) {
  const isListening = question.skill === "listening";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUploadAudio(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500">
      <div>
        <FieldLabel label="Noi dung cau hoi" />
        <TextInput
          value={question.prompt}
          onChange={(value) => onChange({ prompt: value })}
          placeholder="Nhập nội dung câu hỏi..."
          disabled={disabled}
        />
      </div>

      <div className="space-y-3">
        {question.acceptedAnswers.map((answer) => (
          <div
            key={answer.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2"
          >
            <input
              value={answer.text}
              onChange={(event) => onUpdateAnswer(answer.id, event.target.value)}
              disabled={disabled}
              className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none"
              placeholder="Nhap dap an dung"
            />
            <button
              type="button"
              onClick={() => onRemoveAnswer(answer.id)}
              disabled={disabled || question.acceptedAnswers.length <= 1}
              className="rounded-full border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Xoa
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddAnswer}
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500">
            +
          </span>
          Them dap an
        </button>
      </div>

      <div>
        <FieldLabel label="Giai thich / Dap an chi tiet" />
        <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
          <RichTextEditor
            value={question.explanation}
            onChange={(value) => onChange({ explanation: value })}
            editorClassName="min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none"
          />
        </div>
      </div>

      {isListening && (
        <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <div>
            <FieldLabel label="Audio file" />
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="file"
                accept="audio/*,.mp3"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
              />
              <div className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-2 md:w-44">
                <audio controls className="h-8 w-full" src={question.audioUrl || undefined} />
              </div>
              {isUploading && (
                <span className="text-xs font-semibold text-gray-500">Đang tải...</span>
              )}
            </div>
          </div>
          <div>
            <FieldLabel label="Transcript (optional)" />
            <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
              <RichTextEditor
                value={question.transcript}
                onChange={(value) => onChange({ transcript: value })}
                editorClassName="min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={question.isExactMatch}
              onChange={(event) => onChange({ isExactMatch: event.target.checked })}
              disabled={disabled}
              className="h-4 w-4"
            />
            Exact match (case-sensitive)
          </label>
        </div>
      )}
    </div>
  );
}

export default function VideoExerciseForm({
  videoTitle,
  courseId,
  videoId,
  isDisabled = false,
  onSaved,
  onCancel,
  initialExercise,
  questionMode = null,
}: VideoExerciseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const visibleQuestionTypes = questionMode
    ? QUESTION_TYPES.filter((type) => {
      if (questionMode === "essayBased") {
        return type.value === "essay" || type.value === "speaking";
      }
      return type.value === "multipleChoice" || type.value === "fillBlank";
    })
    : QUESTION_TYPES;

  useEffect(() => {
    if (!initialExercise) {
      setCurrentExerciseId(null);
      setTitle("");
      setDescription("");
      setQuestions([]);
      return;
    }

    const mapped = mapExerciseToForm(initialExercise);
    setCurrentExerciseId(initialExercise._id);
    setTitle(mapped.title);
    setDescription(mapped.description);
    setQuestions(mapped.questions);
  }, [initialExercise]);

  const buildExercisePayload = (items: QuestionItem[]) => ({
    title: title.trim(),
    description: description.trim(),
    questions: items.map((question) => {
      const base = {
        questionType: question.type,
        questionText: question.prompt.trim(),
        explanation: question.explanation.trim(),
        skill: question.skill,
      };

      if (question.type === "multipleChoice") {
        return {
          ...base,
          options: question.options
            .map((option) => ({
              id: option.id,
              text: option.text.trim(),
            }))
            .filter((option) => option.text.length > 0),
          correctOptionId: question.correctOptionId || "",
          audioUrl: question.skill === "listening" ? question.audioUrl.trim() : undefined,
          transcript: question.skill === "listening" ? question.transcript.trim() : undefined,
        };
      }

      if (question.type === "fillBlank") {
        return {
          ...base,
          correctAnswers: question.acceptedAnswers
            .map((answer) => answer.text.trim())
            .filter((value) => value.length > 0),
          isExactMatch: question.isExactMatch,
          audioUrl: question.skill === "listening" ? question.audioUrl.trim() : undefined,
          transcript: question.skill === "listening" ? question.transcript.trim() : undefined,
        };
      }

      if (question.type === "essay") {
        return {
          ...base,
          minWords: question.minWords,
        };
      }

      if (question.type === "speaking") {
        return {
          ...base,
          audioPromptUrl: question.audioUrl.trim(),
          timeLimitSeconds: question.timeLimit,
        };
      }

      return {
        ...base,
        audioUrl: question.audioUrl.trim(),
        transcript: question.transcript.trim(),
      };
    }),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNote(null);

    if (!courseId || !videoId) {
      toast.error("Không tìm thấy thông tin video hoặc khóa học.");
      return;
    }

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài tập.");
      return;
    }

    if (questions.length === 0) {
      toast.error("Hãy thêm ít nhất một câu hỏi");
      return;
    }

    for (const question of questions) {
      if (!question.prompt.trim()) {
        toast.error("Vui lòng nhập nội dung câu hỏi.");
        return;
      }

      const isListeningVariant = question.skill === "listening";

      if (question.type === "multipleChoice") {
        const filledOptions = question.options.filter((option) => option.text.trim());
        if (filledOptions.length < 2 || !question.correctOptionId) {
          toast.error("Cau hoi trac nghiem can it nhat 2 phuong an va 1 dap an dung.");
          return;
        }

        if (isListeningVariant && !question.audioUrl.trim()) {
          toast.error("Multiple choice listening can audio file.");
          return;
        }
      }

      if (question.type === "fillBlank") {
        const answers = question.acceptedAnswers.filter((answer) => answer.text.trim());
        if (answers.length === 0) {
          toast.error("Cau hoi dien tu can it nhat 1 dap an.");
          return;
        }

        if (isListeningVariant && !question.audioUrl.trim()) {
          toast.error("Fill blank listening can audio file.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = buildExercisePayload(questions);

      const response = currentExerciseId
        ? await exerciseService.updateExercise(currentExerciseId, payload)
        : await exerciseService.createVideoExercise(videoId, payload);

      if (response.status === "error" || !response.data) {
        throw new Error(
          response.message ||
          (currentExerciseId ? "Khong the cap nhat bai tap." : "Khong the tao bai tap.")
        );
      }

      setCurrentExerciseId(response.data._id);
      onSaved?.(response.data);
      toast.success(
        currentExerciseId ? "Cập nhật thành công!" : "Tạo bài tập thành công!"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : currentExerciseId
            ? "Cập nhật bài tập thất bại"
            : "Tạo bài tập thất bại";
      setNote(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const updateQuestion = (id: string, patch: Partial<QuestionItem>) => {
    setQuestions((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const requestRemoveQuestion = (id: string) => {
    const toRemove = questions.find((q) => q.id === id);
    if (!toRemove) return;

    setQuestionToDelete(toRemove);
  };

  const confirmRemoveQuestion = async () => {
    if (!questionToDelete) return;

    setIsDeletingQuestion(true);

    try {
      const nextQuestions = questions.filter((item) => item.id !== questionToDelete.id);

      if (currentExerciseId) {
        const payload = buildExercisePayload(nextQuestions);
        const response = await exerciseService.updateExercise(currentExerciseId, payload);

        if (response.status === "error" || !response.data) {
          throw new Error(response.message || "Khong the cap nhat bai tap.");
        }

        setCurrentExerciseId(response.data._id);
        setQuestions(nextQuestions);
        onSaved?.(response.data);
      } else {
        setQuestions(nextQuestions);
      }

      toast.success("Xoa cau hoi thanh cong!");
      setQuestionToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xoa cau hoi that bai.";
      toast.error(message);
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const addQuestion = (type: QuestionTypeValue, skill?: SkillValue) => {
    setQuestions((items) => [...items, createQuestion(type, skill)]);
  };

  const addOption = (questionId: string) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? {
            ...item,
            options: [...item.options, { id: createId(), text: "" }],
          }
          : item
      )
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    value: string
  ) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? {
            ...item,
            options: item.options.map((option) =>
              option.id === optionId ? { ...option, text: value } : option
            ),
          }
          : item
      )
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((items) =>
      items.map((item) => {
        if (item.id !== questionId) {
          return item;
        }
        const nextOptions = item.options.filter(
          (option) => option.id !== optionId
        );
        const nextCorrect =
          item.correctOptionId === optionId
            ? nextOptions[0]?.id ?? null
            : item.correctOptionId;
        return { ...item, options: nextOptions, correctOptionId: nextCorrect };
      })
    );
  };

  const selectCorrect = (questionId: string, optionId: string) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? { ...item, correctOptionId: optionId }
          : item
      )
    );
  };

  const addAcceptedAnswer = (questionId: string) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? {
            ...item,
            acceptedAnswers: [
              ...item.acceptedAnswers,
              { id: createId(), text: "" },
            ],
          }
          : item
      )
    );
  };

  const updateAcceptedAnswer = (
    questionId: string,
    answerId: string,
    value: string
  ) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? {
            ...item,
            acceptedAnswers: item.acceptedAnswers.map((answer) =>
              answer.id === answerId ? { ...answer, text: value } : answer
            ),
          }
          : item
      )
    );
  };

  const removeAcceptedAnswer = (questionId: string, answerId: string) => {
    setQuestions((items) =>
      items.map((item) =>
        item.id === questionId
          ? {
            ...item,
            acceptedAnswers: item.acceptedAnswers.filter(
              (answer) => answer.id !== answerId
            ),
          }
          : item
      )
    );
  };

  const uploadListeningAudio = async (questionId: string, file: File) => {
    setUploadingQuestionId(questionId);
    try {
      const signatureResponse = await uploadService.requestSignature({
        resourceType: "video",
        folder: "audios",
      });

      if (signatureResponse.status === "error" || !signatureResponse.data) {
        throw new Error(signatureResponse.message || "Khong the lay chu ky upload.");
      }

      const uploadResult = await uploadService.uploadToCloudinary(
        file,
        signatureResponse.data
      );

      if (!uploadResult.secure_url) {
        throw new Error("Khong lay duoc duong dan audio.");
      }

      updateQuestion(questionId, { audioUrl: uploadResult.secure_url });
      toast.success("Tai audio thanh cong!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tai audio that bai.";
      toast.error(message);
    } finally {
      setUploadingQuestionId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500"
            aria-label="Quay lai"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Tạo bài tập cho video
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {videoTitle
                ? `Video: ${videoTitle}`
                : "Chọn video để tạo bài tập."}
            </p>
          </div>
        </div>
        {/* Buttons moved to bottom of form */}
      </header>

      <form
        id="video-exercise-form"
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        <SectionCard title="Thông tin chung">
          <div>
            <FieldLabel label="Tiêu đề bài tập" />
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Nhập tiêu đề cho bài tập..."
              disabled={isDisabled}
            />
          </div>
          <div>
            <FieldLabel label="Mô tả bài tập" />
            <TextArea
              value={description}
              onChange={setDescription}
              placeholder="Ghi chú hướng dẫn cho học viên..."
              disabled={isDisabled}
              rows={4}
            />
          </div>
        </SectionCard>

        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            typeLabel={QUESTION_LABELS[question.type]}
            onDelete={() => requestRemoveQuestion(question.id)}
            disabled={isDisabled}
          >
            {question.type === "multipleChoice" && (
              <MultipleChoiceEditor
                question={question}
                onChange={(patch) => updateQuestion(question.id, patch)}
                onAddOption={() => addOption(question.id)}
                onUpdateOption={(optionId, value) =>
                  updateOption(question.id, optionId, value)
                }
                onRemoveOption={(optionId) =>
                  removeOption(question.id, optionId)
                }
                onSelectCorrect={(optionId) =>
                  selectCorrect(question.id, optionId)
                }
                onUploadAudio={(file) => uploadListeningAudio(question.id, file)}
                isUploading={uploadingQuestionId === question.id}
                disabled={isDisabled}
              />
            )}
            {question.type === "essay" && (
              <EssayEditor
                question={question}
                onChange={(patch) => updateQuestion(question.id, patch)}
                disabled={isDisabled}
              />
            )}
            {question.type === "speaking" && (
              <SpeakingEditor
                question={question}
                onChange={(patch) => updateQuestion(question.id, patch)}
                disabled={isDisabled}
              />
            )}
            {question.type === "fillBlank" && (
              <FillBlankEditor
                question={question}
                onChange={(patch) => updateQuestion(question.id, patch)}
                onAddAnswer={() => addAcceptedAnswer(question.id)}
                onUpdateAnswer={(answerId, value) =>
                  updateAcceptedAnswer(question.id, answerId, value)
                }
                onRemoveAnswer={(answerId) =>
                  removeAcceptedAnswer(question.id, answerId)
                }
                onUploadAudio={(file) => uploadListeningAudio(question.id, file)}
                isUploading={uploadingQuestionId === question.id}
                disabled={isDisabled}
              />
            )}
          </QuestionCard>
        ))}

        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-4">
          <div className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            Thêm câu hỏi mới
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {visibleQuestionTypes.map((type, index) => (
              <button
                key={`${type.label}-${index}`}
                type="button"
                onClick={() => addQuestion(type.value, type.listening ? "listening" : undefined)}
                disabled={isDisabled}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {type.icon && <type.icon className="h-4 w-4" />}
                  {type.label}

                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
          >
            Hủy
          </button>
          <button
            form="video-exercise-form"
            type="submit"
            disabled={
              isDisabled ||
              isSubmitting ||
              !title.trim() ||
              questions.length === 0
            }
            className="rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Đang lưu..."
              : currentExerciseId
                ? "Cập nhật bài tập"
                : "Lưu bài tập"}
          </button>
        </div>

        {note && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-600">
            {note}
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={Boolean(questionToDelete)}
        onClose={() => {
          if (!isDeletingQuestion) {
            setQuestionToDelete(null);
          }
        }}
        onConfirm={confirmRemoveQuestion}
        title="Xoa cau hoi nay?"
        message={
          questionToDelete?.audioUrl
            ? "Cau hoi va file audio tren Cloudinary se bi xoa. Ban co muon tiep tuc?"
            : "Cau hoi nay se bi xoa khoi danh sach. Ban co muon tiep tuc?"
        }
        confirmText="Xoa"
        cancelText="Huy"
        isDestructive
        isLoading={isDeletingQuestion}
      />
    </section>
  );
}
