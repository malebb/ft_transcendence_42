import {
  Controller,
  Get,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
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
  getUserProfile(@Param('userid') userid: string) {
    console.log(userid);
    return this.userService.getUserProfile(parseInt(userid));
  }

  @Post()
  editUser(@GetUser() user: User, @Body() dto: EditUserDto) {
    return this.userService.editUser(user.id, dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadImage(@UploadedFile() file, @GetUser() user: User): Promise<User> {
    return this.userService.uploadPicture(user.id, file.path);
  }

  @Get('get-all-user')
  getAllUser(): Promise<NeutralUser[]> {
    return this.userService.getAllUser();
  }

  @Public()
  @Get('profile-image/:imagename')
  findProfileImage(@Param('imagename') imagename, @Res() res): Response {
    return res.sendFile(
      join(process.cwd(), 'uploads/profileimages/' + imagename),
    );
  }

  @Post('patchme')
  // @FormDataRequest()
  @UseInterceptors(FileInterceptor('file', storage))
  PatchProfile(
    @UploadedFile() file,
    @GetUser() user: User,
    @Body() dto: EditUserDto,
  ) {
    if (file !== undefined) this.userService.uploadPicture(user.id, file.path);
    if (dto.login !== undefined) this.userService.editUsername(user.id, dto);
  }

  @Get('send-friend-request/:userid')
  createFriendRequest(
    @GetUser('id') creatorId: number,
    @Param('userid') receiverId,
  ): Promise<string> {
    return this.userService.createFriendRequest(
      creatorId,
      parseInt(receiverId),
    );
  }

  @Get('accept-friend-request-by-userid/:userid')
  acceptFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid') userid,
  ) {
    return this.userService.acceptFriendRequestByUserId(myId, parseInt(userid));
  }

  @Get('accept-friend-request-by-reqid/:friendrequestid')
  acceptFriendRequestByReqId(@Param('friendrequestid') requestid) {
    return this.userService.acceptFriendRequestByReqId(parseInt(requestid));
  }

  @Get('decline-friend-request/:friendrequestid')
  declineFriendRequestByReqId(@Param('friendrequestid') requestid) {
    return this.userService.declineFriendRequest(parseInt(requestid));
  }
  @Get('decline-friend-request-by-userid/:userid')
  declineFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid') userid,
  ) {
    return this.userService.declineFriendRequestByUserId(
      myId,
      parseInt(userid),
    );
  }

  @Get('destroy-friend-request-by-userid/:userid')
  deleteFriendRequestByUserId(
    @GetUser('id') myId: number,
    @Param('userid') userid,
  ) {
    return this.userService.deleteFriendRequestByUserId(myId, parseInt(userid));
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
}
