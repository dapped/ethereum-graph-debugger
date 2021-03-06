import { CFGBlocks } from '../../cfg/CFGBlocks'
import { Operation } from '../../bytecode/Operation'

export interface CFGContract {
  contractConstructor?: {
    bytecode: Operation[]
    blocks: CFGBlocks,
    rawBytecode
  }
  contractRuntime: {
    bytecode: Operation[]
    blocks: CFGBlocks
    rawBytecode: string
  }
}
