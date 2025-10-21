import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}