import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from "../../entities/user.entity";
import { CachedUser } from "../../types/caches/user.cache";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache
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

  async getUser(mezonUserId: string, useCache: boolean = true): Promise<CachedUser | null> {
    const key = `user:${mezonUserId}`;

    if (useCache) {
      const cached = await this.cache.get<CachedUser>(key);
      if (cached) return cached;
    }

    const user = await this.userRepo.findOne({ where: { mezonUserId } });
    if (!user) return null;

    const cachedUser: CachedUser = {
      id: user.id,
      mezonUserId: user.mezonUserId,
      username: user.username,
      joinedAt: user.joinedAt,
    };

    if (useCache) await this.cache.set(key, cachedUser, 86_400_000);

    return cachedUser;
  }
}