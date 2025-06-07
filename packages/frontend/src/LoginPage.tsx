import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./LoginPage.css";

interface LoginPageProps {
    isRegistering: boolean; 
    setAuthToken: (token: string) => void; // BEGIN: Added callback prop
}

export function LoginPage({ isRegistering, setAuthToken }: LoginPageProps) { 
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const [error, setError] = React.useState<string | null>(null); 
    const [isPending, setIsPending] = React.useState(false); 
    const navigate = useNavigate(); // BEGIN: Added useNavigate hook

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsPending(true); 

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string; 
        const password = formData.get("password") as string; 

        try {
            const response = await (isRegistering ? registerUser(username, password) : loginUser(username, password));

            if (!response.ok) {
                throw new Error(isRegistering ? "Failed to create account" : "Failed to log in");
            }

            const data = await response.json();
            if (isRegistering) { // BEGIN: Handle successful registration
                setAuthToken(data.token); 
                console.log("Authentication token:", data.token); 
                navigate("/"); // Redirect to home after successful registration
            } else {
                setAuthToken(data.token); // Set auth token from callback
                console.log("Authentication token:", data.token); // Log the auth token on successful login
            }

            console.log(isRegistering ? "Successfully created account" : "Successfully logged in"); 
        } catch (err: any) {
            setError(err.message); 
        } finally {
            setIsPending(false); 
        }
    };

    const registerUser = (username: string, password: string) => {
        return fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
    };

    const loginUser = (username: string, password: string) => {
        return fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
    };

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" onSubmit={handleSubmit}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} name="username" required disabled={isPending} />
                
                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

                <input type="submit" value="Submit" disabled={isPending} />
                {error && <p aria-live="assertive" style={{ color: 'red' }}>{error}</p>}
            </form>
            {!isRegistering && ( 
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            )}
        </>
    );
}
