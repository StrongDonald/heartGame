import hre, { ethers } from "hardhat";
import addressUtils from "../../utils/addressUtils";

export async function deployInvoiceFactory(
  invoiceFunction: string,
  chainSelector: string,
  router: string,
  link: string
) {
  const [owner] = await ethers.getSigners();
  const InvoiceFactory = await ethers.getContractFactory("InvoiceFactory");
  const invoiceFactory = await InvoiceFactory.deploy(
    invoiceFunction,
    owner.address,
    chainSelector,
    router,
    link
  );
  await invoiceFactory.deployed();
  console.log("Deployed invoiceFactory at: ", invoiceFactory.address);
  await addressUtils.saveAddresses(hre.network.name, {
    InvoiceFactory: invoiceFactory.address,
  });
  return invoiceFactory;
}
