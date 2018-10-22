const Badges = artifacts.require("Badges");

module.exports = function(deployer) {
  deployer.deploy(Badges);
};
