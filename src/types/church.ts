export interface ChurchInfo {
  name: string | undefined, 
  defaultServiceId: string | undefined,
  greeting: string | undefined,
  message: string | undefined, 
  additionalWelcome: string | undefined,
  waiting: string | undefined,
  language: string | undefined, 
  translationLanguages: string | undefined,
  base64Logo: string | undefined
}

export interface LanguageEntry {
    name: string,
    subscribers: number
}
export interface ChurchActiveLanguages {
    serviceId: string,
    languages: LanguageEntry[]
}