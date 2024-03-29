import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import * as fs from 'fs';
import { Friend, NeutralUser } from './types';
import { User, Activity } from '@prisma/client';
import { Socket } from 'socket.io';
import { getIdFromToken, isAuthEmpty, getIdIfValid } from '../gatewayUtils/gatewayUtils';


const DEFAULT_IMG = 'uploads/profileimages/default_profile_picture.png';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

	// user gateway: 
	clients: Socket[] = [];

  mapArrayUserToNeutralUser(user: User[]): NeutralUser[] {
    const ret = user.map(
      ({ id, createdAt, id42, username, profilePicture, status }) => ({
        id,
        createdAt,
        id42,
        username,
        profilePicture,
        status,
      }),
    );
    return ret;
  }

  mapUserToFriend(user: User): Friend {
    const id = user.id;
    const createdAt = user.createdAt;
    const id42 = user.id42;
    const username = user.username;
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const profilePicture = user.profilePicture;
    const skin = user.skin;
    const map = user.map;
    return {
      id,
      createdAt,
      id42,
      username,
      email,
      firstName,
      lastName,
      profilePicture,
      skin,
      map,
    };
  }
  mapUserToNeutralUser(user: User): NeutralUser {
    const id = user.id;
    const createdAt = user.createdAt;
    const id42 = user.id42;
    const username = user.username;
    const profilePicture = user.profilePicture;
    const status = user.status;
    return { id, createdAt, id42, username, profilePicture, status };
  }
  async getFriends(userId: number): Promise<Friend[]> {
    const friendArray: Friend[] = [];
    const crea_request = await this.prisma.friendRequest.findMany({
      where: {
        creatorId: userId,
        status: 'accepted',
      },
    });
    await Promise.all(
      crea_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.receiverId,
          },
        });
        if (user) friendArray.push(this.mapUserToFriend(user));
      }),
    );
    const recv_request = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'accepted',
      },
    });
    await Promise.all(
      recv_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.creatorId,
          },
        });
        if (user) friendArray.push(this.mapUserToFriend(user));
      }),
    );
    return friendArray;
  }

  async getUserProfile(userId: number): Promise<NeutralUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return;
    // throw new NotFoundException('User profile ' + userId + ' Not Found');
    return this.mapUserToNeutralUser(user);
  }
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;
    return user;
  }
  async setUserOnLineOffline(userId: number, newStatus: Activity) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        //https://stackoverflow.com/questions/31816061/why-am-i-getting-an-error-object-literal-may-only-specify-known-properties
        status: newStatus,
      },
    });
    return user;
  }

  async editUsername(userId: number, dto: EditUserDto) {
    try {
      const already_use = await this.prisma.user.findUnique({
        where: {
          username: dto.login,
        },
      });
      if (already_use) throw new ForbiddenException();
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: dto.login,
        },
      });

      delete user.hash;
      return user;
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      else
        throw new InternalServerErrorException(
          'Internal Eroor trying to update login',
        );
    }
  }

  async uploadPicture(userId: number, imagePath: string) {
    try {
      const img_to_del = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      const user = await this.prisma.user.update({
        data: {
          profilePicture: imagePath,
        },
        where: {
          id: userId,
        },
      });
      if (
        img_to_del.profilePicture !== user.profilePicture &&
        img_to_del.profilePicture !== DEFAULT_IMG
      ) {
        await fs.unlink(img_to_del.profilePicture, (err) => {
          if (err) {
            console.error(err);
            return err;
          }
        });
      }
      delete user.hash;
      return user;
    } catch (err: any) {
      throw new InternalServerErrorException('Error patching picture');
    }
  }

  async getCustomisation(userId: number) {
    const customisation = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        skin: true,
        map: true,
      },
    });
    return customisation;
  }

  async alreadyRequested(
    creatorId: number,
    receiverId: number,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });
    if (!user)
      throw new ForbiddenException('User ' + creatorId + ' forbidden action');
    let request = await this.prisma.friendRequest.findFirst({
      where: {
        creatorId: creatorId,
        receiverId: receiverId,
      },
    });
    if (!request) {
      request = await this.prisma.friendRequest.findFirst({
        where: {
          creatorId: receiverId,
          receiverId: creatorId,
        },
      });
    }
    if (!request) return '';
    return request.status;
  }

  async createFriendRequest(
    creatorId: number,
    receiverId: number,
  ): Promise<string> {
    if (creatorId == receiverId)
      throw new ForbiddenException('User ' + creatorId + ' forbidden action');
    const status = await this.alreadyRequested(creatorId, receiverId);
    if (status === '') {
      const newreq = await this.prisma.friendRequest.create({
        data: {
          status: 'pending',
          creatorId: creatorId,
          receiverId: receiverId,
        },
      });
      return newreq.status;
    }
    return status;
  }

  async acceptFriendRequestByUserId(myId: number, userId: number) {
    if (myId == userId) return;
    const user = await this.prisma.friendRequest.updateMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
      data: {
        status: 'accepted',
      },
    });
    if (user.count == 0)
      throw new ForbiddenException('User ' + myId + ' forbidden action');
    return user;
  }
  async acceptFriendRequestByReqId(requestId: number, myId: number) {
    const user = await this.prisma.friendRequest.updateMany({
      where: {
        id: requestId,
        receiverId: myId,
      },
      data: {
        status: 'accepted',
      },
    });
    if (user.count == 0)
      throw new ForbiddenException('User ' + myId + ' forbidden action');
    return user;
  }

  async declineFriendRequest(requestId: number, myId: number) {
    const user = await this.prisma.friendRequest.updateMany({
      where: {
        id: requestId,
        receiverId: myId,
      },
      data: {
        status: 'declined',
      },
    });
    if (user.count == 0)
      throw new ForbiddenException('User ' + myId + ' forbidden action');
    return user;
  }
  async declineFriendRequestByUserId(myId: number, userId: number) {
    if (myId == userId) return;
    const user = await this.prisma.friendRequest.updateMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
      data: {
        status: 'declined',
      },
    });
    if (user.count == 0)
      throw new ForbiddenException('User ' + myId + ' forbidden action');
    return user;
  }
  async deleteFriendRequestByUserId(myId: number, userId: number) {
    if (myId == userId) return;
    const ret = await this.prisma.friendRequest.deleteMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
    });
    const ret2 = await this.prisma.friendRequest.deleteMany({
      where: {
        creatorId: myId,
        receiverId: userId,
      },
    });
    if (ret.count === 1 && ret2.count === 0) return ret;
    else if (ret.count === 0 && ret2.count === 1) return ret2;
    else throw new ForbiddenException('User ' + myId + ' forbidden action');
  }

  async getRecvPendingRequest(userId: number): Promise<NeutralUser[]> {
    const waitingArray: NeutralUser[] = [];
    const recv_request = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
    });
    await Promise.all(
      recv_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.creatorId,
          },
        });
        if (user) waitingArray.push(this.mapUserToNeutralUser(user));
      }),
    );
    return waitingArray;
  }
  async getCreatedPendingRequest(userId: number): Promise<NeutralUser[]> {
    const pendingArray: NeutralUser[] = [];
    const crea_request = await this.prisma.friendRequest.findMany({
      where: {
        creatorId: userId,
        status: 'pending',
      },
    });
    await Promise.all(
      crea_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.receiverId,
          },
        });
        if (user) pendingArray.push(this.mapUserToNeutralUser(user));
      }),
    );
    return pendingArray;
  }

  async checkSenderStatus(myId: number, userId: number): Promise<string> {
    let req = await this.prisma.friendRequest.findFirst({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
    });
    if (!req) {
      req = await this.prisma.friendRequest.findFirst({
        where: {
          receiverId: userId,
          creatorId: myId,
        },
      });
      if (!req) return '';
      else return 'creator';
    }
    return 'receiver';
  }

  async getAllUser(): Promise<NeutralUser[]> {
    const users = await this.prisma.user.findMany();
    const ret = this.mapArrayUserToNeutralUser(users);
    return ret;
  }

  async block(idToBlock: number, userId: number) {
    if (idToBlock !== userId) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          blockedByYou: {
            connect: {
              id: idToBlock,
            },
          },
        },
      });
    } else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async unblock(idToBlock: number, userId: number) {
    if (idToBlock !== userId) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          blockedByYou: {
            disconnect: {
              id: idToBlock,
            },
          },
        },
      });
    } else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async getBlocked(idBlocked: number, userId: number) {
    if (!idBlocked || !userId) return;
    const blocked = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        blockedByYou: {
          where: {
            id: idBlocked,
          },
          select: { id: true },
        },
      },
    });
    return blocked.blockedByYou;
  }

  async getAllBlocked(userId: number) {
    const blocked = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        blockedByYou: {
          select: { id: true },
        },
      },
    });
    return blocked.blockedByYou;
  }

  // user status

	async emitStatusToFriends(clientId: number, newStatus: Activity)
	{
		const friends: Friend[] = await this.getFriends(clientId);
		for (let i = 0; i < this.clients.length; ++i)
		{
			for (let j = 0; j < friends.length; ++j)
			{
				if (friends[j].id === getIdFromToken(this.clients[i].handshake.auth.token))
				{
					this.clients[i].emit('CHANGE_STATUS', {status: newStatus, id: clientId});
					break ;
				}
			}
			if (clientId  === getIdFromToken(this.clients[i].handshake.auth.token))
				this.clients[i].emit('CHANGE_STATUS', {status: newStatus, id: clientId});
		}
	}

	isUserInAnotherSession(userId: number)
	{
		let countUserFound: number = 0;
		for (let i = 0; i < this.clients.length; ++i)
		{
			if (userId === getIdFromToken(this.clients[i].handshake.auth.token))
				countUserFound++;
		}
		return (countUserFound >= 2);
	}

	removeUserFromConnected(client: Socket)
	{
		for (let i = 0; i < this.clients.length; ++i)
		{
			if (this.clients[i].id === client.id)
			{
				this.clients.splice(i, 1);
				break ;
			}
		}
	}

	addUserToConnected(client: Socket)
	{
	  this.clients.push(client);
	}
}
