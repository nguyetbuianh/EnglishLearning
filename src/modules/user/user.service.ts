import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) { }

  async isRegistered(mezonUserId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { mezonUserId } });
    return !!user;
  }
}