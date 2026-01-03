import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export default function StreakCounter({ current, longest }) {
    const [displayCount, setDisplayCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (current > 0) {
            setIsAnimating(true);
            // Animate count up
            const duration = 1000;
            const steps = Math.min(current, 30);
            const stepTime = duration / steps;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                setDisplayCount(Math.round((step / steps) * current));
                if (step >= steps) {
                    clearInterval(timer);
                    setDisplayCount(current);
                }
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [current]);

    const isMilestone = current >= 7;

    return (
        <div className={`streak-counter ${isAnimating ? 'animate' : ''} ${isMilestone ? 'milestone' : ''}`}>
            <div className="streak-icon">
                <Flame size={24} />
                {isMilestone && <div className="streak-glow" />}
            </div>
            <div className="streak-info">
                <div className="streak-number">{displayCount}</div>
                <div className="streak-label">Day Streak</div>
            </div>
            {longest > current && (
                <div className="streak-best">
                    Best: {longest} days
                </div>
            )}
        </div>
    );
}
