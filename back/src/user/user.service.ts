import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import * as fs from 'fs';

const DEFAULT_IMG='uploads/profileimages/default_profile_picture.png'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService)
    {}

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
    async editEmail(userId: number, dto: EditUserDto) {
        const user = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: dto.login,
            },
        });

        delete user.hash;
        return user;
    }
    
    //TODO maybe delete the old profile picture
    async uploadPicture(userId: number, imagePath: string)
    {
        const img_to_del = await this.prisma.user.findUnique({
            where: {
                id: userId,
            }
        })
        const user = await this.prisma.user.update({
            data: {
                profilePicture: imagePath,
            },
            where: {
                id: userId,
            },
        })
        console.log("img to del = " + img_to_del.profilePicture);
        if (img_to_del.profilePicture !== user.profilePicture && img_to_del.profilePicture !== DEFAULT_IMG)
        {
            await fs.unlink(img_to_del.profilePicture, (err) => {
                if (err) {
                    console.error(err);
                    return err;
                }
            });
        }
        delete user.hash;
        return user;
    }

	async getCustomisation(username: string)
	{
		const customisation = await this.prisma.user.findUnique(
		{
			where: {
				email: username,
			},
			select: {
				skin: true,
				map: true
			}
		});
		return (customisation);
	}
}
