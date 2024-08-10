require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const cors = require('cors');
const fetch = require('node-fetch');
const axios = require('axios');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const providerURL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`;
const provider = new Web3.providers.http.HttpProvider(providerURL);
const web3 = new Web3.Web3(provider);

const ZERO_X_API_URL = 'https://api.0x.org/swap/v1';

app.get('/', (req, res) => {
  res.send('DEX Backend');
});

const getEthereumTokens = async () => {
  try {
    const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
    let tokenListJSON = await response.json();
    tokens = tokenListJSON.tokens;
    console.log("tokens:", tokens);

    if (Array.isArray(tokens)) {
      return tokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        decimals:token.decimals,
        icon: token.logoURI,
        tokenAddress: token.address
      }));
    } else {
      throw new Error('Failed to retrieve tokens from CoinGecko');
    }
  } catch (error) {
    console.error('Error fetching Ethereum tokens:', error);
    throw error;
  }
};

const getAllTokensOwned = async (userAddress) => {
  const fetchURL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`;
  const raw = JSON.stringify({
    "jsonrpc": "2.0",
    "method": "alchemy_getTokenBalances",
    "params": [userAddress],
    "id": 42
  });

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
    redirect: 'follow'
  };

  try {
    const response = await fetch(fetchURL, requestOptions);
    const data = await response.json();

    if (data.result && data.result.tokenBalances) {
      const tokenBalances = data.result.tokenBalances;

      const tokenMetadataPromises = tokenBalances.map(async (token) => {
        const metadataURL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`;
        const metadataRaw = JSON.stringify({
          "jsonrpc": "2.0",
          "method": "alchemy_getTokenMetadata",
          "params": [token.contractAddress],
          "id": 1
        });

        const metadataOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: metadataRaw,
          redirect: 'follow'
        };

        const metadataResponse = await fetch(metadataURL, metadataOptions);
        const metadata = await metadataResponse.json();

        if (metadata.result) {
          return {
            symbol: metadata.result.symbol,
            name: metadata.result.name,
            icon: metadata.result.logo,
            tokenAddress: token.contractAddress,
            balance: web3.utils.fromWei(token.tokenBalance, 'ether'),
          };
        } else {
          return null;
        }
      });

      const tokensWithMetadata = await Promise.all(tokenMetadataPromises);
      return tokensWithMetadata.filter((token) => token !== null);
    } else {
      throw new Error('Failed to retrieve token balances from Alchemy');
    }
  } catch (error) {
    console.error('Error fetching token balances and metadata:', error);
    throw error;
  }
};

app.post('/user/balances', async (req, res) => {
  const { userAddress } = req.body;

  console.log('Received request for user balances:', userAddress);

  try {
    const balances = await getAllTokensOwned(userAddress);
    console.log('Fetched user balances and metadata:', balances);
    res.send(balances);
  } catch (error) {
    console.error('Error in /user/balances:', error);
    res.status(500).send({ error: 'fetch failed' });
  }
});

app.post('/network/coins', async (req, res) => {
  const { network } = req.body;

  console.log('Received request for network:', network);

  try {
    if (network.toLowerCase() === 'ethereum') {
      console.log('Fetching Ethereum tokens...');
      const coins = await getEthereumTokens();

      console.log('Fetched Ethereum tokens:', coins);
      res.send(coins);
    } else {
      const networks = [
        { name: 'Ethereum', coins: ['ETH', 'USDT', 'USDC'] },
        { name: 'Bitcoin', coins: ['BTC'] },
        { name: 'Solana', coins: ['SOL', 'USDC'] },
      ];
      const selectedNetwork = networks.find(n => n.name.toLowerCase() === network.toLowerCase());
      if (selectedNetwork) {
        res.send(selectedNetwork.coins);
      } else {
        res.status(404).send({ error: 'Network not found' });
      }
    }
  } catch (error) {
    console.error('Error in /network/coins:', error);
    res.status(500).send({ error: 'fetch failed' });
  }
});

app.post('/getPrice', async (req, res) => {
  const { buyToken, sellToken, sellAmount } = req.body;

  try {
    const response = await axios.get(`${ZERO_X_API_URL}/price`, {
      params: {
        buyToken,
        sellToken,
        sellAmount
      },
      headers:{
        '0x-api-key':`${process.env.ZERO_X_API_KEY}`
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).send({ error: 'Failed to fetch price' });
  }
});

app.post('/placeOrder', async (req, res) => {
  const { buyToken, sellToken, sellAmount, takerAddress } = req.body;

  try {
    const response = await axios.get(`${ZERO_X_API_URL}/quote`, {
      params: {
        buyToken,
        sellToken,
        sellAmount,
        takerAddress
      },
      headers:{
        headers:{
          '0x-api-key':`${process.env.ZERO_X_API_KEY}`
        }
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send({ error: 'Failed to place order' });
  }
});

app.listen(port, () => {
  console.log(`DEX backend listening at http://localhost:${port}`);
});
