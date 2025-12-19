import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from "../../entities/user.entity";
import { CachedUser } from "../../types/caches/user.cache";
import { UserProfileReponse } from "../../responses/user-profile.response";
import { StatService } from "../stat/stat.service";
import { getJoinAt } from "../mezon/utils/date.util";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly statService: StatService,
  ) { }

  async createUserByMezonId(mezonUserId: string, displayName: string): Promise<User> {
    const newUser = this.userRepo.create({ mezonUserId: mezonUserId, username: displayName });
    return this.userRepo.save(newUser);
  }

  async findUserById(userId: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: userId }
    });
  }

  async getAllUsersInBatches(limit: number, offset = 0): Promise<User[]> {
    return this.userRepo.find({
      skip: offset,
      take: limit,
    });
  }

  async getUser(
    mezonUserId: string,
    useCache: boolean = true
  ): Promise<CachedUser | User | null> {
    const key = `user:${mezonUserId}`;

    if (useCache) {
      const cached = await this.cache.get<CachedUser>(key);
      if (cached) return cached;
    }

    const user = await this.userRepo.findOne({ where: { mezonUserId } });
    if (!user) return null;

    if (useCache) {
      const cachedUser: CachedUser = {
        id: user.id,
        mezonUserId: user.mezonUserId,
        username: user.username,
        joinedAt: user.joinedAt,
        role: user.role,
      };

      await this.cache.set(key, cachedUser, 86_400_000);
    }

    return user;
  }

  async getUserProfile(userId: number): Promise<UserProfileReponse> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userStat = await this.statService.findUserStats(userId);

    return {
      username: user.username,
      formattedJoinDate: getJoinAt(user.joinedAt),
      badges: userStat?.badges ?? [],
      points: userStat?.points ?? 0,
      streakDays: userStat?.streakDays ?? 0,
    };
  }
}