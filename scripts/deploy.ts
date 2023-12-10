import hre, { ethers } from "hardhat";
import addressUtils from "../utils/addressUtils";
import { deployInvoiceFactory } from "./deploy/InvoiceFactory";
import { deployInvoiceFunction } from "./deploy/InvoiceFunction";
import { deployInvoiceUpkeep } from "./deploy/InvoiceUpkeep";

export enum ChainSupport {
  "sepolia" = "sepolia",
  "mumbai" = "mumbai",
  "fuji" = "fuji",
  "hardhat" = "hardhat",
}

const getChainSelector = (chain: ChainSupport) => {
  switch (chain) {
    case ChainSupport.sepolia:
      return "16015286601757825753";
    case ChainSupport.mumbai:
      return "12532609583862916517";
    case ChainSupport.fuji:
      return "14767482510784806043";
    default:
      throw new Error("Invalid chain");
  }
};

const getRouterAndLink = (chain: ChainSupport) => {
  switch (chain) {
    case ChainSupport.sepolia:
      return {
        router: "0xd0daae2231e9cb96b94c8512223533293c3693bf",
        link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      };
    case ChainSupport.mumbai:
      return {
        router: "0x70499c328e1e2a3c41108bd3730f6670a44595d1",
        link: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      };
    case ChainSupport.fuji:
      return {
        router: "0x554472a2720e5e7d5d3c817529aba05eed5f82d8",
        link: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
      };
    default:
      throw new Error("Invalid chain");
  }
};

async function main() {
  const chain = hre.network.name as ChainSupport;
  const addressList = await addressUtils.getAddressList(hre.network.name);
  const chainSelector = getChainSelector(chain);
  const { router, link } = getRouterAndLink(chain);
  // const invoiceFunction = addressList.InvoiceFunction;

  const invoiceFunction = await deployInvoiceFunction(chain);
  const invoiceFactory = await deployInvoiceFactory(
    invoiceFunction.address,
    chainSelector,
    router,
    link
  );
  await deployInvoiceUpkeep(60, invoiceFactory.address);
  // console.log(ethers.constants.AddressZero);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
