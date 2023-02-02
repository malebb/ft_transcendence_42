<<<<<<< HEAD
import { Controller, Get, UseGuards, Req, Patch, Body, Post, UseInterceptors, UploadedFile, Param, Res } from '@nestjs/common';
=======
import { Controller, Get, UseGuards, Req, Patch, Body, Param } from '@nestjs/common';
>>>>>>> master
import { JwtGuard } from '../auth/guard';
import { GetUser, Public } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileURLToPath } from 'url';
import { diskStorage} from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { imageFileFilter } from './user.upload.utils';
import { FormDataRequest } from 'nestjs-form-data';
import { stringify } from 'querystring';

export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = file.originalname.replace(/\s/g, '') + uuidv4();
            const extension: string = extname(file.originalname);

            cb(null, `${filename}${extension}`)
        }
    }),
    fileFilter: imageFileFilter, 
}

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    constructor(private userService: UserService)
    {
	}

    @Get('me')
    getMe(@GetUser() user: User)
    {
        return user;
    }

    @Patch()
<<<<<<< HEAD
    editUser(@GetUser() user: User, @Body() dto: EditUserDto)
    {
        return this.userService.editUser(user.id, dto);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadImage(@UploadedFile() file, @GetUser() user: User): Object
    {
        const ret_user = this.userService.uploadPicture(user.id, file.path)
        
        return ret_user;
    }

    @Public()
    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Object
    {
        return (res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }

    @Patch('patchme')
   // @FormDataRequest()
    @UseInterceptors(FileInterceptor('file', storage))
    PatchProfile(@UploadedFile() file, @GetUser() user: User,@Body() dto: EditUserDto)
    {
    //    console.log("file = " + file);   
        let ret_user;
        console.log("PROFILE PATCH DTO = " + JSON.stringify(dto.login));   
        if (file !== undefined)
            ret_user = this.userService.uploadPicture(user.id, file.path);
        if (dto.login !== undefined)
            this.userService.editEmail(user.id, dto);
        //this.userService.editUser(user.id, dto);
=======
    editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto)
    {
		return this.userService.editUser(userId, dto);
>>>>>>> master
    }
}
