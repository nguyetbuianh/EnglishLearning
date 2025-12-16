import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { UserService } from "./user.service";
import { UsersController } from "../../controllers/users.controller";
import { UserProcessService } from "../../services/user-process.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UserService,
    UserProcessService
  ],
  exports: [
    UserService,
    UserProcessService
  ],
})
export class UserModule { }
