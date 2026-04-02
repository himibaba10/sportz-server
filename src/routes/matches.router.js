import { desc } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { getMatchStatus } from '../utils/match-status.js';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.validation.js';

export const matchRouter = Router();

matchRouter.get('/', async (req, res) => {
  try {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query.', details: parsed.error.issues });
    }

    const limit = Math.min(parsed?.data?.limit ?? 50, 100);

    const events = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
    res.status(200).json({ message: 'Matches List', data: events });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches.', details: JSON.stringify(error) });
  }
});

matchRouter.post('/', async (req, res) => {
  try {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload.', details: parsed.error.issues });
    }

    const {
      data: { startTime, endTime, homeScore, awayScore },
    } = parsed;

    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();
    res.status(201).json({ message: 'Match created successfully.', data: event });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create a match.', details: JSON.stringify(error) });
  }
});
