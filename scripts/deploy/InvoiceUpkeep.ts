import hre, { ethers } from "hardhat";
import addressUtils from "../../utils/addressUtils";

export async function deployInvoiceUpkeep(
  interval: number,
  invoiceFactoryAddress: string
) {
  const InvoiceUpkeep = await ethers.getContractFactory("InvoiceUpkeep");
  const invoiceUpkeep = await InvoiceUpkeep.deploy(
    interval,
    invoiceFactoryAddress
  );
  await invoiceUpkeep.deployed();
  console.log("Deployed invoiceUpkeep at: ", invoiceUpkeep.address);
  await addressUtils.saveAddresses(hre.network.name, {
    InvoiceUpkeep: invoiceUpkeep.address,
  });
  return invoiceUpkeep;
}
