import { BADGE_TYPES } from '../lib/db';

const BADGE_INFO = {
    [BADGE_TYPES.FIRST_SCAN]: { name: 'First Flame', icon: '🔥', desc: 'Complete first health scan' },
    [BADGE_TYPES.STEP_MASTER]: { name: 'Step Master', icon: '🏃', desc: '10K steps in a day' },
    [BADGE_TYPES.CLEAN_EATER]: { name: 'Clean Eater', icon: '🥗', desc: 'Log 7 healthy meals' },
    [BADGE_TYPES.SLEEP_CHAMPION]: { name: 'Sleep Champion', icon: '😴', desc: '8h sleep for 5 days' },
    [BADGE_TYPES.STREAK_7]: { name: '7-Day Warrior', icon: '📅', desc: '7-day streak' },
    [BADGE_TYPES.STREAK_30]: { name: 'Monthly Master', icon: '🗓️', desc: '30-day streak' },
    [BADGE_TYPES.GOAL_CRUSHER]: { name: 'Goal Crusher', icon: '🎯', desc: 'Reach primary goal' },
    [BADGE_TYPES.FOOD_LOGGER]: { name: 'Food Logger', icon: '📸', desc: 'Log 10 meals' },
    [BADGE_TYPES.HYDRATION_HERO]: { name: 'Hydration Hero', icon: '💧', desc: 'Track water 7 days' },
    [BADGE_TYPES.EARLY_BIRD]: { name: 'Early Bird', icon: '🌅', desc: 'Log before 7 AM' },
};

export default function BadgeGrid({ earnedBadges = [] }) {
    const earnedTypes = earnedBadges.map(b => b.badgeType);

    return (
        <div className="badge-grid">
            {Object.entries(BADGE_INFO).map(([type, info]) => {
                const isEarned = earnedTypes.includes(type);
                return (
                    <div
                        key={type}
                        className={`badge-item ${isEarned ? 'earned' : 'locked'}`}
                        title={isEarned ? `${info.name} - Earned!` : `${info.name} - ${info.desc}`}
                    >
                        <div className="badge-icon">
                            {isEarned ? info.icon : '🔒'}
                        </div>
                        <span className="badge-name">{info.name}</span>
                    </div>
                );
            })}
        </div>
    );
}
