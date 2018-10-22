const ERC721Holder = artifacts.require('../Badges.sol');
const ERC721Mintable = artifacts.require('../Badges.sol');

require('chai')
  .should();

contract('ERC721Holder', function ([creator]) {
  it('receives an ERC721 token', async function () {
    const token = await ERC721Mintable.new({ from: creator });
    const tokenId = 1;
    await token.mintWithTokenURI(creator, tokenId, '', { from: creator });

    const receiver = await ERC721Holder.new();
    await token.approve(receiver.address, tokenId, { from: creator });
    await token.safeTransferFrom(creator, receiver.address, tokenId);

    (await token.ownerOf(tokenId)).should.be.equal(receiver.address);
  });
});
