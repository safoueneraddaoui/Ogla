export enum Role {
  ATHLETE = 'ATHLETE',
  CLUB = 'CLUB',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum Locale {
  EN = 'EN',
  AR = 'AR',
  FR = 'FR',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

export enum AffiliationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  LEFT = 'LEFT',
}

export enum CompetitionStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export enum CompetitionEntryStatus {
  REGISTERED = 'REGISTERED',
  CONFIRMED = 'CONFIRMED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
}

export enum ChatRoomType {
  DM = 'DM',
  GROUP = 'GROUP',
}

export enum NotificationType {
  AFFILIATION = 'AFFILIATION',
  COMPETITION = 'COMPETITION',
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
}
