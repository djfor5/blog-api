import express from "express";
const router = express.Router();

// Require controller modules.
import comment_controller from "../controllers/commentController.js"

/// COMMENT ROUTES ///

// GET request for list of all Comments.
router.get("/", comment_controller.comment_list);

// GET request for one Comment.
router.get("/:id", comment_controller.comment_detail);

//POST request for creating Comment.
router.post("/", comment_controller.comment_create_post);

// PATCH request to update Comment.
router.patch("/:id", comment_controller.comment_update_patch);

// DELETE request to delete Comment.
router.delete("/:id", comment_controller.comment_delete_delete);

export default router;