'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

  if (error) return <p className="text-danger">{error}</p>;
  if (!quizzes) return <p className="text-gray-500">Loading…</p>;
  if (quizzes.length === 0) return <p className="text-gray-500">No quiz available for this course yet.</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Quiz</h1>
      {quizzes.map((quiz) => (
        <div key={quiz._id} className="card p-5 space-y-5">
          {quiz.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium mb-2">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="radio"
                      name={`${quiz._id}-${qi}`}
                      checked={answers[quiz._id]?.[qi] === oi}
                      onChange={() => setAnswer(quiz._id, qi, oi)}
                      className="w-auto"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary" onClick={() => submit(quiz)} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit quiz'}
          </button>
          {result?.quizId === quiz._id && (
            <p className="text-ok font-semibold">Score: {result.scorePercent}%</p>
          )}
        </div>
      ))}
    </div>
  );
}
