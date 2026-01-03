import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Sparkles, Check, RefreshCw, Loader2 } from 'lucide-react';
import { getTasks, addTask, toggleTask, clearCompletedTasks } from '../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function TasksPage() {
    const { profile } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const loadTasks = async () => {
        if (profile?.id) {
            const t = await getTasks(profile.id);
            setTasks(t);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [profile]);

    const generateTasks = async () => {
        if (!profile) return;

        setIsGenerating(true);
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Generate 5 personalized daily health tasks for a person with this profile:
- Goal: ${profile.goal || 'General Wellness'}
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}

Return ONLY a JSON array of task strings (no markdown):
["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]

Tasks should be specific, actionable, and achievable in one day.`;

            const result = await model.generateContent(prompt);
            const text = (await result.response).text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const newTasks = JSON.parse(cleaned);

            // Add tasks to database
            for (const taskText of newTasks) {
                await addTask(profile.id, taskText);
            }

            await loadTasks();
        } catch (err) {
            console.error('Task generation failed:', err);
            setError('Failed to generate tasks. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleToggle = async (taskId) => {
        await toggleTask(taskId);
        await loadTasks();
    };

    const handleClearCompleted = async () => {
        await clearCompletedTasks(profile.id);
        await loadTasks();
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt).toDateString();
        return taskDate === new Date().toDateString();
    });

    return (
        <div className="tasks-page fade-in">
            <div className="page-header-inline">
                <h1><ClipboardList size={24} /> Your Tasks</h1>
                <button
                    className="btn-primary"
                    onClick={generateTasks}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <><Loader2 size={18} className="spin" /> Generating...</>
                    ) : (
                        <><Sparkles size={18} /> Generate AI Tasks</>
                    )}
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Progress */}
            <div className="tasks-progress">
                <div className="progress-info">
                    <span className="progress-label">Today's Progress</span>
                    <span className="progress-value">{completedCount} of {todayTasks.length} completed</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: todayTasks.length ? `${(completedCount / todayTasks.length) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Task List */}
            {tasks.length > 0 ? (
                <>
                    <div className="task-list">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                className={`task-item ${task.completed ? 'completed' : ''}`}
                                onClick={() => handleToggle(task.id)}
                            >
                                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                                    {task.completed && <Check size={14} />}
                                </div>
                                <span className="task-text">{task.text}</span>
                            </div>
                        ))}
                    </div>

                    {completedCount > 0 && (
                        <button className="btn-text clear-btn" onClick={handleClearCompleted}>
                            Clear completed tasks
                        </button>
                    )}
                </>
            ) : (
                <div className="empty-state-card">
                    <ClipboardList size={48} />
                    <h3>No tasks yet</h3>
                    <p>Click "Generate AI Tasks" to get personalized daily health tasks</p>
                </div>
            )}
        </div>
    );
}
