export interface ApiEndpoints {
  // Auth
  login: string;
  register: string;
  logout: string;
  
  // Test
  submitTest: string;
  getTestHistory: string;
  getTestResult: string;
  exportHistory: string;
  
  // Questions
  getQuestions: string;
  
  // Users
  getUsers: string;
  getClubUsers: string;
  
  // Comparisons
  createComparison: string;
  getComparisonHistory: string;
  
  // Clubs
  getClubs: string;
  createClub: string;
  validateClub: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
    [key: string]: string;
  };
  endpoints: ApiEndpoints;  // オプショナルではなく必須に
}
