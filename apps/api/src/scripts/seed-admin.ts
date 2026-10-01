import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../lib/db.js';
import { AdminUser } from '../models/AdminUser.js';

async function main() {
  await connectDb();
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await AdminUser.findOneAndUpdate(
    { email },
    { name: 'مدير النظام', email, passwordHash, role: 'admin', active: true },
    { upsert: true, new: true },
  );

  console.log(`Admin ready: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
