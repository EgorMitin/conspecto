import { format, isToday, isTomorrow } from "date-fns";

export function getNextAiReviewDateText (nextAiReviewDate: Date) {
  if (!nextAiReviewDate) return "";
  if (isToday(nextAiReviewDate)) return "Next review today";
  if (isTomorrow(nextAiReviewDate)) return "Next review tomorrow";
  return `Next review on ${format(nextAiReviewDate, "MMMM d")}`;
};