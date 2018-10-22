const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();
const fs = require('fs')
const Web3 = require('web3')
const clevisConfig = JSON.parse(fs.readFileSync("clevis.json").toString().trim())
web3 = new Web3(new Web3.providers.HttpProvider(clevisConfig.provider))
function localContractAddress(contract){
  return fs.readFileSync(clevisConfig.CONTRACTS_FOLDER+"/"+contract+ "/" + contract + ".address").toString().trim()
}
function localContractAbi(contract){
  return JSON.parse(fs.readFileSync(clevisConfig.CONTRACTS_FOLDER+"/"+contract+ "/"+ contract +".abi").toString().trim())
}
function printTxResult(result){
  if(!result||!result.transactionHash){
    console.log("ERROR".red,"MISSING TX HASH".yellow)
  }else{
    console.log(tab,result.transactionHash.gray,(""+result.gasUsed).yellow)
  }
}
function bigHeader(str){
  return "########### "+str+" "+Array(128-str.length).join("#")
}
function rand(min, max) {
  return Math.floor( Math.random() * (max - min) + min );
}
function getPaddedHexFromNumber(num,digits){
  let hexIs = web3.utils.numberToHex(num).replace("0x","");
  while(hexIs.length<digits){
    hexIs = "0"+hexIs
  }
  return hexIs
}
const tab = "\t\t";
module.exports = {


  web3:web3,
  localContractAddress,
  contracts:fs.readFileSync(clevisConfig.ROOT_FOLDER + "/contracts.clevis").toString().trim().split("\n"),
  reload:()=>{
    describe('#reload() ', function() {
      it('should force browser to reload', async function() {
        fs.writeFileSync(clevisConfig.CRA_FOLDER + "/../public/reload.txt",Date.now());
      });
    });
  },
  version:()=>{
    describe('#version() ', function() {
      it('should get version', async function() {
        this.timeout(90000)
        const result = await clevis("version")
        console.log(result)
      });
    });
  },
  blockNumber:()=>{
    describe('#blockNumber() ', function() {
      it('should get blockNumber', async function() {
        this.timeout(90000)
        const result = await clevis("blockNumber")
        console.log(result)
      });
    });
  },
  compile:(contract)=>{
    describe('#compile() '+contract.magenta, function() {
      it('should compile '+contract.magenta+' contract to bytecode', async function() {
        this.timeout(90000)
        const result = await clevis("compile",contract)
        console.log(result)
        assert(Object.keys(result.contracts).length>0, "No compiled contacts found.")
        let count = 0
        for(let c in result.contracts){
          console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
          if(count++==0){
              assert(result.contracts[c].bytecode.length > 1, "No bytecode for contract "+c)
          }
        }
      });
    });
  },
  deploy:(contract,accountindex)=>{
    describe('#deploy() '+contract.magenta, function() {
      it('should deploy '+contract.magenta+' as account '+accountindex, async function() {
        this.timeout(360000)
        const result = await clevis("deploy",contract,accountindex)
        printTxResult(result)
        console.log(tab+"Address: "+result.contractAddress.blue)
        assert(result.contractAddress)
      });
    });
  },

  publish:()=>{
    describe('#publish() ', function() {
      it('should inject contract address and abi into web app', async function() {
        this.timeout(120000)
        const fs = require("fs")
        if(!fs.existsSync("src")){
          fs.mkdirSync("src");
        }
        if(!fs.existsSync("src/contracts")){
          fs.mkdirSync("src/contracts");
        }
        for(let c in module.exports.contracts){
          let thisContract = module.exports.contracts[c]
          console.log(tab,thisContract.magenta)
          let address = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER + "/" + thisContract+"/"+thisContract+".address").toString().trim()
          console.log(tab,"ADDRESS:",address.blue)
          assert(address,"No Address!?")
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/"+thisContract+".address.js","module.exports = \""+address+"\"");
          let blockNumber = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER +"/" + thisContract + "/"+thisContract+".blockNumber").toString().trim()
          console.log(tab,"blockNumber:",blockNumber.blue)
          assert(blockNumber,"No blockNumber!?")
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".blocknumber.js","module.exports = \""+blockNumber+"\"");
          let abi = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER +"/" + thisContract +"/"+thisContract+".abi").toString().trim()
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".abi.js","module.exports = "+abi);
          let bytecode = fs.readFileSync(clevisConfig.CONTRACTS_FOLDER + "/" + thisContract +"/"+thisContract+".bytecode").toString().trim()
          fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/" + thisContract+".bytecode.js","module.exports = \""+bytecode+"\"");
        }
        fs.writeFileSync(clevisConfig.CRA_FOLDER + "/contracts/contracts.js","module.exports = "+JSON.stringify(module.exports.contracts));
        module.exports.reload()
      });
    });
  },
  metamask:()=>{
    describe('#transfer() ', function() {
      it('should give metamask account some ether or tokens to test', async function() {
        this.timeout(600000)
        let result = await clevis("sendTo","0.1","0","0x2a906694D15Df38F59e76ED3a5735f8AAbccE9cb")///<<<-------- change this to your metamask accounts
        printTxResult(result)
        result = await clevis("sendTo","0.1","0","0x9319bbb4e2652411be15bb74f339b7f6218b2508")///<<<-------- change this to your metamask accounts
        printTxResult(result)
        //here is an example of running a funtion from within this object:
        //module.exports.mintTo("Greens",0,"0x2a906694d15df38f59e76ed3a5735f8aabcce9cb",20)
        //view more examples here: https://github.com/austintgriffith/galleass/blob/master/tests/galleass.js
      });
    });
  },


  ////----------------------------------------------------------------------------///////////////////


  ////    ADD YOUR TESTS HERE <<<<<<<<--------------------------------

  // setUrl:(accountindex,url)=>{
  //   describe('#setUrl() ', function() {
  //     it('should setUrl to '+(url+"").yellow+' as account '+accountindex, async function() {
  //       this.timeout(120000)
  //       const result = await clevis("contract","setUrl","GuidlCoin",accountindex,url)
  //       printTxResult(result)
  //       const currentUrl = await clevis("contract","url","GuidlCoin")
  //       assert(currentUrl==url,"setUrl failed!".red)
  //     });
  //   });
  // },

  name:()=>{
    describe('#name() ', function() {
      it('should receive name', async function() {
        this.timeout(12000)
        const result = await clevis("contract","name","Badges")
        assert(result=='ProjectProof',"setUrl failed!".red)
      });
    });
  },

  failToGetCommunity:(communityId)=>{
    describe('#failToGetCommunity() ', function() {
      it('should fail to getCommunity with id '+(communityId+"").yellow, async function() {
        this.timeout(120000)
        let errorMessage = ""
        try{
          const result = await clevis("contract","getCommunity","Badges",communityId)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });


      it('should fail to getCommunity through mine ', async function() {
        this.timeout(120000)
        let errorMessage = ""
        try{
          const result = await clevis("contract","getMyCommunity","Badges")
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  createCommunity:(accountindex, to, name, url)=>{
    describe('#createCommunity() ', function() {
      it('should work to createCommunity with name '+(name+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let errorMessage = ""
        let result = await clevis("contract","createCommunity","Badges", accountindex, to, name, url)
        printTxResult(result)
        this.timeout(120000)
        const count = await clevis("contract","getCommunitiesCount","Badges");
        result = await clevis("contract","getCommunity","Badges", count - 1)
        assert(result.name === name, 'Name must be equal');
        assert(result.url === url);
      });
    });
  },

  destroyCommunity:(accountindex, to, communityId)=>{
    describe('#destroyCommunity() ', function() {
      it('should work to destroyCommunity with id '+(communityId+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let result;
        result = await clevis("contract","destroyCommunity","Badges", accountindex, to, communityId)
        printTxResult(result)
        this.timeout(120000)
        let errorMessage = ""
        try{
          result = await clevis("contract","getCommunity","Badges", communityId)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  destroyCommunityWithTemplates:(accountindex, to, communityId)=>{
    describe('#fail to destroyCommunity with Templates() ', function() {
      it('should fail to destroyCommunity with templates with '+(communityId+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let result;
        try{
          result = await clevis("contract","destroyCommunity","Badges", accountindex, to, communityId)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  createTemplateWithNoCommunity:(accountindex, name, description, image, limit)=>{
    describe('#failToCreateTemplate() ', function() {
      it('should not work to create template with name '+(name+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let errorMessage = ""
        try{
          const result = await clevis("contract","createTemplate","Badges", accountindex, name, description, image, limit)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  createTemplate:(accountindex, name, description, image, limit)=>{
    describe('#createTemplate() ', function() {
      it('should work to create template with name '+(name+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let errorMessage = ""
        try{
          const result = await clevis("contract","createTemplate","Badges", accountindex, name, description, image, limit)
        }catch(e){
          errorMessage = e.toString()
        }
        const count = await clevis("contract","getTemplatesCount","Badges");
        result = await clevis("contract","getTemplate","Badges", count - 1)
        console.log('result', result);
        assert(result.name === name, 'Name must be equal');
        assert(result.description === description);
        assert(result.image === image);
        assert(parseInt(result.limit, 10) === limit);
      });
    });
  },

  destroyTemplate:(accountindex, templateId)=>{
    describe('#destroyTemplate() ', function() {
      it('should work to destroy Template with id '+(templateId+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let result;
        result = await clevis("contract","destroyTemplate","Badges", accountindex, templateId)
        printTxResult(result)
        this.timeout(120000)
        let errorMessage = ""
        try{
          result = await clevis("contract","getTemplate","Badges", templateId)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  createBadge:(accountindex, templateId, tokenURI)=>{
    describe('#createBadge() ', function() {
      it('should work to createBadge with token uri '+(tokenURI+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let errorMessage = ""
        let result = await clevis("contract","createBadge","Badges", accountindex, templateId, tokenURI)
        printTxResult(result)
        this.timeout(120000)
        const count = await clevis("contract","totalSupply","Badges");
        result = await clevis("contract","tokenURI","Badges", count - 1);
        assert(result === tokenURI, 'Name must be equal');
      });
    });
  },

  burnBadge:(accountindex, tokenId)=>{
    describe('#burnBadge() ', function() {
      it('should work to burn badge with token id '+(tokenId+ " ").yellow + 'as account '+accountindex, async function() {
        this.timeout(120000)
        let errorMessage = ""
        let result = await clevis("contract","burnBadge","Badges", accountindex, tokenId)
        printTxResult(result)
        this.timeout(120000)
        try{
          result = await clevis("contract","ownerOf","Badges", tokenId)
        }catch(e){
          errorMessage = e.toString()
        }
        console.log(tab,"Expect error message: ",errorMessage.green)
        assert(errorMessage.indexOf("revert")>=0,"Did not get an error!?")
      });
    });
  },

  // getCommunity:(accountindex, 1)=>{
  //   describe('#name() ', function() {
  //     it('should receive no community', async function() {
  //       this.timeout(12000)
  //       const result = await clevis("contract","name","Badges", accountindex)
  //       assert(result=='ProjectProof',"setUrl failed!".red)
  //     });
  //   });
  // },

  ////----------------------------------------------------------------------------///////////////////


  full:()=>{
    describe(bigHeader('COMPILE'), function() {
      it('should compile all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","compile")
        console.log('result', result);
        assert(result==0,"deploy ERRORS")
      });
    });
    describe(bigHeader('FAST'), function() {
      it('should run the fast test (everything after compile)', async function() {
        this.timeout(6000000)
        const result = await clevis("test","fast")
        assert(result==0,"fast ERRORS")
      });
    });
  },

  fast:()=>{
    describe(bigHeader('DEPLOY'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","deploy")
        assert(result==0,"deploy ERRORS")
      });
    });
    describe(bigHeader('METAMASK'), function() {
      it('should deploy all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","metamask")
        assert(result==0,"metamask ERRORS")
      });
    });
    describe(bigHeader('PUBLISH'), function() {
      it('should publish all contracts', async function() {
        this.timeout(6000000)
        const result = await clevis("test","publish")
        assert(result==0,"publish ERRORS")
      });
    });

  },

}

checkContractDeployment = async (contract)=>{
  const localAddress = localContractAddress(contract)
  const address = await clevis("contract","getContract","Example",web3.utils.fromAscii(contract))
  console.log(tab,contract.blue+" contract address is "+(localAddress+"").magenta+" deployed as: "+(address+"").magenta)
  assert(localAddress==address,contract.red+" isn't deployed correctly!?")
  return address
}



//example helper function
/*
makeSureContractHasTokens = async (contract,contractAddress,token)=>{
  const TokenBalance = await clevis("contract","balanceOf",token,contractAddress)
  console.log(tab,contract.magenta+" has "+TokenBalance+" "+token)
  assert(TokenBalance>0,contract.red+" doesn't have any "+token.red)
}

view more examples here: https://github.com/austintgriffith/galleass/blob/master/tests/galleass.js

*/
