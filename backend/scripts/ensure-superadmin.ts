import { findUserByEmail, createUser } from "../utils/database";
import { SUPER_ADMIN_EMAIL } from "../constants/auth";

const ensureSuperadmin = () => {
  try {
    const existing = findUserByEmail(SUPER_ADMIN_EMAIL);
    
    if (existing) {
      console.log(`✓ Superadmin user already exists: ${SUPER_ADMIN_EMAIL}`);
      console.log(`  - User ID: ${existing.id}`);
      console.log(`  - Role: ${existing.role}`);
      console.log(`  - Username: ${existing.username}`);
      return existing;
    }

    console.log(`Creating superadmin user: ${SUPER_ADMIN_EMAIL}`);
    const tempPassword = "tempPassword123!";
    
    const user = createUser({
      email: SUPER_ADMIN_EMAIL,
      username: "superadmin",
      displayName: "Super Admin",
      password: tempPassword,
      role: "superadmin",
    });

    console.log(`✓ Superadmin user created successfully`);
    console.log(`  - User ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Username: ${user.username}`);
    console.log(`  - Temporary Password: ${tempPassword}`);
    
    return user;
  } catch (error) {
    console.error("Error ensuring superadmin:", error);
    throw error;
  }
};

ensureSuperadmin();
