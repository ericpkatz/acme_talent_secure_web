//server/index.js
const {
  client,
  createTables,
  createUser,
  createSkill,
  createUserSkill,
  fetchUsers,
  fetchSkills,
  fetchUserSkills,
  deleteUserSkill,
  authenticate,
  findUserByToken
} = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

const isLoggedIn = async(req, res, next)=> {
  try{
    const token = req.headers.authorization;
    req.user = await findUserByToken(token);
    next();
  }
  catch(ex){
    ex.status = 401;
    next(ex);
  }
};

app.post('/api/auth/login', async(req, res, next)=> {
  try {
    res.send({ token: await authenticate(req.body)});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth/me', isLoggedIn, (req, res, next)=> {
  try {
    res.send(req.user);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/skills', async(req, res, next)=> {
  try {
    res.send(await fetchSkills());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/userSkills', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('token mismatch');
      error.status = 401;
      throw error;
    }
    res.send(await fetchUserSkills(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/:id/userSkills', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('token mismatch');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await createUserSkill({ user_id: req.params.id, skill_id: req.body.skill_id}));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:userId/userSkills/:id', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.userId !== req.user.id){
      const error = Error('token mismatch');
      error.status = 401;
      throw error;
    }
    await deleteUserSkill(req.params.id, req.user.id);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.use((req, res, next)=> {
  const err = Error(`${req.url} not found`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err});
});



const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] = await Promise.all([
    createUser({ username: 'moe', password: 'm_pw' }),
    createUser({ username: 'lucy', password: 'l_pw' }),
    createUser({ username: 'ethyl', password: 'e_pw' }),
    createSkill({ name: 'singing'}),
    createSkill({ name: 'dancing'}),
    createSkill({ name: 'juggling'}),
    createSkill({ name: 'plate spinning'}),
  ]);
  const users = await fetchUsers();
  console.log(users);

  const skills = await fetchSkills();
  console.log(skills);

  const userSkills = await Promise.all([
    createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id}),
    createUserSkill({ user_id: moe.id, skill_id: juggling.id}),
    createUserSkill({ user_id: ethyl.id, skill_id: juggling.id}),
    createUserSkill({ user_id: lucy.id, skill_id: dancing.id}),
  ]);

  console.log(await fetchUserSkills(moe.id));
  await deleteUserSkill(userSkills[0].id, moe.id);
  console.log(await fetchUserSkills(moe.id));

  console.log(`CURL localhost:3000/api/users/${lucy.id}/userSkills`);

  console.log(`CURL -X POST localhost:3000/api/users/${lucy.id}/userSkills -d '{"skill_id":"${plateSpinning.id}"}' -H 'Content-Type:application/json'`);

  console.log(`CURL -X DELETE localhost:3000/api/users/${moe.id}/userSkills/${userSkills[1].id}`);
  
  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};


init();
