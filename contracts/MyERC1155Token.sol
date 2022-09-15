// SPDX-License-Identifier: MIT

pragma solidity =0.8.9;

import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MyERC1155Token is ERC1155PresetMinterPauser {
  using EnumerableSet for EnumerableSet.UintSet;

  mapping(address => EnumerableSet.UintSet) private _accountTokens;

  constructor(string memory uri) ERC1155PresetMinterPauser(uri) {}

  function mint(
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public override {
    super.mint(to, id, amount, data);
    _addTokenIdTo(to, id);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override {
    super.mintBatch(to, ids, amounts, data);
    for (uint256 i = 0; i < ids.length; i++) {
      _addTokenIdTo(to, ids[i]);
    }
  }

  function burn(
    address from,
    uint256 id,
    uint256 value
  ) public override {
    super.burn(from, id, value);
    if (balanceOf(from, id) == 0) {
      _removeTokenIdFrom(from, id);
    }
  }

  function burnBatch(
    address from,
    uint256[] memory ids,
    uint256[] memory values
  ) public override {
    super.burnBatch(from, ids, values);
    for (uint256 i = 0; i < ids.length; i++) {
      if (balanceOf(from, ids[i]) == 0) {
        _removeTokenIdFrom(from, ids[i]);
      }
    }
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public override {
    super.safeTransferFrom(from, to, id, amount, data);
    if (balanceOf(from, id) == 0) {
      _removeTokenIdFrom(from, id);
    }
    if (balanceOf(to, id) != 0) {
      _addTokenIdTo(to, id);
    }
  }

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public override {
    super.safeBatchTransferFrom(from, to, ids, amounts, data);
    for (uint256 i = 0; i < ids.length; i++) {
      if (balanceOf(from, ids[i]) == 0) {
        _removeTokenIdFrom(from, ids[i]);
      }
      _addTokenIdTo(to, ids[i]);
    }
  }

  function _addTokenIdTo(address account, uint256 id) internal {
    EnumerableSet.UintSet storage tokens = _accountTokens[account];
    if (!EnumerableSet.contains(tokens, id)) {
      EnumerableSet.add(tokens, id);
    }
  }

  function _removeTokenIdFrom(address account, uint256 id) internal {
    EnumerableSet.UintSet storage tokens = _accountTokens[account];
    if (EnumerableSet.contains(tokens, id)) {
      EnumerableSet.remove(tokens, id);
    }
  }

  function getTokenIdsFor(address account) external view returns (uint256[] memory tokenIds) {
    return EnumerableSet.values(_accountTokens[account]);
  }
}
