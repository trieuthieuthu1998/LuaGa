import React, { useEffect, useState, Fragment } from "react";
import { ethers } from "ethers";
import dayjs from "dayjs";
import { useLottie } from "lottie-react";
import BigNumber from "bignumber.js";
import ClaimingAnimation from "./assets/ClaimingAnimation.json";
// import { aWSBAirDropABI } from "./ABI/airdrop.json";
import { EIP20 } from "./ABI/eip-20.json";
import { Fairy } from "./ABI/fairy-airdrop.json";
import { pogai } from "./ABI/pogai.json";
import {
  MAINNET_ID,
  TOKEN_ADDRESS,
  MAINNET_NAME,
  FAIRY_CONTRACT_ADDRESS,
  AWSB_AIRDROP_CONTRACT_ADDRESS,
  aWSBTokenInfo,
} from "./const";
import airdrop from "./assets/airdrop-mini.png";
import success from "./assets/success-mini.png";
import ethereumLogo from "./assets/ethereum-logo.png";
import metamask from "./assets/metamask.png";
import "./App.less";

declare global {
  interface Window {
    ethereum: any;
  }
}

const ethereum = window.ethereum;
let aWSBAirDropContract: ethers.Contract;
let aWSBTokenContract: ethers.Contract;

let FairyAirDropContract: ethers.Contract;

//const aWSBTokenAddress = AWSB_TOKEN_ADDRESS;
//const aWSBAirDropContractAddress = AWSB_AIRDROP_CONTRACT_ADDRESS;
//const FairyAirDropContractAddress = FAIRY_CONTRACT_ADDRESS;

//DEV:
 const aWSBTokenAddress = aWSBTokenInfo.tokenAddress;
 const aWSBAirDropContractAddress = TOKEN_ADDRESS;
 const FairyAirDropContractAddress = FAIRY_CONTRACT_ADDRESS;
console.log(TOKEN_ADDRESS);
let ethersProvider: any;
let signer: any;
if (ethereum) {
  ethersProvider = new ethers.providers.Web3Provider(ethereum, "any");
  signer = ethersProvider.getSigner();
}
// console.log("🚀 ~ file: App.tsx ~ line 33 ~ ethersProvider", ethersProvider);

const init = async () => {
  aWSBAirDropContract = new ethers.Contract(
    aWSBAirDropContractAddress,
    pogai,
    ethersProvider
  );
  FairyAirDropContract = new ethers.Contract(
    FairyAirDropContractAddress,
    Fairy,
    ethersProvider
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aWSBTokenContract = new ethers.Contract(aWSBTokenAddress, EIP20);
  aWSBTokenContract = aWSBTokenContract.connect(signer);
  aWSBAirDropContract = aWSBAirDropContract.connect(signer);
  FairyAirDropContract = FairyAirDropContract.connect(signer);
};

const formatAddress = (address: string) => {
  return address.substr(0, 8) + "..." + address.substr(address.length - 8, 8);
};

function Loaing() {
  return (
    <div style={{ transform: "scale(0.45)" }}>
      <div className="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

function Claiming() {
  const options = {
    animationData: ClaimingAnimation,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return <div className="claiming-animation">{View}</div>;
}

async function addToMask() {
  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: aWSBTokenInfo.tokenAddress, // The address that the token is at.
          symbol: aWSBTokenInfo.tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: aWSBTokenInfo.tokenDecimals, // The number of decimals in the token
          image: aWSBTokenInfo.tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      console.log("Thanks for your interest!");
    } else {
      console.log("Your loss!");
    }
  } catch (error) {
    console.log(error);
  }
}

function App() {
  const [address, setAddress] = useState<string>("");
  const [expiredTime, setExpiredTime] = useState<number>(0);
  const [claimBalance, setClaimBalance] = useState<string>("0");
  const [errorNetWork, setErrorNetWork] = useState<boolean>(false);
  const [aWSBTokenBalance, setaWSBTokenBalance] = useState<string>("0");
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState<boolean>();
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [noWallet, setNotWallet] = useState<boolean>(false);
  const [isFairy, setIsFairy] = useState<boolean>(false);
  const [isFairyEvent, setIsFairyEvent] = useState<boolean>(false);
  const [fairyNextReleasedTime, setFairyNextReleasedTime] = useState<number>(0);
  const [fairyClaimBalance, setFairyClaimBalance] = useState<string>("0");
  const [amount, setAmount] = useState<number>(0);
  const [v, setV] = useState<number>(0);
  const [r, setR] = useState<string>("0");
  const [s, setS] = useState<string>("0");
  useEffect(() => {
    if (!ethereum) {
      setNotWallet(true);
      setConnecting(false);
      return;
    }
    let chainId: number;
    setConnecting(true);
    const getNetWork = async () => {
      chainId = (await ethersProvider.getNetwork()).chainId;
      // dev: BSC_TESTNET_ID
      console.log(chainId);
      console.log(MAINNET_ID);
    if (chainId !== MAINNET_ID) {
      
        setErrorNetWork(true);
        setAddress("");
      }
    };
    getNetWork();
    async function getAccount() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsMetaMaskConnected(Boolean(ethereum.selectedAddress));
      setConnecting(false);
    }
    getAccount();
  }, []);

  const change = (accounts: any[]) => {
    setIsMetaMaskConnected(
      accounts.length > 0 && Boolean(ethereum.selectedAddress)
    );
    if (!(accounts.length > 0 && Boolean(ethereum.selectedAddress))) {
      setAddress("");
    }
  };
  if (ethereum) {
    ethereum.on("accountsChanged", change);
  }

  const getAirdropInfos = async () => {
    await init();
    if (isMetaMaskConnected && !errorNetWork) {
      let walletAccounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(walletAccounts[0]);
      let aWSBTokenBalance: ethers.BigNumber = await aWSBTokenContract.balanceOf(
        walletAccounts[0]
      );

      const response = await fetch('https://api.pogai.org/airdrop.php?address='+walletAccounts[0])
      const data = (await response.json())
      let expiredTime = new BigNumber(data.data.t);
      setExpiredTime(expiredTime.toNumber());
      setAmount(data.data.amount);
      setV(data.data.v);
      setR(data.data.r);
      setS(data.data.s);
      // console.log(data.data.amount,data.data.v,data.data.r, data.data.s,data.data.t);
      // let expiredTime : ethers.BigNumber =  data.data.t;

      // let expiredTime: ethers.BigNumber = await aWSBAirDropContract.claimExpiredAt();
      // console.log(expiredTime);
      
      let claimBalance = data.data.amount;
      // let claimBalance: ethers.BigNumber = await aWSBAirDropContract.claimWhitelist(
      //   walletAccounts[0]
      // );
      // let fairyStatus: boolean = await FairyAirDropContract.containsFairy(
      //   walletAccounts[0]
      // );
      // if (fairyStatus) {
      //   let nextReleasedTime: ethers.BigNumber = await FairyAirDropContract.nextReleasedTime();
      //   console.log(
      //     "🚀 ~ file: App.tsx ~ line 202 ~ getAirdropInfos ~ nextReleasedTime",
      //     nextReleasedTime.toNumber()
      //   );
      //   let fairyBalance: ethers.BigNumber = await FairyAirDropContract.fairyVault(
      //     walletAccounts[0]
      //   );
      //   setFairyNextReleasedTime(nextReleasedTime.toNumber());
      //   setFairyClaimBalance(
      //     new BigNumber(fairyBalance.toString())
      //       .div(1e18)
      //       .toFixed(4)
      //       .toString()
      //   );
      // }
      // setIsFairy(fairyStatus);
      // console.log(
      //   "🚀 ~ file: App.tsx ~ line 196 ~ getAirdropInfos ~ fairyStatus",
      //   fairyStatus
      // );
      
      setaWSBTokenBalance(
        new BigNumber(aWSBTokenBalance.toString())
          .toString()
      );
      setClaimBalance(
        new BigNumber(claimBalance.toString())
          .toString()
      );
    }
  };

  useEffect(() => {
    // 获取合约相关信息
    getAirdropInfos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMetaMaskConnected]);

  const connectWallet = async () => {
    return await ethereum.request({
      method: "eth_requestAccounts",
    });
  };

  const claimButtonDisabled = isFairyEvent
    ? claiming || claimSuccess || Number(fairyClaimBalance) === 0
    : claiming ||
      claimSuccess ||
      Number(claimBalance) === 0 ||
      dayjs().isAfter(dayjs.unix(expiredTime));

  const claim = async () => {
    setClaiming(true);
    try {
      let process;
      if (isFairyEvent) {
        process = await FairyAirDropContract.claim();
      } else {
        process = await aWSBAirDropContract.mint("0x6fd58f5a2f3468e35feb098b5f59f04157002407",amount,v,r,s);
      }
      try {
        await process.wait();
        setClaimSuccess(true);
        getAirdropInfos();
      } catch (error) {}
      setClaiming(false);
    } catch (error) {
      setClaiming(false);
    }
  };

  return (
    <div className="App">
      <div className="address">
        Token:{TOKEN_ADDRESS}
        AirDrop: {AWSB_AIRDROP_CONTRACT_ADDRESS}
      </div>
      <div className="main">
        {claiming ? (
          <Claiming />
        ) : (
          <img
            src={claimSuccess ? success : airdrop}
            className="airdrop-img"
            alt="img"
          />
        )}
        <div className="airdrop">
          <div className="title">
            <span style={{ fontWeight: 900 }}>POGAI</span>
            <span style={{ fontWeight: 300, marginLeft: "10px" }}>
              AirDrop 
            </span>
            {/*<div className="version">1.0.0</div>*/}
          </div>
          {isFairy && (
            <div className="fairy">
              {isFairyEvent ? (
                <div style={{ marginRight: "20px" }}>
                  <span style={{ fontSize: 30 }}>🧚‍♀️</span> Welcome Fairy{" "}
                  <span style={{ fontSize: 30 }}>🧚‍♀️</span>
                </div>
              ) : (
                <div
                  className="enter-button"
                  onClick={() => {
                    setIsFairyEvent(true);
                  }}
                >
                  <span style={{ fontSize: 30, marginRight: 5 }}>🧚‍♀️</span>Enter
                  Fairy Airdrop
                </div>
              )}
            </div>
          )}
          <div className="address-info">
            <div className="key address-text">
              <div
                className="connected"
                style={{
                  background: address ? "#52c41a" : "#E1694E",
                }}
              ></div>
              {connecting && "Connecting..."}
              {noWallet && "Wallet not found!"}
              {address
                ? formatAddress(String(address))
                : errorNetWork && !connecting
                ? MAINNET_NAME + " Only !   Please Switch NetWork."
                : connecting
                ? ""
                : !noWallet
                ? "Please Unlock Wallet."
                : ""}
            </div>
            {address && (
              <Fragment>
                <div className="token-info">
                  <div className="bsc-info">
                    <img className="binance-logo" src={ethereumLogo} alt="" />
                    <div className="bsc-address">
                      {MAINNET_NAME} :{" "}
                      <span style={{ fontWeight: 600, marginLeft: 10 }}>
                        {formatAddress(aWSBTokenInfo.tokenAddress)}
                      </span>
                    </div>
                    <img
                      className="metamask-logo"
                      src={metamask}
                      alt=""
                      onClick={addToMask}
                    />
                  </div>
                </div>
                <div className="key claimed-balance">
                  To be claimed:{" "}
                  <span style={{ fontWeight: 600, marginLeft: 10 }}>
                    {isFairyEvent ? fairyClaimBalance : claimBalance} POGAI
                  </span>
                </div>
                <div className="key">
                  {isFairyEvent ? "Next Released Time" : "Claims Expired Time:"}
                  <span style={{ fontWeight: 600, marginLeft: 10 }}>
                    {dayjs(
                      isFairyEvent
                        ? fairyNextReleasedTime * 1000
                        : expiredTime * 1000
                    ).format("YYYY-MM-DD")}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
          {address ? (
            <button
              className="claim-button"
              onClick={claim}
              disabled={claimButtonDisabled}
              style={{
                background: claimSuccess
                  ? "#52c41a"
                  : claimButtonDisabled
                  ? "#858da1"
                  : "#ec615b",
              }}
            >
              {claiming ? (
                <Loaing />
              ) : claimSuccess ? (
                "Success!"
              ) : isFairyEvent ? (
                "Fairy Claim"
              ) : (
                "Claim"
              )}
            </button>
          ) : errorNetWork || noWallet ? (
            <button
              className="claim-button"
              disabled
              style={{
                background: "#858da1",
              }}
            >
              {noWallet
                ? "Please Install MetaMask."
                : "Please Switch NetWork to ."+MAINNET_NAME}
            </button>
          ) : (
            <button
              className="claim-button"
              style={{
                background: "#4B2CC8",
              }}
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Unlock Wallet"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
