'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '../../../../lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
interface Quiz {
  _id: string;
  courseId: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<{ quizId: string; scorePercent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<Quiz[]>(`/quiz/course/${courseId}`)
      .then(setQuizzes)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load quiz'));
  }, [courseId]);

  function setAnswer(quizId: string, qIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      const current = prev[quizId] ? [...prev[quizId]] : [];
      current[qIndex] = optionIndex;
      return { ...prev, [quizId]: current };
    });
  }

  async function submit(quiz: Quiz) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ scorePercent: number }>('/quiz/submit', {
        quizId: quiz._id,
        answers: answers[quiz._id] || [],
      });
      setResult({ quizId: quiz._id, scorePercent: res.scorePercent });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!quizzes) return <p className="text-sm text-ui-faint">Loading…</p>;
  if (quizzes.length === 0) return <p className="text-sm text-ui-faint">No quiz available for this course yet.</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-2">
        <GraduationCap size={18} className="text-signal" />
        <h1 className="text-xl font-display font-semibold">Quiz</h1>
      </div>
      {quizzes.map((quiz) => (
        <div key={quiz._id} className="surface p-6 space-y-6">
          {quiz.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium text-sm mb-2.5">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className="flex items-center gap-2.5 text-sm text-ui-muted hover:text-ui-text cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`${quiz._id}-${qi}`}
                      checked={answers[quiz._id]?.[qi] === oi}
                      onChange={() => setAnswer(quiz._id, qi, oi)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button className="btn btn-primary" onClick={() => submit(quiz)} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit quiz'}
            </button>
            {result?.quizId === quiz._id && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-ok">
                <CheckCircle2 size={15} />
                Score: {result.scorePercent}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
