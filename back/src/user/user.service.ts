import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import * as fs from 'fs';
import { Friend, NeutralUser } from './types';
import { User } from '@prisma/client';
import { throwError } from 'rxjs';

const DEFAULT_IMG = 'uploads/profileimages/default_profile_picture.png';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: number): Promise<NeutralUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return;
    console.log(user);
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
  async setUserOnLineOffline(userId: number, newStatus: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        //https://stackoverflow.com/questions/31816061/why-am-i-getting-an-error-object-literal-may-only-specify-known-properties
        status: newStatus,
      },
    });
    //console.log(user);
    return user;
  }

  async editUsername(userId: number, dto: EditUserDto) {
    // try {
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
    // } catch (err: any) {
    // return null;
    // }
  }

  //TODO maybe delete the old profile picture
  async uploadPicture(userId: number, imagePath: string) {
    // try {
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
    console.log('img to del = ' + img_to_del.profilePicture);
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
    // } catch (err: any) {
    //   return null;
    // }
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
    console.log('user = ' + user);
    if (!user) return 'error';
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
    if (creatorId == receiverId) return;
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
    return await this.prisma.friendRequest.updateMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
      data: {
        status: 'accepted',
      },
    });
  }
  async acceptFriendRequestByReqId(requestId: number) {
    await this.prisma.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'accepted',
      },
    });
  }

  async declineFriendRequest(requestId: number) {
    await this.prisma.friendRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'declined',
      },
    });
  }
  async declineFriendRequestByUserId(myId: number, userId: number) {
    if (myId == userId) return;
    return await this.prisma.friendRequest.updateMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
      data: {
        status: 'declined',
      },
    });
  }
  async deleteFriendRequestByUserId(myId: number, userId: number) {
    if (myId == userId) return;
    let ret = await this.prisma.friendRequest.deleteMany({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
    });
    let ret2 = await this.prisma.friendRequest.deleteMany({
      where: {
        creatorId: myId,
        receiverId: userId,
      },
    });
    if (ret.count === 1 && ret2.count === 0) return ret;
    else if (ret.count === 0 && ret2.count === 1) return ret2;
    else
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  mapArrayUserToNeutralUser(user: User[]): NeutralUser[] {
    let ret = user.map(({ id, createdAt, id42, username, profilePicture, status }) => ({
      id,
      createdAt,
      id42,
      username,
      profilePicture,
      status,
    }));
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
    let friendArray: Friend[] = [];
    let crea_request = await this.prisma.friendRequest.findMany({
      where: {
        creatorId: userId,
        status: 'accepted',
      },
    });
    console.log(crea_request);
    await Promise.all(
      crea_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.receiverId,
          },
        });
        console.log(user);
        if (user) console.log(friendArray.push(this.mapUserToFriend(user)));
      }),
    );
    let recv_request = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'accepted',
      },
    });
    console.log(recv_request);
    await Promise.all(
      recv_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.creatorId,
          },
        });
        console.log(user);
        if (user) console.log(friendArray.push(this.mapUserToFriend(user)));
      }),
    );
    console.log(JSON.stringify(friendArray));
    return friendArray;
  }
  async getRecvPendingRequest(userId: number): Promise<NeutralUser[]> {
    //TODO maybe create a particular mapping to remove email from not friend user
    let waitingArray: NeutralUser[] = [];
    console.log('momi');
    let recv_request = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
    });
    console.log(recv_request);
    await Promise.all(
      recv_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.creatorId,
          },
        });
        console.log(user);
        if (user)
          console.log(waitingArray.push(this.mapUserToNeutralUser(user)));
      }),
    );
    console.log(JSON.stringify(waitingArray));
    return waitingArray;
  }
  async getCreatedPendingRequest(userId: number): Promise<NeutralUser[]> {
    //TODO maybe create a particular mapping to remove email from not friend user
    let pendingArray: NeutralUser[] = [];
    let crea_request = await this.prisma.friendRequest.findMany({
      where: {
        creatorId: userId,
        status: 'pending',
      },
    });
    console.log(crea_request);
    await Promise.all(
      crea_request.map(async (req) => {
        const user = await this.prisma.user.findUnique({
          where: {
            id: req.receiverId,
          },
        });
        console.log(user);
        if (user)
          console.log(pendingArray.push(this.mapUserToNeutralUser(user)));
      }),
    );
    console.log(JSON.stringify(pendingArray));
    return pendingArray;
  }

  async checkSenderStatus(myId: number, userId: number): Promise<string> {
    let req = await this.prisma.friendRequest.findFirst({
      where: {
        receiverId: myId,
        creatorId: userId,
      },
    });
    console.log('req = ' + JSON.stringify(req));
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

	async block(idToBlock: number, userId: number)
	{
		if (idToBlock !== userId)
		{
			await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					blockedByYou: {
						connect: {
							id: idToBlock
						}
					}
				}
			});
		}
		else
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
