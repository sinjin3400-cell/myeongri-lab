const STREAK_KEY = 'myeongri_streak';
const VISIT_KEY = 'myeongri_last_visit';

type StreakData = {
  count: number;
  lastVisit: string; // YYYY-MM-DD
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { count: 0, lastVisit: '' };
}

function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

/**
 * 오늘 방문을 기록하고 현재 스트릭 정보를 반환
 * @returns { count: 연속 방문일, isNew: 오늘 첫 방문인지, milestone: 달성한 마일스톤 (3 또는 7) }
 */
export function recordVisit(): { count: number; isNew: boolean; milestone: number | null } {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const data = loadStreak();

  // 이미 오늘 방문한 경우
  if (data.lastVisit === today) {
    return { count: data.count, isNew: false, milestone: null };
  }

  let newCount: number;
  if (data.lastVisit === yesterday) {
    // 어제 방문 → 연속 유지
    newCount = data.count + 1;
  } else {
    // 어제 안 왔으면 리셋
    newCount = 1;
  }

  saveStreak({ count: newCount, lastVisit: today });

  // 마일스톤 체크 (3일, 7일)
  const milestone = newCount === 3 ? 3 : newCount === 7 ? 7 : null;

  return { count: newCount, isNew: true, milestone };
}

/**
 * 현재 스트릭 카운트만 읽기 (기록하지 않음)
 */
export function getStreakCount(): number {
  const data = loadStreak();
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (data.lastVisit === today || data.lastVisit === yesterday) {
    return data.count;
  }
  return 0;
}

/** 12지 띠별 오늘의 한줄 운세 (날짜 시드 기반) */
const ZODIAC_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZODIAC_EMOJIS = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'];

const FORTUNE_LINES = [
  ['금전운이 빛나는 하루', '가족과의 대화가 복을 불러와요', '새로운 인연이 찾아올 수 있어요', '건강에 신경 쓰면 운이 따라와요'],
  ['직감을 믿으면 좋은 결과가 있어요', '작은 친절이 큰 보답으로 돌아와요', '재물운이 상승하는 날이에요', '마음을 비우면 기회가 보여요'],
  ['오래된 친구에게서 좋은 소식이 와요', '노력한 만큼 성과가 나타나요', '예상치 못한 행운이 기다려요', '여유를 가지면 좋은 일이 생겨요'],
  ['변화를 두려워하지 마세요', '주변의 조언에 귀 기울이세요', '하고 싶던 일을 시작하기 좋은 날', '감사하는 마음이 복을 키워요'],
  ['오늘은 결단력이 중요한 날이에요', '부드러운 말이 관계를 좋게 해요', '운동이 행운 에너지를 높여줘요', '웃는 얼굴에 좋은 기운이 모여요'],
  ['솔직한 마음이 통하는 하루예요', '새로운 도전이 성장을 가져와요', '소중한 것을 지키는 힘이 생겨요', '평소와 다른 선택이 행운이 돼요'],
  ['차분함이 최고의 무기인 날이에요', '가까운 곳에서 기쁨을 찾아보세요', '배움의 기회가 찾아오는 날이에요', '나를 위한 시간이 필요한 하루예요'],
  ['좋은 사람과의 만남이 복이에요', '끈기가 보상받는 하루예요', '자신감을 가지면 길이 열려요', '작은 것에서 행복을 느껴보세요'],
];

export function getDailyZodiacFortunes(date: Date): { animal: string; emoji: string; fortune: string }[] {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );

  return ZODIAC_ANIMALS.map((animal, i) => {
    const lineGroup = FORTUNE_LINES[(dayOfYear + i) % FORTUNE_LINES.length];
    const line = lineGroup[(dayOfYear + i * 3) % lineGroup.length];
    return {
      animal,
      emoji: ZODIAC_EMOJIS[i],
      fortune: line,
    };
  });
}
