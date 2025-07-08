import React, { useEffect } from 'react'
import './login.css'
import { useState } from 'react'
import axios from 'axios';
import Logo from '../assets/logo.png'
import Dashboard from '../Pages/Dashboard';
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loggedInUser, setLoggedInUser] = useState("");

    // everytime the page loads we see if we logged in or not and if we are , as who are we logged in. 
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedEmail = localStorage.getItem('email');
        const expiry = localStorage.getItem('tokenExpiry');
        if (!token || !savedEmail || !expiry) return;
        const now = new Date().getTime();
        if (now >= parseInt(expiry)) {
            console.log("the token has expired");
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('tokenExpiry');
        }
        else {
            setLoggedInUser(savedEmail);
            console.log("you are logged in as ", { savedEmail });
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.post('https://Dev4Side.bsite.net/auth/login',
                {
                    email,
                    password
                }, {
                headers: { 'Content-Type': 'application/json' }
            }
            );
            const token = resp.data.token;
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);
            //token is valid only for 2h
            const expiryTime = new Date().getTime() + 2 * 60 * 60 * 1000;
            localStorage.setItem("tokenExpiry", expiryTime.toString());
            window.location.href = '/';
            console.log("Successfully logged in as ", email);
            setLoggedInUser(email);
            window.location.reload();
        }
        catch (err) {
            console.error(err);
            setError("invalid credentials");
        }
    }
    const logout = () => {
        localStorage.removeItem("tokrn");
        localStorage.removeItem("email");
        localStorage.removeItem("tokenExpiry");
        setLoggedInUser("");
        setEmail("");
        setPassword("");
        window.location.reload();
    }
    // return (
    //     <div className='Login-container'>
    //         {!loggedInUser ?
    //             <>
    //                 {/* <Dashboard onLogOut={logout} /> */}

    //                 {/* <button onClick={logout}
    //                     style={{
    //                         padding: '10px 20px',
    //                         backgroundColor: '#dc3545',
    //                         color: 'white',
    //                         border: 'none',
    //                         borderRadius: '4px',
    //                         cursor: 'pointer'
    //                     }}>
    //                     Logout
    //                 </button> */}

    //                 <form onSubmit={handleSubmit}>
    //                     <img src={Logo} alt="" />
    //                     Email:  <input type="text" value={email} onChange={e => setEmail(e.target.value)} />

    //                     Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

    //                     {error && <p style={{ color: 'red' }}>{error}</p>}
    //                     <br />

    //                     <button type='submit'
    //                         style={{
    //                             padding: '10px 20px',
    //                             backgroundColor: '#007bff',
    //                             color: 'white',
    //                             border: 'none',
    //                             borderRadius: '4px',
    //                             cursor: 'pointer'
    //                         }}

    //                     >Login</button>
    //                     <a href="/register">create an account</a>
    //                     <br />

    //                 </form>

    //             </> : <button onClick={logout}
    //                 style={{
    //                     padding: '10px 20px',
    //                     backgroundColor: '#dc3545',
    //                     color: 'white',
    //                     border: 'none',
    //                     borderRadius: '4px',
    //                     cursor: 'pointer'
    //                 }}>
    //                 Logout
    //             </button>}
    //     </div>
    // )


    return (
        <>
            {loggedInUser ? (
                <Dashboard onLogOut={logout} isUserLoggedIn={!!loggedInUser} />
            ) : (
                <div className='Login-container'>
                    <form onSubmit={handleSubmit}>
                        <img src={Logo} alt="" />
                        Email:  <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
                        Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <br />
                        <button type='submit'>Login</button>
                        <a href="/register">create an account</a>
                        <br />
                    </form>
                </div>
            )}
        </>
    );

}

export default Login