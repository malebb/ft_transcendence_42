import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { User } from 'ft_transcendence';
import { Friend } from '../../src/user/types/friend.type';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async addVictory(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            victory: {
              increment: 1,
            },
          },
        },
      },
    });
  }

  async addDefeat(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            defeat: {
              increment: 1,
            },
          },
        },
      },
    });
  }

  async addXp(userId: number, amount: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            xp: {
              increment: amount,
            },
          },
        },
      },
    });
  }

  async addLevel(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            level: {
              increment: 1,
            },
          },
        },
      },
    });
  }

  async updateLevel(userId: number, newLevel: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            level: newLevel,
          },
        },
      },
    });
  }

  async updateModeExplorer(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            modeExplorer: true,
          },
        },
      },
    });
  }

  async updateFashionWeek(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            fashionWeek: true,
          },
        },
      },
    });
  }

  async updateTraveler(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            traveler: true,
          },
        },
      },
    });
  }

  async updateFailureKnowledge(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stats: {
          update: {
            failureKnowledge: true,
          },
        },
      },
    });
  }

  isFriend(friends: Friend[], userId: number): boolean {
    let isFriend = false;
    friends.forEach((friend: Friend) => {
      if (friend.id == userId) isFriend = true;
    });
    return isFriend;
  }

  async getStats(userStatsId: number, userId: number) {
    try {
      const friends = await this.userService.getFriends(userId);

      if (userStatsId === userId || this.isFriend(friends, userStatsId)) {
        const userFriend = await this.prisma.user.findUnique({
          where: {
            id: userStatsId,
          },
          select: {
            stats: true,
          },
        });
        return userFriend.stats;
      } else {
        const user = await this.prisma.user.findUnique({
          where: {
            id: userStatsId,
          },
          select: {
            stats: {
              select: { defeat: true, victory: true, xp: true, level: true },
            },
          },
        });
        if (!user)
          throw new NotFoundException(
            'Stats of user ' + userStatsId + ' Not Found',
          );
        return user.stats;
      }
    } catch (err) {
      throw err;
    }
  }
}
