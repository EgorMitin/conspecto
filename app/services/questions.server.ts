import { adminDb } from "~/lib/firebase/admin.server";
import type { Question, CreateQuestionData } from "~/lib/types";

const questionsCollection = adminDb.collection("questions");

export async function createQuestion(data: CreateQuestionData): Promise<Question> {
  const questionRef = questionsCollection.doc();
  const today = new Date().toLocaleDateString("en-US");

  const question = {
    id: questionRef.id,
    ...data,
    lastInterval: 0,
    nextDueDate: today,
    reviewHistory: [],
    createdAt: today.toLocaleString(),
  };

  await questionRef.set(question);
  return question;
}

export async function getQuestionById(
  questionId: string,
): Promise<Question | null> {
  const doc = await questionsCollection.doc(questionId).get();
  if (!doc.exists) return null;
  return doc.data() as Question;
}

export async function getQuestionsByUser(userId: string): Promise<Question[]> {
  const snapshot = await questionsCollection
    .where("userId", "==", userId)
    .orderBy("nextDueDate", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Question);
}

export async function getQuestionsByNote(noteId: string): Promise<Question[]> {
  const snapshot = await questionsCollection
    .where("noteId", "==", noteId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Question);
}

export async function updateQuestion(
  questionId: string,
  data: Partial<Question>,
): Promise<void> {
  await questionsCollection.doc(questionId).update(data);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await questionsCollection.doc(questionId).delete();
}

export async function getDueQuestions(userId: string): Promise<Question[]> {
  const today = new Date().toLocaleDateString("en-US");
  const snapshot = await questionsCollection
    .where("userId", "==", userId)
    .where("nextDueDate", "<=", today)
    .orderBy("nextDueDate", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Question);
}
