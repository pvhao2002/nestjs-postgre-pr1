export class UpdatePostDto {
  description: string;
  image: Express.Multer.File;
  createdAt: Date;
  updatedAt: Date;
}

export class UploadFile {
  image: Express.Multer.File;
}
