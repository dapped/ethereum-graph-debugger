import { WasmSectionType } from "./wasmTypes";
import { FuncType } from "./FuncType";
import { ExportEntry } from "./ExportEntry";
import { FunctionBody } from "./FunctionBody";
import { ImportEntry } from "./ImportEntry";

export interface WasmSection {
  sectionType: WasmSectionType
  payloadHex: string,
  payload: WasmSectionPayload
}

export interface WasmSectionPayload {

}

export interface WasmTypeSectionPayload extends WasmSectionPayload {
  functions: FuncType[]
}

export interface WasmExportSectionPayload extends WasmSectionPayload {
  exports: ExportEntry[]
}

export interface WasmImportSectionPayload extends WasmSectionPayload {
  imports: ImportEntry[]
}

export interface WasmCodeSectionPayload extends WasmSectionPayload {
  functions: FunctionBody[]
}

export interface WasmFunctionSectionPayload extends WasmSectionPayload {
  functionsTypes: number[]
}

export const findSection = (sections: WasmSection[], sectionType: WasmSectionType): WasmSection => {
  return sections.find(section =>  {
    return section.sectionType.toString() == WasmSectionType[sectionType.toString()]
  }); 
}