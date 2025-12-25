import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { RoomDto } from '../../../dtos/create-room.dto';
import { JwtAuthGuard } from '../../../auth/jwt.guard';
import { appConfig } from '../../../appConfig';

@Controller('call')
@UseGuards(JwtAuthGuard)
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) { }

  @Post('room')
  async createRoom(
    @Request() req,
  ) {
    const userId = Number(req.user.userId);
    const roomName = await this.livekitService.createRoom();

    return {
      roomName,
      createdBy: userId,
    };
  }

  @Post('token')
  async getToken(
    @Request() req,
    @Body() dto: RoomDto,
  ) {
    const userId = Number(req.user.userId);
    const token = await this.livekitService.generateToken(userId, dto.roomName);

    return {
      token,
      url: appConfig.livekit.url,
    };
  }
}
