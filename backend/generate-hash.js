const bcrypt = require('bcryptjs');

const password = 'nhsro2024';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nYou can now use this hash in Supabase to create the default user.');
});