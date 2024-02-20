import Rx from 'rxjs';
import EventEmitter from 'events';
export const roomEmitter = new EventEmitter();
export const transcriptAvailServiceSub = new Rx.Subject();
