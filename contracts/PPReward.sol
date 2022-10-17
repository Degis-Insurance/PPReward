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

    uint256 public endTimestamp;

    // Root of the merkle tree
    bytes32 public root;

    // User address => Already claimed the reward
    // 0 as not claimed, 1 as claimed
    mapping(address => uint256) public alreadyClaimed;

    event Claim(address indexed user, uint256 amount);

    constructor(address _deg, uint256 _duration) {
        DEG = IERC20(_deg); // 0x9f285507Ea5B4F33822CA7aBb5EC8953ce37A645

        endTimestamp = block.timestamp + _duration;
    }

    modifier notEnded() {
        require(block.timestamp < endTimestamp, "PPReward: ended");
        _;
    }

    modifier revokable() {
        require(block.timestamp > endTimestamp, "PPReward: not ended yet");
        _;
    }

    /// @notice Set merkle root by the owner
    function setMerkleRoot(bytes32 _root) external onlyOwner {
        root = _root;
    }

    function setEndTime(uint256 _duration) external onlyOwner {
        endTimestamp = block.timestamp + _duration;
    }

    function isClaimable(
        address _to,
        uint256 _amount,
        bytes32[] calldata _proof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));

        bool isValidate = MerkleProof.verify(_proof, root, leaf);
        return isValidate;
    }

    function getLeaf(address _to, uint256 _amount)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_to, _amount));
    }

    /// @notice Claim DEG reward with the proof
    function claim(
        address _to,
        uint256 _amount,
        bytes32[] calldata _proof
    ) external notEnded {
        require(alreadyClaimed[_to] == 0, "Already Claimed");

        bytes32 leaf = keccak256(abi.encodePacked(_to, _amount));

        bool isValidate = MerkleProof.verify(_proof, root, leaf);
        require(isValidate, "Not in the reward list");

        alreadyClaimed[_to] = 1;

        DEG.safeTransfer(_to, _amount);

        emit Claim(_to, _amount);
    }

    /// @notice Revoke the remaining DEG tokens
    function revoke() external onlyOwner revokable {
        DEG.safeTransfer(owner(), DEG.balanceOf(address(this)));
    }
}
