import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getAllUsersProcedure = publicProcedure
  .input(
    z.object({
      adminUserId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Backend] Get all users by admin:", input.adminUserId);
    
    return {
      success: true,
      message: "Users managed through frontend",
    };
  });

export const updateUserRoleProcedure = publicProcedure
  .input(
    z.object({
      adminUserId: z.string(),
      targetUserId: z.string(),
      newRole: z.enum(["user", "admin", "superadmin"]),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Update user role:", input.targetUserId, "to", input.newRole);
    
    return {
      success: true,
      message: `User role updated to ${input.newRole}`,
    };
  });

export const deleteUserProcedure = publicProcedure
  .input(
    z.object({
      adminUserId: z.string(),
      targetUserId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Delete user:", input.targetUserId);
    
    return {
      success: true,
      message: "User deleted successfully",
    };
  });
