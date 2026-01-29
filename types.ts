
export enum EducationLevel {
  SMP = 'SMP',
  SMA = 'SMA/SMK',
  MAHASISWA = 'Mahasiswa'
}

export enum LanguageStyle {
  FORMAL = 'Formal Akademik',
  SEMI_FORMAL = 'Semi Formal'
}

export interface PaperInput {
  title: string;
  author: string;
  institution: string;
  subject: string;
  lecturer?: string;
  academicYear: string;
  estimatedPages: number;
  educationLevel: EducationLevel;
  languageStyle: LanguageStyle;
  includePreface: boolean;
  includeClosing: boolean;
  includeBibliography: boolean;
  mode: 'quick' | 'deep';
}

export interface PaperContent {
  preface?: string;
  introduction: {
    background: string;
    problemFormulation: string[];
    objectives: string[];
  };
  chapters: {
    title: string;
    subChapters: {
      title: string;
      content: string;
    }[];
  }[];
  closing?: {
    conclusion: string;
    suggestions: string;
  };
  bibliography?: string[];
}

export interface PaperData {
  input: PaperInput;
  content: PaperContent;
}
