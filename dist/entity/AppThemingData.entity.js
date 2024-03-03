var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
import { DatabaseFile } from "./DatabaseFile.entity.js";
let AppThemingData = class AppThemingData {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], AppThemingData.prototype, "id", void 0);
__decorate([
    OneToOne(() => Tenant, (tenant) => tenant.app_theming_data),
    JoinColumn({ name: 'tenant_id' }) // this will change the following to tenant_id in the DB 
    ,
    __metadata("design:type", Tenant)
], AppThemingData.prototype, "tenant", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], AppThemingData.prototype, "greeting", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], AppThemingData.prototype, "message", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], AppThemingData.prototype, "additional_welcome_message", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], AppThemingData.prototype, "waiting_message", void 0);
__decorate([
    JoinColumn({ name: 'logoId' }),
    OneToOne(() => DatabaseFile, { nullable: true }),
    __metadata("design:type", Object)
], AppThemingData.prototype, "logo", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], AppThemingData.prototype, "logoId", void 0);
AppThemingData = __decorate([
    Entity({ name: "main_theming_data" })
], AppThemingData);
export { AppThemingData };
