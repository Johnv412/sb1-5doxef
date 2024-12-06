import { Observable } from '@nativescript/core';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard-service';
import { AuthService } from '../../services/auth-service';
import { ProfileService } from '../../services/profile-service';

export class LeaderboardViewModel extends Observable {
    private leaderboardService: LeaderboardService;
    private authService: AuthService;
    private profileService: ProfileService;
    private _isLoading: boolean = false;
    private _leaderboard: LeaderboardEntry[] = [];
    private _userRank: number = 0;
    private _userName: string = '';
    private _userPoints: number = 0;

    constructor() {
        super();
        this.leaderboardService = LeaderboardService.getInstance();
        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.loadLeaderboard();
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    get leaderboard(): LeaderboardEntry[] {
        return this._leaderboard;
    }

    set leaderboard(value: LeaderboardEntry[]) {
        if (this._leaderboard !== value) {
            this._leaderboard = value;
            this.notifyPropertyChange('leaderboard', value);
        }
    }

    get userRank(): number {
        return this._userRank;
    }

    set userRank(value: number) {
        if (this._userRank !== value) {
            this._userRank = value;
            this.notifyPropertyChange('userRank', value);
        }
    }

    get userName(): string {
        return this._userName;
    }

    set userName(value: string) {
        if (this._userName !== value) {
            this._userName = value;
            this.notifyPropertyChange('userName', value);
        }
    }

    get userPoints(): number {
        return this._userPoints;
    }

    set userPoints(value: number) {
        if (this._userPoints !== value) {
            this._userPoints = value;
            this.notifyPropertyChange('userPoints', value);
        }
    }

    async loadLeaderboard(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[LeaderboardViewModel] No user logged in');
                return;
            }

            const [leaderboardData, userProfile, userRank] = await Promise.all([
                this.leaderboardService.getTopUsers(20),
                this.profileService.getProfile(currentUser.uid),
                this.leaderboardService.getUserRank(currentUser.uid)
            ]);

            this.leaderboard = leaderboardData;
            this.userRank = userRank;
            
            if (userProfile) {
                this.userName = userProfile.name || userProfile.email;
                this.userPoints = userProfile.points;
            }
        } catch (error) {
            console.error('[LeaderboardViewModel] Error loading leaderboard:', error);
        } finally {
            this.isLoading = false;
        }
    }
}