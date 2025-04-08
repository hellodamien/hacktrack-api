import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// List hackathons with pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const hackathons = await prisma.hackathon.findMany({
    skip: parseInt(skip),
    take: parseInt(limit),
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      theme: true,
      _count: { select: { teams: true } },
    },
  });

  // Remove _count from response and put the value in registeredTeamsCount
  const formattedHackathons = hackathons.map(({ _count, ...hackathon }) => ({
    ...hackathon,
    registeredTeams: _count.teams,
  }));

  res.json(formattedHackathons);
});

// Get hackathon details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      theme: true,
      teams: {
        select: {
          id: true,
          name: true,
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    }
  });

  if (!hackathon) {
    return res.status(404).json({ error: 'Hackathon not found' });
  }

  res.json(hackathon);
});

export default router;
