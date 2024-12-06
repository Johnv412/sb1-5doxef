import { Observable } from '@nativescript/core';
import { AchievementService, Achievement } from '../../services/achievement-service';
import { AuthService } from '../../services/auth-service';
import { ProfileService } from '../../services/profile-service';
import { ProgressService } from '../../services/progress-service';
import { StreakService } from '../../services/streak-service';

interface AchievementViewModel extends Achievement {
    isUnlocked: boolean;
    progressText: string;
}

export class AchievementsViewModel extends Observable {
    private achievementService: AchievementService;
    private authService: AuthService;
    private profileService: ProfileService;
    private progressService: ProgressService;
    private streakService: StreakService;
    private _isLoading: boolean = false;
    private _achievements: AchievementViewModel[] = [];

    constructor() {
        super();
        this.achievementService = AchievementService.getInstance();
        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.progressService = ProgressService.getInstance();
        this.streakService = StreakService.getInstance();
        this.loadAchievements();
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

    get achievements(): AchievementViewModel[] {
        return this._achievements;
    }

    set achievements(value: AchievementViewModel[]) {
        if (this._achievements !== value) {
            this._achievements = value;
            this.notifyPropertyChange('achievements', value);
        }
    }

    async loadAchievements(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[AchievementsViewModel] No user logged in');
                return;
            }

            const [userAchievements, profile, progress, streak] = await Promise.all([
                this.achievementService.getUserAchievements(currentUser.uid),
                this.profileService.getProfile(currentUser.uid),
                this.progressService.getProgress(currentUser.uid),
                this.streakService.getStreak(currentUser.uid)
            ]);

            const allAchievements = this.achievementService.getAllAchievements();
            const stats = {
                lessons: progress.completedLessons,
                streak,
                points: profile?.points || 0
            };

            this.achievements = allAchievements.map(achievement => {
                const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
                const { type, value } = achievement.requirement;
                let currentValue = 0;

                switch (type) {
                    case 'lessons':
                        currentValue = stats.lessons;
                        break;
                    case 'streak':
                        currentValue = stats.streak;
                        break;
                    case 'points':
                        currentValue = stats.points;
                        break;
                }

                return {
                    ...achievement,
                    isUnlocked,
                    progressText: isUnlocked ? '' : `Progress: ${currentValue}/${value}`
                };
            });
        } catch (error) {
            console.error('[AchievementsViewModel] Error loading achievements:', error);
        } finally {
            this.isLoading = false;
        }
    }
}