import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getOrCreateUserByMezonId(mezonUserId: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { mezon_user_id: mezonUserId } });
    if (!user) {
      user = this.userRepo.create({ mezon_user_id: mezonUserId });
      user = await this.userRepo.save(user);
    }
    return user;
  }

  async findByMezonId(mezonUserId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { mezon_user_id: mezonUserId } });
  }
}
