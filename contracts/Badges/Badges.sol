/// SPDX-License-Identifier: BSD-3-Clause
pragma solidity 0.6.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Badges is Ownable, AccessControl, ERC721Burnable, ERC721Holder {

  using SafeMath for uint256;

  // Create a new role identifier for the minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  /* already included in ERC721.sol
  bytes4 private constant _InterfaceId_ERC721Metadata = 0x5b5e139f;
  bytes4 private constant _InterfaceId_ERC721 = 0x80ac58cd;
  */
  /*
      Badge metadata format
      {
          "title": "Project Proof Badge Metadata",
          "type": "object",
          "properties": {
              "name": {
                  "type": "string",
                  "description": "Identifies the badge template to which this NFT represents",
              },
              "description": {
                  "type": "string",
                  "description": "Describes the asset to which this NFT represents",
              },
              "image": {
                  "type": "string",
                  "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
              },
              "unit_id": {
                  "type": "integer",
                  "description": "Specifies the id of this unit within its kind",
              }
          }
      }
  */

  event NewCommunity(uint256 communityId, string name, string url);
  event NewTemplate(uint256 communityId, string name, string description, string image, uint256 limit);
  event NewBadge(uint256 tokenId, uint256 templateId, string tokenURI);
  // event LogDebugS(string hola);
  // event LogDebugN(uint256 number);

  struct Community {
    string name;
    string url;
  }

  struct BadgeTemplate {
    string name;
    string description;
    string image;
    address owner;
    uint256 limit;
  }

  Community[] private communities;
  BadgeTemplate[] private templates;

  // Mapping from a community address to the pos in the community array
  mapping (address => uint256) private _ownedCommunity;

  // Mapping from community  to list of owned token IDs
  mapping(address => uint256[]) private _communityTokens;
  // Mapping from token ID to index of the community tokens list
  mapping(uint256 => uint256) private _communityTokensIndex;

  // Mapping from community to list of badge template IDs
  mapping(address => uint256[]) private _communityTemplates;
  // Mapping from template ID to index of the community templates list
  mapping(uint256 => uint256) private _communityTemplatesIndex;
  // Supplies of each badge template
  mapping(uint256 => uint256) private _templateQuantities;
  mapping(uint256 => uint256) private _tokenTemplates;

  constructor()
    Ownable()
    ERC721("ProjectProof", "PROOF")
    public
  {
    /* already included in ERC721.sol
    _registerInterface(_InterfaceId_ERC721Metadata);
    _registerInterface(_InterfaceId_ERC721);
    */
    _setupRole(DEFAULT_ADMIN_ROLE, owner());
  }
  /* function toString() already included in OpenZeppelin v3.0.0 in /utils/Strings.sol

  function toString(address x) internal pure returns (string memory) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
  }
  */
  // cloned form OpenZeppelin v2.5
  modifier onlyMinter() {
      require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
      _;
    }

  modifier onlyTemplateOwner(uint _templateId) {
    require(bytes(templates[_templateId].name).length != 0, "Template needs to exist");
    require(templates[_templateId].owner == msg.sender, "You do not own this template");
    _;
  }

  function addMinter(address account) public onlyOwner returns (bool) {
    grantRole(MINTER_ROLE, account);
    return true;
  }

  function removeMinter(address account) public onlyOwner returns (bool) {
    revokeRole(MINTER_ROLE, account);
    return true;
  }

  // cloned from OpenZeppelin v2.5
  function mintWithTokenURI(address to, uint256 tokenId, string memory tokenURI) public onlyMinter returns (bool) {
    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);
    return true;
  }

  function _hasCommunity(address add) internal view returns (bool) {
    require(communities.length > _ownedCommunity[add], "You need to own a community");
    return true;
  }

  function _hasTemplate(address add, uint256 templateId) internal view returns (bool) {
    require(templates.length > templateId, "No template with that id");
    require(templates[templateId].owner == add, "The community does not own the template");
    return true;
  }

  // Getters

  function getCommunity(uint256 communityId) public view onlyOwner returns (uint256 _communityId, string memory name, string memory url) {
    require(getCommunitiesCount() > communityId, "No community with that id");
    Community memory mycommunity = communities[communityId];
    return (_communityId, mycommunity.name, mycommunity.url);
  }

  function getMyCommunity() public view onlyMinter returns (uint256 _communityId, string memory name, string memory url) {
    return getCommunity(_ownedCommunity[msg.sender]);
  }

  function getTemplate(uint256 templateId) public view returns (string memory name, string memory description, string memory image, uint256 limit) {
    require(templates.length > templateId, "No template with that id");
    BadgeTemplate memory template = templates[templateId];
    return (template.name, template.description, template.image, template.limit);
  }

  // Communities

  function getCommunitiesCount() public view returns (uint256 count) {
    return communities.length;
  }

  function createCommunity(address to, string memory name, string memory url) public onlyOwner returns (uint256 _communityId) {
    require(getCommunitiesCount() <= _ownedCommunity[to], "You already own a community");
    Community memory _newCommunity = Community({
       name: name,
       url: url
    });
    communities.push(_newCommunity);
    _communityId = communities.length.sub(1);
    _ownedCommunity[to] = _communityId;
    emit NewCommunity(_communityId, name, url);
    return _communityId;
  }

  function destroyCommunity(address to, uint256 communityId) public onlyOwner {
    _hasCommunity(to);
    require(_communityTemplates[to].length == 0, "You need to destroy the community template first");
    require(_ownedCommunity[to] == communityId);
    Community memory lastCommunity = communities[communities.length.sub(1)];
    communities[communityId] = lastCommunity;
    communities.pop();
    // Can't remove the access here need to call it from somewhere else
    // _removeMinter(to);
  }

  // Templates

  function getTemplatesCount() public view returns (uint256 count) {
    return templates.length;
  }

  function createTemplate(string memory name, string memory description, string memory image, uint256 limit) public onlyMinter returns (uint256 _templateId) {
    // Community has to exist
    _hasCommunity(msg.sender);
    BadgeTemplate memory _newTemplate = BadgeTemplate({
       name: name,
       owner: msg.sender,
       description: description,
       image: image,
       limit: limit
    });
    templates.push(_newTemplate);
    _templateId = templates.length.sub(1);
    _ownedCommunity[msg.sender] = _templateId;
    _communityTemplates[msg.sender].push(_templateId);
    _communityTemplatesIndex[_templateId] = _communityTemplates[msg.sender].length.sub(1);
    emit NewTemplate(_templateId, name, description, image, limit);
    return _templateId;
  }

  function destroyTemplate(uint256 templateId) public onlyTemplateOwner(templateId) {
    // Community has to exist
    _hasCommunity(msg.sender);
    _hasTemplate(msg.sender, templateId);
    require(_templateQuantities[templateId] == 0, "Cannnot remove a template that has badges");
    // To prevent a gap in the array, we store the last token in the index of the template to delete, and
    // then delete the last slot.
    uint256 templateIndex = _communityTemplatesIndex[templateId];
    uint256 lastTemplateIndex = _communityTemplates[msg.sender].length.sub(1);
    uint256 lastTemplate = _communityTemplates[msg.sender][lastTemplateIndex];

    _communityTemplates[msg.sender][templateIndex] = lastTemplate;
    // This also deletes the contents at the last position of the array
    _communityTemplates[msg.sender].pop();

    // Note that this will handle single-element arrays. In that case, both templateIndex and lastTemplateIndex are going to
    // be zero. Then we can make sure that we will remove templateId from the _communityTemplates list since we are first swapping
    // the lastTemplate to the first position, and then dropping the element placed in the last position of the list

    _communityTemplatesIndex[templateId] = 0;
    _communityTemplatesIndex[lastTemplate] = templateIndex;

    templates[templateId] = templates[templates.length.sub(1)];
    templates.pop();
  }

  // Badges

  function getBadgeTemplate(uint256 tokenId) public view returns (uint256) {
    require(totalSupply() > tokenId, "No token with that id");
    return _tokenTemplates[tokenId];
  }

  function getBadgeTemplateQuantity(uint256 templateId) public view returns (uint256) {
    require(templates.length > templateId, "No template with that id");
    return _templateQuantities[templateId];
  }

  function createBadge(address to, uint256 templateId, string memory tokenURI) public onlyTemplateOwner(templateId) returns (uint256 _tokenId) {
    // Community has to exist
    _hasCommunity(msg.sender);
    _hasTemplate(msg.sender, templateId);
    require(_templateQuantities[templateId] < templates[templateId].limit,
      "You have reached the limit of NFTs");
    _tokenId = totalSupply();

    _communityTokens[msg.sender].push(_tokenId);
    _communityTokensIndex[_tokenId] = _communityTokens[msg.sender].length.sub(1);
    // Increase the quantities
    _tokenTemplates[_tokenId] = templateId;
    _templateQuantities[templateId] = _templateQuantities[templateId].add(1);

    require(mintWithTokenURI(to, _tokenId, tokenURI), "Badge not minted");

    emit NewBadge(_tokenId, templateId, tokenURI);
    return _tokenId;
  }

  function burnBadge(uint256 tokenId) public {
    uint256 templateId = getBadgeTemplate(tokenId);
    _templateQuantities[templateId] = _templateQuantities[templateId].sub(1);
    burn(tokenId);
  }

    /// @notice ERC721 _transfer() Disabled
    /// @dev _transfer() has been overriden
    /// @dev reverts on transferFrom() and safeTransferFrom()
    function _transfer(address from, address to, uint256 tokenId) internal override {
      require(!true, "ERC721: token transfer disabled");
      super._transfer(from, to, tokenId);
    }

}
