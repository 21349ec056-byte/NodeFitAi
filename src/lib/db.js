import Dexie from 'dexie';

// Create database
export const db = new Dexie('nodeFitDB');

// Define schema - version 3 adds users table for auth
db.version(3).stores({
    users: '++id, email, createdAt',
    profiles: '++id, userId, name, gender, createdAt',
    reports: '++id, profileId, createdAt',
    streaks: '++id, profileId',
    badges: '++id, profileId, badgeType, [profileId+badgeType], earnedAt',
    meals: '++id, profileId, createdAt',
    cycles: '++id, profileId, startDate',
    tasks: '++id, profileId, completed, createdAt',
});

// ==================== AUTH OPERATIONS ====================

// Simple hash function for password (not cryptographically secure, but works locally)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

export async function createUser(email, password) {
    const existing = await db.users.where('email').equals(email.toLowerCase()).first();
    if (existing) {
        throw new Error('Email already registered');
    }

    const id = await db.users.add({
        email: email.toLowerCase(),
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString(),
    });
    return id;
}

export async function authenticateUser(email, password) {
    const user = await db.users.where('email').equals(email.toLowerCase()).first();
    if (!user) {
        throw new Error('Invalid email or password');
    }
    if (user.passwordHash !== simpleHash(password)) {
        throw new Error('Invalid email or password');
    }
    return user;
}

export async function getUser(id) {
    return await db.users.get(id);
}

// ==================== PROFILE OPERATIONS ====================

export async function createProfile(userId, profileData) {
    const id = await db.profiles.add({
        userId,
        ...profileData,
        createdAt: new Date().toISOString(),
    });
    return id;
}

export async function getProfileByUserId(userId) {
    return await db.profiles.where('userId').equals(userId).first();
}

export async function getProfile(id) {
    return await db.profiles.get(id);
}

export async function updateProfile(id, data) {
    return await db.profiles.update(id, data);
}

export async function deleteProfile(id) {
    await db.reports.where('profileId').equals(id).delete();
    await db.streaks.where('profileId').equals(id).delete();
    await db.badges.where('profileId').equals(id).delete();
    await db.meals.where('profileId').equals(id).delete();
    await db.cycles.where('profileId').equals(id).delete();
    await db.tasks.where('profileId').equals(id).delete();
    await db.profiles.delete(id);
}

// ==================== REPORT OPERATIONS ====================

export async function saveReport(profileId, reportJson) {
    return await db.reports.add({
        profileId,
        reportJson,
        createdAt: new Date().toISOString(),
    });
}

export async function getReports(profileId) {
    return await db.reports.where('profileId').equals(profileId).reverse().toArray();
}

export async function getLatestReport(profileId) {
    return await db.reports.where('profileId').equals(profileId).last();
}

// ==================== STREAK OPERATIONS ====================

export async function getOrCreateStreak(profileId) {
    let streak = await db.streaks.where('profileId').equals(profileId).first();
    if (!streak) {
        const id = await db.streaks.add({
            profileId,
            current: 0,
            longest: 0,
            lastActive: null,
        });
        streak = await db.streaks.get(id);
    }
    return streak;
}

export async function updateStreak(profileId) {
    const streak = await getOrCreateStreak(profileId);
    const today = new Date().toDateString();
    const lastActive = streak.lastActive ? new Date(streak.lastActive).toDateString() : null;

    if (lastActive === today) return streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = lastActive === yesterday.toDateString() ? streak.current + 1 : 1;
    const newLongest = Math.max(streak.longest, newCurrent);

    await db.streaks.update(streak.id, {
        current: newCurrent,
        longest: newLongest,
        lastActive: new Date().toISOString(),
    });

    return { ...streak, current: newCurrent, longest: newLongest };
}

// ==================== BADGE OPERATIONS ====================

export const BADGE_TYPES = {
    FIRST_SCAN: 'first_scan',
    STEP_MASTER: 'step_master',
    CLEAN_EATER: 'clean_eater',
    SLEEP_CHAMPION: 'sleep_champion',
    STREAK_7: 'streak_7',
    STREAK_30: 'streak_30',
    GOAL_CRUSHER: 'goal_crusher',
    FOOD_LOGGER: 'food_logger',
    HYDRATION_HERO: 'hydration_hero',
    EARLY_BIRD: 'early_bird',
};

export async function awardBadge(profileId, badgeType) {
    const existing = await db.badges
        .where('[profileId+badgeType]')
        .equals([profileId, badgeType])
        .first();

    if (existing) return null;

    return await db.badges.add({
        profileId,
        badgeType,
        earnedAt: new Date().toISOString(),
    });
}

export async function getBadges(profileId) {
    return await db.badges.where('profileId').equals(profileId).toArray();
}

// ==================== MEAL OPERATIONS ====================

export async function logMeal(profileId, mealData) {
    return await db.meals.add({
        profileId,
        ...mealData,
        createdAt: new Date().toISOString(),
    });
}

export async function getMeals(profileId, limit = 50) {
    return await db.meals
        .where('profileId')
        .equals(profileId)
        .reverse()
        .limit(limit)
        .toArray();
}

export async function getAllMeals(profileId) {
    return await db.meals.where('profileId').equals(profileId).reverse().toArray();
}

// ==================== TASK OPERATIONS ====================

export async function addTask(profileId, taskText) {
    return await db.tasks.add({
        profileId,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
    });
}

export async function getTasks(profileId) {
    return await db.tasks.where('profileId').equals(profileId).reverse().toArray();
}

export async function toggleTask(taskId) {
    const task = await db.tasks.get(taskId);
    if (task) {
        await db.tasks.update(taskId, { completed: !task.completed });
    }
}

export async function clearCompletedTasks(profileId) {
    await db.tasks.where('profileId').equals(profileId).filter(t => t.completed).delete();
}

// ==================== CYCLE OPERATIONS ====================

export async function logCycle(profileId, startDate, endDate = null, notes = '') {
    return await db.cycles.add({
        profileId,
        startDate,
        endDate,
        notes,
    });
}

export async function getCycles(profileId) {
    return await db.cycles.where('profileId').equals(profileId).reverse().toArray();
}

export async function updateCycle(id, data) {
    return await db.cycles.update(id, data);
}
