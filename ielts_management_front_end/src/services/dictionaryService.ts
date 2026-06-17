export interface DictionaryMeaning {
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface DictionaryResult {
  phonetic: string;
  audioUrl: string;
  meanings: DictionaryMeaning[];
}

export const dictionaryService = {
  async fetchWordData(word: string): Promise<DictionaryResult> {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    
    if (!data || data.length === 0) {
      throw new Error("No data returned");
    }

    const entry = data[0];
    
    // Extract phonetic
    let fetchedPhonetic = entry.phonetic || '';
    let fetchedAudio = '';
    
    if (entry.phonetics && entry.phonetics.length > 0) {
      const phoneticObj = entry.phonetics.find((p: any) => p.text && p.audio);
      if (phoneticObj) {
        if (!fetchedPhonetic) fetchedPhonetic = phoneticObj.text;
        fetchedAudio = phoneticObj.audio;
      } else {
        const anyAudio = entry.phonetics.find((p: any) => p.audio);
        if (anyAudio) fetchedAudio = anyAudio.audio;
      }
    }
    
    // Extract meanings
    const meanings: DictionaryMeaning[] = [];

    if (entry.meanings && entry.meanings.length > 0) {
      for (const m of entry.meanings) {
        const partOfSpeech = m.partOfSpeech || '';
        
        if (m.definitions && m.definitions.length > 0) {
          for (const d of m.definitions) {
            meanings.push({
              partOfSpeech,
              definition: d.definition || '',
              example: d.example || ''
            });
          }
        }
      }
    }
    
    return {
      phonetic: fetchedPhonetic,
      audioUrl: fetchedAudio,
      meanings: meanings
    };
  }
};
