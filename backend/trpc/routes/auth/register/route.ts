import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      username: z.string().min(3),
      displayName: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Register attempt:", input.email, input.username);
    
    return {
      success: true,
      message: "Registration handled by frontend AuthContext",
      user: {
        email: input.email,
        username: input.username,
        displayName: input.displayName,
      },
    };
  });
