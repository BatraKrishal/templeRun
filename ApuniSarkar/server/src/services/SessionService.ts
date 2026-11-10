export interface SessionData {
  sessionId: string;
  activeServiceId?: string;
  activeRoute: string;
  activeFieldId?: string;
  collectedSlots: Record<string, any>;
  isConfirmationPending: boolean;
  isSubmitted: boolean;
  submissionId?: string;
  turnCount: number;
  lastUpdated: number;
  history: Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }>;
}

export class SessionService {
  private sessions: Map<string, SessionData> = new Map();

  public getOrCreateSession(sessionId: string, currentRoute: string = '/'): SessionData {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        activeRoute: currentRoute,
        collectedSlots: {},
        isConfirmationPending: false,
        isSubmitted: false,
        turnCount: 0,
        lastUpdated: Date.now(),
        history: [],
      };
      this.sessions.set(sessionId, session);
    }
    session.lastUpdated = Date.now();
    return session;
  }

  public updateSession(sessionId: string, updates: Partial<SessionData>): SessionData {
    const session = this.getOrCreateSession(sessionId);
    if (updates.activeServiceId !== undefined) session.activeServiceId = updates.activeServiceId;
    if (updates.activeRoute !== undefined) session.activeRoute = updates.activeRoute;
    if (updates.activeFieldId !== undefined) session.activeFieldId = updates.activeFieldId;
    if (updates.collectedSlots !== undefined) {
      session.collectedSlots = { ...session.collectedSlots, ...updates.collectedSlots };
    }
    if (updates.isConfirmationPending !== undefined) session.isConfirmationPending = updates.isConfirmationPending;
    if (updates.isSubmitted !== undefined) session.isSubmitted = updates.isSubmitted;
    if (updates.submissionId !== undefined) session.submissionId = updates.submissionId;
    session.turnCount++;
    session.lastUpdated = Date.now();
    return session;
  }

  public recordHistory(sessionId: string, role: 'user' | 'assistant', text: string) {
    const session = this.getOrCreateSession(sessionId);
    session.history.push({ role, text, timestamp: Date.now() });
    if (session.history.length > 30) {
      session.history.shift();
    }
  }

  public clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}

