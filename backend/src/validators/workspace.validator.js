import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2)
  })
});

export const joinWorkspaceSchema = z.object({
  body: z.object({
    workspaceId: z.string().optional(),
    inviteCode: z.string().optional()
  })
});
