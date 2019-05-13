import { injectable, inject } from "inversify";
import { Web3Instance } from "../../blockchain/Web3Instance";
import { IWeb3 } from "../../blockchain/IWeb3";
import { TransactionBase } from "../bean/TransactionBase";
import { TYPES } from "../../../inversify/types";
import { Solc } from "./Solc";
let fs = require('fs')
let nodePath = require('path')

@injectable()
export class ContractService {

  constructor(
    @inject(TYPES.Solc) private solc: Solc
  ){}

  getAbi(contractName: string, source: string, path: string): any {
    const contract = this.compileContract(contractName, source, path)
    return contract.abi
  }

  compileContract(contractName: string, source: string, path: string): any {
    const compileJson = this.generateCompileObject(contractName, source, path)
    const compiledContract = JSON.parse(this.solc.getInstance().compileStandardWrapper(JSON.stringify(compileJson)))
    const contractWithExt = `${contractName}.sol`
    const contract = compiledContract.contracts[contractWithExt][contractName]
    if (!contract) {
      throw new Error('Bad source code')
    }
    return contract
  }

  async deployContract <T extends TransactionBase> (web3config: any, contractName: string, source: string, path: string, txBase: T): Promise<any> {
    const iWeb3: IWeb3 = new Web3Instance(web3config)
    const web3 = iWeb3.getInstance()
    let bytecode = source
    if (!source.startsWith('0x')) {
      const compiledContract = this.compileContract(contractName, source, path)
      bytecode = compiledContract.evm.bytecode.object
    }
    return this.sendTx(web3, null, bytecode, txBase.from, txBase.gas, txBase.gasPrice, txBase.value)
  }

  async runFunction <T extends TransactionBase> (web3config: any, abi: any, params: string[], to: string, txBase: T): Promise<any> {
    const iWeb3: IWeb3 = new Web3Instance(web3config)
    const web3 = iWeb3.getInstance()
    const functionCallEncoded: string = web3.eth.abi.encodeFunctionCall(abi, params)
    return this.sendTx(web3, to, functionCallEncoded, txBase.from, txBase.gas, txBase.gasPrice, txBase.value)
  }

  private async sendTx(web3: any, to: string, input: string, from?: string, gas?: number, gasPrice?: number, value?: number): Promise<any> {
    const accounts = await web3.eth.getAccounts()
    return web3.eth.sendTransaction({
      to,
      from: from || accounts[0],
      gas,
      gasPrice,
      value,
      input
    });
  }

  private generateCompileObject(contractName: string, content: string, path: string) {
    const sources = {}
    sources[`${contractName}.sol`] = {
      content: content
    }
    const filesChecked = []
    this.findImports(sources, content, path, filesChecked, path)
    const compileJson = {
      language: 'Solidity',
      sources,
      settings: {
        outputSelection: {
          '*': {
            '*': ['evm.bytecode', 'evm.legacyAssembly', 'evm.deployedBytecode', "abi"]
          }
        }
      }
    }
    return compileJson
  }

  private findImports(sources: any, content: string, path: string, filesChecked: string[], initialPath: string) {
    const regexp = /import "(.*)"|import '(.*)'/g
    const match = content.match(regexp)
    if (!match) {
      return
    }
    const matches = match.map(imp => {
      const splittedImp = imp.split('"')
      if (splittedImp.length < 2) {
        return imp.split("'")[1]
      } else {
        return splittedImp[1]
      }
    })

    for (const imp of matches) {
      let importFilePath = path
      if (!importFilePath.endsWith(nodePath.sep)) {
        importFilePath = importFilePath + nodePath.sep
      }
      importFilePath = nodePath.normalize(importFilePath + imp)
      const importPathRelative = nodePath
        .relative(initialPath, importFilePath)
        .replace('./', '')
        .replace('../', '')
        .replace(/^\./, '')

      const importContent = fs.readFileSync(importFilePath).toString()
      let sourceFileName = imp.replace('./', '').replace('../', '')
      if (sourceFileName.startsWith('.')) {
        sourceFileName = sourceFileName.substr(1, sourceFileName.length)
      }
      if (filesChecked.includes(importPathRelative)) {
        continue
      }
      filesChecked.push(importPathRelative)
      sources[importPathRelative] = {
        content: importContent
      }
      this.findImports(
        sources,
        importContent,
        nodePath.normalize(nodePath.dirname(importFilePath)),
        filesChecked,
        initialPath
      )
    }
  }
}