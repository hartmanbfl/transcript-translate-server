import Rx from 'rxjs';
import EventEmitter from 'events';

export const roomEmitter = new EventEmitter();

export interface TranscriptAvailableMessage {
    serviceCode: string, 
    transcript: string, 
    serviceLanguageMap: Map<string, string[]> 
}
export const transcriptAvailServiceSub = new Rx.Subject<TranscriptAvailableMessage>();