import Student from "../models/Student.js";
import fs from "fs";
import path from "path";


export const getStudents = async (req, res) => {
  try {
    const excludeFields = ["sort", "page", "limit", "search", "skip", "fields"];
    const queryObj = { ...req.query };
    excludeFields.forEach((field) => delete queryObj[field]);

    let filter = { ...queryObj };


    if (req.query.search) {
      const searchValue = req.query.search.trim();
      const safeValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter = {
        $or: [
          { name: { $regex: safeValue, $options: "i" } },
          { email: { $regex: safeValue, $options: "i" } },
          { courseEnrolled: { $regex: safeValue, $options: "i" } },
        ],
      };
    }


    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const students = await Student.find(filter).skip(skip).limit(limit);
    const totalStudent = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudent / limit);

    return res.status(200).json({ students, totalPages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(student);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


export const createStudent = async (req, res) => {
  try {
    const { name, email, age, courseEnrolled } = req.body;

    await Student.create({
      name,
      email,
      age,
      courseEnrolled,
      image: req.imagePath || null,
    });

    return res.status(201).json({
      message: "Student details added successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error creating student",
      error: err.message,
    });
  }
};


export const updateStudent = async (req, res) => {
  try {
    const { name, email, age, courseEnrolled } = req.body || {};

    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    student.name = name || student.name;
    student.email = email || student.email;
    student.age = age || student.age;
    student.courseEnrolled = courseEnrolled || student.courseEnrolled;


    if (req.imagePath) {
      if (student.image) {
        const oldPath = path.join("./uploads", student.image);

        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.log("Image delete error:", err.message);
          }
        }
      }

      student.image = req.imagePath;
    }

    await student.save();

    return res.status(200).json({
      message: "Student details updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error updating student",
      error: err.message,
    });
  }
};


export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    if (student.image) {
      const imagePath = path.join("./uploads", student.image);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.log("File delete failed:", err.message);
        }
      }
    }


    await student.deleteOne();

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({
      message: "Server error while deleting student",
      error: err.message,
    });
  }
};