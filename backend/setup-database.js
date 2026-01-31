const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Hash the password
    const password = 'nhsro2024';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create default user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'nhsro')
      .single();

    if (existingUser) {
      console.log('✅ Default user already exists');
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: 'nhsro',
            password_hash: hashedPassword
          }
        ])
        .select();

      if (insertError) {
        console.error('Error creating user:', insertError);
      } else {
        console.log('✅ Default user created successfully:');
        console.log('   Username: nhsro');
        console.log('   Password: nhsro2024');
      }
    }

    // Add initial hospital data
    const { hospitalsData } = require('../src/data/hospitalsData');

    for (const hospital of hospitalsData) {
      const { data: existingHospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('name', hospital.name)
        .single();

      if (existingHospital) {
        console.log(`✅ Hospital already exists: ${hospital.name}`);
      } else {
        const { error: insertHospitalError } = await supabase
          .from('hospitals')
          .insert([
            {
              user_id: 1, // Default user
              name: hospital.name,
              address: hospital.address,
              phone: hospital.reps.length > 0 ? hospital.reps[0].phone : '',
              email: ''
            }
          ]);

        if (insertHospitalError) {
          console.error(`Error adding hospital ${hospital.name}:`, insertHospitalError);
        } else {
          console.log(`✅ Hospital added: ${hospital.name} (${hospital.members} members)`);
        }
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy the backend to Render');
    console.log('2. Set the backend API URL in the frontend');
    console.log('3. Test the login and case creation');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase().then(() => {
  process.exit(0);
});