export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  classId: number;
  className: string;
  teacherName: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    studentId: "usr-1",
    studentName: "Анна Кузнецова",
    studentPhone: "89112223344",
    classId: 1,
    className: "Contemporary Dance",
    teacherName: "Мария Ковалева",
    rating: 5,
    comment: "Было супер! Очень нежная, но при этом силовая разминка. Мария — невероятный хореограф!",
    date: "14.07.2026"
  },
  {
    id: "rev-2",
    studentId: "usr-2",
    studentName: "Дмитрий Морозов",
    studentPhone: "89223334455",
    classId: 1,
    className: "Contemporary Dance",
    teacherName: "Мария Ковалева",
    rating: 4,
    comment: "Сложная связка, но музыка супер! И подача тренера отличная.",
    date: "14.07.2026"
  },
  {
    id: "rev-3",
    studentId: "usr-3",
    studentName: "София Лебедева",
    studentPhone: "89556667788",
    classId: 2,
    className: "Hip-Hop Beginner",
    teacherName: "Алексей Петров",
    rating: 5,
    comment: "Первый раз на хип-хопе, безумно понравилось! Алексей все очень подробно объясняет, темп комфортный.",
    date: "14.07.2026"
  },
  {
    id: "rev-4",
    studentId: "mock-admin-id-12345",
    studentName: "Рустам Назаров",
    studentPhone: "89119223406",
    classId: 3,
    className: "High Heels Pro",
    teacherName: "Кристина",
    rating: 5,
    comment: "Было очень жарко, классный плейлист!",
    date: "14.07.2026"
  },
  {
    id: "rev-5",
    studentId: "usr-5",
    studentName: "Елена Орлова",
    studentPhone: "89889990011",
    classId: 3,
    className: "High Heels Pro",
    teacherName: "Кристина",
    rating: 5,
    comment: "Сложная связка, но тренер топ!",
    date: "14.07.2026"
  }
];

export function getReviews(): Review[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS;
  const data = localStorage.getItem('akademika_reviews');
  if (!data) {
    localStorage.setItem('akademika_reviews', JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  return JSON.parse(data);
}

export function saveReviews(reviews: Review[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('akademika_reviews', JSON.stringify(reviews));
}
