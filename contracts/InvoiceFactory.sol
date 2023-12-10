// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import "./InvoiceCCIP.sol";
import "./interfaces/IInvoiceFunction.sol";

contract InvoiceFactory is InvoiceCCIP {
    event Pay(
        uint64 _chainSelector,
        address _token,
        uint256 _amount,
        address _receiver
    );

    event Claim(uint64 _chainSelector, address _beneficiary);

    uint64 public chainSelector;
    address[] public tokens;
    address addminWallet;
    IInvoiceFunction invoiceFunction;

    mapping(address => bool) public allowlistedTokens;

    modifier onlyAllowlisted(uint64 _chainSelector, address _token) {
        require(allowlistedTokens[_token], "Token not allowlisted");
        require(allowlistedChains[_chainSelector], "Chain not allowlisted");
        _;
    }

    constructor(
        address _invoiceFunction,
        address _addminWallet,
        uint64 _chainSelector,
        address _router,
        address _link
    ) InvoiceCCIP(_router, _link) {
        invoiceFunction = IInvoiceFunction(_invoiceFunction);
        addminWallet = _addminWallet;
        chainSelector = _chainSelector;
    }

    function allowlistToken(address _token, bool allowed) external onlyOwner {
        tokens.push(_token);
        allowlistedTokens[_token] = allowed;
    }

    function pay(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount,
        uint64 subscriptionId,
        string[] calldata args
    ) external onlyAllowlisted(_destinationChainSelector, _token) {
        require(
            IERC20(_token).balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );
        require(
            IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        if (_destinationChainSelector != chainSelector) {
            require(_receiver != address(0), "Invalid receiver address");
            this.transferTokensPayLINK(
                _destinationChainSelector,
                _receiver,
                _token,
                _amount
            );
        }
        invoiceFunction.sendRequest(subscriptionId, args);
        emit Pay(_destinationChainSelector, _token, _amount, _receiver);
    }

    function claim(
        uint64 _destinationChainSelector,
        address _beneficiary
    ) public {
        if (_destinationChainSelector != chainSelector) {
            for (uint256 i = 0; i < tokens.length; i++) {
                IERC20 token = IERC20(tokens[i]);
                uint256 _amount = token.balanceOf(address(this));
                this.transferTokensPayLINK(
                    _destinationChainSelector,
                    _beneficiary,
                    address(token),
                    _amount
                );
            }
        } else {
            for (uint256 i = 0; i < tokens.length; i++) {
                IERC20 token = IERC20(tokens[i]);
                uint256 amount = token.balanceOf(address(this));
                if (amount > 0) {
                    this.withdrawToken(_beneficiary, address(token));
                }
            }
        }
    }

    function claimByUpkeep() external {
        claim(chainSelector, addminWallet);
        emit Claim(chainSelector, addminWallet);
    }

    // TODO: function set subscriptionId
}
