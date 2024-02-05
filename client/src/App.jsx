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
    const token = window.localStorage.getItem('token');
    if(token){
      attemptLoginWithToken();
    }
  }, []);

  useEffect(()=> {
    if(auth.id){
      fetch(`/api/users/${auth.id}/userSkills`, {
        headers: {
          authorization: window.localStorage.getItem('token')
        }
      })
        .then( response => response.json())
        .then( userSkills => setUserSkills(userSkills));
    }
    else {
      setUserSkills([]);
    }
  }, [auth]);

  useEffect(()=> {
    fetch('/api/skills')
      .then( response => response.json())
      .then( skills => setSkills(skills));
  }, []);

  const attemptLoginWithToken = ()=> {
    const token = window.localStorage.getItem('token');
    fetch('/api/auth/me', {
      headers: {
        authorization: token
      }
    })
    .then(response => response.json())
    .then(user => setAuth(user));
  }

  const login = (credentials)=> {
    return fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then( response => response.json())
    .then(({ token, error }) => {
      if(token){
        window.localStorage.setItem('token', token);
        attemptLoginWithToken();
      }
      else {
        throw error;
      }
    });
  };

  useEffect(()=> {
    fetch('/api/users')
      .then( response => response.json())
      .then( users => console.log(users));
  }, []);

  const logout = ()=> {
    window.localStorage.removeItem('token');
    setAuth({});
  };

  const addUserSkill = async(skill_id)=> {
    const response = await fetch(`/api/users/${auth.id}/userSkills`,{
      method: 'POST',
      body: JSON.stringify({skill_id}),
      headers: {
        'Content-Type': 'application/json',
        authorization: window.localStorage.getItem('token')
      }
    });
    if(response.ok){
      const userSkill = await response.json();
      setUserSkills([...userSkills, userSkill]);
    }
  }

  const removeUserSkill = async(userSkill)=> {
    const response = await fetch(`/api/users/${auth.id}/userSkills/${userSkill.id}`,{
      method: 'DELETE',
      headers: {
        authorization: window.localStorage.getItem('token')
      }
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
