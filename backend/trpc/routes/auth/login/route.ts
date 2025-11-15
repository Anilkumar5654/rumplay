import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { createSession, findUserByEmail, verifyPassword } from "../../../../utils/database";

const sanitizeUser = (user: ReturnType<typeof findUserByEmail>) => {
  if (!user) {
    return null;
  }

  return {
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
  };
};

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password } = input;
    const user = findUserByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
      } as const;
    }

    const valid = verifyPassword(user, password);

    if (!valid) {
      return {
        success: false,
        error: "Invalid credentials",
      } as const;
    }

    const session = createSession(user.id);

    return {
      success: true,
      token: session.token,
      user: sanitizeUser(user),
    } as const;
  });
