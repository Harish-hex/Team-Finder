export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
}

export interface Team {
  id: string
  eventName: string
  description: string
  eventType: 'hackathon' | 'ctf' | 'competition' | 'project'
  techStack: string[]
  rolesNeeded: string[]
  isBeginnerFriendly: boolean
  hasMentor: boolean
  teamSize: number
  currentMembers: TeamMember[]
  createdAt: string
  creatorId: string
}

export interface Award {
  id: string
  name: string
  description: string
  icon: 'trophy' | 'medal' | 'star' | 'shield' | 'flame' | 'heart' | 'zap'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface User {
  id: string
  name: string
  avatar: string
  role: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  about: string
  isMentor: boolean
  awards: Award[]
  teamsCreated: number
  teamsJoined: number
  skills: string[]
}

export const mockTeams: Team[] = [
  {
    id: '1',
    eventName: 'HackMIT 2026',
    description: 'Looking for passionate developers to build an AI-powered study assistant. We want to create something that helps students learn more effectively using personalized recommendations.',
    eventType: 'hackathon',
    techStack: ['React', 'Python', 'OpenAI', 'PostgreSQL'],
    rolesNeeded: ['Frontend Dev', 'ML Engineer'],
    isBeginnerFriendly: true,
    hasMentor: true,
    teamSize: 4,
    currentMembers: [
      { id: '1', name: 'Alex Chen', avatar: '/avatars/1.jpg', role: 'Backend Lead' },
      { id: '2', name: 'Sarah Kim', avatar: '/avatars/2.jpg', role: 'Designer' },
    ],
    createdAt: '2026-01-20T10:00:00Z',
    creatorId: '1',
  },
  {
    id: '2',
    eventName: 'PicoCTF 2026',
    description: 'Forming a CTF team for the upcoming PicoCTF competition. All skill levels welcome - we focus on learning together and having fun while solving challenges.',
    eventType: 'ctf',
    techStack: ['Python', 'C', 'Assembly', 'Linux'],
    rolesNeeded: ['Crypto Specialist', 'Reverse Engineer', 'Web Exploit'],
    isBeginnerFriendly: true,
    hasMentor: true,
    teamSize: 6,
    currentMembers: [
      { id: '3', name: 'Jordan Lee', avatar: '/avatars/3.jpg', role: 'Team Lead' },
      { id: '4', name: 'Maya Patel', avatar: '/avatars/4.jpg', role: 'Binary Analyst' },
      { id: '5', name: 'Chris Wong', avatar: '/avatars/5.jpg', role: 'Web Security' },
    ],
    createdAt: '2026-01-19T14:30:00Z',
    creatorId: '3',
  },
  {
    id: '3',
    eventName: 'Google Code Jam',
    description: 'Competitive programming practice group preparing for Google Code Jam. We meet weekly to solve problems and discuss algorithms.',
    eventType: 'competition',
    techStack: ['C++', 'Python', 'Java'],
    rolesNeeded: ['Algorithm Expert'],
    isBeginnerFriendly: false,
    hasMentor: false,
    teamSize: 3,
    currentMembers: [
      { id: '6', name: 'David Park', avatar: '/avatars/6.jpg', role: 'Captain' },
      { id: '7', name: 'Emma Liu', avatar: '/avatars/7.jpg', role: 'Member' },
    ],
    createdAt: '2026-01-18T09:00:00Z',
    creatorId: '6',
  },
  {
    id: '4',
    eventName: 'TreeHacks 2026',
    description: 'Building a climate tech solution! Looking for developers who care about sustainability and want to make an impact at Stanford\'s hackathon.',
    eventType: 'hackathon',
    techStack: ['Next.js', 'TypeScript', 'Supabase', 'Mapbox'],
    rolesNeeded: ['Full Stack Dev', 'Data Viz'],
    isBeginnerFriendly: true,
    hasMentor: false,
    teamSize: 4,
    currentMembers: [
      { id: '8', name: 'Olivia Martinez', avatar: '/avatars/8.jpg', role: 'Project Lead' },
    ],
    createdAt: '2026-01-22T16:00:00Z',
    creatorId: '8',
  },
  {
    id: '5',
    eventName: 'DefCon CTF Quals',
    description: 'Experienced CTF team looking for elite players. Must have prior CTF experience and be able to dedicate significant time during the competition.',
    eventType: 'ctf',
    techStack: ['Python', 'C', 'Rust', 'IDA Pro'],
    rolesNeeded: ['Pwn Expert'],
    isBeginnerFriendly: false,
    hasMentor: false,
    teamSize: 8,
    currentMembers: [
      { id: '9', name: 'Ryan Nakamura', avatar: '/avatars/9.jpg', role: 'Team Lead' },
      { id: '10', name: 'Zoe Thompson', avatar: '/avatars/10.jpg', role: 'Rev Expert' },
      { id: '11', name: 'Marcus Johnson', avatar: '/avatars/11.jpg', role: 'Pwn' },
      { id: '12', name: 'Aisha Rahman', avatar: '/avatars/12.jpg', role: 'Crypto' },
      { id: '13', name: 'Tyler Brooks', avatar: '/avatars/13.jpg', role: 'Web' },
      { id: '14', name: 'Nina Volkov', avatar: '/avatars/14.jpg', role: 'Forensics' },
    ],
    createdAt: '2026-01-17T11:00:00Z',
    creatorId: '9',
  },
  {
    id: '6',
    eventName: 'Open Source Project',
    description: 'Starting a developer tools project focused on improving code review workflows. Looking for contributors who want to learn and ship real software.',
    eventType: 'project',
    techStack: ['Go', 'React', 'GraphQL', 'Docker'],
    rolesNeeded: ['Backend Dev', 'DevOps'],
    isBeginnerFriendly: true,
    hasMentor: true,
    teamSize: 5,
    currentMembers: [
      { id: '15', name: 'James Wilson', avatar: '/avatars/15.jpg', role: 'Maintainer' },
      { id: '16', name: 'Sofia Garcia', avatar: '/avatars/16.jpg', role: 'Frontend' },
    ],
    createdAt: '2026-01-21T08:00:00Z',
    creatorId: '15',
  },
]

export const mockAwards: Award[] = [
  {
    id: '1',
    name: 'First Victory',
    description: 'Won your first competition',
    icon: 'trophy',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Team Builder',
    description: 'Created 5 teams',
    icon: 'star',
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Mentor Supreme',
    description: 'Mentored 10+ beginners',
    icon: 'heart',
    rarity: 'epic',
  },
  {
    id: '4',
    name: 'Hackathon Legend',
    description: 'Won 3 major hackathons',
    icon: 'flame',
    rarity: 'legendary',
  },
  {
    id: '5',
    name: 'CTF Master',
    description: 'Top 10 in a major CTF',
    icon: 'shield',
    rarity: 'epic',
  },
  {
    id: '6',
    name: 'Quick Learner',
    description: 'Completed first team as a beginner',
    icon: 'zap',
    rarity: 'common',
  },
]

export const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  avatar: '/avatars/1.jpg',
  role: 'Full Stack Developer',
  experienceLevel: 'advanced',
  about: 'CS student at MIT passionate about building tools that help developers work more efficiently. Love hackathons and mentoring beginners. Always looking for new challenges and interesting projects to work on.',
  isMentor: true,
  awards: [mockAwards[0], mockAwards[1], mockAwards[2], mockAwards[3]],
  teamsCreated: 8,
  teamsJoined: 15,
  skills: ['React', 'TypeScript', 'Python', 'Go', 'PostgreSQL', 'Docker'],
}

export const liveActivity = [
  { type: 'team_created', message: 'New team formed for HackMIT 2026', time: '2 min ago' },
  { type: 'member_joined', message: 'Sarah joined TreeHacks team', time: '5 min ago' },
  { type: 'team_created', message: 'CTF squad recruiting for PicoCTF', time: '12 min ago' },
  { type: 'member_joined', message: 'Marcus joined DefCon team', time: '18 min ago' },
  { type: 'team_created', message: 'Open source project started', time: '25 min ago' },
]

export const platformStats = {
  activeTeams: 247,
  membersOnline: 1832,
  eventsThisMonth: 34,
  mentorsAvailable: 89,
}
