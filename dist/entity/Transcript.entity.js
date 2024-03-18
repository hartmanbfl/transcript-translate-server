var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { Phrase } from "./Phrase.entity.js";
import { Session } from "./Session.entity.js";
let Transcript = class Transcript {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Transcript.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Tenant, (tenant) => tenant.transcripts),
    JoinColumn({ name: 'tenant_id' }),
    __metadata("design:type", Object)
], Transcript.prototype, "tenant", void 0);
__decorate([
    OneToMany(() => Phrase, (phrase) => phrase.transcript),
    __metadata("design:type", Array)
], Transcript.prototype, "phrases", void 0);
__decorate([
    ManyToOne(() => Session, (session) => session.transcripts, { onDelete: 'CASCADE' }),
    __metadata("design:type", Object)
], Transcript.prototype, "session", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Number)
], Transcript.prototype, "message_count", void 0);
__decorate([
    Column({ nullable: false }),
    __metadata("design:type", String)
], Transcript.prototype, "service_id", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Transcript.prototype, "status", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Transcript.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Transcript.prototype, "updated_at", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Date)
], Transcript.prototype, "ended_at", void 0);
Transcript = __decorate([
    Entity({ name: "main_transcript" })
], Transcript);
export { Transcript };
