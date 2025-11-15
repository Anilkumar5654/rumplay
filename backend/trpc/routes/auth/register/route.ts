import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { createSession, createUser } from "../../../../utils/database";

const SUPER_ADMIN_EMAIL = "565413anil@gmail.com";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
      displayName: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const role = input.email.toLowerCase() === SUPER_ADMIN_EMAIL ? "superadmin" : "user";
      const user = createUser({
        email: input.email,
        username: input.username,
        displayName: input.displayName,
        password: input.password,
        role,
      });

      const session = createSession(user.id);

      return {
        success: true,
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          bio: user.bio,
          channelId: user.channelId,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          subscriptions: user.subscriptions,
          memberships: user.memberships,
          reactions: user.reactions,
          watchHistory: user.watchHistory,
          watchHistoryDetailed: user.watchHistoryDetailed,
          savedVideos: user.savedVideos,
          likedVideos: user.likedVideos,
          rolesAssignedBy: user.rolesAssignedBy,
        },
      } as const;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to register",
      } as const;
    }
  });
