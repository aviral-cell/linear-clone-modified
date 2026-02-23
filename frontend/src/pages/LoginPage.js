import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User } from '../icons';
import { Button, Input, Label, Spinner } from '../components/ui';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } else {
      if (!name.trim()) {
        toast.error('Name is required');
        setLoading(false);
        return;
      }
      const result = await register(email, password, name);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary flex items-center justify-center px-4">
      <main className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-2xl mb-4 shadow-lg shadow-accent/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Workflow</h1>
          <p className="text-text-secondary">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <div className="rounded-xl border border-border bg-background-secondary p-8 shadow-modal">
          <div className="mb-6 flex gap-2 rounded-lg bg-background p-1">
            <Button
              variant={isLogin ? 'primary' : 'ghost'}
              size="lg"
              className="flex-1"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? 'primary' : 'ghost'}
              size="lg"
              className="flex-1"
              onClick={() => setIsLogin(false)}
            >
              Register
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" size="md">
                  Name
                </Label>
                <Input.WithIcon
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={!isLogin}
                >
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </Input.WithIcon>
              </div>
            )}

            <div>
              <Label htmlFor="email" size="md">
                Email
              </Label>
              <Input.WithIcon
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@workflow.dev"
                required
              >
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
              </Input.WithIcon>
            </div>

            <div>
              <Label htmlFor="password" size="md">
                Password
              </Label>
              <Input.WithIcon
                id="password"
                type="text"
                autoComplete="off"
                style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              >
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
              </Input.WithIcon>
            </div>

            <Button type="submit" variant="hero" size="xl" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Spinner size="md" className="-ml-1 mr-3 text-white" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-8">Issue tracking made simple</p>
      </main>
    </div>
  );
};

export default LoginPage;
