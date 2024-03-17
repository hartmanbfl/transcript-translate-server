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
import { Subscriber } from "./Subscriber.entity.js";
import { Transcript } from "./Transcript.entity.js";
let Session = class Session {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Session.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Tenant, (tenant) => tenant.sessions),
    JoinColumn({ name: "tenant_id" }),
    __metadata("design:type", Object)
], Session.prototype, "tenant", void 0);
__decorate([
    OneToMany(() => Subscriber, (subscriber) => subscriber.session),
    __metadata("design:type", Object)
], Session.prototype, "subscribers", void 0);
__decorate([
    OneToMany(() => Transcript, (transcript) => transcript.session),
    __metadata("design:type", Object)
], Session.prototype, "transcripts", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Session.prototype, "service_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Session.prototype, "status", void 0);
__decorate([
    Column("text", { array: true, nullable: true }),
    __metadata("design:type", Array)
], Session.prototype, "languages", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Session.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Session.prototype, "updated_at", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Date)
], Session.prototype, "ended_at", void 0);
Session = __decorate([
    Entity({ name: "main_session" })
], Session);
export { Session };
