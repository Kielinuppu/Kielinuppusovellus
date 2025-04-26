// src/types/info.ts
export interface InfoData {
  id: string;
  title: string;
  category: string; // laulupelit, sanapelit, muistipelit, valintapelit, muut, laulutaulut
  imageFiles: string[]; // Kuvatiedostojen nimet array-muodossa
  page: string; // Sivun nimi, johon info liittyy (pelit, laulutaulut, jne.)
}