import { questions, Question } from "./questions";
import { lessons } from "../data/lessons";
const distractors: Record<string, string[]> = {
  starting: ["Open recent workbook", "Print workbook", "Close Excel"],
  facts: [
    "Bill Gates and Paul Allen",
    "Steve Jobs and Steve Wozniak",
    "Charles Babbage and Ada Lovelace",
  ],
};
export function academyQuestions(topic: string): Question[] {
  const lesson = lessons[topic];
  const pool = questions.filter((q) => q.topicId === topic && q.options);
  const ordered = pool.toSorted(
    (a, b) =>
      ["easy", "medium", "hard", "expert"].indexOf(a.difficulty) -
      ["easy", "medium", "hard", "expert"].indexOf(b.difficulty),
  );
  if (ordered.length >= 3) return ordered.slice(0, 3);
  return [
    ...ordered,
    {
      id: "academy-" + topic,
      topicId: topic,
      type: "mcq",
      difficulty: "easy",
      prompt: lesson.tryIt,
      answer: lesson.answer,
      options: [
        lesson.answer,
        ...(distractors[topic] || [
          "None of these",
          "A chart",
          "A file folder",
        ]),
      ],
      explanation: lesson.why,
      hint: lesson.goal,
      concept: topic,
      estimatedSeconds: 30,
    },
  ];
}
