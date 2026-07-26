import { AuthUser, AuthState } from '@canvas-chain/types';

export class AuthService {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
  };

  public getCurrentUser(): AuthUser | null {
    return this.state.user;
  }

  public async loginWithGuest(name = 'Guest Architect'): Promise<AuthUser> {
    const user: AuthUser = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      email: 'guest@canvas-chain.io',
      name,
      role: 'editor',
    };
    this.state = {
      user,
      isAuthenticated: true,
      isLoading: false,
      token: 'guest_token_mock',
    };
    return user;
  }

  public logout(): void {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    };
  }
}
