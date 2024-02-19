import Rx from 'rxjs';
import EventEmitter from 'events';
export var roomEmitter = new EventEmitter();
export var transcriptAvailServiceSub = new Rx.Subject();
