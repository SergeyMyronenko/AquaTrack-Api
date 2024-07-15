import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloud } from "cloudinary";
import multer from "multer";
import "dotenv/config";

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloud.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloud,

  params: async (req, file) => {
    const { _id } = req.user;
    const originalnameWithoutType = file.originalname.replace(
      /\.(jpe?g|png)$/i,
      ""
    );

    let fileName = originalnameWithoutType;
    let folder;

    if (file.fieldname === "avatar") {
      folder = "avatars";
      fileName = `${_id}_${originalnameWithoutType}`;
    }

    return {
      folder: folder,
      allowed_formats: ["jpg", "png"],
      public_id: fileName,
    };
  },
});

export const upload = multer({ storage });
