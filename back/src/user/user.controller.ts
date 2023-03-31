import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
} from '@nestjs/common';
import { GetUser, Public } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { imageFileFilter } from './user.upload.utils';
import { NeutralUser } from './types';

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const IMG_REGEX = /^(image\/)(?:png|jpg|jpeg|gif|webp)$/;
export const storage = {
  storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string = file.originalname.replace(/\s/g, '') + uuidv4();
      const extension: string = extname(file.originalname);

      cb(null, `${filename}${extension}`);
    },
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1000000 },
};
//TODO everybody can accept and decline other user pendingrequest BIG PROBLEM
// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get('profile/:userid')
  getUserProfile(@Param('userid', ParseIntPipe) userid: number) {
    return this.userService.getUserProfile(userid);
  }

  // @Post()
  // editUser(@GetUser() user: User, @Body() dto: EditUserDto) {
  //   return this.userService.editUser(user.id, dto);
  // }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', storage))
  // uploadImage(@UploadedFile() file, @GetUser() user: User): Promise<User> {
  //   return this.userService.uploadPicture(user.id, file.path);
  // }

  @Get('get-all-user')
  getAllUser(): Promise<NeutralUser[]> {
    return this.userService.getAllUser();
  }

  @Public()
  @Get('profile-image/:imagename')
  findProfileImage(@Param('imagename') imagename: string, @Res() res) {
    return res.sendFile(
      join(process.cwd(), 'uploads/profileimages/' + imagename),
    );
  }

  @Post('patchme')
  // @FormDataRequest()
  @UseInterceptors(FileInterceptor('file', storage))
  PatchProfile(
    @GetUser() user: User,
    @UploadedFile()
    file?: Express.Multer.File,
    @Body() dto?: EditUserDto,
  ) {
    if (file !== undefined) {
      this.userService.uploadPicture(user.id, file.path);
    }
    if (dto.login !== undefined) {
      // if (!USER_REGEX.test(dto.login))
      //   throw new HttpException('Invalid Input', HttpStatus.FORBIDDEN);
      this.userService.editUsername(user.id, dto);
    }
  }

  @Get('send-friend-request/:userid')
  createFriendRequest(
    @GetUser('id') creatorId: number,
    @Param('userid', ParseIntPipe) receiverId: number,
  ): Promise<string> {
    return this.userService.createFriendRequest(creatorId, receiverId);
  }

  @Get('accept-friend-request-by-userid/:userid')
  acceptFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid', ParseIntPipe) userid: number,
  ) {
    return this.userService.acceptFriendRequestByUserId(myId, userid);
  }

  @Get('accept-friend-request-by-reqid/:friendrequestid')
  acceptFriendRequestByReqId(
    @Param('friendrequestid', ParseIntPipe) requestid: number,
  ) {
    return this.userService.acceptFriendRequestByReqId(requestid);
  }

  @Get('decline-friend-request/:friendrequestid')
  declineFriendRequestByReqId(
    @Param('friendrequestid', ParseIntPipe) requestid: number,
  ) {
    return this.userService.declineFriendRequest(requestid);
  }
  @Get('decline-friend-request-by-userid/:userid')
  declineFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid', ParseIntPipe) userid: number,
  ) {
    return this.userService.declineFriendRequestByUserId(myId, userid);
  }

  @Get('destroy-friend-request-by-userid/:userid')
  deleteFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid', ParseIntPipe) userid: number,
  ) {
    return this.userService.deleteFriendRequestByUserId(myId, userid);
  }
  @Get('friend-list')
  getFriendList(@GetUser('id') userId: number) {
    return this.userService.getFriends(userId);
  }
  @Get('recv-request')
  getRecvPendingRequest(@GetUser('id') userId: number) {
    return this.userService.getRecvPendingRequest(userId);
  }
  @Get('created-request')
  getCreatedPendingRequest(@GetUser('id') userId: number) {
    return this.userService.getCreatedPendingRequest(userId);
  }
  @Get('request-status/:userid')
  getRequestStatus(
    @GetUser('id') myId: number,
    @Param('userid') userid,
  ): Promise<string> {
    return this.userService.alreadyRequested(myId, parseInt(userid));
  }
  @Get('check-sender/:userid')
  checkSenderStatus(
    @GetUser('id') myId: number,
    @Param('userid') userid,
  ): Promise<string> {
    return this.userService.checkSenderStatus(myId, parseInt(userid));
  }

  @Patch('block/:id')
  async block(
    @Param('id', ParseIntPipe) idToBlock: number,
    @GetUser('id') userId: number,
  ) {
    await this.userService.block(idToBlock, userId);
  }

  @Patch('unblock/:id')
  async unblock(
    @Param('id', ParseIntPipe) idToBlock: number,
    @GetUser('id') userId: number,
  ) {
    await this.userService.unblock(idToBlock, userId);
  }

  @Get('blocked/:id')
  async getBlocked(
    @Param('id', ParseIntPipe) idBlocked: number,
    @GetUser('id') userId: number,
  ) {
    return await this.userService.getBlocked(idBlocked, userId);
  }
}
