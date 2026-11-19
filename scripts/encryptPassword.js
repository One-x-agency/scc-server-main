import bcrypt from 'bcryptjs';

async function test() {
  const as = await bcrypt.hash('admin@123', 7);
  console.log(as);
}

test();
