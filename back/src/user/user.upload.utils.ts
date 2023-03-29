import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.NOT_ACCEPTABLE,
      ),
      false,
    );
  }
  callback(null, true);
};
