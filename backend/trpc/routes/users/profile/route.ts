import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      username: z.string().optional(),
      displayName: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Update profile:", input.userId);
    
    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        userId: input.userId,
        ...input,
      },
    };
  });

export const getUserProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Backend] Get user profile:", input.userId);
    
    return {
      success: true,
      message: "Profile fetched from frontend context",
    };
  });
