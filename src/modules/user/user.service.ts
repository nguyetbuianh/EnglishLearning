import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async findUserByMezonId(mezonUserId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { mezonUserId: mezonUserId } });
  }

  async createUserByMezonId(mezonUserId: string): Promise<User> {
    const newUser = this.userRepo.create({ mezonUserId: mezonUserId });
    return this.userRepo.save(newUser);
  }

  async getOrCreateUserByMezonId(mezonUserId: string): Promise<User> {
    let user = await this.findUserByMezonId(mezonUserId);
    if (!user) {
      user = await this.createUserByMezonId(mezonUserId);
    }
    return user;
  }
}
