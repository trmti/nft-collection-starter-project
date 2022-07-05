import { ethers } from 'ethers';
import './styles/App.css';
import myEpicNft from './utils/myEpicNft.json';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'ブラックサンダー';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = '0xD9Ba952E59A31b4655f2b3D9B5363124923512d6';
const NFT_VALUE = '0.001';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentNFTCount, setCurrentNFTCount] = useState(0);
  const [loading, setLoading] = useState(false);
  console.log('currentAccount: ', currentAccount);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Ccnnected to chain ' + chainId);
    const rikebyChainId = '0x4';
    if (chainId !== rikebyChainId) {
      alert('You are not connected to the Rinkeby Test Network!');
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          alert(
            `あなたのウォレットにNFTを送信しました。OpenSeaに表示されるまで最大で10分かかることがあります。NFTへのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log('Setup event listener!');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const askContractToMintNft = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log('Going to pop wallet now to pay gas...');
        let nftTxn = await connectedContract.makeAnEpicNFT({
          value: ethers.utils.parseEther(NFT_VALUE),
        });
        console.log('Mining...please wait.');
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        await setCurrentNftVolume();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const setCurrentNftVolume = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        const currentNftVol = await connectedContract.getCurrentCountId();
        setCurrentNFTCount(currentNftVol.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    setCurrentNftVolume();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {currentAccount === '' ? (
            renderNotConnectedContainer()
          ) : (
            <Button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
              loading={loading}
              // disabled={loading}
            >
              Mint NFT
            </Button>
          )}
        </div>
        <div className="currentCount">
          <p>{`これまでに作成された ${currentNFTCount}/50 NFT`}</p>
        </div>
        <div className="gotoOpenSea">
          <a href="https://testnets.opensea.io/collection/squarenft-3qvstcqrqv">
            OpenSeaでコレクションを表示
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
