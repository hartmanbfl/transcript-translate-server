var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Transcript } from "./Transcript.entity.js";
let Phrase = class Phrase {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Phrase.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Phrase.prototype, "tenant_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Phrase.prototype, "transcript_id", void 0);
__decorate([
    ManyToOne(() => Transcript, (transcript) => transcript.phrases),
    __metadata("design:type", Object)
], Phrase.prototype, "transcript", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Phrase.prototype, "phrase_text", void 0);
__decorate([
    Column(),
    Generated('increment'),
    __metadata("design:type", Number)
], Phrase.prototype, "phrase_number", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Phrase.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Phrase.prototype, "updated_at", void 0);
Phrase = __decorate([
    Entity({ name: "transcript_phrase" })
], Phrase);
export { Phrase };
