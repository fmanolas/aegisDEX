require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const providerURL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_PROJECT_ID}`;
const provider = new Web3.providers.http.HttpProvider(providerURL);
const web3 = new Web3.Web3(provider);

app.get('/', (req, res) => {
  res.send('DEX Backend');
});

const getEthereumTokens = async () => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=ethereum-ecosystem&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data)) {
      return data.map(token => ({
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        icon: token.image
      }));
    } else {
      throw new Error('Failed to retrieve tokens from CoinGecko');
    }
  } catch (error) {
    console.error('Error fetching Ethereum tokens:', error);
    throw error;
  }
};

const getEthereumTokenAddresses = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/list?include_platform=true';

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
      }
    });
    const data = await response.json();

    if (Array.isArray(data)) {
      return data
        .filter(token => token.platforms && token.platforms.ethereum)
        .map(token => ({
          symbol: token.symbol.toUpperCase(),
          name: token.name,
          address: token.platforms.ethereum
        }));
    } else {
      throw new Error('Failed to retrieve token addresses from CoinGecko');
    }
  } catch (error) {
    console.error('Error fetching Ethereum token addresses:', error);
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

app.post('/user/balance', async (req, res) => {
  const { userAddress, coinSymbol } = req.body;

  console.log('Received request for user balance:', { userAddress, coinSymbol });

  try {
    const tokens = await getEthereumTokenAddresses();
    const token = tokens.find(t => t.symbol === coinSymbol.toUpperCase());
    if (!token) {
      return res.status(404).send({ error: 'Token not found' });
    }

    const balance = await getTokenBalance(userAddress, token.address);
    res.send({ tokenAddress: token.address, balance });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch token balance' });
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

app.listen(port, () => {
  console.log(`DEX backend listening at http://localhost:${port}`);
});
