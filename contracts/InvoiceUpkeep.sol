// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./interfaces/IInvoiceFactory.sol";

contract InvoiceUpkeep is AutomationCompatibleInterface {
    uint256 public counter;
    uint256 public interval;
    uint256 public lastTimeStamp;

    IInvoiceFactory public invoiceFactory;

    constructor(uint256 updateInterval, address _invoiceFactory) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;

        counter = 0;

        invoiceFactory = IInvoiceFactory(_invoiceFactory);
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter = counter + 1;
            invoiceFactory.claimByUpkeep();
        }
    }

    // TODO: Onlyonwer
    function setInterval(uint256 _interval) external {
        interval = _interval;
    }

    // TODO: Onlyonwer
    function setInvoiceFactory(address _invoiceFactory) external {
        invoiceFactory = IInvoiceFactory(_invoiceFactory);
    }
}
