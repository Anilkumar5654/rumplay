import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Backend] Login attempt:", input.email);
    
    return {
      success: true,
      message: "Login handled by frontend AuthContext",
      email: input.email,
    };
  });
