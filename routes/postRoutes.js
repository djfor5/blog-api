import express from "express";
const router = express.Router();

// Require controller modules.
import post_controller from "../controllers/postController.js"

/// POST ROUTES ///

// GET request for list of all Posts.
router.get("/", post_controller.post_list);

// GET request for one Post.
router.get("/:id", post_controller.post_detail);

// POST request for creating Post.
router.post("/", post_controller.post_create_post);

// PATCH request to update Post.
router.patch("/:id", post_controller.post_update_patch);

// DELETE request to delete Post.
router.delete("/:id", post_controller.post_delete_delete);

export default router;