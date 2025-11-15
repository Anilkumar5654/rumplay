import { z } from "zod";
import { adminProcedure, superAdminProcedure } from "../../../create-context";
import { createRole, listRoles } from "../../../../utils/database";

export const listRolesProcedure = adminProcedure
  .input(z.void())
  .query(() => {
    const roles = listRoles();

    return {
      success: true,
      roles,
    } as const;
  });

export const createRoleProcedure = superAdminProcedure
  .input(
    z.object({
      name: z.string().min(2).max(32),
      description: z.string().min(4).max(160),
    })
  )
  .mutation(({ input }) => {
    const role = createRole(input.name, input.description);

    return {
      success: true,
      role,
    } as const;
  });
