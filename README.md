# open-proofs: Unique Non Transferable NFTs (NFNTs)  - Badges
open-proofs is a DIY badge creation tool built for communities to easily design and mint their own non-fungible, non-transferable badges and distribute them to within their own communities and applications for various achievements.

[Website](http://openproofs.com/)

**Quick Links:**

- [Open-Proofs Reference Implementation](contracts/Badges/Badges.sol)

- [ERC721Full Interface](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/IERC721Full.sol)

- [ERC721 Metadata Mintable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721MetadataMintable.sol)

- [ERC721 Enumerable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721Enumerable.sol)

- [Open source under BSD-3](LICENSE)
---

**The open-proof Badges contract:**

```sol
contract Badges {

  // Inherited from ERC721
  function name() external view returns (string);
  function symbol() external view returns (string);
  function totalSupply() public view returns (uint256);
  function tokenByIndex(uint256 index) public view returns (uint256);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function balanceOf(address owner) public view returns (uint256);
  function function tokenOfOwnerByIndex(address owner, uint256 index)public view return (uint256);
  function tokensOwned(address owner) public view returns (uint256[], uint256[]);
  //** Transfers are disabled. Calling them would trigger a revert op code

  // Communities
  function getCommunity(uint256 communityId) public view onlyOwner returns (uint256 _communityId, string name, string url);
  function getMyCommunity() public view onlyMinter returns (uint256 _communityId, string name, string url);
  function getCommunitiesCount() public view returns (uint256 count);
  function createCommunity(address to, string name, string url) public onlyOwner returns (uint256 _communityId);
  function destroyCommunity(address to, uint256 communityId) public onlyOwner;

  // Templates
  function getTemplate(uint256 templateId) public view returns (string name, string description, string image, uint256 limit);
  function getTemplatesCount() public view returns (uint256 count);
  function createTemplate(string name, string description, string image, uint256 limit) public onlyMinter returns (uint256 _templateId);
  function destroyTemplate(uint256 templateId) public onlyTemplateOwner(templateId)

  // Badges
  function getBadgeTemplate(uint256 tokenId) public view returns (uint256);
  function getBadgeTemplateQuantity(uint256 templateId) public view returns (uint256);
  function createBadge(address to, uint256 templateId, string tokenURI) public onlyTemplateOwner(templateId) returns (uint256 _tokenId);
  function burnBadge(uint256 tokenId) public;

  // Events
  event NewCommunity(uint256 communityId, string name, string url);
  event NewTemplate(uint256 communityId, string name, string description, string image, uint256 limit);
  event NewBadge(uint256 tokenId, uint256 templateId, string tokenURI);
}
```

----

**Quick Start:**

A) Truffle. Clone the repo
```bash
npm install
truffle test


```
B) Clevis. Make sure clevis is installed globally. Verify clevis.json
```bash
npm install
clevis test badges
```

To run the tests in this repo, simply clone it and run `truffle test` or `clevis test badges`

----

### Background
Fungible tokens are economic incentives that can be used to  power a cryptonetwork.  When users receive these fungible tokens, they tend to seek liquidity and economic profit rather than signal their contributions.  Proof isn’t a cryptonetwork. It’s a common resource standard that is completely free and open source.  Non-fungible tokens in the form are badges are used to signal unique contributions. They are unique because they have a unique `tokenID` and metadata associated with it. Badges are a way to signal proof done by a private key in a verifiable, trustless way to third-parties.

Badges are a step towards verifiable & scarce on-chain achievements. Badges will indicate what a user has done rather than what the user currently owns. Separating badges from tokens is an important step in the process. Communities might want to use proof for an in-application achievement system, reward open-source developer contributions, or even provide access keys to certain digital content.

### The Current ERC Landscape

Our Approach: Extending ERC721, ERC721Enumerable and ERC721MetadataMintable to support unique badges.

Our contract is compatible with the ERC721 Interface, meaning all the functions are callable but please take into account that transfers are disabled.

### Real World Usage

Currently, Dapps are not being adopted outside of the crypto community.  We believe that current UI/UX flows are too complex for the average user. Dapps usually force you to install Metamask, buy ETH and worry about your private keys. We believe this flow - along with scalability - is preventing mass adoption.

Here are some use cases we foresee by creating an identity layer with non-transferable badges:

- Airdrop targeting- Distribution for tokens is currently flawed. Speculators are not users. We can better target users by proving they’ve contributed to a network or acquired a token at some point in time.

- Digital Access - Users will be able to access certain dApps as long as they’ve obtained a specific badge on a different platform. Users can mint new digital assets only if they’ve obtained a specific badge. Users can then loan their digital goods to users with badges to complete certain tasks.

- Patronage - Donating to a specific address or influencer would reward you with a badge indicating your support for the particular influencer.

- Achievements - If you’re a bit of a showoff, now you can become an achievement hunter with proof badges.

### Conclusion

Inspired by projects like MetaTx and Universal Logins, open-proofs is designed so any project can craft digitally scarce badges without the need to install MetaMask, buy ETH, and deploy smart contracts. Creators will just need to pay enough to cover gas costs. Proof will use meta-t/xs so users retain custody of the badge up the entire time throughout the minting process.

## Inspiration & References

- [ERC-721 Anatomy](https://medium.com/crypto-currently/the-anatomy-of-erc721-e9db77abfc24?ref=producthunt)
- [ERC-721 Metadata Standards](https://medium.com/blockchain-manchester/erc-721-metadata-standards-and-ipfs-94b01fea2a89)
- [Identity and NFTs](https://medium.com/originprotocol/managing-identity-with-a-ui-for-erc-725-5c7422b38c09)
- [ERC-721x](https://erc721x.org/)
- [Universal Logins](https://medium.com/@avsa/universal-logins-first-demo-1dc8b17a8de7)

## About

Project created by [Ramón Recuero](https://www.ramonrecuero.com) in collaboration with Bryan Flynn and Adam Breckler from [Xpo](https://xpo.network).
