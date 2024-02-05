import { useEffect, useState } from 'react'

const Login = ({ login })=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async(ev) => {
    try {
      ev.preventDefault();
      await login({ username, password });
    }
    catch(ex){
      console.log(ex);
      setError(ex);
    }
  };

  return (
    <form onSubmit={ submit}>
      { error }
      <input placeholder='username' value={ username } onChange={ ev => setUsername(ev.target.value)}/>
      <input placeholder='password' value={ password } onChange={ ev => setPassword(ev.target.value)}/>
      <button>Login</button>
    </form>
  );
};

function App() {
  const [count, setCount] = useState(0)
  const [auth, setAuth] = useState({});
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  

  useEffect(()=> {
    const fetchUserSkills = async()=> {
      const response = await fetch(`/api/users/${auth.id}/userSkills`);
      if(response.ok){
        const json = await response.json();
        setUserSkills(json);
      }

    }
    if(auth.id){
      fetchUserSkills();
    }
    else {
      setUserSkills([]);
    }
  }, [auth]);

  useEffect(()=> {
    const fetchSkills = async()=> {
      const response = await fetch('/api/skills');
      const json = await response.json();
      setSkills(json);
    }
    fetchSkills();
  }, []);


  const login = async(credentials)=> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(response.ok){
      const json = await response.json();
      setAuth(json);
    }
    else {
      const json = await response.json();
      throw json.error;
    }
  };

  const logout = ()=> {
    setAuth({});
  };

  const addUserSkill = async(skill_id)=> {
    const response = await fetch(`/api/users/${auth.id}/userSkills`,{
      method: 'POST',
      body: JSON.stringify({skill_id}),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if(response.ok){
      const userSkill = await response.json();
      setUserSkills([...userSkills, userSkill]);
    }
  }

  const removeUserSkill = async(userSkill)=> {
    const response = await fetch(`/api/users/${auth.id}/userSkills/${userSkill.id}`,{
      method: 'DELETE'
    });
    setUserSkills(userSkills.filter(_userSkill => _userSkill.id !== userSkill.id));
  }


  return (
    <>
      <h1>Acme Talent Agency Web</h1>
      {
        !auth.id && <><Login login={ login }/></>
      }
      {
        !!auth.id && <button onClick={ logout }>Logout { auth.username }</button>
      }
      <ul>
        {
          skills.map(skill => {
            const hasSkill = userSkills.find(userSkill => userSkill.skill_id === skill.id);
            return (
              <li key={ skill.id } className={ hasSkill ? 'selected': ''}>
                { skill.name }
                {
                  !!auth.id && hasSkill && <button onClick={ ()=> removeUserSkill(hasSkill)}>Remove</button> 
                }
                {
                  !!auth.id && !hasSkill && <button onClick={ ()=> addUserSkill(skill.id)}>Add</button> 
                }
              </li>
            );
          })
        }
      </ul>
    </>
  )
}

export default App
