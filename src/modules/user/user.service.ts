import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from "../../entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) { }

  async findUserByMezonId(mezonUserId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { mezonUserId: mezonUserId } });
  }

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

  async getUserInCache(mezonUserId: string) {
    const key = `user:${mezonUserId}`;
    const cached = await this.cache.get(key);
    if (cached) {
      return cached;
    }

    const user = await this.findUserByMezonId(mezonUserId);
    await this.cache.set(key, {
      id: user?.id,
      mezonUserId: user?.mezonUserId,
      username: user?.username,
      joinedAt: user?.joinedAt
    }, 86_400_000);
    return user;
  }
}