const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres:p%3F3!-7jC9_diNAw@db.pbfkvjosccsyuzeorerd.supabase.co:5432/postgres?sslmode=require",
});

async function test() {
  try {
    await client.connect();
    console.log('Connected successfully');
    const res = await client.query('SELECT current_database()');
    console.log('Database:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error', err.stack);
  }
}
test();
