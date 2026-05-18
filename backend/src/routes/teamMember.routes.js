import express from "express";
import {
  addTeamMember,
  getTeamMembers,
  deleteTeamMember,
} from "../controllers/teamMember.controller.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Team route working",
  });
});

router.post("/add", addTeamMember);

router.get("/:workspaceId", getTeamMembers);

router.delete("/:memberId", deleteTeamMember);

export default router;