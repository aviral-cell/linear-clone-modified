import bcrypt from 'bcrypt';

export async function getUsersData() {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash('Password@123', salt);

  return [
    {
      email: 'alex@workflow.dev',
      name: 'Alex Rivers',
      password,
      role: 'admin',
    },
    {
      email: 'jordan@workflow.dev',
      name: 'Jordan Chen',
      password,
    },
    {
      email: 'taylor@workflow.dev',
      name: 'Taylor Morgan',
      password,
    },
    {
      email: 'casey@workflow.dev',
      name: 'Casey Martinez',
      password,
    },
    {
      email: 'riley@workflow.dev',
      name: 'Riley Parker',
      password,
    },
    {
      email: 'avery@workflow.dev',
      name: 'Avery Brooks',
      password,
    },
    {
      email: 'quinn@workflow.dev',
      name: 'Quinn Hayes',
      password,
    },
    {
      email: 'morgan@workflow.dev',
      name: 'Morgan Lee',
      password,
    },
    {
      email: 'dakota@workflow.dev',
      name: 'Dakota Wells',
      password,
    },
  ];
}
