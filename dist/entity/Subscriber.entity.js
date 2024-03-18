var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Session } from "./Session.entity.js";
let Subscriber = class Subscriber {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Subscriber.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Subscriber.prototype, "tenant_id", void 0);
__decorate([
    ManyToOne(() => Session, (session) => session.subscribers, { onDelete: 'CASCADE' }),
    __metadata("design:type", Object)
], Subscriber.prototype, "session", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Subscriber.prototype, "room", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Subscriber.prototype, "user_agent", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Subscriber.prototype, "socket_id", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Subscriber.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Subscriber.prototype, "updated_at", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Date)
], Subscriber.prototype, "ended_at", void 0);
Subscriber = __decorate([
    Entity({ name: "main_subscribers" })
], Subscriber);
export { Subscriber };
