import { v2 as cloudinary } from 'cloudinary';
import { CONFIG_CLOUD } from 'src/auth/constants/constants';
cloudinary.config({
  cloud_name: CONFIG_CLOUD.CLOUD_NAME,
  api_key: CONFIG_CLOUD.CLOUD_API_KEY,
  api_secret: CONFIG_CLOUD.CLOUD_API_SECRET,
});
export default cloudinary;
