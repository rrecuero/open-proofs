const fs = require('fs');
const clevisConfig = JSON.parse(fs.readFileSync("clevis.json").toString().trim())
module.exports = {
  'openzeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/math/SafeMath.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol', 'utf8'),
  'openzeppelin-solidity/contracts/access/roles/MinterRole.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/access/roles/MinterRole.sol', 'utf8'),
  'openzeppelin-solidity/contracts/access/Roles.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/access/Roles.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/IERC721.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/IERC721Enumerable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Enumerable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/IERC721Metadata.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Metadata.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol', 'utf8'),
  'openzeppelin-solidity/contracts/utils/Address.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/utils/Address.sol', 'utf8'),
  'openzeppelin-solidity/contracts/math/SafeMath.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol', 'utf8'),
  'openzeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol', 'utf8'),
  'openzeppelin-solidity/contracts/introspection/ERC165.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/introspection/ERC165.sol', 'utf8'),
  'openzeppelin-solidity/contracts/introspection/IERC165.sol': fs.readFileSync('node_modules/openzeppelin-solidity/contracts/introspection/IERC165.sol', 'utf8')
}
