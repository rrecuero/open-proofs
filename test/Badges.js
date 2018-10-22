const { assertRevert } = require('./utils/assertRevert');
const { shouldSupportInterfaces } = require('openzeppelin-solidity/test/introspection/SupportsInterface.behavior');
// const { shouldBehaveLikeERC721 } = require('./token_basics/ERC721.behavior');
const _ = require('lodash');

const BigNumber = web3.BigNumber;
const Badges = artifacts.require('Badges.sol');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Badges', function ([
  creator,
  ...accounts
]) {
  const name = 'ProofBadges';
  const symbol = 'PROOF';
  const firstTokenId = 100;
  const secondTokenId = 200;
  const thirdTokenId = 300;
  const nonExistentTokenId = 999;

  const minter = creator;

  const [
    owner,
    newOwner,
    another,
    anyone,
  ] = accounts;

  beforeEach(async function () {
    this.token = await Badges.new({ from: creator });
  });

  describe('like a full ERC721', function () {
    beforeEach(async function () {
      await this.token.mintWithTokenURI(owner, firstTokenId, 'https://ipfs.json', { from: minter });
      await this.token.mintWithTokenURI(owner, secondTokenId, 'https://ipfs.json', { from: minter });
    });

    describe('mintWithTokenURI', function () {
      beforeEach(async function () {
        await this.token.mintWithTokenURI(newOwner, thirdTokenId, 'https://ipfs.json', { from: minter });
      });

      it('adjusts owner tokens by index', async function () {
        (await this.token.tokenOfOwnerByIndex(newOwner, 0)).toNumber().should.be.equal(thirdTokenId);
      });

      it('adjusts all tokens list', async function () {
        (await this.token.tokenByIndex(2)).toNumber().should.be.equal(thirdTokenId);
      });
    });

    describe('burn', function () {
      beforeEach(async function () {
        await this.token.burn(firstTokenId, { from: owner });
      });

      it('removes that token from the token list of the owner', async function () {
        (await this.token.tokenOfOwnerByIndex(owner, 0)).toNumber().should.be.equal(secondTokenId);
      });

      it('adjusts all tokens list', async function () {
        (await this.token.tokenByIndex(0)).toNumber().should.be.equal(secondTokenId);
      });

      it('burns all tokens', async function () {
        await this.token.burn(secondTokenId, { from: owner });
        (await this.token.totalSupply()).toNumber().should.be.equal(0);
        await assertRevert(this.token.tokenByIndex(0));
      });
    });

    describe('metadata', function () {
      const sampleUri = 'mock://mytoken';

      it('has a name', async function () {
        (await this.token.name()).should.be.equal(name);
      });

      it('has a symbol', async function () {
        (await this.token.symbol()).should.be.equal(symbol);
      });

      it('returns non empty metadata for token', async function () {
        (await this.token.tokenURI(firstTokenId)).should.be.equal('https://ipfs.json');
      });

      it('reverts when querying metadata for non existent token id', async function () {
        await assertRevert(this.token.tokenURI(nonExistentTokenId));
      });
    });

    describe('totalSupply', function () {
      it('returns total token supply', async function () {
        (await this.token.totalSupply()).should.be.bignumber.equal(2);
      });
    });

    describe('tokenOfOwnerByIndex', function () {
      describe('when the given index is lower than the amount of tokens owned by the given address', function () {
        it('returns the token ID placed at the given index', async function () {
          (await this.token.tokenOfOwnerByIndex(owner, 0)).should.be.bignumber.equal(firstTokenId);
        });
      });

      describe('when the index is greater than or equal to the total tokens owned by the given address', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 2));
        });
      });

      describe('when the given address does not own any token', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(another, 0));
        });
      });

      describe('after transferring all tokens to another user', function () {
        beforeEach(async function () {
          await this.token.transferFrom(owner, another, firstTokenId, { from: owner });
          await this.token.transferFrom(owner, another, secondTokenId, { from: owner });
        });

        it('returns correct token IDs for target', async function () {
          (await this.token.balanceOf(another)).toNumber().should.be.equal(2);
          const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenOfOwnerByIndex(another, i)));
          tokensListed.map(t => t.toNumber()).should.have.members([firstTokenId, secondTokenId]);
        });

        it('returns empty collection for original owner', async function () {
          (await this.token.balanceOf(owner)).toNumber().should.be.equal(0);
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 0));
        });
      });
    });

    describe('tokenByIndex', function () {
      it('should return all tokens', async function () {
        const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenByIndex(i)));
        tokensListed.map(t => t.toNumber()).should.have.members([firstTokenId, secondTokenId]);
      });

      it('should revert if index is greater than supply', async function () {
        await assertRevert(this.token.tokenByIndex(2));
      });

      [firstTokenId, secondTokenId].forEach(function (tokenId) {
        it(`should return all tokens after burning token ${tokenId} and minting new tokens`, async function () {
          const newTokenId = 300;
          const anotherNewTokenId = 400;

          await this.token.burn(tokenId, { from: owner });
          await this.token.mintWithTokenURI(newOwner, newTokenId, 'https://ipfs.json', { from: minter });
          await this.token.mintWithTokenURI(newOwner, anotherNewTokenId, 'https://ipfs.json', { from: minter });

          (await this.token.totalSupply()).toNumber().should.be.equal(3);

          const tokensListed = await Promise.all(_.range(3).map(i => this.token.tokenByIndex(i)));
          const expectedTokens = _.filter(
            [firstTokenId, secondTokenId, newTokenId, anotherNewTokenId],
            x => (x !== tokenId)
          );
          tokensListed.map(t => t.toNumber()).should.have.members(expectedTokens);
        });
      });
    });
  });

  // shouldBehaveLikeERC721(creator, minter, accounts);

  shouldSupportInterfaces([
    'ERC165',
    'ERC721',
    'ERC721Enumerable',
    'ERC721Metadata',
  ]);
});
