import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { account, web3 } = useWeb3();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的token
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // 当钱包连接时，自动登录
    if (account && web3 && !isAuthenticated) {
      loginWithWallet();
    }
  }, [account, web3, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loginWithWallet = async () => {
    if (!account || !web3) {
      return false;
    }

    try {
      // 模拟签名验证
      const message = `登录到 AI-RWA Portfolio Optimizer\n钱包地址: ${account}\n时间: ${Date.now()}`;
      
      // 在实际应用中，这里应该让用户签名消息
      // const signature = await web3.eth.personal.sign(message, account);
      
      // 模拟API调用
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: account,
          message,
          signature: 'mock_signature' // 实际应该是真实签名
        })
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      
      // 存储token和用户信息
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      
      // 模拟登录成功（开发模式）
      const mockUser = {
        id: account,
        wallet_address: account,
        username: `user_${account.slice(2, 8)}`,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('authToken', 'mock_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setToken('mock_token_' + Date.now());
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return true;
    }
  };

  const loginWithCredentials = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        throw new Error('注册失败');
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      const data = await response.json();
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('更新失败:', error);
      return false;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    loginWithWallet,
    loginWithCredentials,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
}