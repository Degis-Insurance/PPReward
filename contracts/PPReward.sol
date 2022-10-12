// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @notice Protocol Protection Testnet Reward Contract
 *
 *         User reward information is in the form:
 *         [address: 0xabcd, amount: 1 ether]
 *
 *         All info is stored in a merkle tree and this contract verify the proof.
 */
contract PPReward is Ownable {
    using SafeERC20 for IERC20;

    // Reward tokens
    IERC20 public immutable DEG;

    IERC20 public immutable USDC;

    uint256 public immutable endTimestamp;

    // Root of the merkle tree
    bytes32 public root;

    // User address => Already claimed the reward
    // 0 as not claimed, 1 as claimed
    mapping(address => uint256) public alreadyClaimed;

    constructor(
        address _deg,
        address _usdc,
        uint256 _endTimestamp
    ) {
        DEG = IERC20(_deg); // 0x0c1902987652D5A6168DD65EE6B2536456Ef92d3
        USDC = IERC20(_usdc); //0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E

        endTimestamp = _endTimestamp;
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        root = _root;
    }

    function claim(
        address _token,
        address _to,
        uint256 _amount,
        bytes32[] calldata _proof
    ) external {
        require(alreadyClaimed[_to] == 0, "Already Claimed");

        bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));

        bool isValidate = MerkleProof.verify(_proof, root, leaf);
        require(isValidate, "Not in the reward list");

        alreadyClaimed[_to] = 1;

        uint256 amountClaimed = _safeTokenTransfer(address(DEG), _amount);
    }

    function _safeTokenTransfer(address _token, uint256 _amount)
        internal
        returns (uint256)
    {}
}
