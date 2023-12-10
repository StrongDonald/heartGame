import hre, { ethers } from "hardhat";
import addressUtils from "../../utils/addressUtils";
import { ChainSupport } from "../deploy";

const getRouterAndDonID = (chain: ChainSupport) => {
  switch (chain) {
    case ChainSupport.sepolia:
      return {
        router: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
        donID:
          "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
      };
    case ChainSupport.mumbai:
      return {
        router: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
        donID:
          "0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000",
      };
    case ChainSupport.fuji:
      return {
        router: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
        donID:
          "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000",
      };
    default:
      throw new Error("Invalid chain");
  }
};

export async function deployInvoiceFunction(chain: ChainSupport) {
  // const [owner] = await ethers.getSigners();
  const { router, donID } = await getRouterAndDonID(chain);
  const InvoiceFunction = await ethers.getContractFactory("InvoiceFunction");
  const invoiceFunction = await InvoiceFunction.deploy(router, donID);
  await invoiceFunction.deployed();
  console.log("Deployed invoiceFunction at: ", invoiceFunction.address);
  await addressUtils.saveAddresses(hre.network.name, {
    InvoiceFunction: invoiceFunction.address,
  });
  return invoiceFunction;
}
