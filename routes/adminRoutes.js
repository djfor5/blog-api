import express from "express";
const router = express.Router();

// Require controller modules.
import admin_controller from "../controllers/adminController.js"

/// ADMIN ROUTES ///

// GET count of all Users, Posts, and Comments.
router.get("/", admin_controller.index);

// DELETE all Users, Posts, and Comments.
router.delete("/", admin_controller.all_delete_delete);

// TODO - Delete any comment, post, or user as an admin

export default router;