import { ActivityLog } from "../models/ActivityLog.js";

export const logActivity = async ({
  workspaceId,
  actorId,
  action,
  entity,
  entityId,
  meta = {}
}) => {
  await ActivityLog.create({
    workspace: workspaceId,
    actor: actorId,
    action,
    entity,
    entityId,
    meta
  });
};
