import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 检查MetaMask是否安装
    if (typeof window.ethereum !== 'undefined') {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      
      // 检查是否已连接
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(error => {
          console.error('检查账户失败:', error);
        });
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
        }
      });
      
      // 监听网络变化
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('请安装MetaMask!');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      
      setAccount(accounts[0]);
      setNetworkId(networkId);
      
      return true;
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError('连接钱包失败: ' + error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setNetworkId(null);
  };

  const getBalance = async () => {
    if (!web3 || !account) return '0';
    
    try {
      const balance = await web3.eth.getBalance(account);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('获取余额失败:', error);
      return '0';
    }
  };

  const sendTransaction = async (to, value, data = '') => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      const tx = await web3.eth.sendTransaction({
        from: account,
        to,
        value: web3.utils.toWei(value, 'ether'),
        data
      });
      return tx;
    } catch (error) {
      console.error('交易失败:', error);
      throw error;
    }
  };

  const value = {
    web3,
    account,
    networkId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getBalance,
    sendTransaction
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3必须在Web3Provider内使用');
  }
  return context;
}