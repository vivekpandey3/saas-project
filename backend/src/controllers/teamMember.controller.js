import { TeamMember } from "../models/teamMember.models.js";export const addTeamMember = async (req, res) => {
  try {
    const {
      workspaceId,
      email,
      firstName,
      lastName,
      position,
      role,
    } = req.body;

    const existingMember = await TeamMember.findOne({
      workspaceId,
      email,
    });

    if (existingMember) {
      return res.status(400).json({
        message: "Member already exists",
      });
    }

    const member = await TeamMember.create({
      workspaceId,
      email,
      firstName,
      lastName,
      position,
      role,
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({
      workspaceId: req.params.workspaceId,
    });

    res.status(200).json({
      users: members,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const deleteTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await TeamMember.findByIdAndDelete(
      memberId
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.status(200).json({
      message: "Member deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};