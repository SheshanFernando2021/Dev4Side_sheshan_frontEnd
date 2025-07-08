import React, { useState } from 'react';
import axios from 'axios';
import './register.css'
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png'


function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordconfirm, setpasswordconfirm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordconfirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post('https://Dev4Side.bsite.net/auth/register', {
                email,
                password,
                passwordconfirm
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(response.data);
            alert('Registration successful, please log in.');
            navigate('/login'); // Go to login page
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setError("Registration error: " + JSON.stringify(err.response.data));
            } else {
                setError("Error: " + err.message);
            }
        }
    };

    return (
        <div className='Register-container'>
            <form onSubmit={handleSubmit}>
                <img src={Logo} alt="" />
                <h2>Register</h2>
                <label>Email:</label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} />

                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

                <label>Confirm Password:</label>
                <input type="password" value={passwordconfirm} onChange={e => setpasswordconfirm(e.target.value)} />


                {error && <p style={{ color: 'red' }}>{error}</p>}
                <br /><br />

                <button type="submit">Register</button>
                <a href="/login" style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Already have an account ?</a>
            </form>

        </div>
    );
}

export default Register;
