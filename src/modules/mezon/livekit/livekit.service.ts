import { HttpException, Injectable } from '@nestjs/common';
import {
  AccessToken,
  Room,
  RoomServiceClient,
} from 'livekit-server-sdk';
import { appConfig } from '../../../appConfig';
import { UserService } from '../../user/user.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LivekitService {
  private roomService: RoomServiceClient;
  private readonly maxParticipantsPerRoom = 50;

  constructor(
    private readonly userService: UserService
  ) {
    this.roomService = new RoomServiceClient(
      appConfig.livekit.url,
      appConfig.livekit.apiKey,
      appConfig.livekit.apiSecret,
    );
  }

  async createRoom(): Promise<string> {
    const roomName = `room-${uuid().slice(0, 6)}`;
    await this.roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      maxParticipants: this.maxParticipantsPerRoom,
    });
    return roomName;
  }

  async generateToken(userId: number, roomName: string): Promise<string> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const numberOfParticipants = await this.getRoomParticipantCount(roomName);
    if (numberOfParticipants >= this.maxParticipantsPerRoom) {
      throw new HttpException('Room is locked.', 423);
    }

    const token = new AccessToken(
      appConfig.livekit.apiKey,
      appConfig.livekit.apiSecret,
      {
        identity: userId.toString(),
        name: `${user.username}`,
        ttl: 60 * 30,
      },
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return token.toJwt();
  }

  async getRoomParticipantCount(roomName: string): Promise<number> {
    const rooms = await this.roomService.listRooms().then((rooms: Room[]) => {
      return rooms.filter((room) => room.name === roomName);
    });

    if (!rooms.length) return 0;

    return rooms[0].numParticipants ?? 0;
  }

}
