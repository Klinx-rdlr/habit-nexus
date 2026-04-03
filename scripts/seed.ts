/**
 * HabitMap Seed Script
 *
 * Seeds demo data across all service databases for local development.
 * Run: npx ts-node scripts/seed.ts
 *
 * Prerequisites:
 *   - PostgreSQL running with all 4 databases created
 *   - Prisma migrations applied for each service
 */

import { PrismaClient as AuthPrisma } from '../services/auth-service/node_modules/@prisma/client';
import { PrismaClient as HabitPrisma } from '../services/habit-service/node_modules/@prisma/client';
import { PrismaClient as GroupPrisma } from '../services/group-service/node_modules/@prisma/client';
import { PrismaClient as NotificationPrisma } from '../services/notification-service/node_modules/@prisma/client';
import * as bcrypt from 'bcrypt';

const authDb = new AuthPrisma({
  datasources: { db: { url: process.env.AUTH_DB_URL || 'postgresql://habitmap:habitmap@localhost:5432/habitmap_auth' } },
});
const habitDb = new HabitPrisma({
  datasources: { db: { url: process.env.HABIT_DB_URL || 'postgresql://habitmap:habitmap@localhost:5432/habitmap_habits' } },
});
const groupDb = new GroupPrisma({
  datasources: { db: { url: process.env.GROUP_DB_URL || 'postgresql://habitmap:habitmap@localhost:5432/habitmap_groups' } },
});
const notificationDb = new NotificationPrisma({
  datasources: { db: { url: process.env.NOTIFICATION_DB_URL || 'postgresql://habitmap:habitmap@localhost:5432/habitmap_notifications' } },
});

// Fixed UUIDs for reproducible seed data
const USER_IDS = {
  alice: '00000000-0000-0000-0000-000000000001',
  bob: '00000000-0000-0000-0000-000000000002',
  charlie: '00000000-0000-0000-0000-000000000003',
};

const HABIT_IDS = {
  aliceExercise: '10000000-0000-0000-0000-000000000001',
  aliceReading: '10000000-0000-0000-0000-000000000002',
  aliceMeditation: '10000000-0000-0000-0000-000000000003',
  bobExercise: '10000000-0000-0000-0000-000000000004',
  bobCoding: '10000000-0000-0000-0000-000000000005',
  charlieJournal: '10000000-0000-0000-0000-000000000006',
};

const GROUP_ID = '20000000-0000-0000-0000-000000000001';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

async function seedUsers() {
  console.log('Seeding users...');
  const hash = await bcrypt.hash('password123', 10);

  const users = [
    { id: USER_IDS.alice, email: 'alice@example.com', username: 'alice', passwordHash: hash, timezone: 'Asia/Manila' },
    { id: USER_IDS.bob, email: 'bob@example.com', username: 'bob', passwordHash: hash, timezone: 'America/New_York' },
    { id: USER_IDS.charlie, email: 'charlie@example.com', username: 'charlie', passwordHash: hash, timezone: 'Europe/London' },
  ];

  for (const user of users) {
    await authDb.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log(`  Created ${users.length} users (password: password123)`);
}

async function seedHabits() {
  console.log('Seeding habits...');

  const habits = [
    {
      id: HABIT_IDS.aliceExercise,
      userId: USER_IDS.alice,
      name: 'Exercise',
      description: '30 minutes of cardio or strength training',
      color: '#10b981',
      frequencyType: 'daily',
      targetCount: 1,
      currentStreak: 12,
      longestStreak: 12,
    },
    {
      id: HABIT_IDS.aliceReading,
      userId: USER_IDS.alice,
      name: 'Read 20 pages',
      description: 'Read at least 20 pages of a non-fiction book',
      color: '#6366f1',
      frequencyType: 'daily',
      targetCount: 1,
      currentStreak: 30,
      longestStreak: 45,
    },
    {
      id: HABIT_IDS.aliceMeditation,
      userId: USER_IDS.alice,
      name: 'Meditate',
      description: '10 minutes of mindfulness meditation',
      color: '#f59e0b',
      frequencyType: 'custom',
      targetCount: 1,
      currentStreak: 5,
      longestStreak: 20,
    },
    {
      id: HABIT_IDS.bobExercise,
      userId: USER_IDS.bob,
      name: 'Morning Run',
      description: '5K run before work',
      color: '#ef4444',
      frequencyType: 'custom',
      targetCount: 1,
      currentStreak: 8,
      longestStreak: 15,
    },
    {
      id: HABIT_IDS.bobCoding,
      userId: USER_IDS.bob,
      name: 'LeetCode',
      description: 'Solve one LeetCode problem',
      color: '#8b5cf6',
      frequencyType: 'daily',
      targetCount: 1,
      currentStreak: 22,
      longestStreak: 22,
    },
    {
      id: HABIT_IDS.charlieJournal,
      userId: USER_IDS.charlie,
      name: 'Journal',
      description: 'Write a daily journal entry',
      color: '#ec4899',
      frequencyType: 'daily',
      targetCount: 1,
      currentStreak: 7,
      longestStreak: 60,
    },
  ];

  for (const habit of habits) {
    await habitDb.habit.upsert({
      where: { id: habit.id },
      update: {},
      create: habit,
    });
  }

  // Custom schedule for Alice's meditation: Mon, Wed, Fri (0, 2, 4)
  for (const day of [0, 2, 4]) {
    await habitDb.habitSchedule.upsert({
      where: { habitId_dayOfWeek: { habitId: HABIT_IDS.aliceMeditation, dayOfWeek: day } },
      update: {},
      create: { habitId: HABIT_IDS.aliceMeditation, dayOfWeek: day },
    });
  }

  // Custom schedule for Bob's run: Mon, Wed, Fri, Sat (0, 2, 4, 5)
  for (const day of [0, 2, 4, 5]) {
    await habitDb.habitSchedule.upsert({
      where: { habitId_dayOfWeek: { habitId: HABIT_IDS.bobExercise, dayOfWeek: day } },
      update: {},
      create: { habitId: HABIT_IDS.bobExercise, dayOfWeek: day },
    });
  }

  console.log(`  Created ${habits.length} habits with schedules`);
}

async function seedCompletions() {
  console.log('Seeding completions...');

  let count = 0;

  // Alice Exercise: completed last 12 days
  for (let i = 0; i < 12; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.aliceExercise, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.aliceExercise, completedDate: date },
    });
    count++;
  }

  // Alice Reading: completed last 30 days
  for (let i = 0; i < 30; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.aliceReading, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.aliceReading, completedDate: date },
    });
    count++;
  }

  // Alice Reading: older streak of 45 days (gap at day 31)
  for (let i = 32; i < 77; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.aliceReading, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.aliceReading, completedDate: date },
    });
    count++;
  }

  // Bob LeetCode: completed last 22 days
  for (let i = 0; i < 22; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.bobCoding, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.bobCoding, completedDate: date },
    });
    count++;
  }

  // Charlie Journal: completed last 7 days
  for (let i = 0; i < 7; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.charlieJournal, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.charlieJournal, completedDate: date },
    });
    count++;
  }

  // Charlie Journal: older streak of 60 days (gap at day 8)
  for (let i = 9; i < 69; i++) {
    const date = daysAgo(i);
    await habitDb.completion.upsert({
      where: { habitId_completedDate: { habitId: HABIT_IDS.charlieJournal, completedDate: date } },
      update: {},
      create: { habitId: HABIT_IDS.charlieJournal, completedDate: date },
    });
    count++;
  }

  console.log(`  Created ${count} completion records`);
}

async function seedGroups() {
  console.log('Seeding groups...');

  await groupDb.group.upsert({
    where: { id: GROUP_ID },
    update: {},
    create: {
      id: GROUP_ID,
      createdBy: USER_IDS.alice,
      name: 'Accountability Squad',
      description: 'Daily habits, weekly check-ins. No excuses.',
      inviteCode: 'SQUAD2024',
    },
  });

  const members = [
    { groupId: GROUP_ID, userId: USER_IDS.alice, role: 'admin' },
    { groupId: GROUP_ID, userId: USER_IDS.bob, role: 'member' },
    { groupId: GROUP_ID, userId: USER_IDS.charlie, role: 'member' },
  ];

  for (const member of members) {
    await groupDb.groupMember.upsert({
      where: { groupId_userId: { groupId: member.groupId, userId: member.userId } },
      update: {},
      create: member,
    });
  }

  console.log(`  Created 1 group with ${members.length} members (invite code: SQUAD2024)`);
}

async function seedNotifications() {
  console.log('Seeding notifications...');

  const notifications = [
    {
      userId: USER_IDS.alice,
      type: 'streak_milestone',
      message: "You've hit a 30-day streak on 'Read 20 pages'!",
      isRead: false,
      metadata: { habitId: HABIT_IDS.aliceReading, milestone: 30 },
    },
    {
      userId: USER_IDS.alice,
      type: 'member_joined',
      message: "bob joined 'Accountability Squad'",
      isRead: true,
      metadata: { groupId: GROUP_ID, userId: USER_IDS.bob },
    },
    {
      userId: USER_IDS.bob,
      type: 'streak_milestone',
      message: "You've hit a 7-day streak on 'LeetCode'!",
      isRead: true,
      metadata: { habitId: HABIT_IDS.bobCoding, milestone: 7 },
    },
    {
      userId: USER_IDS.bob,
      type: 'member_joined',
      message: "charlie joined 'Accountability Squad'",
      isRead: false,
      metadata: { groupId: GROUP_ID, userId: USER_IDS.charlie },
    },
    {
      userId: USER_IDS.charlie,
      type: 'streak_broken',
      message: "Your streak of 60 days for 'Journal' was broken",
      isRead: true,
      metadata: { habitId: HABIT_IDS.charlieJournal, previousStreak: 60 },
    },
    {
      userId: USER_IDS.charlie,
      type: 'habit_completed',
      message: "Great job! You completed 'Journal' today",
      isRead: false,
      metadata: { habitId: HABIT_IDS.charlieJournal, currentStreak: 7 },
    },
  ];

  for (const notification of notifications) {
    await notificationDb.notification.create({ data: notification });
  }

  console.log(`  Created ${notifications.length} notifications`);
}

async function main() {
  console.log('\nHabitMap Seed Script\n' + '='.repeat(40));

  try {
    await seedUsers();
    await seedHabits();
    await seedCompletions();
    await seedGroups();
    await seedNotifications();

    console.log('\n' + '='.repeat(40));
    console.log('Seeding complete!\n');
    console.log('Demo accounts:');
    console.log('  alice@example.com / password123 (Asia/Manila)');
    console.log('  bob@example.com   / password123 (America/New_York)');
    console.log('  charlie@example.com / password123 (Europe/London)');
    console.log('\nGroup invite code: SQUAD2024');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await authDb.$disconnect();
    await habitDb.$disconnect();
    await groupDb.$disconnect();
    await notificationDb.$disconnect();
  }
}

main();
