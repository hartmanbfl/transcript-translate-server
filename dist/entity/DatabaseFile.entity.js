var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant.entity.js";
let DatabaseFile = class DatabaseFile {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], DatabaseFile.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Tenant),
    JoinColumn({ name: 'tenant_id' }),
    __metadata("design:type", Tenant)
], DatabaseFile.prototype, "tenant", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DatabaseFile.prototype, "filename", void 0);
__decorate([
    Column({ type: "bytea" }),
    __metadata("design:type", Uint8Array)
], DatabaseFile.prototype, "data", void 0);
DatabaseFile = __decorate([
    Entity({ name: "main_database_file" })
], DatabaseFile);
export { DatabaseFile };
