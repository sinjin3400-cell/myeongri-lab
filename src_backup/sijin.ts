export type SijinId =
  | 'ja'
  | 'chuk'
  | 'in'
  | 'myo'
  | 'jin'
  | 'sa'
  | 'o'
  | 'mi'
  | 'sin'
  | 'yu'
  | 'sul'
  | 'hae';

export type SijinOption = {
  id: SijinId;
  label: string;
  hanja: string;
  range: string;
};

export const SIJIN_OPTIONS: readonly SijinOption[] = [
  { id: 'ja', label: '자시', hanja: '子', range: '23:30~01:30' },
  { id: 'chuk', label: '축시', hanja: '丑', range: '01:30~03:30' },
  { id: 'in', label: '인시', hanja: '寅', range: '03:30~05:30' },
  { id: 'myo', label: '묘시', hanja: '卯', range: '05:30~07:30' },
  { id: 'jin', label: '진시', hanja: '辰', range: '07:30~09:30' },
  { id: 'sa', label: '사시', hanja: '巳', range: '09:30~11:30' },
  { id: 'o', label: '오시', hanja: '午', range: '11:30~13:30' },
  { id: 'mi', label: '미시', hanja: '未', range: '13:30~15:30' },
  { id: 'sin', label: '신시', hanja: '申', range: '15:30~17:30' },
  { id: 'yu', label: '유시', hanja: '酉', range: '17:30~19:30' },
  { id: 'sul', label: '술시', hanja: '戌', range: '19:30~21:30' },
  { id: 'hae', label: '해시', hanja: '亥', range: '21:30~23:30' },
] as const;
