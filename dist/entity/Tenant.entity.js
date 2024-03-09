var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from "typeorm";
import { AppThemingData } from "./AppThemingData.entity.js";
import { Transcript } from "./Transcript.entity.js";
import { User } from "./User.entity.js";
import { ChurchProperties } from "./ChurchProperties.entity.js";
let Tenant = class Tenant {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    Column({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    Column({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "church_key", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "address", void 0);
__decorate([
    Column({ nullable: true, select: false }),
    __metadata("design:type", String)
], Tenant.prototype, "deepgram_api_key", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "deepgram_project", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Tenant.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Tenant.prototype, "updated_at", void 0);
__decorate([
    OneToOne(() => AppThemingData, (app_theming_data) => app_theming_data.tenant, { cascade: true }),
    __metadata("design:type", Object)
], Tenant.prototype, "app_theming_data", void 0);
__decorate([
    OneToOne(() => ChurchProperties, (church_properties) => church_properties.tenant, { cascade: true }),
    __metadata("design:type", Object)
], Tenant.prototype, "church_properties", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "app_theming_data_id", void 0);
__decorate([
    OneToMany(() => Transcript, (transcript) => transcript.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "transcripts", void 0);
__decorate([
    OneToMany(() => User, (user) => user.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
Tenant = __decorate([
    Entity({ name: "main_tenant" })
], Tenant);
export { Tenant };
