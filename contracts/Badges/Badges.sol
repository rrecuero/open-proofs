pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Badges is Ownable, ERC721Full, ERC721MetadataMintable, ERC721Burnable, ERC721Holder {

  using SafeMath for uint256;
  using Address for address;

  bytes4 private constant _InterfaceId_ERC721Metadata = 0x5b5e139f;
  bytes4 private constant _InterfaceId_ERC721 = 0x80ac58cd;

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
    ERC721Full("ProjectProof", "PROOF")
    public
  {
    _registerInterface(_InterfaceId_ERC721Metadata);
    _registerInterface(_InterfaceId_ERC721);
  }

  function toString(address x) internal pure returns (string memory) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
  }

  modifier onlyTemplateOwner(uint _templateId) {
    require(bytes(templates[_templateId].name).length != 0, "Template needs to exist");
    require(templates[_templateId].owner == msg.sender, "You do not own this template");
    _;
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
    _communityId = communities.push(_newCommunity).sub(1);
    _ownedCommunity[to] = _communityId;
    if (!isMinter(to)) {
      addMinter(to);
    }
    emit NewCommunity(_communityId, name, url);
    return _communityId;
  }

  function destroyCommunity(address to, uint256 communityId) public onlyOwner {
    _hasCommunity(to);
    require(_communityTemplates[to].length == 0, "You need to destroy the community template first");
    require(_ownedCommunity[to] == communityId);
    Community memory lastCommunity = communities[communities.length.sub(1)];
    communities[communityId] = lastCommunity;
    communities.length --;
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
    _templateId = templates.push(_newTemplate).sub(1);
    _ownedCommunity[msg.sender] = _templateId;
    uint256 length = _communityTemplates[msg.sender].push(_templateId).sub(1);
    _communityTemplatesIndex[_templateId] = length;
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
    _communityTemplates[msg.sender].length--;

    // Note that this will handle single-element arrays. In that case, both templateIndex and lastTemplateIndex are going to
    // be zero. Then we can make sure that we will remove templateId from the _communityTemplates list since we are first swapping
    // the lastTemplate to the first position, and then dropping the element placed in the last position of the list

    _communityTemplatesIndex[templateId] = 0;
    _communityTemplatesIndex[lastTemplate] = templateIndex;

    templates[templateId] = templates[templates.length.sub(1)];
    templates.length --;
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
    mintWithTokenURI(
      to,
      _tokenId,
      tokenURI
    );
    uint256 length = _communityTokens[msg.sender].push(_tokenId).sub(1);
    _communityTokensIndex[_tokenId] = length;
    // Increase the quantities
    _tokenTemplates[_tokenId] = templateId;
    _templateQuantities[templateId] = _templateQuantities[templateId].add(1);
    emit NewBadge(_tokenId, templateId, tokenURI);
    return _tokenId;
  }

  function burnBadge(uint256 tokenId) public {
    uint256 templateId = getBadgeTemplate(tokenId);
    burn(tokenId);
    _templateQuantities[templateId] = _templateQuantities[templateId].sub(1);
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  )
    public
  {
    require(1 != 0 , "Proof Badges transfers are disabled");
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  )
    public
  {
    require(1 != 0 , "Proof Badges transfers are disabled");
  }
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  )
    public
  {
    require(1 != 0 , "Proof Badges transfers are disabled");
  }

}
