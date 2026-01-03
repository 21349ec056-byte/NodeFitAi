import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History, Search, Utensils, Calendar } from 'lucide-react';
import { getAllMeals } from '../lib/db';

export default function FoodHistory() {
    const { profile, user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMeals = async () => {
            const storageId = profile?.id || (user?.id ? `temp_${user.id}` : null);
            if (storageId) {
                const m = await getAllMeals(storageId);
                setMeals(m);
            }
            setIsLoading(false);
        };
        loadMeals();
    }, [profile, user]);

    const filteredMeals = meals.filter(meal => {
        const searchLower = searchQuery.toLowerCase();
        return (
            meal.analysis?.foodName?.toLowerCase().includes(searchLower) ||
            meal.analysis?.ingredients?.some(i => i.toLowerCase().includes(searchLower))
        );
    });

    // Group meals by date
    const groupedMeals = filteredMeals.reduce((acc, meal) => {
        const date = new Date(meal.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(meal);
        return acc;
    }, {});

    const totalCalories = filteredMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

    return (
        <div className="history-page fade-in">
            <div className="page-header-inline">
                <h1><History size={24} /> Food History</h1>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search meals or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Summary */}
            <div className="history-summary">
                <div className="summary-stat">
                    <span className="stat-value">{filteredMeals.length}</span>
                    <span className="stat-label">Total Meals</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-value">{totalCalories.toLocaleString()}</span>
                    <span className="stat-label">Total Calories</span>
                </div>
            </div>

            {/* Meal List */}
            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading history...</p>
                </div>
            ) : Object.keys(groupedMeals).length > 0 ? (
                <div className="meal-groups">
                    {Object.entries(groupedMeals).map(([date, dayMeals]) => (
                        <div key={date} className="meal-group">
                            <div className="group-header">
                                <Calendar size={16} />
                                <span>{date}</span>
                                <span className="group-calories">
                                    {dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0)} kcal
                                </span>
                            </div>
                            <div className="group-meals">
                                {dayMeals.map(meal => (
                                    <div key={meal.id} className="history-meal-card">
                                        {meal.photoBlob && (
                                            <img src={meal.photoBlob} alt={meal.analysis?.foodName} className="meal-thumb" />
                                        )}
                                        <div className="meal-details">
                                            <span className="meal-name">{meal.analysis?.foodName || 'Unknown'}</span>
                                            <div className="meal-meta">
                                                <span className="meal-calories">{meal.calories || 0} kcal</span>
                                                <span className={`meal-score ${meal.analysis?.nutritionScore?.toLowerCase()}`}>
                                                    {meal.analysis?.nutritionScore || 'N/A'}
                                                </span>
                                            </div>
                                            {meal.analysis?.ingredients && (
                                                <div className="meal-ingredients">
                                                    {meal.analysis.ingredients.slice(0, 3).map((ing, i) => (
                                                        <span key={i} className="ingredient-tag">{ing}</span>
                                                    ))}
                                                    {meal.analysis.ingredients.length > 3 && (
                                                        <span className="ingredient-more">
                                                            +{meal.analysis.ingredients.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state-card">
                    <Utensils size={48} />
                    <h3>No meals found</h3>
                    <p>{searchQuery ? 'Try a different search term' : 'Start scanning your meals to build your history'}</p>
                </div>
            )}
        </div>
    );
}
