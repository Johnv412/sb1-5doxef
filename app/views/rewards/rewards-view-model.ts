import { Observable, alert } from '@nativescript/core';
import { RewardsService, Reward } from '../../services/rewards-service';
import { AuthService } from '../../services/auth-service';
import { ProfileService } from '../../services/profile-service';

interface RewardViewModel extends Reward {
    canAfford: boolean;
}

export class RewardsViewModel extends Observable {
    private rewardsService: RewardsService;
    private authService: AuthService;
    private profileService: ProfileService;
    private _isLoading: boolean = false;
    private _rewards: RewardViewModel[] = [];
    private _userPoints: number = 0;
    private _selectedFilter: string = 'all';

    constructor() {
        super();
        this.rewardsService = RewardsService.getInstance();
        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.loadRewards();
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

    get rewards(): RewardViewModel[] {
        return this._rewards;
    }

    set rewards(value: RewardViewModel[]) {
        if (this._rewards !== value) {
            this._rewards = value;
            this.notifyPropertyChange('rewards', value);
            this.notifyPropertyChange('filteredRewards', this.filteredRewards);
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

    get selectedFilter(): string {
        return this._selectedFilter;
    }

    set selectedFilter(value: string) {
        if (this._selectedFilter !== value) {
            this._selectedFilter = value;
            this.notifyPropertyChange('selectedFilter', value);
            this.notifyPropertyChange('filteredRewards', this.filteredRewards);
        }
    }

    get filteredRewards(): RewardViewModel[] {
        if (this._selectedFilter === 'all') {
            return this._rewards;
        }
        return this._rewards.filter(reward => reward.type === this._selectedFilter);
    }

    async loadRewards(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[RewardsViewModel] No user logged in');
                return;
            }

            const [availableRewards, userProfile] = await Promise.all([
                this.rewardsService.getAvailableRewards(),
                this.profileService.getProfile(currentUser.uid)
            ]);

            this.userPoints = userProfile?.points || 0;
            
            this.rewards = availableRewards.map(reward => ({
                ...reward,
                canAfford: this.userPoints >= reward.cost
            }));
        } catch (error) {
            console.error('[RewardsViewModel] Error loading rewards:', error);
        } finally {
            this.isLoading = false;
        }
    }

    onFilterTap(args: any): void {
        const button = args.object;
        this.selectedFilter = button.text.toLowerCase();
    }

    async onRedeemTap(args: any): Promise<void> {
        try {
            const reward = args.object.bindingContext as RewardViewModel;
            if (!reward.canAfford) return;

            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[RewardsViewModel] No user logged in');
                return;
            }

            const result = await alert({
                title: "Redeem Reward",
                message: `Are you sure you want to redeem ${reward.name} for ${reward.cost} points?`,
                okButtonText: "Yes",
                cancelButtonText: "No"
            });

            if (result) {
                await this.rewardsService.redeemReward(
                    currentUser.uid,
                    reward.id,
                    this.userPoints
                );

                this.userPoints -= reward.cost;
                this.loadRewards(); // Refresh the rewards list

                alert({
                    title: "Success!",
                    message: `You've successfully redeemed ${reward.name}!`,
                    okButtonText: "OK"
                });
            }
        } catch (error: any) {
            alert({
                title: "Error",
                message: error.message || "Failed to redeem reward",
                okButtonText: "OK"
            });
        }
    }
}