import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';


const LogInForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('Logged in:', userCredential.user);

      navigate('/StudentDashboard');
      // Redirect or update UI after successful login
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Login error:', err.message);
        alert('Login failed: ' + err.message);
      } 
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 space-y-6"
    >
      <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">
        Login to your account
      </h1>

      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Your email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"

          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-500 dark:text-gray-300">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            className="mr-2 w-4 h-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          Remember me
        </label>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 px-5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login
      </button>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Don't have an account yet?{' '}
        <Link to="/Signup">Sign up</Link>
      </p>
    </form>
  );
};  

export default LogInForm;
