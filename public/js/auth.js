/**
 * ShopSphere - Authentication (Login & Register) Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to home
  if (Auth.isLoggedIn()) {
    const redirect = sessionStorage.getItem('redirect_after_login') || '/index.html';
    sessionStorage.removeItem('redirect_after_login');
    window.location.href = redirect;
    return;
  }

  // DOM Elements
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('login-form');
  const formRegister = document.getElementById('register-form');
  const fillDemoBtn = document.getElementById('fill-demo-credentials');

  // Check URL query for tab (e.g. ?tab=register)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'register') {
    switchToRegister();
  }

  // Tab Switching
  if (tabLogin) tabLogin.addEventListener('click', switchToLogin);
  if (tabRegister) tabRegister.addEventListener('click', switchToRegister);

  function switchToLogin() {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  }

  function switchToRegister() {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
  }

  // Demo Credentials Auto-Fill
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      switchToLogin();
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = 'alex@example.com';
        passInput.value = 'password123';
        showToast('Demo credentials filled: alex@example.com / password123', 'info');
      }
    });
  }

  // Password Visibility Toggle
  document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁';
        }
      }
    });
  });

  // Handle Login Form Submit
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = formLogin.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both your email address and password', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        const res = await API.login(email, password);
        const { token, ...userData } = res.data;

        Auth.setAuth(userData, token);
        showToast(`Welcome back, ${userData.name}!`, 'success');

        const redirect = sessionStorage.getItem('redirect_after_login') || '/index.html';
        sessionStorage.removeItem('redirect_after_login');

        setTimeout(() => {
          window.location.href = redirect;
        }, 600);
      } catch (err) {
        console.error('Login error:', err);
        showToast(err.message || 'Login failed. Please verify your credentials.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to ShopSphere';
      }
    });
  }

  // Handle Registration Form Submit
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      const submitBtn = formRegister.querySelector('button[type="submit"]');

      if (!name || name.length < 2) {
        showToast('Please provide your full name (at least 2 characters)', 'error');
        return;
      }

      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        showToast('Please provide a valid email address', 'error');
        return;
      }

      if (!password || password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please verify.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';

      try {
        const res = await API.register(name, email, password);
        const { token, ...userData } = res.data;

        Auth.setAuth(userData, token);
        showToast(`Account created! Welcome to ShopSphere, ${userData.name}.`, 'success');

        const redirect = sessionStorage.getItem('redirect_after_login') || '/index.html';
        sessionStorage.removeItem('redirect_after_login');

        setTimeout(() => {
          window.location.href = redirect;
        }, 600);
      } catch (err) {
        console.error('Registration error:', err);
        showToast(err.message || 'Registration failed. Please try a different email.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create ShopSphere Account';
      }
    });
  }
});
