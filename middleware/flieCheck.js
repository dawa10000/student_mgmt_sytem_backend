import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const supportedFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/* ================= CREATE FILE CHECK ================= */
export const fileCheck = async (req, res, next) => {
  try {
    // ✅ Check file exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    const file = req.files.image;

    // ✅ Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!supportedFormats.includes(ext)) {
      return res.status(400).json({
        message: "Unsupported file format",
      });
    }

    // ✅ File size limit (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        message: "File too large (max 5MB)",
      });
    }

    // ✅ Ensure uploads folder exists
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // ✅ Safe filename
    const safeName = file.name.replace(/\s+/g, "-");
    const imagePath = `${uuidv4()}-${safeName}`;

    // ✅ Move file
    await file.mv(`${uploadDir}/${imagePath}`);

    req.imagePath = imagePath;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "File upload failed",
    });
  }
};

/* ================= UPDATE FILE CHECK ================= */
export const updateFileCheck = async (req, res, next) => {
  try {
    //  Optional file
    if (!req.files || !req.files.image) {
      return next();
    }

    const file = req.files.image;

    //  Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!supportedFormats.includes(ext)) {
      return res.status(400).json({
        message: "Unsupported file format",
      });
    }

    //  File size limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        message: "File too large (max 5MB)",
      });
    }

    //  Ensure uploads folder exists
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    //  Safe filename
    const safeName = file.name.replace(/\s+/g, "-");
    const imagePath = `${uuidv4()}-${safeName}`;

    //  Move file
    await file.mv(`${uploadDir}/${imagePath}`);

    req.imagePath = imagePath;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "File upload failed",
    });
  }
};