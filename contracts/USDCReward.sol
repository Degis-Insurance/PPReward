// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice Protocol Protection Testnet Reward Contract
 *
 *         User reward information is in the form:
 *         [address: 0xabcd, amount: 1 ether]
 *
 *         All info is stored in a merkle tree and this contract verify the proof.
 */
contract USDCReward is Ownable {
    using SafeERC20 for IERC20;

    // Reward tokens
    IERC20 public immutable USDC;

    uint256 public totalUsers;
    mapping(uint256 => address) public users;
    mapping(uint256 => uint256) public amounts;

    mapping(uint256 => bool) public alreadyDistributed;

    uint256[] private tempKeys;

    constructor(address _usdc) {
        USDC = IERC20(_usdc);
    }

    function getUsers() external view returns (address[] memory) {
        uint256 length = totalUsers;
        address[] memory _users = new address[](length);
        for (uint256 i; i < length; i++) {
            _users[i] = users[i];
        }

        return _users;
    }

    function getAmounts() external view returns (uint256[] memory) {
        uint256 length = totalUsers;
        uint256[] memory _amounts = new uint256[](length);
        for (uint256 i; i < length; i++) {
            _amounts[i] = amounts[i];
        }

        return _amounts;
    }

    function getKey(address _user) external view returns (uint256 key) {
        uint256 length = totalUsers;
        for (uint256 i; i < length; ) {
            if (users[i] == _user) key = i;

            unchecked {
                ++i;
            }
        }
    }

    function setList(address[] calldata _list, uint256[] calldata _amount)
        external
        onlyOwner
    {
        uint256 length = _list.length;

        uint256 startIndex = totalUsers;
        uint256 endIndex = startIndex + length;

        for (uint256 i = startIndex; i < endIndex; ) {
            users[i] = _list[i];
            amounts[i] = _amount[i];

            unchecked {
                ++i;
            }
        }

        totalUsers += length;
    }

    function removeFromList(uint256 _key) external onlyOwner {
        require(_key < totalUsers, "Invalid key");

        delete users[_key];
        delete amounts[_key];
    }

    function distributeReward() external onlyOwner {
        uint256 length = totalUsers;

        for (uint256 i; i < length; ) {
            if (!alreadyDistributed[i] && users[i] != address(0)) {
                USDC.safeTransfer(users[i], amounts[i]);
                alreadyDistributed[i] = true;
            }

            unchecked {
                ++i;
            }
        }
    }
}
